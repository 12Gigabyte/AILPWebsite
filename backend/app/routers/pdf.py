from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
import os
import json
import google.generativeai as genai
import fitz  # <-- Back to PyMuPDF!
from dotenv import load_dotenv
from bson import ObjectId
from app.database import ai_pdfs_collection 

# Load the API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize the model
model = genai.GenerativeModel('gemini-2.5-flash')

router = APIRouter(prefix="/api/pdf", tags=["PDF Analyser"])

@router.post("/upload")
async def analyze_pdf(file: UploadFile = File(...)):
    try:
        # 1. Read the PDF file using PyMuPDF (fitz)
        pdf_bytes = await file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # 2. Extract text from all pages
        text_content = ""
        for page in doc:
            text_content += page.get_text() + "\n"
            
        total_pages = len(doc)
        doc.close() # Always good practice to close the document!
            
        # 3. AI Prompt
        prompt = f"""
        You are an expert tutor. Analyze this document and generate study materials.
        Return ONLY a perfectly valid JSON object exactly like this:
        {{
            "document_title": "A clear, concise title for these notes",
            "flashcards": [
                {{"front": "Question/Concept", "back": "Answer/Definition"}}
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
        1. Generate 5 to 10 flashcards.
        2. Generate 10 to 15 quiz questions.
        3. DO NOT wrap the JSON in markdown code blocks like ```json.
        
        TEXT TO ANALYZE:
        {text_content[:15000]}
        """
        
        # 4. Generate and Parse
        response = model.generate_content(prompt)
        raw_text = response.text.strip()
        
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:-3]
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:-3]
            
        ai_data = json.loads(raw_text)
        
        # 5. Return the extracted data to React!
        return {
            "filename": file.filename,
            "total_pages": total_pages,
            "ai_analysis": ai_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")


# --- THE REAL CLOUD ENDPOINTS ---

class SavePdfRequest(BaseModel):
    username: str
    pdf_data: dict

@router.get("/library/{username}")
async def get_pdf_library(username: str):
    try:
        pdfs = []
        # Find all PDFs for this user, sorted newest first
        async for pdf in ai_pdfs_collection.find({"username": username}).sort("_id", -1):
            pdf["id"] = str(pdf["_id"])
            del pdf["_id"]
            pdfs.append(pdf)
        return pdfs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/library")
async def save_pdf(req: SavePdfRequest):
    try:
        doc = req.pdf_data
        doc["username"] = req.username # Stamp it with the User ID!
        result = await ai_pdfs_collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        del doc["_id"]
        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/library/{pdf_id}")
async def delete_pdf(pdf_id: str):
    try:
        await ai_pdfs_collection.delete_one({"_id": ObjectId(pdf_id)})
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))