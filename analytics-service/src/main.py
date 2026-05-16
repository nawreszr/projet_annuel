from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI(title="Analytics Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "OK", "service": "Analytics Service", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/analytics/dashboard")
def get_dashboard():
    return {"total_users": 1, "total_courses": 3, "total_views": 0}
