# === Stage 1: Build ===
# Use a modern, lightweight Node.js LTS image as the 'builder'
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
# This leverages Docker's build cache. If these files don't change,
# 'npm ci' (clean install) won't be re-run on subsequent builds.
COPY package.json package-lock.json ./

# Install dependencies using 'npm ci' for reproducible builds from the lockfile
RUN npm ci

# Copy the rest of the application source code
COPY . .

# --- Build-time Environment Variable ---
# Declare the GEMINI_API_KEY as a build argument.
# You will need to pass this during the build command, e.g.:
# docker build --build-arg GEMINI_API_KEY="your_api_key_here" -t my-app .
ARG GEMINI_API_KEY

# Set the ENV variable *within this build stage* so that the 'vite build' 
# process can access it via `loadEnv` (as referenced in your vite.config.ts)
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

# Run the build script. This will create the /app/dist folder.
# (This assumes your 'build' script in package.json is 'vite build')
RUN npm run build

# === Stage 2: Production ===
# Use a small, official Nginx image to serve the static files
FROM nginx:1.27-alpine AS production

# Set working directory for Nginx content
WORKDIR /usr/share/nginx/html

# Remove the default Nginx welcome page
RUN rm -rf ./*

# Copy the built static files (from the /app/dist folder) 
# from the 'builder' stage into the Nginx server directory
COPY --from=builder /app/dist .

# Copy the custom Nginx configuration
# This is crucial for 'react-router-dom' (SPA routing) to work correctly
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (the default Nginx port)
EXPOSE 80

# Start Nginx in the foreground so the container keeps running
CMD ["nginx", "-g", "daemon off;"]
