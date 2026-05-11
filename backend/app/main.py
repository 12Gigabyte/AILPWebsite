from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import our router files
from app.routers import dashboard
from app.routers import auth
from app.routers import courses 
from app.routers import pdf
from app.routers import explorer 
from app.routers import chat

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
app.include_router(pdf.router)
app.include_router(explorer.router)
app.include_router(chat.router)