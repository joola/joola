#!/bin/sh
basedir=`dirname "$0"`

case `uname` in
    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;
esac

if [ -x "$basedir/node" ]; then
  "$basedir/pm2" "start" "$basedir/service.json" "$@"
  ret=$?
else
  pm2 start "$basedir/service.json" "$@"
  ret=$?
fi
exit $ret

