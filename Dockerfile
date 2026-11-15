# ---- build the Vue site ----
FROM node:26-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---- run: tiny Node server (static files + /api/chat + /api/request-cv) ----
FROM node:26-slim
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NODE_OPTIONS=--max-old-space-size=128
# the API handlers only need nodemailer at runtime
RUN npm init -y >/dev/null && npm i nodemailer@6 --no-audit --no-fund --silent && rm package.json package-lock.json
COPY --from=build /app/server.js ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/api ./src/api
COPY --from=build /app/src/i18n ./src/i18n
COPY --from=build /app/src/data ./src/data
RUN printf '{"type":"module"}\n' > package.json
USER node
EXPOSE 3000
CMD ["node", "server.js"]
