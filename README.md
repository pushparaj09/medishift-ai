<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MediShift AI - Hospital Workforce Management

This project contains both a React Frontend and a Python FastAPI Backend.

## Frontend Setup

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env` (if using client-side AI)
3. Run the frontend:
   `npm run dev`

## Backend Setup (Python)

To run the server implementation:

1. Navigate to the backend folder:
   `cd backend`

2. Install Python dependencies:
   `pip install -r requirements.txt`

3. Set your API key in `.env` or environment variables:
   `export API_KEY=your_gemini_key_here`

4. Run the server:
   `python main.py`

The API will be available at `http://localhost:8000`.
Docs available at `http://localhost:8000/docs`.

## Tech Stack

*   **Frontend:** React, Vite, TailwindCSS, Recharts, Lucide Icons
*   **Backend:** Python, FastAPI, Uvicorn
*   **AI:** Google Gemini 2.5 Flash
