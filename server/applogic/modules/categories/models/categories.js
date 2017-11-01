"use strict";

// let ROOT 			= "../../../../";
let config = require("../../../../config");
let logger = require("../../../../core/logger");

let _ = require("lodash");

let db = require("../../../../core/express/mongo");
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let hashids = require("../../../../core/libs/hashids")("categories");
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

let CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: "Please provide a name to this category",
      trim: true
    },
    category_id: {
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

CategorySchema.virtual("code").get(function() {
  return this.encodeID();
});

CategorySchema.plugin(autoIncrement.plugin, {
  model: "Category",
  startAt: 1
});

CategorySchema.methods.encodeID = function() {
  return hashids.encodeHex(this._id);
};

CategorySchema.methods.decodeID = function(code) {
  return hashids.decodeHex(code);
};

let Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
