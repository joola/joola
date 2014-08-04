[HOME](Home) > [CONCEPTS](basic-concepts) > **Users**

A user is a simple metadata collection of attributes describing a user that will access and use the system.
Users have the following basic attributes:
- `username` which is a unique identifier of the user.
- `password` if plain-text login is allowed via [configuration](configuration).
- `displayName` is used by the UI to show a human-friendly username.
- `roles` is an array of strings, each is a defined role. A user may have more than one role and joola will aggregate the overall permissions and filters.
- `filter` is an array of filters, each restricting which data should be displayed for the user.

```js
{
  "username": "newuser",
  "password": "password",
  "displayName": "new user",
  "roles": ["user"],
  "filter": []
}
```

Adding a user via SDK:
```js
var user = {
  "username": "newuser",
  "password": "password",
  "displayName": "new user",
  "roles": ["user"],
  "filter": []
};

joola.users.add(user, function(err, result) {
  if (err)
    throw err;
  console.log('new user details:', result);
});
```

[API documentation on managing Users](https://github.com/joola/joola/wiki/api-documentation#users-usersworkspaceapitoken)