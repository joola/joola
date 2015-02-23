# DOCKER-VERSION 1.3.0

FROM ubuntu:14.04

MAINTAINER Itay Weinberger <itay@joo.la>

# start of by updating packages and installing base packages
RUN apt-get update -ym
RUN apt-get upgrade -ym
RUN apt-get install -y curl build-essential git

RUN \
    curl -sL https://deb.nodesource.com/setup | sudo bash - && \
    apt-get install -y nodejs 

# setup needed settings/configuration for stack
RUN ulimit -n 1024
RUN echo 'root:password' | chpasswd
ENV LC_ALL C
ENV NODE_CONFIG_DIR /opt/joola/bin/config

# setup joola user account/group
RUN \
    groupadd joola && \
    useradd -g joola -d /home/joola -s /bin/bash joola && \
    echo "joola:joola" | chpasswd && \
    mkdir /home/joola && \
    chown -R joola:joola /home/joola
    
# setup joola directories
RUN mkdir -p /opt/joola/bin /opt/joola/logs
RUN chown -R joola:joola /opt/joola

# install joola
COPY ../../ /opt/joola/bin
RUN \ 
    cd /opt/joola/bin && \
    npm install 

EXPOSE 8080 8081
CMD []
ENTRYPOINT ["node", "/opt/joola/bin/joola.js"]
