"use strict";

var mongoose = require('mongoose');

var RoomImageSchema = new mongoose.Schema ({
	name: String,
	data: Buffer,
	contentType: String
});
var RoomImage = mongoose.model('RoomImage', RoomImageSchema);

var UserList = require('./UserSchema').UserList;

var RoomSchema = new mongoose.Schema({
	name: String,
	image: {type: mongoose.Schema.Types.ObjectId, ref: 'RoomImage'},
	createdOn: { type: Date, default: Date.now },
	subrooms: [{type: mongoose.Schema.Types.ObjectId, ref: 'Room'}],
	type: {type: String, enum:['Public', 'Private']},
	defaultUserList: {type: mongoose.Schema.Types.ObjectId, ref: 'UserList'},
	roomUserLists: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserList'}]
});
var Room = mongoose.model('Room', RoomSchema);

module.exports = {Room, RoomImage};