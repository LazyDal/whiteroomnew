"use strict";

var mongoose = require('mongoose');

var UserImageSchema = require('./UserImageSchema');
var UserImage = mongoose.model('UserImage', UserImageSchema);

var UserListSchema = new mongoose.Schema({
	name: String,
	users: [{type:mongoose.Schema.Types.ObjectId, ref: User}]
});
var UserList = mongoose.model('UserList', UserListSchema);

var UserSchema = new mongoose.Schema({
	userName: String,
	realName: String,
	email: String,
	password: String,
	country: String,
	phone: String,
	age: Number,
	sex: String,
	status: String,
	interestedIn: String,
	image: {type: mongoose.Schema.Types.ObjectId, ref: 'UserImage'},
	userLists: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserList'}],
	createdOn: Date,
	lastAction: Date,
	totalPosts: Number,
	totalTopicsStarted: Number
});
var User = mongoose.model('User', UserSchema);

module.exports = {UserSchema, UserListSchema, User, UserList};