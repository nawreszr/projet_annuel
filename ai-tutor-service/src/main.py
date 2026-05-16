from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Nexus AI Tutor (Auto-Adaptive)", version="1.6.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str
    user_id: str = "guest"

@app.post("/api/ai/ask")
async def ask_question(question_data: Question):
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
         return {"answer": "🤖 Veuillez configurer GEMINI_API_KEY.", "timestamp": datetime.utcnow().isoformat()}

    try:
        genai.configure(api_key=api_key)
        
        # Auto-détection du meilleur modèle disponible
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        
        if not available_models:
            raise Exception("Aucun modèle de génération trouvé pour cette clé API.")
        
        # On choisit le plus récent ou le premier disponible
        # Priorité : 1.5-flash > 1.5-pro > gemini-pro
        selected_model = "models/gemini-1.5-flash" # Default target
        
        if "models/gemini-1.5-flash" in available_models:
            selected_model = "models/gemini-1.5-flash"
        elif "models/gemini-pro" in available_models:
            selected_model = "models/gemini-pro"
        else:
            selected_model = available_models[0]
            
        print(f"Modèle auto-sélectionné : {selected_model}")
        
        model = genai.GenerativeModel(selected_model)
        prompt = f"Tu es le tuteur Nexus. Réponds à : {question_data.question}"
        response = model.generate_content(prompt)
        
        return {
            "answer": response.text,
            "timestamp": datetime.utcnow().isoformat(),
            "model_used": selected_model
        }
    except Exception as e:
        print(f"Erreur Auto-Adaptive : {str(e)}")
        # On renvoie la liste des modèles pour débugger au cas où
        try:
            debug_models = [m.name for m in genai.list_models()]
        except:
            debug_models = "Impossible de lister"
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}. Modèles dispos : {debug_models}")
