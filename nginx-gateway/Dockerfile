FROM nginx:alpine

# Supprimer la configuration par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier la configuration personnalisée
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
