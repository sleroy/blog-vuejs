"use strict";

let logger = require("../../core/logger");
let config = require("../../config");
let Sockets = require("../../core/sockets");
let C = require("../../core/constants");

let _ = require("lodash");
let hash = require("object-hash");
let Cacher = require("../cacher");
let Services;

let warn = function(msg, params) {
  logger.warn("[Fetching warn]: " + msg, params);
};

let info = function(msg, params) {
  logger.info("[Fetching info]: " + msg, params);
};

let debug = function(msg, params) {
  logger.debug("[Fetching debug]: " + msg, params);
};

let exception = function(msg) {
  throw new Error("[Fetching exception]: " + msg);
};
module.exports = {
  /**
   * Fetch an object by its ID.
   * @param docs : the list of documents to perform aggregation
   * @param field : the field on which perform aggregation
   * @param service : service used for aggregation
   * @param promises : array of promises to insert the fetch
   */
  fetchByReferences: function(docs, field, service, promises, refs) {
    debug("Aggregating " + field + " by references %j", refs);

    let items = _.isArray(docs) ? docs : [docs];
    if (items.length == 0) {
      promises.push(Promise.resolve([]));
      return;
    }
    // For all documents
    items.forEach(doc => {
      const promiseRefs = [];
      // We chain the promise references;
      // For all references to look up

      // We trigger only if they is some data to aggregate.
      if (doc[field] && doc[field].length > 0) {
        for (let ref of refs) {
          // info("Document", doc);

          // We try to look up on the reference with the value.
          const filter = { key: ref, ids: doc[field] };

          // We create a lazy promise
          promiseRefs.push(
            Promise.resolve().then(() => {
              // If the field has not been recovered yet
              // warn("Filter necessary is %j", filter);
              service.findByFilter(filter).then(populated => {
                if (populated.length > 0) {
                  doc[field] = populated;
                }
              });
            })
          );
        }

        promises.push(
          Promise.all(promiseRefs).then(() => {
            return doc[field];
          })
        );
      }
    });
  },

  /**
   * Fetch an object by its ID.
   * @param docs : the list of documents to perform aggregation
   * @param field : the field on which perform aggregation
   * @param service : service used for aggregation
   * @param promises : array of promises to insert the fetch
   */
  fetchByID: function(docs, field, service, promises) {
    let items = _.isArray(docs) ? docs : [docs];
    items.forEach(doc => {
      promises.push(
        service.getByID(doc[field]).then(populated => {
          doc[field] = populated;
        })
      );
    });
  }
};
