#!/bin/sh

set -e

APP_NAME="joola"
CLI="$APP_NAME"
APP_USER="$APP_NAME" #$(${CLI} config:get APP_USER)
APP_GROUP="$APP_NAME" #$(${CLI} config:get APP_GROUP)
APP_CONFIG="/etc/${APP_NAME}/default.yml"

[ -f "$APP_CONFIG" ] || cp /opt/${APP_NAME}/config/default.yml $APP_CONFIG
chown $APP_USER.$APP_GROUP $APP_CONFIG
ln -f -s $APP_CONFIG /opt/$APP_NAME/config/default.yml
chmod 0640 $APP_CONFIG

${CLI} scale web=1 || true
