FROM node:16-slim@sha256:e41a70d089deb43717a834c5c966842dab760e56257bfe391f3f161ce5b28c52 AS base
WORKDIR /app

COPY . .
RUN npm ci

ENV API_PORT=3002
ENV NODE_ENV=production
EXPOSE 3002
CMD [ "node", "./api/server.js" ]
