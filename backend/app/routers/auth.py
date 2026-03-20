from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import bcrypt # <--- NEW: Using pure bcrypt instead of passlib
from app.database import user_collection

router = APIRouter(prefix="/api", tags=["Authentication"])

# --- DATA MODELS ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# --- ENDPOINTS ---

@router.post("/signup")
async def create_user(user: UserCreate):
    """Registers a new user in the database"""
    # 1. Check if the email is already taken
    existing_user = await user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # 2. Scramble (Hash) the password using pure bcrypt
    # We have to convert the string to bytes, hash it, and convert it back to a string to save it
    salt = bcrypt.gensalt()
    hashed_password_bytes = bcrypt.hashpw(user.password.encode('utf-8'), salt)
    hashed_password_string = hashed_password_bytes.decode('utf-8')

    # 3. Save the new user to MongoDB
    new_user_document = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password_string # Saved as a secure string!
    }
    await user_collection.insert_one(new_user_document)
    
    return {"message": "Account created successfully!"}


@router.post("/login")
async def login_user(request: LoginRequest):
    """Verifies user credentials against the database"""
    # 1. Find the user by their email
    user = await user_collection.find_one({"email": request.email})
    
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    # 2. Unscramble and check the password
    # We convert both the login attempt and the database hash into bytes to compare them
    password_is_correct = bcrypt.checkpw(
        request.password.encode('utf-8'), 
        user["password"].encode('utf-8')
    )
    
    if not password_is_correct:
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    # 3. Success!
    return {"message": "Login successful", "user": user["name"]}