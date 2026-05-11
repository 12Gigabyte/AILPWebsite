from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import time

# 1. NEW: Import your MongoDB collections!
from app.database import ai_pdfs_collection, ai_courses_collection

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

router = APIRouter(prefix="/api", tags=["Chatbot"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    username: str = "Student" # 👈 NEW: Accepts the username

# Tool 1: Navigation
navigation_tool = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="switch_dashboard_tab",
            description="Use this tool to navigate the user to a different page or tab.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={"target_tab": types.Schema(type=types.Type.STRING)},
                required=["target_tab"]
            )
        )
    ]
)

# Tool 2: NEW! Database Reader
database_tool = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="read_user_database",
            description="CRITICAL: Use this tool IMMEDIATELY if the user asks questions about their saved courses, modules, PDFs, documents, or flashcards. It reads their private database.",
        )
    ]
)

@router.post("/chat")
async def process_chat(request: ChatRequest):
    try:
        formatted_contents = []
        for msg in request.history:
            role = "model" if msg.role == "assistant" else "user"
            formatted_contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))
        
        formatted_contents.append(types.Content(role="user", parts=[types.Part.from_text(text=request.message)]))

        system_prompt = """
        You are Synapse AI, an educational assistant.
        1. NAVIGATION: ONLY if the user's LATEST message asks to 'take me to X' or 'open X', trigger the 'switch_dashboard_tab' function. Ignore past navigation requests.
        2. DATA QUESTIONS: If the user asks about their specific PDFs, flashcards, courses, or modules, YOU MUST trigger the 'read_user_database' tool. 
        3. GENERAL: Otherwise, chat normally.
        """

        # 🛡️ 2. THE AUTO-RETRY LOOP
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-flash', # 👈 3. The new lightweight model!
                    contents=formatted_contents,
                    config=types.GenerateContentConfig(
                        tools=[navigation_tool, database_tool],
                        system_instruction=system_prompt
                    )
                )
                break # If successful, break out of the loop and continue!
                
            except Exception as e:
                # If it's a 503 Traffic Error, wait and retry. Otherwise, crash normally.
                if "503" in str(e) and attempt < max_retries - 1:
                    print(f"[AI-LOG] Network congested. Retrying in 2 seconds... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(2)
                    continue
                else:
                    raise e # We've tried 3 times or it's a different error, give up.
        
        # Check if the AI used a tool
        if response.function_calls:
            tool_call = response.function_calls[0]
            
            # --- TOOL 1: NAVIGATION ---
            if tool_call.name == "switch_dashboard_tab":
                raw_target = tool_call.args.get("target_tab", "").lower()
                target = "overview" 
                if "profile" in raw_target: target = "profile"
                elif "analy" in raw_target or "pdf" in raw_target: target = "analyser"
                elif "plan" in raw_target or "course" in raw_target: target = "planner"
                elif "over" in raw_target or "home" in raw_target: target = "overview"
                return {"action": "navigate", "target": target}
            
            # --- TOOL 2: READ MONGODB ---
            elif tool_call.name == "read_user_database":
                print(f"[AI-LOG] Fetching DB context for user: {request.username}")
                
                # 1. Fetch PDFs
                user_pdfs = await ai_pdfs_collection.find({"user": request.username}).to_list(length=20)
                db_context = "\n--- USER'S SAVED PDFS & FLASHCARDS ---\n"
                for pdf in user_pdfs:
                    db_context += f"Document Name: {pdf.get('filename', 'Unknown')}\n"
                    db_context += f"Content/Flashcards: {pdf.get('ai_analysis', 'No content')}\n\n"

                # 2. Fetch Courses
                user_courses = await ai_courses_collection.find({"user": request.username}).to_list(length=20)
                db_context += "\n--- USER'S GENERATED COURSES & MODULES ---\n"
                for course in user_courses:
                    db_context += f"Course Topic: {course.get('topic', 'Unknown')}\n"
                    db_context += f"Syllabus Details: {course.get('syllabus', 'No syllabus')}\n\n"

                # 3. Ask Gemini a second time (Also using the 8b model!)
                synthesis_prompt = f"The user asked: '{request.message}'. Here is all the data from their private database. Answer their question brilliantly using ONLY this data:\n{db_context}"
                
                print("[AI-LOG] DB Fetched! Synthesizing final answer...")
                
                # We can add a simple retry here too, but let's keep it simple for now
                synthesis_response = client.models.generate_content(
                    model='gemini-2.5-flash', # 👈 Make sure to update it here too!
                    contents=synthesis_prompt
                )
                
                return {"action": "chat", "reply": synthesis_response.text}
        
        # Normal Chat Fallback
        reply_text = response.text if response.text else "How can I help you?"
        return {"action": "chat", "reply": reply_text}
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail="My AI brain is currently offline.")