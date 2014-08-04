[HOME](Home) > [CONCEPTS](basic-concepts) > **Roles**

A user is a simple metadata collection of attributes describing a user that will access and use the system.
Users have the following basic attributes:
- `key` a unique identifier for the role.
- `permissions` is an array of strings, each is a defined permission.
- `filter` is an array of filters, each restricting which data should be displayed for users belonging to this role.

```js
{
  "key": "role-name",
  "permissions": [
    "access_system"
  ],
  "filter": []
}
```

Adding a role via SDK:
```js
var role = {
  "key": "role-name",
  "permissions": [
    "access_system"
  ],
  "filter": []
};

joola.roles.add(role, function(err, result) {
  if (err)
    throw err;
  console.log('new role details:', result);
});
```

[API documentation on managing Roles](https://github.com/joola/joola/wiki/api-documentation#roles-rolesworkspaceapitoken)