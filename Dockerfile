# DOCKER-VERSION 1.3.0

FROM ubuntu:14.04

MAINTAINER Itay Weinberger <itay@joo.la>

# Install needed stack components
RUN apt-get update
RUN apt-get upgrade
RUN apt-get install -y redis-server mongodb rabbitmq-server curl python build-essential 
RUN \
    curl -sL https://deb.nodesource.com/setup | sudo bash - && \
    apt-get install -y nodejs 

# Setup needed settings/configuration for stack
RUN ulimit -n 1024
#ENV NODE_ENV production

# Install joola
RUN mkdir /opt/joola
COPY . /opt/joola
RUN \ 
    cd /opt/joola && \
    npm install 
     
EXPOSE 8080 8081
WORKDIR /opt/joola
ENTRYPOINT ["node", "joola.js"]
