# Build stage
FROM node:20-bullseye AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-bullseye AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY prisma ./prisma/
COPY .env .
RUN npx prisma generate
COPY run.sh .
RUN chmod +x run.sh
EXPOSE 3003
CMD ["sh", "run.sh"]