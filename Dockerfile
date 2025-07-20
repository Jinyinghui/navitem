FROM node:20-alpine3.20 AS frontend-builder

WORKDIR /app

COPY web/package*.json ./

RUN npm install

COPY web/ ./

RUN npm run build

# 生产环境
FROM node:20-alpine3.20 AS production

RUN apk add --no-cache \
    sqlite \
    && rm -rf /var/cache/apk/*

WORKDIR /app

RUN mkdir -p uploads database

COPY package*.json ./

RUN npm install

COPY app.js config.js db.js ./
COPY routes/ ./routes/

COPY --from=frontend-builder /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000/tcp

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

CMD ["npm", "start"] 
