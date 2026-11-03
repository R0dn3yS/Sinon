FROM node:26-trixie-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy bot source
COPY . .

# Run as the non-root Node user
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production

CMD ["npm", "run", "start"]