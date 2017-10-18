"use strict";

// let ROOT 			= "../../../../";
let config = require("../../../../config");
let logger = require("../../../../core/logger");

let _ = require("lodash");

let db = require("../../../../core/mongo");
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let hashids = require("../../../../libs/hashids")("hexoposts");
let autoIncrement = require("mongoose-auto-increment");

let schemaOptions = {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
};

let TagSchema = new Schema(
  {
    name: {
      type: String,
      required: "Please provide a name to this tag",
      trim: true
    },
    tag_id: {
      type: String,
      trim: true,
      unique: true,
      index: true,
      sparse: true
    },
    slug: {
      type: String,
      trim: true,
      required: "Please provide a slug",
      unique: true,
      index: true,
      sparse: true
    },
    metadata: {}
  },
  schemaOptions
);

TagSchema.plugin(autoIncrement.plugin, {
  model: "Tag",
  startAt: 1
});

let Tag = mongoose.model("Tag", TagSchema);

module.exports = Tag;
