import Ember from 'ember';
import clean from '../utils/clean';

export default Ember.Service.extend({

  debug:       false,
  queueName:   "queues/events",
  firebaseApp: null, // override with Firebase app name - TODO - load from config
  firebase:    Ember.computed("firebaseApp", {
    get() {
      return new self.Firebase(this.get("firebaseApp"));
    }
  }),

  log(...args) {
    if (this.get("debug")) {
      console.debug("BACKGROUND:", ...args);
    }
  },

  submit(route, data, requestID=null) {
    const payload = this.preparePayload(route, data, requestID, false);

    this.log("submit event", route, payload);

    return this.submitJob(this.get("queueName"), payload);
  },

  request(route, data, requestID=null) {
    const payload = this.preparePayload(route, data, requestID, true);

    this.log("submit request", route, payload);

    return this.processJob(this.get("queueName"), payload).then(response => {
      this.log("success", response);
      return response;
    }).catch(e => {
      this.log("failed", e);
      throw e;
    });
  },

  preparePayload(route, data, request_id, respond) {
    return {
      request_id, // optional, set by request if not present
      route,      // the routing key used when it's sent to RabbitMQ
      respond,    // whether or not to wait for a response
      data
    };
  },

  queueRefFromName(queueName) {
    if (queueName instanceof self.Firebase) {
      return queueName;
    } else {
      return this.get("firebase").child(queueName);
    }
  },

  processJob(queueName, params) {
    return this.submitJob(queueName, params).then(request_id => {
      return this.handleResponse(queueName, request_id);
    });
  },

  submitJob(queueName, params) {
    const queue   = this.queueRefFromName(queueName);
    const request = queue.child("requests").push();

    // The queue doesn't get the request ID, so set it here (would/could be the auth.id)
    const request_id = params.request_id || request.key();
    params.request_id = request_id;

    return new Ember.RSVP.Promise((resolve, reject) => {
      request.set(clean(params), e => {
        if (e) {
          reject(e);
        } else {
          resolve(request_id);
        }
      });
    });
  },

  handleResponse(queueName, request_id) {
    const queue       = this.queueRefFromName(queueName);
    const responseRef = queue.child("responses").child(request_id);

    return new Ember.RSVP.Promise((resolve, reject) => {
      responseRef.on("value", snap => {
        const response = snap.val();
        if (!response) {
          return;
        }

        responseRef.off("value");
        responseRef.remove();

        if (response.success) {
          resolve(response);
        } else {
          reject(response);
        }
      });
    });
  }
});