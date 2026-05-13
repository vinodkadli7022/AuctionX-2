# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy only the built artifacts and prod dependencies from the builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

# Install only production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
