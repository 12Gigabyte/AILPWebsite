from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

# 1. Initialize the router
router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"]
)

# 2. Define the exact shape of a Course using Pydantic
class Course(BaseModel):
    id: int = None # ID is optional when creating a new course
    name: str
    time: str
    day: str
    color: str

# 3. Our Temporary Database
FAKE_DB = [
    {"id": 1, "name": "Intro to Machine Learning", "time": "10:00 AM - 11:30 AM", "day": "Monday", "color": "bg-blue-500"},
    {"id": 2, "name": "Data Structures", "time": "2:00 PM - 3:30 PM", "day": "Wednesday", "color": "bg-purple-500"}
]

# --- THE ENDPOINTS ---

@router.get("/", response_model=List[Course])
def get_all_courses():
    """Returns all courses in the database"""
    return FAKE_DB

@router.post("/")
def add_course(course: Course):
    """Saves a new course to the database"""
    # Generate a new ID
    new_id = max([c["id"] for c in FAKE_DB], default=0) + 1
    
    # Convert the Pydantic model to a dictionary and save it
    course_dict = course.model_dump()
    course_dict["id"] = new_id
    FAKE_DB.append(course_dict)
    
    return course_dict

@router.delete("/{course_id}")
def delete_course(course_id: int):
    """Deletes a course by its ID"""
    global FAKE_DB
    
    # Check if the course exists
    course_exists = any(c["id"] == course_id for c in FAKE_DB)
    if not course_exists:
        raise HTTPException(status_code=404, detail="Course not found")
        
    # Filter out the deleted course
    FAKE_DB = [c for c in FAKE_DB if c["id"] != course_id]
    return {"message": "Course successfully deleted"}