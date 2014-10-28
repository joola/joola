# DOCKER-VERSION 1.3.0

FROM ubuntu:14.04

MAINTAINER Itay Weinberger <itay@joo.la>

# start of by updating packages and installing base packages
RUN rm -fR /var/lib/apt/lists/*
RUN apt-get update -ym
RUN apt-get upgrade -ym
RUN apt-get install -y wget lsb-release unzip ca-certificates curl python build-essential git openssh-server

# install latest CFEngine
RUN wget -qO- http://cfengine.com/pub/gpg.key | apt-key add -
RUN echo "deb http://cfengine.com/pub/apt $(lsb_release -cs) main" > /etc/apt/sources.list.d/cfengine-community.list
RUN apt-get update && apt-get install -y cfengine-community

# install cfe-docker process management policy
RUN wget https://github.com/estenberg/cfe-docker/archive/master.zip -P /tmp/ && unzip /tmp/master.zip -d /tmp/
RUN cp /tmp/cfe-docker-master/cfengine/bin/* /var/cfengine/bin/
RUN cp /tmp/cfe-docker-master/cfengine/inputs/* /var/cfengine/inputs/
RUN rm -rf /tmp/cfe-docker-master /tmp/master.zip

# install needed stack components
RUN apt-get install -y redis-server mongodb rabbitmq-server
RUN \
    curl -sL https://deb.nodesource.com/setup | sudo bash - && \
    apt-get install -y nodejs 

# setup needed settings/configuration for stack
RUN mkdir -p /var/run/sshd
RUN echo "root:password" | chpasswd
RUN ulimit -n 1024
#ENV NODE_ENV production

# Setup joola user account/group
RUN \
    groupadd joola && \
    useradd -g joola joola && \
    echo "joola:joola" | chpasswd
    
# install joola
#RUN mkdir /opt/joola
#COPY . /opt/joola
#RUN \ 
#    cd /opt/joola && \
#    npm install 
     
EXPOSE 8080 8081 22
#WORKDIR /opt/joola

ENTRYPOINT ["/var/cfengine/bin/docker_processes_run.sh"]