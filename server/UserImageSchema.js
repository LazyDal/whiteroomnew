"use strict";

var mongoose = require('mongoose');

var UserImageSchema = new mongoose.Schema({
	 data: Buffer,
	 contentType: String
});

module.exports = UserImageSchema;