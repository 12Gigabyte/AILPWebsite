from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import our router files
from app.routers import dashboard
from app.routers import auth
from app.routers import courses 

app = FastAPI()

# --- The CORS Bridge ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

# --- Plug in the Squad's Routes ---
app.include_router(dashboard.router)
app.include_router(auth.router)
app.include_router(courses.router) 