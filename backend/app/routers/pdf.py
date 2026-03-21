from fastapi import APIRouter, UploadFile, File, HTTPException
import fitz  # PyMuPDF
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load the API key from your .env file
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize the Gemini 2.5 Flash model
model = genai.GenerativeModel('gemini-2.5-flash')

router = APIRouter(prefix="/api/pdf", tags=["PDF Analyser"])

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type.")
    
    try:
        # 1. Crack open the PDF
        contents = await file.read()
        doc = fitz.open(stream=contents, filetype="pdf")
        
        extracted_text = ""
        for page in doc:
            extracted_text += page.get_text() + "\n"
            
        num_pages = len(doc)
        doc.close()

        # 2. THE AI BRAIN: Retrained to be a Study Buddy
        prompt = f"""
        You are an elite AI tutor. I will provide raw text from a student's notes or document.
        Your job is to generate study materials to help them learn this specific document.
        
        You MUST return the data as a perfectly valid JSON object exactly like this:
        {{
            "document_title": "A short, catchy title based on the content",
            "flashcards": [
                {{"front": "Question or concept?", "back": "Answer or definition"}}
            ],
            "quiz": [
                {{
                    "question": "Multiple choice question?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": "The exact string of the correct option"
                }}
            ]
        }}
        
        Generate exactly 5 flashcards and 3 quiz questions.
        DO NOT wrap the JSON in markdown code blocks like ```json.
        Return ONLY the raw JSON object.
        
        Here is the document text:
        {extracted_text}
        """
        
        # 3. Ask Gemini to process it
        response = model.generate_content(prompt)
        
        # 4. Clean up the response to ensure it's pure JSON
        raw_ai_text = response.text.strip()
        if raw_ai_text.startswith("```json"):
            raw_ai_text = raw_ai_text[7:-3] # Strip markdown formatting if Gemini disobeys
            
        # 5. Convert Gemini's text response into an actual Python Dictionary
        structured_data = json.loads(raw_ai_text)
            
        # 6. Return the beautiful AI data to React!
        return {
            "filename": file.filename,
            "total_pages": num_pages,
            "ai_analysis": structured_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Processing Failed: {str(e)}")