#!/bin/sh
set -e

# setup of general vars
APP_NAME="joola"
CLI="$APP_NAME"
APP_USER="$APP_NAME"
APP_GROUP="$APP_NAME"
APP_CONFIG_DIR="/etc/${APP_NAME}"
APP_CONFIG="${APP_CONFIG_DIR}/default.yml"

# setup needed configuration mapping
[ -f "$APP_CONFIG" ] || cp /opt/${APP_NAME}/config/default.yml $APP_CONFIG
chown $APP_USER.$APP_GROUP $APP_CONFIG
ln -f -s $APP_CONFIG /opt/$APP_NAME/config/default.yml
chmod 0640 $APP_CONFIG
$(${CLI} config:set NODE_CONFIG_DIR=$APP_CONFIG_DIR)
$(${CLI} config:set NODE_ENV=production)

# cleanup
unset JOOLA_PKG
rm ./postinstall.sh

# startup
${CLI} scale web=1 || true
