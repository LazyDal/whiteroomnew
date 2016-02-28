"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('mongoose');
var validate = require('validate.js');
var XRegExp = require('xregexp');

var UserImage = require('../model/UserSchema').UserImage;
var User = require('../model/UserSchema').User;

// Custom validator for username
validate.validators.userNameCheck = function(value, options, key, attributes) {
	var dissallowedCharacters = XRegExp('\\p{Z}|\\p{S}|\\p{C}');
	if (dissallowedCharacters.test(value)) return "contains invalid characters.";
	else return null;
}
var constraints = {
  userName: {
  	presence: true,
  	userNameCheck: true
  },
  email: {
  	presence: true,
  	email: true
  },
  password: {
    presence: true,
    length: {
      minimum: 6,
      message: "must be at least 6 characters"
    }
  },
  age: {
  	numericality: {
      onlyInteger: true,
		  greaterThan: 5,
  		lessThanOrEqualTo: 250	// Not a mistake ;)
  	}
  }
};

var userManagement = {
	newUserValidation: function (newUser) {
		return validate(newUser, constraints);
	},
	newUser: function (newUser) {
		this.trimFieldSpaces(newUser);
		this.checkImage(newUser.image);
		var validationMessages = this.newUserValidation(newUser);
		if (validationMessages) {
			console.log('\n' + JSON.stringify(validationMessages) + '\n');
			return validationMessages;
		}
			
    /* newUser.password = */ this.hashPassword(newUser.password);
		return this.saveUser(newUser);
	},
	saveUser: function (newUser) {
		var newUserBeingSaved = new Promise(function(resolve, reject){
			newUser.save( function( err ){
				if (err) {
					console.log(err);
					validationMessages["internal"] = "User not saved due to internal server error :(";
					validationMessages["status"] = "Error";
					throw err;
					reject(validationMessages);
				}
				console.log('User saved!');
				resolve(validationMessages);
			});
		});
		// Return the deferred promise
		return newUserBeingSaved;
	},
	// before this function. PasswordOK() should be called
	hashPassword: function(password) {
		var hashedPassword; // = hash algorhythm
		return password;
	},
	trimFieldSpaces: function(user) {
		// trim spaces left and right in string fields
		if (user.userName) user.userName = user.userName.trim();
		if (user.realName) user.realName = user.realName.trim();
		if (user.email) user.email = user.email.trim();
		if (user.password) user.password = user.password.trim();
		if (user.country) user.country = user.country.trim();
		if (user.phone) user.phone = user.phone.trim();
	},
	checkImage: function(image) {
		// no less than 100x100 px
	},
	tryAddingUserToList: function(user, userList) {
		this.checkUserExistence(user.userName);
		this.addUserToList(user, userList);
		validationMessages["status"] = "O.K.";
		return validationMessages;
	},
	addUserToList: function(user, userList) {
		// TODO
	},
	checkUserExistence: function(newUserName) {
		// body...
	}
};

module.exports = userManagement;