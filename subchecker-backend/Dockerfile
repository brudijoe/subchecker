# Use an official Node runtime as a parent image for the build
FROM node:22-alpine AS build

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./
# Install dependencies
RUN npm ci

# Copy the TypeScript configuration and application source
COPY tsconfig.json ./
COPY src ./src
# Build the application
RUN npm run build

# Use an official Node runtime as a parent image for production
FROM node:22-alpine AS runtime

# Set the production environment and working directory
ENV NODE_ENV=production
WORKDIR /app

# Copy package manifests and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the built application from the build stage
COPY --from=build /app/dist ./dist

# Run the application as the non-root node user
USER node

# Expose the backend port
EXPOSE 3000

# Run the backend server
CMD ["node", "dist/index.js"]
