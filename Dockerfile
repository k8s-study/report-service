FROM node:9.11

RUN \
    apt-get update && \
    apt-get clean

WORKDIR /opt/service

ADD ./package.json ./
ADD ./app.js ./
ADD ./src ./

RUN npm install

CMD npm start
