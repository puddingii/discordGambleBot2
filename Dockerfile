FROM node:16-alpine as ts-compiler
WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM node:16-alpine as ts-remover
WORKDIR /usr/app
COPY --from=ts-compiler /usr/app/package*.json ./
COPY --from=ts-compiler /usr/app/build ./build
RUN npm install --only=production

FROM node:16-alpine
WORKDIR /usr/app
ENV IS_DOCKER=1
ENV TZ=Asia/Seoul
ENV NODE_ENV=production
COPY --from=ts-remover /usr/app ./
RUN chmod -R 777 /usr/app
RUN --mount=type=secret,id=BOT_TOKEN \
  --mount=type=secret,id=CLIENT_ID \
  --mount=type=secret,id=GUILD_ID \
  --mount=type=secret,id=MONGO_ID \
  --mount=type=secret,id=MONGO_PW \
  --mount=type=secret,id=ADMIN_ID \
  --mount=type=secret,id=ADMIN_PW \
  --mount=type=secret,id=STOCK_UPDATE_TIME \
  --mount=type=secret,id=GAMBLE_UPDATE_TIME \
  export BOT_TOKEN=$(cat /run/secrets/BOT_TOKEN) && \
  export CLIENT_ID=$(cat /run/secrets/CLIENT_ID) && \
  export GUILD_ID=$(cat /run/secrets/GUILD_ID) && \
  export MONGO_ID=$(cat /run/secrets/MONGO_ID) && \
  export MONGO_PW=$(cat /run/secrets/MONGO_PW) && \
  export ADMIN_ID=$(cat /run/secrets/ADMIN_ID) && \
  export ADMIN_PW=$(cat /run/secrets/ADMIN_PW) && \
  export STOCK_UPDATE_TIME=$(cat /run/secrets/STOCK_UPDATE_TIME) && \
  export GAMBLE_UPDATE_TIME=$(cat /run/secrets/GAMBLE_UPDATE_TIME) && \
  yarn gen
USER node
CMD ["npm", "run", "start"]
