# 🛠 Project Command Cheat Sheet

This guide contains every command needed to set up, run, and collaborate on the AILP Website project.

## 1. First-Time Setup (Prerequisites)
These ensure your computer can communicate with GitHub and run the code.

| Purpose | Command |
| :--- | :--- |
| **Install Git (Windows)** | `winget install --id Git.Git -e --source winget` |
| **Set Git Name** | `git config --global user.name "Your Name"` |
| **Set Git Email** | `git config --global user.email "your-email@example.com"` |
| **Clone Project** | `git clone https://github.com/12Gigabyte/AILPWebsite.git` |


Worked last time:
| **Install Git (Windows)** | `winget install --id Git.Git` |
| **Clone Project** | `git clone https://github.com/12Gigabyte/AILPWebsite.git` |
---

## 2. Installing Dependencies
Run these once after cloning to download the necessary libraries.

| Purpose | Command |
| :--- | :--- |
| **Install Frontend (React)** | `cd frontend` then `npm install` |
| **Install Backend (Python)** | `cd backend` then `pip install -r requirements.txt` |

---

## 3. Running the App
You should usually have two terminals open at once to run both sides of the app.

| Purpose | Command | Location |
| :--- | :--- | :--- |
| **Start Frontend** | `npm run dev` | `/frontend` |
| **Start Backend** | `py -m uvicorn app.main:app --reload` | `/backend` |

---

## 4. Collaboration Workflow (The Daily Cycle)
Follow these steps to share your code with the team without causing errors.

| Step | Command | What it does |
| :--- | :--- | :--- |
| **1. Update** | `git pull` | Downloads the latest work from teammates. |
| **2. Save** | `git add .` | Marks your new changes as ready to save. |
| **3. Label** | `git commit -m "Your message"` | Creates a local checkpoint of your work. |
| **4. Share** | `git push` | Sends your work to the GitHub cloud. |

---

## 💡 Troubleshooting
* **Python not found:** Make sure you checked "Add Python to PATH" during installation.
* **CORS Error:** If the frontend can't talk to the backend, notify the Project Manager to check `main.py` settings.
* **Merge Conflict:** If `git push` fails, run `git pull` first, fix the code conflicts in VS Code, then try again.