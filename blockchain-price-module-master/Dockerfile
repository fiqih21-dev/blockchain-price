# Stage 1: Build
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files for installing build dependencies
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# Install only devDependencies for build
RUN npm ci --include=dev --ignore-scripts && npm run build

# Stage 2: Production
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the build output from the build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts && npm i --ignore-scripts pm2 -g

# Switch to non-root user
USER node

# Expose the port that the application will run on
EXPOSE 3371

# Command to run the application in production mode
CMD ["pm2-runtime", "start" , "dist/main.js", "-i", "1"]
