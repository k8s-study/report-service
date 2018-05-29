FROM node:9.11

RUN apt-get update && \
    apt-get install apt-transport-https

RUN curl -OL https://download.arangodb.com/arangodb33/Debian_8.0/Release.key
RUN apt-key add - < Release.key
RUN echo 'deb https://download.arangodb.com/arangodb33/Debian_8.0/ /' | tee /etc/apt/sources.list.d/arangodb.list

RUN apt-get update && \
    apt-get install arangodb3-client && \
    apt-get clean

WORKDIR /opt/service

ADD package.json ./
ADD app.js ./
ADD server.js ./
ADD src ./src
ADD init ./init

RUN npm install

CMD node ./server.js
