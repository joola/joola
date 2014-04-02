[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [SUBSYSTEMS](subsystems) > **AUTHENTICATION**

joola.io is a secure system, meaning that any request must have a secure context with a valid authentication token.

The topic of Authentication is broad and contains several sub-topics:
- [Configuration](#configuration)
- [Security context & tokens](#tokens)
- [Data segregation](#segregate)
- [Authentication stores](#stores)
- [Single Sign On (SSO)](#sso)

### Configuration
//TODO: Add relevant configuration information

### Security context & tokens
Each request handled by the system must have a security context, i.e. be assosciated to a valid user in the system.
This ensures three main factors:
- The request is made by a valid and authenticated user.
- The action/endpoint requested by the user is allowed by his permissions.
- The user will see only data and content relevant to his account.
When a request is made, a [token validation](#tokens) process occurs, it ensures that we have a valid token and the user is
authenticated and that the action/endpoint requested is allowed. During this process, we also force a `filter` on the request
which is used throughout the framework to ensure only [relevant data](#segregate) for this user is communicated.

#### Token generation
joola.io exposes a dedicated endpoint `/api/auth/generateToken` for the purpose of token generation.
//TODO: Add link to specific docs on generateToken. Add an example for generating token.

#### Token validation
joola.io uses it's `auth` middleware to check every request and evaluate its validity, here's the logical flow:

[[/images/authentication-flow.png]]
//TODO: Add link to full image

- Incoming request for non-static content
- Check for query string `token` parameter
- If none, check request headers for `joola-token`
- If none, check session for `joola-token`
-> If none, **redirect to login/return 401**
- If exists, validate token not expired
- If token not valid, **return 401**
- If valid, retrieve user details from token
- Check that the user has permission for target action
- If not, **return 500**
- If permissions ok, **process request**

### Data segregation
//TODO: TBC

### Authentication stores
//TODO: TBC

#### Custom authentication stores
//TODO: TBC

