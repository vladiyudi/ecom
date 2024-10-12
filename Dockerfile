# Install dependencies only when needed
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app

# Copy all files
COPY . .

# Build the Next.js app
RUN npm run build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

# Set production environment variable
ENV NODE_ENV=production
ENV PORT=8080

# Copy the necessary files and directories from the builder
COPY --from=builder /app/public ./public  
COPY --from=builder /app/.next ./.next    
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080

# Command to run the Next.js app
CMD ["npm", "start"]
