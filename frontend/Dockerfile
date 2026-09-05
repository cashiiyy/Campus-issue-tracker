FROM node:20-alpine

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
