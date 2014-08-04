[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [ARCHITECTURE](architecture) > **AUTHENTICATION**

joola is a secure system, meaning that any request must have a secure context with a valid authentication token.

The topic of Authentication is broad and contains several sub-topics:
- [Configuration](#configuration)
- [Security context & tokens](#tokens)
- [Single Sign On (SSO)](#sso)

<a name="configuration"/>
### Configuration

Configuring the framework authentication is done in two forms, firstly using the main authentication configuration section:

```yaml
authentication:
  basicauth:
    enabled: false #support for plaintext username/password (not-recommended)
  tokens:
    expireafter: 1200000 #token expiry in ms
  ratelimits: #rate limits
    guest: 60 
    user: 5000
  force404: false #display HTTP error 404 instead of 401
```

In addition, each workspace contains roles and users relevant.

```
workspaces:
  _test:
    key: _test
    name: joola Framework Tests
    description: Workspace for internal joola tests
    roles:
      root:
        key: "root"
        permissions:
          - "beacon:insert"
          - "query:fetch"
          - "query:stop"
          - "collections:list"
          - "collections:get"
        filter: []
      user:
        key: "users"
        permissions:
          - "query:fetch"
    users:
      root:
        username: "root"
        password: "password"
        roles:
          - "root"
        displayName: "Administrator"
        APIToken: "apitoken-test"
        ratelimit: 5000
```

<a name="tokens"/>
### Security context & tokens
Each request handled by the system must have a security context, i.e. be associated to a valid user in the system.
This ensures three main factors:
- The request is made by a valid and authenticated user.
- The action/endpoint requested by the user is allowed by their permissions.
- The user will see only data and content relevant to their account.
When a request is made, a token validation process takes place, it ensures that we have a valid token and the user is
authenticated and that the action/endpoint requested is allowed. During this process, we also force any `filters` applied on the account by their role or other configuration. 
This filter on the request is then used throughout the user's usage of the framework to ensure only [relevant data](#segregate) for this specific user is communicated.

<a name="sso"/>
#### Single-Sign-On (SSO)
joola exposes a dedicated endpoint [`/tokens/`](https://github.com/joola/joola/wiki/api-documentation#tokens-tokensapitoken) for the purpose of token generation.

When generating tokens the system requesting the new token defined the role and filter to apply as part of the token, this enables Single-Sign-On. An external system can 
call the [`/tokens/`](https://github.com/joola/joola/wiki/api-documentation#tokens-tokensapitoken) API endpoint to generate a token for a known user (server-side).
This token is than passed to the Webpage which consumes data and visualizations using the token.


