---

layout: doc
title: REST API
description: All of Joola features and functions are exposed using a standard REST API.

---

This guide describes the resources that make up the joola API.
If you have any problems or requests please open an [issue](http://github.com/joola/joola/issues).

# Using This Guide

We will be using `http://localhost:8080` which is the default configuration for a fresh installation of joola.

You can use the `Debugging Host` to execute requests against a valid, online joola instance we have put up for the purpose of this guide. A valid token for this purpose is `apitoken-demo`.
Some actions will not be available in order to maintain system integrity.

While we understand how naive we are with this request, please apply Fair Usage and avoid vandalism of the system as much as possible. The node serving this guide will recycle every hour.

# Current Version
To check what version of joola is running, run:

```bash
$ curl http://localhost:8080/system/version?APIToken=apitoken-demo

{"version": "joola version 0.6.4"}
```

# Schema
All data is sent and received as JSON.

```bash
$ curl -i http://127.0.0.1:8080/system/version?APIToken=apitoken-demo

HTTP/1.1 200 OK
Server: joola
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: ETag, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
X-joola-Request-Id: HpEO6kDLn:1399190956781:Uj184Jhop
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4987
X-RateLimit-Reset: 1399192026
Retry-After: 1069
X-joola-Duration: 14
X-joola-Requested-By: HpEO6kDLn
X-joola-Fulfilled-By: HpEO6kDLn
X-joola-Duration-Fulfilled: 2
Content-Type: application/json
Content-Length: 36
ETag: "867689076"
Date: Sun, 04 May 2014 08:09:16 GMT
```

Blank fields are included as `null` instead of being omitted.

All timestamps are returned in ISO 8601 format:

```
YYYY-MM-DDTHH:MM:SSZ
```

## HTTP Verbs
joola API uses the following Verbs.

| Header   | Description                                                                                                                                                                                         |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `HEAD`   | Can be issued against any resource to get just the HTTP header info.                                                                                                                                |
| `GET`    | Used for retrieving resources.                                                                                                                                                                      |
| `POST`   | Used for creating resources, or performing custom actions.                                                                                                         |
| `PATCH`  | Used for updating resources with partial JSON data. For instance, an Issue resource has title and body attributes. A PATCH request may accept one or more of the attributes to update the resource. |
| `PUT`    | Used for replacing resources or collections. For PUT requests with no body attribute, be sure to set the Content-Length header to zero. Rarely used as part of the framework.                       |
| `DELETE` | Used for deleting resources.                                                                                                                                                                        |

# Security & Tokens
There are three ways to authenticate through joola API.
Requests that require authentication will return 404 Not Found, instead of 403 Forbidden, in some places. This is to prevent the accidental leakage of private information to unauthorized users.

## Basic Authentication

```bash
$ curl -u "workspace/username:password" http://localhost:8080/system/version
```

## APIToken (sent in a header)

```bash
$ curl -H "Authorization: token my-apitoken" http://localhost:8080/system/version
```

## APIToken (sent as a parameter)
```bash
$ curl http://localhost:8080/system/version?APIToken=my-apitoken
```

## Rate Limits
joola support rate limits. The default rate is `5000` requests per hour, but can be changed as part of the [configuration](http://github.com/joola/joola/wiki/configuration).

You can check the returned HTTP headers of any API request to see your current rate limit:

```bash
$ curl -i http://127.0.0.1:8080/system/version?APIToken=apitoken-demo

HTTP/1.1 200 OK
Date: Sun, 04 May 2014 07:39:52 GMT
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4989
X-RateLimit-Reset: 1399192026
```

The headers include the information about the current rate limit status:

| Header                | Description                                                                     |
|-----------------------|---------------------------------------------------------------------------------|
| X-RateLimit-Limit     | The maximum number of requests that the consumer is permitted to make per hour. |
| X-RateLimit-Remaining | The number of requests remaining in the current rate limit window.              |
| X-RateLimit-Reset     | The time at which the current rate limit window resets in UTC epoch seconds.    |
| Retry-After           | The number of seconds before the current rate limit resets.                     |

## Response Headers
Each API request fulfilled by joola contains some useful response headers:

| Header                       |                                                                                       |
|------------------------------|---------------------------------------------------------------------------------------|
| X-joola-Request-Id         | Unique request id assigned by joola server. Format: {NODE_UUID}:{TIMESTAMP}:{UUID} |
| X-joola-Duration           | Total duration of request from route in to out.                                       |
| X-joola-Duration-Fulfilled | Total duration of request from dispatch in/out.                                       |
| X-joola-Requested-By       | Node UUID of the requester.                                                           |
| X-joola-Fulfilled-By       | Node UUID of the fulfiller.                                                           |

# Group Workspaces
Notes related resources of the **Workspaces API**

## Workspaces [/workspaces{?APIToken}]
Workspaces are a high-level logical containers.
Each workspace is a separate logical and (sometimes) phyisical container, it has its own roles, users, collections and other meta data information describing the container.

Having multiple workspaces is the corner-stone for joola's multi-tenancy.

### Workspace Structure
| Field        | Type   | Description                             |
|:-------------|:-------|:----------------------------------------|
| key          | string | Workspace unique key.                   |
| name         | string | A nice display name for the Workspace.  |
| description  | string | Workspace description.                  |

+ Parameters
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### List all Workspaces [GET]
+ Response 200 (application/json)

        [
          {
            "key": "_test",
            "description": "Workspace for internal joola tests",
            "name": "joola Framework Tests"
          },
          {
            "key": "_stats",
            "description": "Stores internal statistics of joola",
            "name": "Internal Stats"
          },
          {
            "key": "demo",
            "description": "A starter/playground workpsace",
            "name": "Demo Workspace"
          }
        ]

### Create a Workspace [POST]
+ Request (application/json)

        {
          "key": "workspace-name",
          "name": "Workspace Name"
        }

+ Response 200 (application/json)

        {
          "key": "workspace-name",
          "name": "Workspace Name",
          "description": null
        }

+ Response 500 (application/json)

        { "message": "workspace already exists", "documentation_url": "http://github.com/joola/joola/wiki" }

## Workspace [/workspaces/{key}{?APIToken}]

+ Parameters
    + key (required, string, `workspace-name`) ... String `key` of the Workspace to perform action with. Has example value.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Retrieve a Workspace [GET]
+ Response 200 (application/json)

    + Body

            {
              "key": "workspace-name",
              "name": "Workspace Name",
              "description": null
            }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "workspace [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Update a Workspace [PATCH]
+ Request (application/json)

        { "description": "workspace description" }

+ Response 200

        {
          "key": "workspace-name",
          "name": "Workspace Name",
          "description": "workspace description"
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 415 (application/json)

        { "message": "unsupported media type.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "role [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Remove a Workspace [DELETE]
+ Response 200

        {}

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 415 (application/json)

        { "message": "unsupported media type.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "workspace [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

# Group Collections
Notes related resources of the **Collections API**

## Collections [/collections/{workspace}{?APIToken}]

### Collection Structure
| Field        | Type   | Description                             |
|:-------------|:-------|:----------------------------------------|
| key          | string | Collection unique key.                  |
| name         | string | A nice display name for the Collection. |
| description  | string | Collection description.                 |
| strongTyped  | bool   | Is the collection strong typed?         |
| dimensions  | array   | Array of dimensions part of the collection         |
| metrics  | array   | Array of Metrics part of the collection         |

+ Parameters
    + workspace (required, string, `demo`) ... The `Workspace` of the collection performing the action.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### List all Collections [GET]
+ Response 200 (application/json)

            [
              {
                "key": "demo-visits",
                "strongTyped": "true",
                "name": "demo-visits",
                "dimensions": [
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "referrer",
                    "key": "referrer"
                  },
                  {
                    "datatype": "ip",
                    "type": "dimension",
                    "name": "ip",
                    "key": "ip"
                  },
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "userid",
                    "key": "userid"
                  },
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "os",
                    "key": "os"
                  },
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "engine",
                    "key": "engine"
                  },
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "browser",
                    "key": "browser"
                  },
                  {
                    "datatype": "date",
                    "type": "dimension",
                    "name": "timestamp",
                    "key": "timestamp"
                  }
                ],
                "description": ""
              },
              {
                "key": "demo-clicks",
                "strongTyped": "true",
                "name": "demo-clicks",
                "dimensions": [
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "referrer",
                    "key": "referrer"
                  },
                  {
                    "datatype": "ip",
                    "type": "dimension",
                    "name": "ip",
                    "key": "ip"
                  },
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "userid",
                    "key": "userid"
                  },
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "os",
                    "key": "os"
                  },
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "engine",
                    "key": "engine"
                  },
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "browser",
                    "key": "browser"
                  },
                  {
                    "datatype": "date",
                    "type": "dimension",
                    "name": "timestamp",
                    "key": "timestamp"
                  }
                ],
                "description": ""
              },
              {
                "key": "demo-mousemoves",
                "strongTyped": "true",
                "name": "demo-mousemoves",
                "dimensions": [
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "referrer",
                    "key": "referrer"
                  },
                  {
                    "datatype": "ip",
                    "type": "dimension",
                    "name": "ip",
                    "key": "ip"
                  },
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "userid",
                    "key": "userid"
                  },
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "os",
                    "key": "os"
                  },
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "engine",
                    "key": "engine"
                  },
                  {
                    "datatype": "string",
                    "type": "dimension",
                    "name": "browser",
                    "key": "browser"
                  },
                  {
                    "datatype": "date",
                    "type": "dimension",
                    "name": "timestamp",
                    "key": "timestamp"
                  }
                ],
                "description": ""
              }
            ]


