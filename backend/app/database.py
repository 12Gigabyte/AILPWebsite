import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# 1. Load the hidden variables from the .env file
load_dotenv()

# 2. Fetch the URL securely
MONGO_DETAILS = os.getenv("MONGO_URL")

# 3. Initialize the database client
client = AsyncIOMotorClient(MONGO_DETAILS)

# 4. Create a link to a specific database inside your cluster
database = client.synapse_ai

# 5. Create "Collections" (like tables in a spreadsheet) for our squads
course_collection = database.get_collection("courses_collection")
user_collection = database.get_collection("users_collection")