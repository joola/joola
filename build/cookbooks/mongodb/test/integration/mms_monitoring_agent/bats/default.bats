#!/usr/bin/env bats

@test "starts mms monitoring agent" {
    # should return a 0 status code if monitoring agent is running
    run service mongodb-mms-monitoring-agent status
    [ "$status" -eq 0 ]
}

@test "sets sslRequireValidServerCertificates to false" {
    run grep "sslRequireValidServerCertificates=false" /etc/mongodb-mms/monitoring-agent.config
    [ "$status" -eq 0 ]
}
