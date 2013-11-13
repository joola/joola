@echo off

set my_command=pm2
set my_params="%~dp0\service.json" %*

    %my_command% start %my_params%


