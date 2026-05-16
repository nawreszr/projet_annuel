from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI(title="Course Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "OK", "service": "Course Service", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/courses")
def get_courses():
    return {"courses": [
        {"id": 1, "title": "Introduction aux Microservices", "price": 49.99, "duration": 240},
        {"id": 2, "title": "Docker pour Débutants", "price": 39.99, "duration": 180},
        {"id": 3, "title": "API Design Patterns", "price": 59.99, "duration": 300}
    ]}
