# ☸️ Configuration Kubernetes — Plateforme d'E-Learning Nexus

Ce dossier contient l'ensemble des fichiers de configuration (manifests) requis pour déployer la plateforme d'e-learning Nexus sur un cluster **Kubernetes** (tels que Minikube, Kind, Docker Desktop K8s, EKS, GKE, ou AKS).

Toutes les bases de données utilisent des **StatefulSets** pour garantir la persistance des données et la stabilité des identifiants réseaux. Les microservices utilisent des **Deployments** pour la haute disponibilité, et les configurations sensibles/partagées sont centralisées dans un fichier global.

---

## 📂 Structure du Répertoire `k8s/`

La structure respecte scrupuleusement l'architecture modulaire demandée :

```text
k8s/
├── kustomization.yaml       # Fichier Kustomize pour orchestrer le déploiement global
├── global/
│   ├── configmap.yaml       # Configurations globales partagées (ConfigMap)
│   └── secret.yaml          # Données secrètes et clés API (Secret)
│
│   # 🗄️ BASES DE DONNÉES (StatefulSets & Services)
├── postgres/
│   ├── configmap.yaml       # Script SQL d'initialisation (init-postgres.sql)
│   ├── statefulset.yaml     # StatefulSet PostgreSQL + Service headless
│   └── service.yaml         # Service ClusterIP PostgreSQL
├── mongodb/
│   ├── statefulset.yaml     # StatefulSet MongoDB + Service headless
│   └── service.yaml         # Service ClusterIP MongoDB
├── redis/
│   ├── statefulset.yaml     # StatefulSet Redis + Service headless
│   └── service.yaml         # Service ClusterIP Redis
├── minio/
│   ├── statefulset.yaml     # StatefulSet MinIO + Service headless
│   └── service.yaml         # Service ClusterIP MinIO
│
│   # ⚙️ MICROSERVICES (Deployments & Services)
├── user-service/
│   ├── deployment.yaml      # Déploiement du service Utilisateurs (Node.js)
│   └── service.yaml         # Service ClusterIP pour user-service (Port 8002)
├── course-service/
│   ├── deployment.yaml      # Déploiement du service Cours (FastAPI Python)
│   └── service.yaml         # Service ClusterIP pour course-service (Port 8001)
├── analytics-service/
│   ├── deployment.yaml      # Déploiement du service Analytics (FastAPI Python)
│   └── service.yaml         # Service ClusterIP pour analytics-service (Port 8003)
├── ai-tutor-service/
│   ├── deployment.yaml      # Déploiement de l'assistant IA adaptatif (FastAPI Python)
│   └── service.yaml         # Service ClusterIP pour ai-tutor-service (Port 8004)
│
│   # 💻 FRONTEND (Deployment & Service)
├── learning-portal/
│   ├── deployment.yaml      # Déploiement de l'application Next.js
│   └── service.yaml         # Service ClusterIP pour le portail (Port 3000)
│
│   # 🛡️ API GATEWAY (Deployment, Service & ConfigMap)
└── nginx-gateway/
    ├── configmap.yaml       # Fichiers nginx.conf et configuration de routage des services
    ├── deployment.yaml      # Déploiement de la passerelle Nginx
    └── service.yaml         # Service LoadBalancer (Point d'accès externe Port 80)
```

---

## 🛠️ Explications des Choix d'Architecture

1. **Dossier Global (`global/`)** : centralise les configurations applicatives (`global/configmap.yaml`) et les données sensibles (`global/secret.yaml`). Les secrets sont écrits en utilisant `stringData` pour une maintenance simplifiée (Kubernetes encode automatiquement en Base64).
2. **StatefulSets pour les Bases de Données** :
   - Assurent que chaque Pod de base de données garde son identité réseau stable (ex: `postgres-0.postgres-headless`).
   - Utilisent un `volumeClaimTemplates` pour demander de manière dynamique des volumes persistants (`PVC`) rattachés à chaque Pod.
   - Initialisation Postgres automatisée : la base de données PostgreSQL monte le script d'initialisation `init-postgres.sql` à partir d'une ConfigMap directement au démarrage, créant ainsi les bases `courses`, `analytics` et `n8n` automatiquement.
3. **API Gateway (`nginx-gateway`)** :
   - Utilise une ConfigMap dédiée pour injecter la configuration d'upstreams et les règles de proxying Nginx.
   - Exposé avec un service de type **`LoadBalancer`** qui permet d'accéder au frontend (Next.js) sur `/` et aux microservices sur `/api/*` à travers une adresse IP ou un port unique externe.

---

## 🚀 Guide de Déploiement Rapide

### 1. Démarrer et Déployer
Pour appliquer l'ensemble de la pile Kubernetes dans le bon ordre avec une seule commande, placez-vous dans le dossier racine du projet et exécutez :

```bash
kubectl apply -k k8s/
```

### 2. Suivre le statut du déploiement
Vérifiez que tous les pods démarrent correctement :

```bash
# Surveiller les Pods en temps réel
kubectl get pods -w

# Vérifier les bases de données StatefulSets
kubectl get statefulset

# Vérifier les services et repérer l'IP du LoadBalancer
kubectl get svc
```

### 3. Accéder à l'application
- **Minikube** : Si vous utilisez Minikube, démarrez le tunnel de LoadBalancer pour mapper l'IP externe :
  ```bash
  minikube tunnel
  ```
  Ouvrez ensuite simplement `http://localhost` (ou l'IP externe affichée par `kubectl get svc nginx-gateway`) dans votre navigateur !

---

## 🧹 Nettoyage

Pour supprimer proprement l'intégralité des ressources créées (services, déploiements, secrets, configmaps et StatefulSets) :

```bash
kubectl delete -k k8s/
```
*Note : Si vous souhaitez également supprimer les volumes de données stockés par les bases de données, vous pouvez supprimer les PVC correspondantes : `kubectl delete pvc --all`.*
