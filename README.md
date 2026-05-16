# Plateforme d'apprentissage en ligne - Learning Platform

Plateforme d'apprentissage en ligne basée sur une architecture microservices, intégrant une fonctionnalité IA pour assistance pédagogique et un workflow automatisé de collecte de feedback via n8n.

## Architecture
┌─────────────────────────────────────────────────────────────────┐
│ API Gateway │
│ (Nginx - Port 80) │
└─────────────────────────────────────────────────────────────────┘
│
┌───────────────────────┼───────────────────────┐
│ │ │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│ User Service │ │Course Service │ │AI Tutor Service│
│ (Node.js) │ │ (FastAPI) │ │ (FastAPI) │
│ Port 8002 │ │ Port 8001 │ │ Port 8004 │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
│ │ │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│ MongoDB │ │ PostgreSQL │ │ Redis │
│ (Users) │ │ (Courses) │ │ (Cache) │
│ Port 27017 │ │ Port 5432 │ │ Port 6379 │
└───────────────┘ └───────────────┘ └───────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Services complémentaires │
├───────────────────┬───────────────────┬───────────────────────┤
│ Analytics │ MinIO Storage │ n8n Automation │
│ (FastAPI) │ (Object Store) │ (Workflows) │
│ Port 8003 │ Ports 9000/9001 │ Port 5678 │
└───────────────────┴───────────────────┴───────────────────────┘
## Structure du projet
projet-apprentissage/
├── docker-compose.yml # Orchestration des services
├── .env # Variables d'environnement
├── init-scripts/ # Scripts d'initialisation des bases
│ └── init-postgres.sql # Initialisation PostgreSQL
├── user-service/ # Service utilisateurs (Node.js/Express)
│ ├── Dockerfile
│ ├── package.json
│ └── src/
│ ├── index.js
│ ├── models/
│ ├── routes/
│ └── middleware/
├── course-service/ # Service cours (FastAPI)
│ ├── Dockerfile
│ ├── requirements.txt
│ └── src/
│ └── main.py
├── analytics-service/ # Service analytics (FastAPI)
│ ├── Dockerfile
│ ├── requirements.txt
│ └── src/
│ └── main.py
├── ai-tutor-service/ # Service IA (FastAPI)
│ ├── Dockerfile
│ ├── requirements.txt
│ └── src/
│ └── main.py
├── nginx-gateway/ # API Gateway (Nginx)
│ ├── Dockerfile
│ └── nginx.conf
└── n8n-automation/ # Workflows n8n (optionnel)
└── workflows/

## Prérequis

- **Docker** 20.10+
- **Docker Compose** 2.20+
- **Node.js** 18+ (pour développement local)
- **Python** 3.11+ (pour développement local)
- **Git** (optionnel)

## Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd projet-apprentissage
2. Configurer l'environnement
bash
# Copier le fichier d'environnement
cp .env.example .env

# Modifier les variables si nécessaire
nano .env
.env.example :

env
# JWT
JWT_SECRET=super_secret_jwt_key_change_me_123456

# Bases de données
POSTGRES_PASSWORD=postgres123
MONGO_INITDB_ROOT_PASSWORD=mongodb123
MINIO_ROOT_PASSWORD=minio123

# n8n
N8N_PASSWORD=admin123

# OpenAI (optionnel)
OPENAI_API_KEY=
3. Démarrer les services
bash
# Démarrer tous les services
docker compose up -d

# Démarrer avec reconstruction
docker compose up -d --build

# Démarrer un service spécifique
docker compose up -d user-service
4. Vérifier l'état des services
bash
# Voir tous les services
docker compose ps

