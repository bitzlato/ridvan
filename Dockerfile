FROM node:14-slim

WORKDIR /app

COPY . .

CMD ["node", "index.js"]

