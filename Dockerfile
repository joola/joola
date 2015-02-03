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
RUN \ 
    apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 && \
    echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list && \
    sudo apt-get update && \
    sudo apt-get install -y mongodb-org    

RUN apt-get install -y redis-server rabbitmq-server
RUN \
    curl -sL https://deb.nodesource.com/setup | sudo bash - && \
    apt-get install -y nodejs 
RUN \
    rabbitmq-plugins enable rabbitmq_stomp && \
    service rabbitmq-server restart

# setup needed settings/configuration for stack
COPY ./build/docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN mkdir -p /var/run/sshd
RUN ulimit -n 1024
RUN echo 'root:password' | chpasswd
ENV RABBITMQ_LOG_BASE /opt/joola/data/rabbitmq/log
ENV RABBITMQ_MNESIA_BASE /opt/joola/data/rabbitmq/mnesia
ENV LC_ALL C

# setup joola user account/group
RUN \
    groupadd joola && \
    useradd -g joola -d /home/joola -s /bin/bash joola && \
    echo "joola:joola" | chpasswd && \
    mkdir /home/joola && \
    chown -R joola:joola /home/joola
    
# setup joola directories
RUN mkdir -p /opt/joola/bin /opt/joola/logs /opt/joola/data/redis /opt/joola/data/mongodb /opt/joola/data/rabbitmq/log /opt/joola/data/rabbitmq/data
RUN chown -R joola:joola /opt/joola
RUN chown -R rabbitmq /opt/joola/data/rabbitmq

# install joola
COPY . /opt/joola/bin
RUN \ 
    cd /opt/joola/bin && \
    npm install 
COPY ./build/docker/run_within_docker.sh /opt/joola/bin/run_within_docker.sh

EXPOSE 8080 8081 22
CMD []
ENTRYPOINT ["/usr/bin/supervisord"]
