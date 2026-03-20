from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.database import course_collection # Import the cloud bridge
from bson import ObjectId # MongoDB uses ObjectIds for unique keys

router = APIRouter(prefix="/api/courses", tags=["Courses"])

class Course(BaseModel):
    name: str
    time: str
    day: str
    color: str

# --- THE REAL CLOUD ENDPOINTS ---

@router.get("/")
async def get_all_courses():
    courses = []
    # We "find" all documents and turn them into a list React can read
    async for course in course_collection.find():
        course["id"] = str(course["_id"]) # Convert MongoDB ID to a readable string
        courses.append(course)
    return courses

@router.post("/")
async def add_course(course: Course):
    course_dict = course.model_dump()
    # Insert directly into the cloud!
    result = await course_collection.insert_one(course_dict)
    course_dict["id"] = str(result.inserted_id)
    return course_dict

@router.delete("/{course_id}")
async def delete_course(course_id: str):
    # Delete from the cloud using the specific ID
    delete_result = await course_collection.delete_one({"_id": ObjectId(course_id)})
    
    if delete_result.deleted_count == 1:
        return {"message": "Course successfully deleted"}
    raise HTTPException(status_code=404, detail="Course not found")