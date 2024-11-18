# Use a Node.js base image
FROM node:18

# Set the working directory for the app
WORKDIR /app

# Copy the package.json and package-lock.json first to leverage Docker's cache
COPY package*.json ./

# Install the dependencies for both frontend and backend
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the ports required for both the frontend (Parcel) and backend (API)
EXPOSE 1234 3000

# Run the frontend (Parcel) and backend (nodemon) concurrently
CMD ["npm", "run", "start"]