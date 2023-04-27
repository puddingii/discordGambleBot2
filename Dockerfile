FROM node:18-alpine as ts-compiler
WORKDIR /usr/app
COPY package*.json tsconfig*.json yarn.lock ./
RUN yarn install --pure-lockfile
COPY . ./
RUN yarn build

FROM node:18-alpine as ts-remover
WORKDIR /usr/app
COPY --from=ts-compiler /usr/app/package*.json /usr/app/yarn.lock ./
COPY --from=ts-compiler /usr/app/build ./build
RUN yarn install --only=production --pure-lockfile

FROM node:18-alpine
WORKDIR /usr/app
ENV IS_DOCKER=1
ENV TZ=Asia/Seoul
ENV NODE_ENV=production
COPY --from=ts-remover /usr/app ./
RUN chmod -R 777 /usr/app
USER node
CMD ["npm", "run", "start"]
