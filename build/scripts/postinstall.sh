if [ -z $npm_config_global ];
  then
    echo "Local Joola installation, leaving things as is."
  else
    groupadd joola
    useradd joola -G joola

    mkdir /etc/joola
    mkdir /var/log/joola
    
    echo "##### JOOLA INSTALLATION"
    echo "#"
    echo "#"
    echo "# Your Joola installation is now ready for use."
    echo "# The following changes have been applied to your environment:"
    echo "#"
    echo "# Joola is installed in $(pwd)"
    echo "# Added group `joola`"
    echo "# Added user `joola`"
    echo "# Else run the installation as a non root user"
    echo "#"
    echo "#"
    echo "#"
    echo "######"
    echo ""
fi