## Collection [/collections/{workspace}/{key}{?APIToken}]

+ Parameters
    + workspace (optional, string, `demo`) ... The `Workspace` of the collection performing the action.
    + key (required, string, `demo-visits`) ... String `key` of the Collection to perform action with.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Retrieve a Collection [GET]
+ Response 200 (application/json)

    + Body

            {
              "key": "demo-visits",
              "name": "demo-visits",
              "strongTyped": "true",
              "dimensions": [
                {
                  "datatype": "date",
                  "type": "dimension",
                  "name": "timestamp",
                  "key": "timestamp"
                },
                {
                  "datatype": "string",
                  "type": "dimension",
                  "name": "browser",
                  "key": "browser"
                },
                {
                  "datatype": "string",
                  "type": "dimension",
                  "name": "engine",
                  "key": "engine"
                },
                {
                  "datatype": "string",
                  "type": "dimension",
                  "name": "os",
                  "key": "os"
                },
                {
                  "datatype": "string",
                  "type": "dimension",
                  "name": "userid",
                  "key": "userid"
                },
                {
                  "datatype": "ip",
                  "type": "dimension",
                  "name": "ip",
                  "key": "ip"
                },
                {
                  "datatype": "string",
                  "type": "dimension",
                  "name": "referrer",
                  "key": "referrer"
                }
              ],
              "description": ""
            }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "collection [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Update a Collection [PATCH]
