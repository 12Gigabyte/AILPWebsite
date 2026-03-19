from fastapi import APIRouter

# 1. Initialize the router and set the base URL for all routes in this file
router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)

# 2. Define the specific endpoint (Because of the prefix above, this becomes /api/dashboard/)
@router.get("/")
def get_dashboard_data():
    return {
        "title": "SynapseAI Dashboard",
        "status": "Backend is fully connected and operational!",
        "active_users": 6
    }