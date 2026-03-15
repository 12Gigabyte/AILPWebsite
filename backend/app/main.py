from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --- The CORS Bridge ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any frontend to connect (perfect for local team dev)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all actions (GET, POST, etc.)
    allow_headers=["*"],
)

# --- A Test Route for the Dashboard ---
@app.get("/api/dashboard")
def get_dashboard_data():
    return {
        "title": "AILP Team Dashboard",
        "status": "Backend is fully connected and operational!",
        "active_users": 6
    }