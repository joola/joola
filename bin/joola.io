#!/bin/sh
basedir=`dirname "$0"`

case `uname` in
    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;
esac

if [ -x "$basedir/node" ]; then
  "$basedir/node"  "$basedir/lib/joola.io.js" "$@"
  ret=$?
else
  node  "$basedir/joola.io.js" "$@"
  ret=$?
fi
exit $ret

