{
  "rules": {
    "users": {
      ".read": "root.child('users/' + auth.uid + '/isAdmin').val() === true",
      "$uid": {
        ".read": "auth.uid === $uid",
        ".write": "auth.uid === $uid || root.child('users/' + auth.uid + '/isAdmin').val() === true"
      }
    },
    "groups": {
      ".read": "auth != null && (root.child('users/' + auth.uid + '/role').val() === 'super-admin' || root.child('users/' + auth.uid + '/role').val() === 'restricted-admin' || root.child('users/' + auth.uid + '/isAdmin').val() === true)",
      ".write": "auth != null && root.child('users/' + auth.uid + '/role').val() === 'super-admin'",
      "$groupId": {
        ".validate": "newData.hasChildren(['name','createdAt']) && newData.child('name').isString() && newData.child('name').val().length > 0 && (!newData.child('completedAt').exists() || newData.child('completedAt').isNumber()) && (!newData.child('completionDurationSec').exists() || newData.child('completionDurationSec').isNumber())"
      }
    },
    "publicOverview": {
      ".read": true,
      ".write": "auth != null && root.child('users/' + auth.uid + '/isAdmin').val() === true",
      "$itemId": {
        ".validate": "newData.hasChildren(['name','createdAt']) && newData.child('name').isString() && newData.child('createdAt').isNumber() && (!newData.child('status').exists() || newData.child('status').isString())"
      }
    }
  }
}
