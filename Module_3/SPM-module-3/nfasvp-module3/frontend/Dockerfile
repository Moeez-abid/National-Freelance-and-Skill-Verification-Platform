FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 5003

# Run vite with host flag to allow external access
CMD ["npm", "run", "dev", "--", "--host"]
