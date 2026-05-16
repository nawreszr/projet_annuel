from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="AI Tutor Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@app.get("/health")
def health_check():
    return {"status": "OK", "service": "AI Tutor Service", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/ai/ask")
def ask_question(question: Question):
    return {
        "answer": f"💡 Réponse à votre question : '{question.question}'\n\nEn tant qu'assistant pédagogique, je vous recommande de consulter les ressources du cours.",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/ai/generate-quiz")
def generate_quiz():
    return {
        "quiz": [
            {"question": "Qu'est-ce qu'un microservice ?", "options": ["Architecture monolithique", "Service indépendant", "Base de données"], "correct": 1},
            {"question": "Quel outil est utilisé pour la containerisation ?", "options": ["Git", "Docker", "Python"], "correct": 1}
        ]
    }
