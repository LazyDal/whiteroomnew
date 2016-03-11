"use strict";

var mongoose = require('mongoose');

// Mongoose schema; mongoose uses this information to compile the model. Model can have only fields listed here. However, only required fields are mandatory.
var UserImageSchema = new mongoose.Schema({
	 name: String,
	 data: {type:Buffer, required:true },
	 contentType: { type: String, required: true },
	 tmpPath: String
});
// Mongoose model will be compiled from schema only here and exported throughout the application
var UserImage = mongoose.model('UserImage', UserImageSchema);

var UserListSchema = new mongoose.Schema({
	name: String,
	users: [String]
});
var UserList = mongoose.model('UserList', UserListSchema);

// This schema contains some of the additional validation available in Mongoose
var UserSchema = new mongoose.Schema({
	userName: { type: String, unique: true, required: true },
	realName: String,
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	country: String,
	phone: String,
	age: { type:Number, min:6, max:250 },
	sex: {type: String, enum:['Male', 'Female', 'None', 'Other', 'Not Specified']},
	status: {type: String, enum:['Single', 'In relation', 'Married', 'Divorced', 'None', 'Other', 'Not Specified']},
	interestedIn: {type: String, enum:['Men', 'Women', 'Both', 'None', 'Other', 'Not Specified']},
	// Next two fields are references to documents from other collections; we don't want these objects to be embedded directly in User model
	image: {type: mongoose.Schema.Types.ObjectId, ref: 'UserImage'},
	userLists: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserList'}],
	createdOn: Date,
	lastAction: Date,
	totalPosts: Number,
	totalTopicsStarted: Number,
	points: Number
});
var User = mongoose.model('User', UserSchema);

// We export only compiled mongoose models, schemas remain only in this file
module.exports = {User, UserImage, UserList};