# Voir les logs
docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs -f user-service
Accès aux services
Service	URL	Identifiants
API Gateway	http://localhost	-
User Service API	http://localhost:8002	-
Course Service API	http://localhost:8001	-
Analytics Service API	http://localhost:8003	-
AI Tutor Service API	http://localhost:8004	-
MinIO Console	http://localhost:9001	minioadmin / minio123
n8n Interface	http://localhost:5678	admin / admin123
API Endpoints
User Service (Port 8002)
Méthode	Endpoint	Description	Auth
GET	/health	Vérification du service	Public
GET	/	Informations du service	Public
POST	/api/auth/register	Inscription utilisateur	Public
POST	/api/auth/login	Connexion	Public
GET	/api/auth/me	Profil utilisateur	JWT
GET	/api/users	Liste des utilisateurs	Admin
GET	/api/users/:id	Détails utilisateur	JWT
PUT	/api/users/:id	Mise à jour profil	JWT
DELETE	/api/users/:id	Suppression compte	JWT
Course Service (Port 8001)
Méthode	Endpoint	Description
GET	/health	Vérification du service
GET	/api/courses	Liste des cours
GET	/api/courses/:id	Détails d'un cours
GET	/api/courses/search?q=	Recherche de cours
POST	/api/courses	Créer un cours
Analytics Service (Port 8003)
Méthode	Endpoint	Description
GET	/health	Vérification du service
GET	/api/analytics/dashboard	Dashboard statistiques
GET	/api/analytics/course/:id	Stats d'un cours
POST	/api/analytics/track	Tracker un événement
AI Tutor Service (Port 8004)
Méthode	Endpoint	Description
GET	/health	Vérification du service
POST	/api/ai/ask	Poser une question à l'IA
POST	/api/ai/generate-quiz	Générer un quiz
POST	/api/ai/recommendations	Recommandations personnalisées
Tests avec cURL
Inscription utilisateur
bash
curl -X POST http://localhost:8002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
Connexion
bash
curl -X POST http://localhost:8002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
Récupérer le profil (avec token)
bash
curl -X GET http://localhost:8002/api/auth/me \
  -H "Authorization: Bearer VOTRE_TOKEN"
Lister les cours
bash
curl http://localhost:8001/api/courses
Question à l'IA
bash
curl -X POST http://localhost:8004/api/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Qu'est-ce qu'un microservice ?"}'
Tests avec Postman
Importer la collection : Fichier → Import → Coller le JSON de la collection

Variables d'environnement : Créer un environnement avec base_url = http://localhost

Tester les endpoints : Utiliser les requêtes pré-configurées

Commandes utiles
Gestion des services
bash
# Démarrer tous les services
docker compose up -d

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker compose down -v

# Redémarrer un service
docker compose restart user-service

# Voir les logs en temps réel
docker compose logs -f user-service

# Exécuter une commande dans un conteneur
docker exec -it user_service sh
Maintenance
bash
# Nettoyer les images non utilisées
docker image prune -a

# Nettoyer les volumes non utilisés
docker volume prune

# Voir l'utilisation des ressources
docker stats
Développement local
bash
# Installer les dépendances Node.js
cd user-service && npm install

# Lancer user-service en mode développement
npm run dev

# Installer les dépendances Python
cd course-service && pip install -r requirements.txt

# Lancer course-service en mode développement
uvicorn src.main:app --reload --port 8001
Résolution des problèmes
Port déjà utilisé
bash
# Vérifier les ports utilisés
netstat -ano | findstr :8002

# Changer le port dans docker-compose.yml
ports:
  - "8003:8002"  # Utiliser le port 8003 à la place
MongoDB non accessible
bash
# Vérifier que MongoDB tourne
docker ps | grep mongodb

# Vérifier les logs
docker logs mongodb

# Redémarrer MongoDB
docker compose restart mongodb
User Service ne répond pas
bash
# Vérifier les logs
docker compose logs user-service

# Reconstruire l'image
docker compose build --no-cache user-service

# Redémarrer
docker compose up -d user-service
Variables d'environnement
Variable	Description	Défaut
JWT_SECRET	Clé secrète JWT	secret123
POSTGRES_PASSWORD	Mot de passe PostgreSQL	postgres123
MONGO_INITDB_ROOT_PASSWORD	Mot de passe MongoDB	mongodb123
MINIO_ROOT_PASSWORD	Mot de passe MinIO	minio123
N8N_PASSWORD	Mot de passe n8n	admin123
OPENAI_API_KEY	Clé API OpenAI (optionnel)	-
Technologies utilisées
Orchestration : Docker, Docker Compose

API Gateway : Nginx

Backend Services : Node.js/Express, FastAPI (Python)

Bases de données : MongoDB, PostgreSQL, Redis

Stockage : MinIO (S3-compatible)

Automation : n8n

Frontend : Next.js + shadcn/ui (optionnel)

IA : OpenAI API / LLM local#   p r o j e t _ a p p r e n t i s s a g e  
 #   p r o j e t _ a n n u e l  
 