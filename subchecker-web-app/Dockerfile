# Use an offical Node runtime as a parent image
FROM node:22-alpine AS build
# Set the working directory
WORKDIR /app
# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80