#!/bin/bash

#
# Check if user is logged as root and that joola command is available
#

if ( [ "$EUID" -eq 0 ] || [ "$USER" == "root" ] ) && ! ( env | grep "unsafe-perm" );
  then
    echo "##### JOOLA INSTALLATION"
    echo "#"
    echo "#"
    echo "# As you run Joola as root, to update Joola automatically"
    echo "# you must add the --unsafe-perm flag."
    echo "#"
    echo "#       $  npm install joola -g --unsafe-perm"
    echo "#"
    echo "# Else run the installation as a non root user"
    echo "#"
    echo "#"
    echo "#"
    echo "######"
    echo ""
  exit 1
fi
