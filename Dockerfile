# Dockerfile

# 1) Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the workspace
COPY . .

# Build the api app (uses webpack via Nx project.json)
RUN npx nx build api

# 2) Runtime stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Copy only the built artifacts and the generated package.json
COPY --from=builder /usr/src/app/dist/apps/api ./
COPY --from=builder /usr/src/app/dist/apps/api/package.json ./

# Install only production dependencies for the built app
RUN npm install --omit=dev

# Environment variables expected by the app
ENV NODE_ENV=production
ENV PORT=3000
# These should be overridden in compose or deployment env
ENV MONGO_URI=mongodb://mongo:27017/task-manager
ENV JWT_SECRET=super-secret-jwt-key

EXPOSE 3000

CMD ["node", "main.js"]