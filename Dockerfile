# syntax=docker/dockerfile:1

FROM node:24.14.1-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src

RUN npm ci
RUN npm run build

FROM node:24.14.1-bookworm-slim AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3460 \
    MCP_ALLOWED_HOSTS=localhost,127.0.0.1

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build --chown=node:node /app/dist ./dist

USER node
EXPOSE 3460

# The service has no dedicated health endpoint; verify that its TCP port is listening.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "const net=require('node:net');const s=net.connect(Number(process.env.PORT)||3460,'127.0.0.1',()=>{s.end();process.exit(0)});s.setTimeout(2000,()=>{s.destroy();process.exit(1)});s.on('error',()=>process.exit(1));"

CMD ["node", "dist/src/http-server.js"]
