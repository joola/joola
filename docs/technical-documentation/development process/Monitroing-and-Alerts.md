  [HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [DEVELOPMENT](the-development-process) > **MONITORING AND ALERTS**

This section covers the different options available for monitoring the runtime operation of the joola framework.

>
We are using [nagios](http://nagios.org) for our health monitoring. For this section, all examples will be nagios oriented, but we believe it's clear enough to reflect on any monitoring system.

## Web Interfaces
Checking the web interfaces of joola are online is easy and straightforward.   
You will need to know which servers are running webservers and on which ports.

Example nagios config:
```
define service {
  use                           generic-service         ; Name of service template to use
  host_name                     host.name.com
  service_description           HTTP
  check_command                 check_http!--port=8080
  check_interval                1
  max_check_attempts            3
  first_notification_delay      0
  notifications_enabled         1
  contact_groups          	    joola
}

define service {
  use                           generic-service         ; Name of service template to use
  host_name                     host.name.com
  service_description           HTTPS
  check_command                 check_http!--port=8081 -S
  check_interval                1
  max_check_attempts            3
  first_notification_delay      0
  notifications_enabled         1
  contact_groups          	    joola
}

```

## Beacon and Query
Beacon and Query are API endpoints, and as such you can simply call the endpoint with a known payload and a known expected result and compare the two.

*TBC: add nagios configuration example*

## Using REPL
If you chose to enable REPL on your joola, then you can connect to the configured port (default 1337) and issue direct commands against the instance.

*TBC: add REPL check example*