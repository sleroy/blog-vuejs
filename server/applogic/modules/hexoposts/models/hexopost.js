"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../config");
let logger    		= require("../../../../core/logger");

let _ 				= require("lodash");

let db	    		= require("../../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../libs/hashids")("hexoposts");
let autoIncrement 	= require("mongoose-auto-increment");

let schemaOptions = {
	timestamps: true,
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
};

let HexoPostSchema = new Schema({
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
	more: {
		type: String,
		trim: true
	},
	author: {
		type: Number,
		required: "Please fill in an author ID",
		ref: "User"
	},
	views: {
		type: Number,
		default: 0
	},
	voters: [{
		type: Number,
		ref: "User"
	}],
	votes: {
		type: Number,
		default: 0
	},
	updatedAt: {
		type: Date
	},
	createdAt: {
		type: Date
	},
	comments: {
		type: Boolean
	},
	permalink: {
		type: String
	},
	link: {
		type: String
	},
	tags: {
		type: Boolean
	},
	categories: {
		type: Boolean
	},
	metadata: {}

}, schemaOptions);

HexoPostSchema.virtual("code").get(function() {
	return this.encodeID();
});

HexoPostSchema.plugin(autoIncrement.plugin, {
	model: "HexoPost",
	startAt: 1
});

HexoPostSchema.methods.encodeID = function () {
	//const id = hashids.encodeHex(this._id);
	//console.info("#ID ", this._id, " ID=", id);
	//console.info("Decode #HASH ", id, " ID=", hashids.decodeHex(id));
	return  this._id;
};

HexoPostSchema.methods.decodeID = function (code) {
	console.info("Decode #HASH ", code, " ID=", hashids.decodeHex(code));
	// return hashids.decodeHex(code);
	return code;
};

/*
HexoPostSchema.static("getByID", function(id) {
	let query;
	if (_.isArray(id)) {
		query = this.collection.find({ _id: { $in: id} });
	} else
		query = this.collection.findById(id);

	return query
		.populate({
			path: "author",
			select: ""
		})
});*/

let HexoPost = mongoose.model("HexoPost", HexoPostSchema);

module.exports = HexoPost;
