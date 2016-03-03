"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('mongoose');
var validate = require('validate.js');
validate.Promise = Promise;	// validate.js will use this Promise implementation
var XRegExp = require('xregexp');

var UserImage = require('../model/UserSchema').UserImage;
var User = require('../model/UserSchema').User;

// Custom validator for username
validate.validators.userNameCheck = function(value, options, key, attributes) {
	return new validate.Promise(function (resolve, reject) {
		var dissallowedCharacters = XRegExp('\\p{Z}|\\p{S}|\\p{C}'); // Matches Unicode character categories whitespace, symbol and special characters	
		if (dissallowedCharacters.test(value)) {
			resolve("contains invalid characters.");
		}
		userManagement.checkUserExistence(value).then(function(result){
			if (result === "already exists.") resolve("already exists.");
			else resolve();
		}).catch (function(err) {
			reject(err);
		});
	});
}
// Custom validator for email
validate.validators.emailUnique = function(value, options, key, attributes) {
	return new validate.Promise(function (resolve, reject) {
		User.findOne({'email' : value}, function(err, foundEmail) {
			if (err) throw err; // TODO
			if (foundEmail) {
				resolve("already exists.");
			}
			else {
				resolve();
			}
		});
	});
}
var constraints = {
  userName: {
  	presence: true,
  	userNameCheck: true,
  	length: {
  		maximum: 30,
  		message:"too long"
  	}
  },
  email: {
  	presence: true,
  	email: true,
  	emailUnique: true,
  	length: {
  		maximum: 254,
  		message:"too long"	
  	}
  },
  password: {
    presence: true,
    length: {
      minimum: 6,
      maximum: 254,
      message: "must be at least 6 characters"
    }
  },
  age: {
  	numericality: {
      onlyInteger: true,
		  greaterThan: 5,
  		lessThanOrEqualTo: 250	// Not a mistake ;)
  	}
  },
  realName: {
  	length: {
  		maximum: 80,
  		message:"too long"
  	}
  },
  country: {
  	length: {
  		maximum: 80,
  		message:"too long"
  	}
  },
  phone: {
  	length: {
  		maximum: 30,
  		message:"too long"
  	}
  }
};

var userManagement = {
	newUserValidation: function (newUser) {
		return validate.async(newUser, constraints);
	},
	checkUserExistence: function(userName) {
		return new Promise(function(resolve, reject){ 
			User.findOne({'userName' : userName}, function(err, foundUser) {
				if (err) reject(err);
				if (foundUser) {
					resolve("already exists.");
				}
				else {
					resolve();
				}
			});
		});
	},
	newUser: function (newUser) {
		var that = this;
		var validationSuccess = function(){
			 /* newUser.password = */ that.hashPassword(newUser.password);
			 return that.saveUser(newUser);
		}
		var validationError = function (validationErrors) {
			return new Promise(function(resolve, reject){
				resolve(validationErrors);
			});
		}

		this.trimFieldSpaces(newUser);
		this.checkImage(newUser.image);
		return this.newUserValidation(newUser).then(validationSuccess, validationError);
	},
	saveUser: function (newUser) {
		return new Promise(function(resolve, reject){
			var ImageSaved = new Promise(function(resolve2, reject2){
				if (!newUser.image) {
					console.log("Trying with placeholder image...\n");
					UserImage.findOne({name:"userImagePlaceholder"}, function (err, img) {
      			if (err) reject2(err);
      			newUser.image = img;
      			resolve2();
					});
				}
				else {
					newUser.image.save(function(err) {
						if (err)
							reject2(err);
						resolve2();
					});
				}
			}); // Image Saved
			ImageSaved.then(function(){
				newUser.save( function( err ){
					if (err) {
						reject(err);
					}
					console.log('User saved!');
					resolve();
				});
			}).catch(function(reason){
				reject(reason);
			}); // User Saved
		});	// Promise
	},
	logOut: function(req){
		req.session.destroy(function(err){
			if (err) throw err;	// TODO
		})
	},
	returnLoggedInUsers: function() {
		// TODO
	},
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
		// no less than 120x120 px
		// TODO
	},
	tryAddingUserToList: function(user, userList) {
		this.checkUserExistence(user.userName);
		this.addUserToList(user, userList);
		return null;
	},
	addUserToList: function(user, userList) {
		// TODO
	}
};

module.exports = userManagement;