# Use Node.js 22 Alpine (small image)
FROM node:22-alpine

# Create app directory inside container
WORKDIR /app

# Copy package files and install dependencies first (caching benefits)
COPY package*.json ./
RUN npm install

# Copy all backend code
COPY . .

# Expose your backend port (change if needed)
EXPOSE 4000

# Run your backend entry file (change if needed)
CMD ["node", "server.js"]
