from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.database import course_collection # Import the cloud bridge
from bson import ObjectId # MongoDB uses ObjectIds for unique keys

router = APIRouter(prefix="/api/courses", tags=["Courses"])

# 1. Added username to the data model!
class Course(BaseModel):
    name: str
    time: str
    day: str
    color: str
    username: str 

# --- THE REAL CLOUD ENDPOINTS ---

# 2. The route now requires a username to fetch data
@router.get("/{username}")
async def get_all_courses(username: str):
    courses = []
    # 3. We filter the MongoDB search to ONLY match the logged-in user
    async for course in course_collection.find({"username": username}):
        course["id"] = str(course["_id"]) 
        courses.append(course)
    return courses

@router.post("/")
async def add_course(course: Course):
    course_dict = course.model_dump()
    result = await course_collection.insert_one(course_dict)
    course_dict["id"] = str(result.inserted_id)
    return course_dict

@router.delete("/{course_id}")
async def delete_course(course_id: str):
    delete_result = await course_collection.delete_one({"_id": ObjectId(course_id)})
    
    if delete_result.deleted_count == 1:
        return {"message": "Course successfully deleted"}
    raise HTTPException(status_code=404, detail="Course not found")