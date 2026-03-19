from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# 1. Initialize the router
router = APIRouter(
    prefix="/api",
    tags=["Authentication"]
)

# 2. Define the expected shape of the incoming data from React
class LoginRequest(BaseModel):
    email: str
    password: str

# 3. Create the endpoint
@router.post("/login")
def login_user(request: LoginRequest):
    # Dummy database check
    if request.email == "test@university.edu" and request.password == "synapsedev2026":
        return {"message": "Login successful", "user": "Test Student"}
    
    # If it fails, throw an HTTP 401 error (Unauthorized)
    raise HTTPException(
        status_code=401, 
        detail="Incorrect email or password."
    )