from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import bcrypt
from datetime import datetime, timedelta # <-- NEW: For calculating streaks!
from app.database import user_collection

router = APIRouter(prefix="/api", tags=["Authentication"])

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def create_user(user: UserCreate):
    existing_user = await user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    salt = bcrypt.gensalt()
    hashed_password_bytes = bcrypt.hashpw(user.password.encode('utf-8'), salt)
    hashed_password_string = hashed_password_bytes.decode('utf-8')

    # NEW: Give new users a starting streak of 1 and stamp today's date!
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    new_user_document = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password_string,
        "current_streak": 1,
        "last_login_date": today_str
    }
    await user_collection.insert_one(new_user_document)
    
    return {"message": "Account created successfully!"}


@router.post("/login")
async def login_user(request: LoginRequest):
    user = await user_collection.find_one({"email": request.email})
    
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    password_is_correct = bcrypt.checkpw(
        request.password.encode('utf-8'), 
        user["password"].encode('utf-8')
    )
    
    if not password_is_correct:
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    # --- THE STREAK CALCULATOR ---
    today_str = datetime.now().strftime("%Y-%m-%d")
    today_obj = datetime.strptime(today_str, "%Y-%m-%d")
    
    # Grab their last login (default to today if they are an old account that doesn't have one yet)
    last_login_str = user.get("last_login_date", today_str)
    last_login_obj = datetime.strptime(last_login_str, "%Y-%m-%d")
    
    current_streak = user.get("current_streak", 1)

    # How many days has it been?
    days_difference = (today_obj - last_login_obj).days

    if days_difference == 1:
        # They logged in yesterday! Keep the streak alive!
        current_streak += 1
    elif days_difference > 1:
        # They missed a day. Reset to 1.
        current_streak = 1
    # If days_difference == 0, they already logged in today. The streak stays the same.

    # Update their document in the Cloud with the new date and streak
    await user_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "last_login_date": today_str, 
            "current_streak": current_streak
        }}
    )

    # Return the real streak to React!
    return {
        "message": "Login successful", 
        "user": user["name"], 
        "streak": current_streak
    }