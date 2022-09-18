FROM node:lts-alpine
ENV NODE_ENV=development
ENV IS_DOCKER=1
ENV TZ=Asia/Seoul
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --development --silent && mv node_modules ../
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "run", "dev:server"]
