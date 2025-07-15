FROM ubuntu:22.04

# Evita errores de interacción
ENV DEBIAN_FRONTEND=noninteractive

# Instala Node.js, LibreOffice y dependencias
RUN apt-get update && \
    apt-get install -y curl gnupg2 libreoffice && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Expone el puerto del backend
EXPOSE 5000

CMD ["node", "server.js"]
