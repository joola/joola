# DOCKER-VERSION 1.3.0

FROM ubuntu:14.04

MAINTAINER Itay Weinberger <itay@joo.la>

# start of by updating packages and installing base packages
RUN rm -fR /var/lib/apt/lists/*
RUN apt-get update -ym
RUN apt-get upgrade -ym
RUN apt-get install -y wget lsb-release unzip ca-certificates curl python build-essential git openssh-server

# install supervisor
RUN apt-get install -y supervisor

# install needed stack components
RUN apt-get install -y redis-server mongodb rabbitmq-server
RUN \
    curl -sL https://deb.nodesource.com/setup | sudo bash - && \
    apt-get install -y nodejs 

# setup needed settings/configuration for stack
COPY ./build/docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf 
RUN mkdir -p /var/run/sshd
RUN echo "root:password" | chpasswd
RUN ulimit -n 1024
ENV NODE_ENV production

# setup joola user account/group
RUN \
    groupadd joola && \
    useradd -g joola -d /home/joola -s /bin/bash joola && \
    echo "joola:joola" | chpasswd && \
    mkdir /home/joola && \
    chown -R joola:joola /home/joola
    
# install joola
RUN mkdir /opt/joola
COPY . /opt/joola
RUN \ 
    cd /opt/joola && \
    npm install 
 

EXPOSE 8080 8081 22
ENTRYPOINT ["/usr/bin/supervisord"]
