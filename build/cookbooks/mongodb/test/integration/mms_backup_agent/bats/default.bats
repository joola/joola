#!/usr/bin/env bats

@test "starts mms backup agent" {
    # should return a 0 status code if backup agent is running
    run service mongodb-mms-backup-agent status
    [ "$status" -eq 0 ]
}

@test "sets sslRequireValidServerCertificates to false" {
    run grep "sslRequireValidServerCertificates=false" /etc/mongodb-mms/backup-agent.config
    [ "$status" -eq 0 ]
}
