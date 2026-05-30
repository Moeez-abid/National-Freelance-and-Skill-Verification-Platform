FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci --include=dev

# Copy source code
COPY . .

EXPOSE 5003

# Run vite with host flag to allow external access
CMD ["npm", "run", "dev", "--", "--host", "--port", "5003"]
