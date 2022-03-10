FROM node:16

WORKDIR /api

COPY package.json package-lock.json /api/

RUN npm ci --silent

COPY . .

EXPOSE 3000

CMD npm start