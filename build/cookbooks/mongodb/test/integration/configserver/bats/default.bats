#!/usr/bin/env bats

@test "starts configserver" {
    # should return a 0 status code if mongodb is running
    if [ -e /etc/init.d/mongodb ]; then
        run /etc/init.d/mongodb status
        [ "$status" -eq 0 ]
    fi
    if [ -e /etc/init.d/mongod ]; then
        run /etc/init.d/mongod status
        [ "$status" -eq 0 ]
    fi

    # this catches if neither init files are present
    [ "$status" -eq 0 ]
}
