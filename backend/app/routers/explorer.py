from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load the API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize the model
model = genai.GenerativeModel('gemini-2.5-flash')

router = APIRouter(prefix="/api/course", tags=["Course Planner"])

class CourseRequest(BaseModel):
    topic: str

@router.post("/generate")
async def generate_course(request: CourseRequest):
    try:
        # THE UPGRADED AI BRAIN: Curriculum Designer + Resource Hunter
        prompt = f"""
        You are an expert curriculum designer. A student wants to learn about: "{request.topic}".
        Create a highly structured, engaging learning path.

        You MUST return the data as a perfectly valid JSON object exactly like this:
        {{
            "title": "A catchy, professional title for the course",
            "description": "A 1-2 sentence inspiring overview of what they will learn",
            "modules": [
                {{
                    "title": "Module 1: [Topic]",
                    "description": "A brief explanation of what this module covers.",
                    "resources": [
                        {{"title": "Name of Resource", "url": "https://...", "type": "Video / Article / Course"}}
                    ]
                }}
            ],
            "quiz": [
                {{
                    "question": "Multiple choice question?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": "The exact string of the correct option"
                }}
            ]
        }}

        Rules:
        1. Generate 4 to 5 modules progressing from beginner to advanced.
        2. For each module, provide exactly 2 to 3 REAL, high-quality reference links (e.g., official documentation, freeCodeCamp, Coursera, well-known YouTube channels like CrashCourse or specialized standard resources). DO NOT hallucinate broken or fake links.
        3. Create a final 10 to 15-question quiz at the end that tests knowledge from across the modules.
        4. DO NOT wrap the JSON in markdown code blocks like ```json.
        Return ONLY the raw JSON object.
        """

        response = model.generate_content(prompt)
        
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3]
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3]
            
        course_data = json.loads(raw_text)
        return course_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Processing Failed: {str(e)}")