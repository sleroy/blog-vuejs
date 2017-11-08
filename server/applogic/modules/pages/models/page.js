"use strict";

// let ROOT 			= "../../../../";
let config = require("../../../../config");
let logger = require("../../../../core/logger");

let _ = require("lodash");

let db = require("../../../../core/express/mongo");
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let hashids = require("../../../../core/libs/hashids")("pages");
let autoIncrement = require("mongoose-auto-increment");
let momentjs = require("moment");

let schemaOptions = {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
};

let PageSchema = new Schema(
  {
    title: {
      type: String,
      required: "Please provide a title to the document",
      trim: true
    },
    content: {
      type: String,
      trim: true
    },
    excerpt: {
      type: String,
      trim: true
    },
    author: {
      type: Number,
      required: "Please fill in an author ID",
      ref: "User"
    },
    updatedAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    slug: {
      type: String
    },
    coverImage: {
      type: String,
      trim: true
    },
    coverCaption: {
      type: String,
      trim: true
    },
    metadata: {}
  },
  schemaOptions
);

PageSchema.virtual("code").get(function() {
  return this.encodeID();
});

PageSchema.plugin(autoIncrement.plugin, {
  model: "Page",
  startAt: 1
});

PageSchema.methods.encodeID = function() {
  return hashids.encodeHex(this._id);
};

PageSchema.methods.decodeID = function(code) {
  return hashids.decodeHex(code);
};

let Page = mongoose.model("Page", PageSchema);

module.exports = Page;