+ Request (application/json)

        { "description": "collection description" }

+ Response 200

          {
            "key": "demo-visits",
            "name": "demo-visits",
            "strongTyped": "true",
            "dimensions": [
              {
                "datatype": "date",
                "type": "dimension",
                "name": "timestamp",
                "key": "timestamp"
              },
              {
                "datatype": "string",
                "type": "dimension",
                "name": "browser",
                "key": "browser"
              },
              {
                "datatype": "string",
                "type": "dimension",
                "name": "engine",
                "key": "engine"
              },
              {
                "datatype": "string",
                "type": "dimension",
                "name": "os",
                "key": "os"
              },
              {
                "datatype": "string",
                "type": "dimension",
                "name": "userid",
                "key": "userid"
              },
              {
                "datatype": "ip",
                "type": "dimension",
                "name": "ip",
                "key": "ip"
              },
              {
                "datatype": "string",
                "type": "dimension",
                "name": "referrer",
                "key": "referrer"
              }
            ],
            "description": "collection description"
          }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 415 (application/json)

        { "message": "unsupported media type.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "role [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Remove a Collection [DELETE]
+ Response 200

        {}

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "collection [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

## Dimensions [/collections/{workspace}/{collection}/dimensions{?APIToken}]
Optional body will compose a joint metadata of collection and document.

+ Parameters
    + workspace (required, string, `demo`) ... The `Workspace` of the collection performing the action.
    + collection (required, string, `demo-clicks`) ... String `Collection` of the Collection to perform action with.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Retrieve all Dimensions [GET]
+ Request (application/json)

          {}

+ Response 200 (application/json)

    + Body

              [
                {
                  "datatype": "date",
                  "name": "timestamp",
                  "key": "timestamp"
                },
                {
                  "datatype": "string",
                  "name": "browser",
                  "key": "browser"
                },
                {
                  "datatype": "string",
                  "name": "engine",
                  "key": "engine"
                },
                {
                  "datatype": "string",
                  "name": "os",
                  "key": "os"
                },
                {
                  "datatype": "string",
                  "name": "userid",
                  "key": "userid"
                },
                {
                  "datatype": "ip",
                  "name": "ip",
                  "key": "ip"
                },
                {
                  "datatype": "string",
                  "name": "referrer",
                  "key": "referrer"
                }
              ]


+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "dimension [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Create a Dimension [POST]
+ Request (application/json)

        {
          "key": "dimension-key",
          "name": "dimension key",
          "datatype": "string"
        }

+ Response 200 (application/json)

        {
          "key": "dimension-key",
          "name": "dimension key",
          "datatype": "string"
        }

+ Response 500 (application/json)

        { "message": "dimension already exists", "documentation_url": "http://github.com/joola/joola/wiki" }

## Dimension [/collections/{workspace}/{collection}/dimensions/{key}{?APIToken}]
Optional body will compose a joint metadata of collection and document.

+ Parameters
    + workspace (required, string, `demo`) ... The `Workspace` of the collection performing the action.
    + collection (required, string, `demo-clicks`) ... String `Collection` of the Collection to perform action with.
    + key (required, string, `dimension-key`) ... String `key` of the Dimension to perform action with.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Retrieve a Dimension [GET]
+ Response 200 (application/json)

    + Body

            {
              "key": "dimension-key",
              "name": "dimension key",
              "datatype": "string",
              "description": ""
            }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "dimension [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Update a Dimension [PATCH]
+ Request (application/json)

        { "description": "a sample description for dimension-key" }

+ Response 200

        {
          "key": "dimension-key",
          "name": "dimension key",
          "datatype": "string",
          "description": "a sample description for dimension-key"
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 415 (application/json)

        { "message": "unsupported media type.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "dimension [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Remove a Dimension [DELETE]
+ Response 200

        {}

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "dimension [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

## Metrics [/collections/{workspace}/{collection}/metrics{?APIToken}]

+ Parameters
    + workspace (required, string, `demo`) ... The `Workspace` of the collection performing the action.
    + collection (required, string, `demo-clicks`) ... String `Collection` of the Collection to perform action with.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Retrieve all Metrics [GET]
+ Request (application/json)

          {}

+ Response 200 (application/json)

    + Body

              [
                {
                  "datatype": "number",
                  "name": "clicks",
                  "key": "clicks"
                }
              ]


+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "metric [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Create a Metric [POST]
+ Request (application/json)

        {
          "key": "metric-key",
          "name": "metric key",
          "datatype": "int",
          "aggregation": "sum",
          "prefix": null,
          "suffix": null,
          "formula": null,
          "decimals": 0,
          "description": ""
        }

+ Response 200 (application/json)

        {
          "key": "dimension-key",
          "name": "dimension key",
          "datatype": "string"
        }

+ Response 500 (application/json)

        { "message": "metric already exists", "documentation_url": "http://github.com/joola/joola/wiki" }

## Metric [/collections/{workspace}/{collection}/metrics/{key}{?APIToken}]

+ Parameters
    + workspace (required, string, `demo`) ... The `Workspace` of the collection performing the action.
    + collection (required, string, `demo-clicks`) ... String `Collection` of the Collection to perform action with.
    + key (required, string, `metric-key`) ... String `key` of the Metric to perform action with.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Retrieve a Metric [GET]
+ Response 200 (application/json)

    + Body

              {
                "key": "metric-key",
                "name": "metric key",
                "datatype": "int",
                "aggregation": "sum",
                "prefix": null,
                "suffix": null,
                "formula": null,
                "decimals": 0,
                "description": ""
              }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "metric [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Update a Metric [PATCH]
+ Request (application/json)

        { "description": "a sample description for metric-key" }

+ Response 200

        {
          "key": "metric-key",
          "name": "metric key",
          "datatype": "int",
          "aggregation": "sum",
          "prefix": null,
          "suffix": null,
          "formula": null,
          "decimals": 0,
          "description": "a sample description for metric-key"
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 415 (application/json)

        { "message": "unsupported media type.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "metric [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Remove a Metric [DELETE]
+ Response 200

        {}

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "metric [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

## Metadata [/collections/{workspace}/{key}/metadata{?APIToken}]
Optional body will compose a joint metadata of collection and document.

+ Parameters
    + workspace (required, string, `demo`) ... The `Workspace` of the collection performing the action.
    + key (required, string, `demo-clicks`) ... String `key` of the Collection to perform action with.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Retrieve a Collection Metadata [POST]
+ Request (application/json)

          {}

+ Response 200 (application/json)

    + Body

              {
                "timestamp": {
                  "datatype": "date",
                  "type": "dimension",
                  "name": "timestamp",
                  "key": "timestamp"
                },
                "browser": {
                  "datatype": "string",
                  "type": "dimension",
                  "name": "browser",
                  "key": "browser"
                },
                "engine": {
                  "datatype": "string",
                  "type": "dimension",
                  "name": "engine",
                  "key": "engine"
                },
                "os": {
                  "datatype": "string",
                  "type": "dimension",
                  "name": "os",
                  "key": "os"
                },
                "userid": {
                  "datatype": "string",
                  "type": "dimension",
                  "name": "userid",
                  "key": "userid"
                },
                "ip": {
                  "datatype": "ip",
                  "type": "dimension",
                  "name": "ip",
                  "key": "ip"
                },
                "referrer": {
                  "datatype": "string",
                  "type": "dimension",
                  "name": "referrer",
                  "key": "referrer"
                },
                "clicks": {
                  "datatype": "number",
                  "type": "metric",
                  "name": "clicks",
                  "key": "clicks"
                },
                "description": ""
              }


+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "collection [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

# Group Roles
joola uses `Roles` to assign `Permissions` to `Users`.

### Role Structure
| Field        | Type   | Description                             |
|:-------------|:-------|:----------------------------------------|
| key          | string | Role unique key.                        |
| permissions | array  | Permissions associated with this Role.  |
| filter      | array  | Filters to apply on users of this Role. |

By assigning permissions to a role, and later assigning users to it, we can create a role-based permissions system.
Roles also include a Filter, this means that any user assosciated with the Role will automatically be assigned with the Filter.

Scenario:
We want to create a group of users to be able to view only activity coming from the Europe region:

```js
var role = {
    key: 'europe-users',
    permissions: ['query:fetch'],
    filter: [
        ['Region', 'eq', 'Europe']
    ]
};
```

Users can be assigned to multiple roles and since Filters are aggregative, they will be assigned with all Filters from all Roles.

## Roles [/roles/{workspace}{?APIToken}]

+ Parameters
    + workspace (required, string, `demo`) ... String `workspace` of the Workspace containing the Role.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### List all Roles [GET]
+ Response 200 (application/json)

        [
          {
            "key": "root",
            "filter": [],
            "permissions": [
              "access_system",
              "manage_system",
              "manage_users",
              "beacon_insert",
              "query_fetch",
              "workspaces:list",
              "workspaces:get",
              "workspaces:add",
              "workspaces:patch",
              "workspaces:delete",
              "roles:list",
              "roles:get",
              "roles:add",
              "roles:patch",
              "roles:delete",
              "users:list",
              "users:get",
              "users:add",
              "users:patch",
              "users:delete",
              "users:generateToken",
              "users:validateToken",
              "users:expireToken",
              "misc:see_private"
            ]
          },
          {
            "key": "user",
            "filter": [],
            "permissions": [
              "access_system"
            ]
          },
          {
            "key": "user",
            "filter": [],
            "permissions": [
              "beacon_insert"
            ]
          },
          {
            "key": "user",
            "filter": [],
            "permissions": [
              "access_system",
              "beacon_insert"
            ]
          }
        ]

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Create a Role [POST]
+ Request (application/json)

        { "key": "role-name", "permissions": ["access_system"], "filter": [] }

+ Response 200 (application/json)

        {
          "key": "role-name",
          "permissions": [
            "access_system"
          ],
          "filter": []
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 415 (application/json)

        { "message": "unsupported media type.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "role already exists", "documentation_url": "http://github.com/joola/joola/wiki" }

## Role [/roles/{workspace}/{key}{?APIToken}]

+ Parameters
    + workspace (required, string, `demo`) ... String `workspace` of the Workspace containing the Role.
    + key (required, string, `role-name`) ... String `key` of the Role.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Retrieve a Role [GET]
+ Response 200 (application/json)

        {
          "key": "role-name",
          "permissions": [
            "access_system"
          ],
          "filter": []
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "role [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Update a Role [PATCH]
+ Request (application/json)

        { "filter": [["dimension", "eq", "value"]] }

+ Response 200

        {
          "key": "role-name",
          "permissions": [
            "access_system"
          ],
          "filter": []
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 415 (application/json)

        { "message": "unsupported media type.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "role [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Remove a Role [DELETE]
+ Response 200

        {}

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 415 (application/json)

        { "message": "unsupported media type.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "role [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

# Group Users

Any system access or action taken in the framework requires a valid security context. Therefore, using these API endpoints, you'll be able to setup the different users.

Users belong to a Workspace and any operations on a user must be within a Workspace context.

### Users Structure
| Field       | Type           | Description                             |
|:------------|:---------------|:----------------------------------------|
| username    | string         | The user's username.                    |
| displayName | string         | A pretty display name for the user.     |
| APIToken    | string         | APIToken associated with this user.     |
| filter      | array, private | Array of Filters to apply on this user. |
| roles       | array          | Array of Roles this user belongs to.    |

## Users [/users/{workspace}{?APIToken}]

+ Parameters
    + workspace (required, string, `demo`) ... String `workspace` of the Workspace containing the User.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### List all Users [GET]
+ Response 200 (application/json)

        [
          {
            "filter": [],
            "APIToken": "apitoken-demo",
            "displayName": "Administrator",
            "roles": [
              "root"
            ],
            "username": "root",
            "workspace": "demo"
          },
          {
            "APIToken": "apitoken-beacon",
            "displayName": "Beacon",
            "roles": [
              "beacon"
            ],
            "username": "beacon",
            "workspace": "demo"
          },
          {
            "APIToken": "apitoken-reader",
            "displayName": "Reader",
            "roles": [
              "reader"
            ],
            "username": "reader",
            "workspace": "demo"
          }
        ]

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Create a User [POST]
+ Request (application/json)

        {
          "username": "newuser",
          "password": "password",
          "displayName": "new user",
          "filter": [],
          "roles": ["user"]
        }

+ Response 200 (application/json)

        {
          "username": "newuser",
          "displayName": "new user",
          "filter": [],
          "workspace": "demo",
          "roles": ["user"]
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 415 (application/json)

        { "message": "unsupported media type.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "user already exists", "documentation_url": "http://github.com/joola/joola/wiki" }

## User [/users/{workspace}/{username}{?APIToken}]

+ Parameters
    + workspace (required, string, `demo`) ... String `workspace` of the Workspace containing the User.
    + username (required, string, `newuser`) ... String `key` of the User.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Retrieve a User [GET]
+ Response 200 (application/json)

        {
          "username": "newuser",
          "displayName": "new user",
          "filter": [],
          "roles": [
            "user"
          ],
          "workspace": "demo",
          "APIToken": null
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "user [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Update a User [PATCH]
+ Request (application/json)

        { "APIToken": "apitoken-newuser" }

+ Response 200

        {
          "username": "newuser",
          "displayName": "new user",
          "filter": [],
          "roles": [
            "user"
          ],
          "workspace": "demo",
          "APIToken": "apitoken-newuser"
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 415 (application/json)

        { "message": "unsupported media type.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "user [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Remove a User [DELETE]
+ Response 200

        {}

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 415 (application/json)

        { "message": "unsupported media type.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "user [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

## User Permissions [/users/{workspace}/{username}/permissions{?APIToken}]

+ Parameters
    + workspace (required, string, `demo`) ... String `workspace` of the Workspace containing the User.
    + username (required, string, `root`) ... String `username` of the User.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### List all User's permissions [GET]
+ Response 200 (application/json)

        [
          "access_system",
          "manage_system",
          "manage_users",
          "beacon_insert",
          "query_fetch",
          "workspaces:list",
          "workspaces:get",
          "workspaces:add",
          "workspaces:patch",
          "workspaces:delete",
          "roles:list",
          "roles:get",
          "roles:add",
          "roles:patch",
          "roles:delete",
          "users:list",
          "users:get",
          "users:add",
          "users:patch",
          "users:delete",
          "users:generateToken",
          "users:validateToken",
          "users:expireToken",
          "users:permissions",
          "misc:see_private"
        ]

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "user [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

# Group Authentication
joola uses two types of security contexts, `token` and `APIToken`:

- `token` is a short-lived (configurable) security token holding the user context and can be used to consume API endpoints on behalf of the user.
- `APIToken` is a long-lived security token which is configured as part of the user account. Using an APIToken assumes that the token is secret and is used by the correct priviliged user.

## Tokens [/tokens/{?APIToken}]

+ Parameters
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Generate Token [POST]
+ Request (application/json)

        {
          "username": "newuser",
          "password": "password",
          "displayName": "new user",
          "filter": [],
          "roles": ["user"]
        }

+ Response 200 (application/json)

        {
          "user": {
            "username": "newuser",
            "password": "password",
            "displayName": "new user",
            "filter": [],
            "roles": [
              "user"
            ],
            "workspace": "demo",
            "APIToken": null
          },
          "_": "0ektI1zId",
          "timestamp": 1399620503649,
          "last": 1399620503651,
          "expires": 1406131703000
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 415 (application/json)

        { "message": "unsupported media type.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "unknown error", "documentation_url": "http://github.com/joola/joola/wiki" }

## Token [/tokens/{token}{?APIToken}]

+ Parameters
    + token (required, string, `0NSGRgfxJ`) ... String `token` of the token to verify.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Validate a Token [GET]

+ Response 401 (application/json)

        { "message": "Failed to validate token [1] [0NSGRgfxJ]", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 200 (application/json)

        {
          "user": {
            "username": "newuser",
            "password": "password",
            "displayName": "new user",
            "filter": [],
            "roles": [
              "user"
            ],
            "workspace": "demo",
            "APIToken": null
          },
          "_": "0NSGRgfxJ",
          "timestamp": 1399620503649,
          "last": 1399620503651,
          "expires": 1406131703000
        }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "unknown error", "documentation_url": "http://github.com/joola/joola/wiki" }

### Delete a Token [DELETE]

+ Response 200 (application/json)

        {}

+ Response 401 (application/json)

        { "message": "Failed to validate token [1] [0NSGRgfxJ]", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "unknown error", "documentation_url": "http://github.com/joola/joola/wiki" }

## API Token [/apitokens/{token}{?APIToken}]

+ Parameters
    + token (required, string, `apitoken-demo`) ... The `APIToken` of to verify.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Validate an APIToken [GET]

+ Response 200 (application/json)

        {
          "username": "root",
          "roles": [
            "root"
          ],
          "displayName": "Administrator",
          "APIToken": "apitoken-demo",
          "filter": [],
          "workspace": "demo"
        }

+ Response 401 (application/json)

        { "message": "Failed to validate api token [apitoken-demo]", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 403 (application/json)

        { "message": "forbidden.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "unknown error", "documentation_url": "http://github.com/joola/joola/wiki" }

# Group Permissions
Permissions are hard-coded string values assigned to each API endpoint. Permissions work in conjunction with `Users` and `Roles` to form joola's role-based permissions system.

### Permission Structure
| Field        | Type   | Description                             |
|:-------------|:-------|:----------------------------------------|
| key          | string | Permission unique key.                  |

## Permissions [/permissions/{?APIToken}]

+ Parameters
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### List all Permissions [GET]
+ Response 200 (application/json)

        [
          "access_system",
          "manage_system",
          "beacon_insert",
          "query"
        ]

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

## Permission [/permissions/{key}{?APIToken}]

+ Parameters
    + key (required, string, `access_system`) ... String `key` of the Permission.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Retrieve a Permission [GET]
+ Response 200 (application/json)

        [
          "access_system"
        ]

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "permission [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

# Group Beacon
Notes related resources of the **Beacon API**

## Beacon [/beacon/{workspace}/{collection}{?APIToken}]

+ Parameters
    + workspace (required, string, `demo`) ... The `key` of the Workspace performing the action.
    + collection (required, string, `demo-example`) ... The `key` of the Collection performing the action.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Insert Documents [POST]
+ Request (application/json)

    + Body

            [{
              "timestamp": null,
              "article": "Sample Analytics",
              "browser": "Chrome",
              "device": "Desktop",
              "engine": "Webkit",
              "os": "Linux",
              "userid": "demo@joo.la",
              "ip": "127.0.0.1",
              "referrer": "http://joo.la",
              "visits": 1,
              "loadtime": 123
            }]

+ Response 200 (application/json)

            [
              {
                "timestamp": "2014-05-10T15:49:49.575Z",
                "article": "Sample Analytics",
                "browser": "Chrome",
                "device": "Desktop",
                "engine": "Webkit",
                "os": "Linux",
                "userid": "demo@joo.la",
                "ip": "127.0.0.1",
                "referrer": "http://joo.la",
                "visits": 1,
                "loadtime": 123,
                "timestamp_timebucket": {
                  "dow": 6,
                  "hod": 18,
                  "second": "2014-05-10T15:49:49.000Z",
                  "minute": "2014-05-10T15:49:00.000Z",
                  "hour": "2014-05-10T15:00:00.000Z",
                  "ddate": "2014-05-10T00:00:00.000Z",
                  "month": "2014-05-01T00:00:00.000Z",
                  "year": "2014-01-01T01:00:00.000Z"
                },
                "ourTimestamp": "2014-05-10T15:49:49.575Z",
                "saved": true
              }
            ]


+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "permission [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

# Group Query
Notes related resources of the **Query API**

## Query [/query{?APIToken}]

+ Parameters
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Fetch [POST]
+ Request (application/json)

    + Body

            {
              "timeframe": "last_hour",
              "metrics": ["visits"],
              "collection": "demo-example"
            }

+ Response 200 (application/json)

            {
              "dimensions": [],
              "metrics": [],
              "documents": [],
              "uid": "kUTTRqspS",
              "resultCount": 0,
              "query": {
                "dontcache": true,
                "filter": null,
                "realtime": false,
                "interval": "timebucket.minute",
                "timeframe": {
                  "start": "2014-05-10T14:35:28.000Z",
                  "end": "2014-05-10T15:35:28.999Z"
                },
                "metrics": [],
                "dimensions": [],
                "uid": "kUTTRqspS",
                "ts": {
                  "start": "2014-05-10T15:35:28.114Z",
                  "end": "2014-05-10T15:35:28.117Z",
                  "duration": 3
                }
              }
            }


+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "permission [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

# Group Configuration
joola uses a central-configuration store to support a node-based deployment schema.
This means that nodes will grab their configuration from central store and that any update to it is propogated to all nodes without a need to restart the service.

Configuration keys are referenced with `:` as a separator, i.e. to change the web server interface port, use `interfaces:webserver:port`.

To learn more about configuration, please refer to the [wiki](http://github.com/joola/joola/wiki/configuration).

## Configuration [/config/{key}{?APIToken}]

+ Parameters
    + key (required, string, `interfaces:webserver:port`) ... The `key` of the configuration to get/set.
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Add a Configuration Key/Value [POST]
+ Request (application/json)

    + Body

            {"value": "8080"}

+ Response 200 (application/json)

          {
            "key": "interfaces:webserver:port",
            "value": "8080"
          }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Get Configuration value [GET]
+ Response 200 (application/json)

        {
          "key": "interfaces:webserver:port",
          "value": "8080"
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "configuration [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

### Set Configuration Value [PATCH]
+ Request (application/json)

    + Body

            {
              "key": "interfaces:webserver:port",
              "value": "8080"
            }

+ Response 200 (application/json)

        {
          "key": "interfaces:webserver:port",
          "value": "8080"
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

+ Response 500 (application/json)

        { "message": "configuration [{key}] does not exist.", "documentation_url": "http://github.com/joola/joola/wiki" }

# Group System
This group lists all general system functions available as part of the joola framework.

## System Version [/system/version{?APIToken}]
Print out joola version.

+ Parameters
    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Get System Version [GET]
+ Response 200 (application/json)

        { "version": "joola version 0.4.1" }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

## Who Am I [/system/whoami{?APIToken}]
Print out the `User` object taken from the `APIToken` provided.

+ Parameters

    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Get Current User [GET]
+ Response 200 (application/json)

        {
          "username": "root",
          "roles": [
            "root"
          ],
          "displayName": "Administrator",
          "APIToken": "apitoken-demo",
          "filter": []
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

## Node UID [/system/nodeUID{?APIToken}]
Print out the unique identifier of the replying node.

+ Parameters

    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Get Node UID [GET]
+ Response 200 (application/json)

        {
          "UID": "By8zwB85V"
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }

## Node Details [/system/nodeDetails{?APIToken}]
Print out all known details on the replying node.

+ Parameters

    + APIToken (optional, string, `apitoken-demo`) ... The `APIToken` of the user performing the action.

### Get Node Details [GET]
+ Response 200 (application/json)

        {
          "uid": "Wdsz265IH",
          "state": "online",
          "uptime": 5.378805379965343,
          "lastSeen": 1399277245932,
          "lastSeenNice": "2014-05-05T08:07:25.932Z",
          "hostname": "joola01",
          "os": {
            "type": "Linux",
            "platform": "linux",
            "arch": "x64",
            "release": "2.6.32-431.11.2.el6.x86_64",
            "uptime": 696896.172012026,
            "loadavg": [
              0.0439453125,
              0.0537109375,
              0.072265625
            ],
            "totalmem": 16610000896,
            "freemem": 3014160384,
            "cpus": [
              {
                "model": "Intel(R) Core(TM) i7-4770 CPU @ 3.40GHz",
                "speed": 3401,
                "times": {
                  "user": 226411800,
                  "nice": 10627400,
                  "sys": 120201400,
                  "idle": 6573488900,
                  "irq": 5200
                }
              },
              {
                "model": "Intel(R) Core(TM) i7-4770 CPU @ 3.40GHz",
                "speed": 800,
                "times": {
                  "user": 307745500,
                  "nice": 11872400,
                  "sys": 48696800,
                  "idle": 6565468200,
                  "irq": 0
                }
              },
              {
                "model": "Intel(R) Core(TM) i7-4770 CPU @ 3.40GHz",
                "speed": 800,
                "times": {
                  "user": 124095500,
                  "nice": 10080100,
                  "sys": 35291400,
                  "idle": 6734179700,
                  "irq": 2200
                }
              },
              {
                "model": "Intel(R) Core(TM) i7-4770 CPU @ 3.40GHz",
                "speed": 800,
                "times": {
                  "user": 109732700,
                  "nice": 8824500,
                  "sys": 24565500,
                  "idle": 6792483200,
                  "irq": 0
                }
              },
              {
                "model": "Intel(R) Core(TM) i7-4770 CPU @ 3.40GHz",
                "speed": 800,
                "times": {
                  "user": 170818400,
                  "nice": 5675300,
                  "sys": 72066700,
                  "idle": 6690757600,
                  "irq": 0
                }
              },
              {
                "model": "Intel(R) Core(TM) i7-4770 CPU @ 3.40GHz",
                "speed": 800,
                "times": {
                  "user": 140783900,
                  "nice": 8544200,
                  "sys": 34519000,
                  "idle": 6742696500,
                  "irq": 0
                }
              },
              {
                "model": "Intel(R) Core(TM) i7-4770 CPU @ 3.40GHz",
                "speed": 800,
                "times": {
                  "user": 110794200,
                  "nice": 8476700,
                  "sys": 31455900,
                  "idle": 6773844400,
                  "irq": 0
                }
              },
              {
                "model": "Intel(R) Core(TM) i7-4770 CPU @ 3.40GHz",
                "speed": 800,
                "times": {
                  "user": 101734700,
                  "nice": 7965100,
                  "sys": 25291700,
                  "idle": 6792722900,
                  "irq": 0
                }
              }
            ]
          },
          "usageCPU": 2.9702970296755726,
          "usageMem": 67366912,
          "http": true,
          "https": false,
          "cluster": false,
          "clusterID": null,
          "clusterMaster": null,
          "clusterSlave": null,
          "connectedSockets": 1
        }

+ Response 401 (application/json)

        { "message": "missing permission.", "documentation_url": "http://github.com/joola/joola/wiki" }
