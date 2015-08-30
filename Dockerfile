# DOCKER-VERSION 1.3.0

FROM ubuntu:14.04

MAINTAINER Itay Weinberger <itay@joo.la>

# start of by updating packages and installing base packages
RUN apt-get update -ym
RUN apt-get upgrade -ym
RUN apt-get install -y curl build-essential python git

RUN \
    curl --silent --location https://deb.nodesource.com/setup_0.12 | sudo bash - && \
    apt-get install -y nodejs 

# setup needed settings/configuration for stack
RUN ulimit -n 1024
ENV LC_ALL C
ENV NODE_CONFIG_DIR /opt/joola/bin/config

# setup joola directories
RUN mkdir -p /opt/joola/bin /opt/joola/logs

# install joola
COPY . /opt/joola/bin
RUN \ 
    cd /opt/joola/bin && \
    npm install 

EXPOSE 8080
CMD []
ENTRYPOINT ["node", "/opt/joola/bin/joola.js"]
