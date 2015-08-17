# DOCKER-VERSION 1.3.0

FROM ubuntu:14.04

MAINTAINER Itay Weinberger <itay@joo.la>

# start of by updating packages and installing base packages
RUN apt-get update -ym
RUN apt-get upgrade -ym
RUN apt-get install -y curl build-essential python git

<<<<<<< HEAD
# install supervisor
RUN apt-get install -y supervisor

# install needed stack components
RUN \ 
    apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 && \
    echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list && \
    sudo apt-get update && \
    sudo apt-get install -y mongodb-org    

RUN apt-get install -y redis-server rabbitmq-server
=======
>>>>>>> develop
RUN \
    curl -sL https://deb.nodesource.com/setup | sudo bash - && \
    apt-get install -y nodejs 

# setup needed settings/configuration for stack
<<<<<<< HEAD
COPY ./build/docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN mkdir -p /var/run/sshd
RUN ulimit -n 1024
RUN echo 'root:password' | chpasswd
ENV RABBITMQ_LOG_BASE /opt/joola/data/rabbitmq/log
ENV RABBITMQ_MNESIA_BASE /opt/joola/data/rabbitmq/mnesia
ENV LC_ALL C
=======
RUN ulimit -n 1024
ENV LC_ALL C
ENV NODE_CONFIG_DIR /opt/joola/bin/config
>>>>>>> develop

# setup joola directories
RUN mkdir -p /opt/joola/bin /opt/joola/logs

# install joola
COPY . /opt/joola/bin
RUN \ 
    cd /opt/joola/bin && \
    npm install 

<<<<<<< HEAD
EXPOSE 8080 8081 22
CMD []
ENTRYPOINT ["/usr/bin/supervisord"]
=======
EXPOSE 8080
CMD []
ENTRYPOINT ["node", "/opt/joola/bin/joola.js"]
>>>>>>> develop
