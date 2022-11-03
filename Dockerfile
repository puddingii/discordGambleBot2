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
USER node
CMD ["npm", "run", "start"]
