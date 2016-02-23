"use strict";

var mongoose = require('mongoose');

var UserImageSchema = require('../server/UserImageSchema');
var UserImage = mongoose.model('UserImage', UserImageSchema);

var UserSchema = require('../server/UserSchema').UserSchema;
var User = require('../server/UserSchema').User;

var userManagement = {
	saveUser: function (newUser) {
		// body...
	},
	hashPassword: function(password) {
		var hashedPassword; // = hash algorhythm
		return hashedPassword;
	},
	newUser: function () {
		var userImage = new UserImage({
			data: 'buffer',
			contentType: 'img/jpeg'
		});
		
		var newUser = new User({
			userName: 'Name',
			realName: 'Real Name',
			email: 'some@mail',
			password: 'somepassword',
			country: 'some country',
			phone: '+xxx yy zzz-zzz',
			age: 25,
			sex: 'Male/Female',
			status: 'Single/InRelation/Married/Divorced',
			interestedIn: 'Men/Women/Both',
			image: userImage,
			createdOn: Date.now(),
			lastAction: Date.now(),
			totalPosts: 42,
			totalTopicsStarted: 12
		});
		newUser.password = this.hashPassword(newUser.password);
		this.saveUser(newUser);
	},
	addUserToList: function(user, userList) {
		// TODO
	}
};

module.exports = userManagement;