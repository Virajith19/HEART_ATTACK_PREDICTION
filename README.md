# Heart Attack Prediction — Student UI Ready-to-Run

This package contains a ready-to-run Heart Attack Prediction project with a clean student-style frontend UI.

Folders:
- backend/  (Flask API, training script)
- frontend/ (React Vite app with simplified student UI)

Quick start (local, no Docker):
1. Backend:
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python train_and_save.py   # creates models/best_pipeline.pkl
   python app.py

2. Frontend:
   cd frontend
   npm install --legacy-peer-deps
   npm run dev
   Open http://localhost:5173 in your browser.

If you prefer Docker:
docker-compose up --build

Notes:
- Backend default port: 5050
- Frontend default port: 5173
