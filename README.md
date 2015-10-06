# Ember-firebase-background-queue

```javascript
export default Ember.Component.extend({
  background: Ember.inject.service(),

  actions: {
    something() {
      this.get("background").request("some.job.name", { args }).then(response => {
        // do something with the response
      });
    }
  }
});
```

## Configure

```javascript
import BackgroundService from 'Ember-firebase-background-queue/services/background';

export default BackgroundService.extend({
  firebaseApp: "my-app", // the firebase app to use
  debug:        true     // display debug logging
});
```

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
