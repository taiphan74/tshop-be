# Stage 1: Builder (build app)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false  # Install all deps (dev cho build)
COPY . .
RUN npm run build  # Build NestJS (output dist/)

# Stage 2: Runner (prod image nhỏ gọn)
FROM node:20-alpine AS runner
WORKDIR /app
# Copy chỉ cần thiết từ builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
# Remove dev deps để nhỏ hơn
RUN npm ci --only=production && npm cache clean --force
# Expose port BE (từ .env.example: 3000, nhưng chỉnh nếu khác)
EXPOSE 3000
# Healthcheck (NestJS endpoint /health nếu có, hoặc curl)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
# Chạy prod
CMD ["npm", "run", "start:prod"]
USER node  # Non-root user cho secure