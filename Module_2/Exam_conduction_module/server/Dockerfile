FROM node:20-alpine

WORKDIR /app

# Install dependencies for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

COPY . .

EXPOSE 5000

# Start the server (Prisma will just query the existing Master DB)
CMD ["sh", "-c", "npx prisma generate && node index.js"]