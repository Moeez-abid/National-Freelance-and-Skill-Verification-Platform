# ─── Stage 1: Build ───
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 2: Production ───
FROM node:22-alpine AS production

WORKDIR /app

# Only install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy uploads folder structure (empty, will be volume-mounted)
RUN mkdir -p uploads

EXPOSE 3006

CMD ["node", "dist/main.js"]
