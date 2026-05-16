FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (y compris dev pour être sûr)
RUN npm install

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 8002

# Utiliser node directement pour éviter l'erreur nodemon
CMD ["node", "src/index.js"]
