# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma/
RUN npx prisma generate

COPY src ./src/
RUN npm run build

# Runtime stage
FROM node:22-alpine

RUN apk add --no-cache python3 py3-pip

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma/
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY teste.py ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
