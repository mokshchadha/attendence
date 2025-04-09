FROM node:22-slim

# Set working directory
WORKDIR /app

# Install dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxcb1 \
    libxkbcommon0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    fonts-noto-color-emoji \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install Playwright browsers (only install chromium to save space)
RUN npx playwright install chromium

# Copy all files
COPY . .

# Set execution permission for run.sh
RUN chmod +x run.sh

# Command to run the script
CMD ["node", "index.js"]