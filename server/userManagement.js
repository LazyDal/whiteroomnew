"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('mongoose');
var validate = require('validate.js');
validate.Promise = Promise;	// validate.js will use this Promise implementation
var XRegExp = require('xregexp');
var sizeOfImage = require('image-size');
var fs = require('fs');

// Import mongoose models
var UserImage = require('../model/UserSchema').UserImage;
var User = require('../model/UserSchema').User;

var userImageMinX = 128,
 		userImageMinY = 128,
 		userImageMaxX = 1920,
 		userImageMaxY = 1200;

//
//	Validate.js will use the information that follows
//

// Custom validator for username. Checks if userName already exists in MongoDB database; since it's an asynchronous function, it returns a promise. Note that it resolves regardless of whether validation passed or not; reject is only for internal server error states which should be logged in the error log.
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
			reject(err);	// TODO
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
// Custom validator for image size
validate.validators.imageSizeOK = function(image, options, key, attributes) {
	if (image) {
		var dimensions = sizeOfImage(image.tmpPath);
		console.log(dimensions.width, dimensions.height);
		if (image.height < userImageMinY || image.width < userImageMinX) return "must be min. 128x128px";
		else if (image.height > userImageMaxY || image.width > userImageMaxX) return "must be max. 1920x1200px";
	}
  return;
}
// Validation.js constrains for the new User object; self explanatory. Note that the custom validators defined previously will be called, such as userNameCheck.
var newUserConstraints = {
  userName: {
  	presence: true,
  	userNameCheck: true,
  	length: {
  		maximum: 40,
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
  		maximum: 20,
  		message:"too long"
  	}
  },
  image: {
  	imageSizeOK: true
  }
};
var updateUserConstraints = {
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
  		maximum: 20,
  		message:"too long"
  	}
  },
  image: {
  	imageSizeOK: true
  }
};

//
// Main object for user data manipulation
//
var userManagement = {
	checkUserExistence: function(userName) {
		return new Promise(function(resolve, reject){ 
			User.findOne({'userName' : userName}, function(err, foundUser) {
				if (err) reject(err);	// TODO
				if (foundUser) {
					resolve("already exists.");
				}
				else {
					resolve();
				}
			});
		});
	},
	newUserValidation: function (newUser) {
		return validate.async(newUser, newUserConstraints);	// calls validate.js asynchronous validation mechanism
	},
	updateUserValidation: function (user) {
		return validate.async(user, updateUserConstraints);	// calls validate.js asynchronous validation mechanism
	},
	newUser: function (newUser) {
		var that = this;
		// This function will be called after succesfull user object validation and will call the function which saves the user to MongoDB
		var validationSuccess = function(){
			 /* newUser.password = */ that.hashPassword(newUser.password);
			return that.saveUser(newUser);
		}
		// This function will be called if user object validation failed
		var validationError = function (validationErrors) {
			return new Promise(function(resolve, reject){
				resolve(validationErrors);
			});
		}
		// Eliminate whitespace on the beggining and the ending of string fields
		this.trimFieldSpaces(newUser);
		// Validate and then call apropriate functions
		return this.newUserValidation(newUser).then(validationSuccess, validationError);
	},
	updateUser: function(user) {
		var that = this;

		var validationSuccess = function(){
			console.log('Updating user...');
			return that.updateUserDB(user);
		}
		var validationError = function (validationErrors) {
			return new Promise(function(resolve, reject){
				resolve(validationErrors);
			});
		}

		this.trimFieldSpaces(user);

		return this.updateUserValidation(user).then(validationSuccess, validationError);
	},
	updateUserDB: function(user) {

		return new Promise(function(resolve, reject){
			console.log('Should write to DB...');
			console.log('User name: ' + user.userName);
			var imageSaved = new Promise(function(resolve2, reject2){			
				user.image.save(function(err) {
					if (err) reject(err);
					resolve2();
				});
			}); // Image Saved
			imageSaved.then(User.findOneAndUpdate({
				userName: user.userName
			}, 
			{ $set: {realName: user.realName, country: user.country, phone: user.phone, age: user.age, sex: user.sex, status: user.status, interestedIn: user.interestedIn, image: user.image} }
			,
			function(){
				console.log('User updated.');
				resolve();
			})
			);
		});
	},
	saveUser: function (newUser) {
		return new Promise(function(resolve, reject){
			var imageSaved = new Promise(function(resolve2, reject2){
				if (!newUser.image) {	// If no image, refer to placeholder image
					UserImage.findOne({name:"userImagePlaceholder"}, function (err, img) {
      			if (err) reject2(err);
      			newUser.image = img;
      			resolve2();
      		});
				}
				else {
					console.log('Resolved with uploaded image.\n')
					newUser.image.save(function(err) {
						if (err) reject(err);
						resolve2();
					});
				}
			}); // Image Saved
			imageSaved.then(function(){
				console.log("Trying to save user...\n");
				newUser.save( function( err ){
					if (err) {
						reject(err);
					}
					resolve();
				});
			}).catch(function(reason){
				reject(reason);
			}); // User Saved
		});	// Promise
	},
	getUserProfile: function(userName) {
		return new Promise(function(resolve, reject){ 
			User.findOne({'userName' : userName}, function(err, foundUser) {
				if (err) {
					reject(err);	// TODO
				}
				if (foundUser) {
					resolve(foundUser);
				}
				else {
					reject();
				}
			});
		});
	},
	getUserImage: function(userName) {
		return new Promise(function(resolve, reject){
			User
			.findOne({'userName': userName})
			.populate('image')
			.exec(function(err, user) {
				if (err) {
					reject(err);	// TODO
				}
				if (user) {
					resolve(user.image);
				}
				else {
					reject("Image not found.");
				}
			});
		});
	},
	hashPassword: function(password) {
		var hashedPassword; // = hash algorhythm
		return password;
	},
	trimFieldSpaces: function(user) {
		// trim spaces on the beggining and ending of string fields
		if (user.userName) user.userName = user.userName.trim();
		if (user.realName) user.realName = user.realName.trim();
		if (user.email) user.email = user.email.trim();
		if (user.password) user.password = user.password.trim();
		if (user.country) user.country = user.country.trim();
		if (user.phone) user.phone = user.phone.trim();
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