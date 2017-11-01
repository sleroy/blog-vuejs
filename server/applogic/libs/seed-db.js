"use strict";

// let ROOT 			= "../../";
let logger 			= require("../../core/logger");
let config 			= require("../../config");

let _ 				= require("lodash");
let tokgen 			= require("../../core/libs/tokgen");
let fakerator		= require("fakerator")();

let User 			= require("../.././models/user");
let Device 			= require("../modules/devices/models/device");
let HexoPost 			= require("../modules/hexoposts/models/hexopost");

module.exports = function() {
	return Promise.resolve();
};
