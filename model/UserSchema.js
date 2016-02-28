"use strict";

var mongoose = require('mongoose');

var UserImageSchema = new mongoose.Schema({
	 data: {type:Buffer, required:true },
	 contentType: { type: String, required: true }
});
var UserImage = mongoose.model('UserImage', UserImageSchema);

var UserListSchema = new mongoose.Schema({
	name: String,
	users: [{type:mongoose.Schema.Types.ObjectId, ref: User}]
});
var UserList = mongoose.model('UserList', UserListSchema);

var UserSchema = new mongoose.Schema({
	userName: { type: String, unique: true, required: true },
	realName: String,
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	country: String,
	phone: String,
	age: { type:Number, min:6, max:250 },
	sex: String,
	status: String,
	interestedIn: String,
	image: {type: mongoose.Schema.Types.ObjectId, ref: 'UserImage'},
	userLists: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserList'}],
	createdOn: Date,
	lastAction: Date,
	totalPosts: Number,
	totalTopicsStarted: Number,
	points: Number
});
var User = mongoose.model('User', UserSchema);

module.exports = {UserSchema, UserImageSchema, UserListSchema, User, UserImage, UserList};