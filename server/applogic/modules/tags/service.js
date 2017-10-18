"use strict";

let logger = require("../../../core/logger");
let config = require("../../../config");
let C = require("../../../core/constants");

let _ = require("lodash");

let Tag = require("./models/tags");

module.exports = {
  settings: {
    name: "tags",
    version: 1,
    namespace: "tags",
    rest: true,
    ws: true,
    graphql: true,
    permission: C.PERM_LOGGEDIN,
    role: "user",
    collection: Tag,
    modelPropFilter: "name tag_id"
  },

  shorcuts: {
    extraMethods: {
      findBySlug: {
        type: "find",
        field: "slug",
        settings: {
          cache: true, // if true, we don't increment the views!
          permission: C.PERM_PUBLIC
        }
      }
    },
    get: {
      settings: {
        cache: true, // if true, we don't increment the views!
        permission: C.PERM_PUBLIC
      }
    },
    create: {
      settings: {
        permission: C.PERM_LOGGEDIN
      },
      dump: true, // Dump directly the request content
      mapping: [] // Map field by field
    },
    update: {
      settings: {
        permission: C.PERM_LOGGEDIN
      },
      dump: true, // Dump directly the request content
      mapping: [] // Map field by field
    },
    remove: {
      settings: {
        permission: C.PERM_LOGGEDIN
      }
    },
    removeAll: {
      settings: {
        permission: C.PERM_LOGGEDIN
      }
    }
  },

  actions: {},

  methods: {},

  init(ctx) {
    //
  },

  socket: {
    afterConnection(socket, io) {
      // Fired when a new client connected via websocket
    }
  },

  graphql: {
    query: `
			tags(limit: Int, offset: Int, sort: String): [Tag]
			tag(tag_id: String): Tag
		`,

    types: `
			type Tag {
				tag_id: String!
				name: String!
			}
		`
  }
};
