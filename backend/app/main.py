from fastapi import FastAPI

app = FastAPI()

# This is your first "route" - it listens for requests!
@app.get("/")
def read_root():
    return {"message": "Hello Team! The AI Learning Platform backend is live!"}