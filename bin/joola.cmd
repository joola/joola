@echo off

set my_command=node
set my_params="%~dp0\..\joola" %*

    %my_command% %my_params%