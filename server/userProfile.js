"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('mongoose');
var validate = require('validate.js');
validate.Promise = Promise;	// validate.js will use this Promise implementation
var XRegExp = require('xregexp');
var sizeOfImage = require('image-size');
var fs = require('fs');
var _ = require('lodash');

// Import mongoose models
var UserImage = require('../model/UserSchema').UserImage;
var User = require('../model/UserSchema').User;
var UserList = require('../model/UserSchema').UserList;

var userCommon = require('./userCommon');

//
//	Validate.js will use the information that follows
//
var userImageMinX = 128,
 		userImageMinY = 128,
 		userImageMaxX = 1920,
 		userImageMaxY = 1200;

// Custom validator for username. Checks if userName already exists in MongoDB database; since it's an asynchronous function, it returns a promise. Note that it resolves regardless of whether validation passed or not; reject is only for internal server error states which should be logged in the error log.
validate.validators.userNameCheck = function(value, options, key, attributes) {
	return new validate.Promise(function (resolve, reject) {
		var dissallowedCharacters = XRegExp('\\p{Z}|\\p{S}|\\p{C}'); // Matches Unicode character categories whitespace, symbol and special characters	
		if (dissallowedCharacters.test(value)) {
			resolve("contains invalid characters.");
		}
		userCommon.checkUserExistence(value).then(function(result){
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

// Validation.js constrains for the new User object; self explanatory. Note that the custom validators will be called, such as userNameCheck.
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
    name: true,
    length: {
      minimum: 6,
      maximum: 80,
      message: "must be 6-80 characters long"
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
  	name: true,
  	length: {
  		maximum: 80,
  		message:"too long"
  	}
  },
  country: {
  	name: true,
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
// Validation.js constrains which will be used when updating an existing user object
var updateUserConstraints = {
  age: {
  	numericality: {
      onlyInteger: true,
		  greaterThan: 5,
  		lessThanOrEqualTo: 250	// Not a mistake ;)
  	}
  },
  realName: {
  	name: true,
  	length: {
  		maximum: 80,
  		message:"too long"
  	}
  },
  country: {
  	name: true,
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

/**
 * Provides user data manipulation
 *
 * @class userProfile
**/
var userProfile = {
	// This method is private (not technicaly) method used by newUser function
	newUserValidation: function (newUser) {
		return validate.async(newUser, newUserConstraints);	// calls validate.js asynchronous validation mechanism
	},
	/**
	 * This function adds a new user to the database.
	 *
	 * @method newUser
	 * @param {an User object} newUser first operand
	 * @return {various} Resolves without return value on success, with object
	 * containg validation errors in the case of validate.js errors,
	 * and with an Error object in the case of other validation errors;
	 * rejects on database errors
	**/
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
		if (!newUser) return new Promise(function(resolve, reject){
				resolve(new ReferenceError("Required parameter is missing, null or an empty string"));
				return;
			});
		if (_.isEmpty(newUser)) return new Promise(function(resolve, reject){
				resolve(new ReferenceError("Parameter has to be non-empty object"));
				return;
		});
		if (!(newUser instanceof User)) return new Promise(function(resolve, reject){
			resolve(new TypeError("Parameter has to be a User object"));
			return;
		});
		// Eliminate whitespace on the beggining and the ending of string fields
		this.trimFieldSpaces(newUser);
		// Validate and then call apropriate functions
		return this.newUserValidation(newUser).then(validationSuccess, validationError);
	},
	/**
	 * This function is a private method (not technicaly) used by newUser method
	 *
	 * @method saveUser
	 * @param {instance of User} newUser as first operand
	 * @return {undefined} on successfull write to database, rejects
	 * on database errors
	**/
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
					newUser.image.save(function(err) {
						if (err) reject(err);
						resolve2();
					});
				}
			}); // Image Saved
			imageSaved.then(function(){
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
	// Doesn't validate userName, email and password
	updateUserValidation: function (user) {
		return validate.async(user, updateUserConstraints);	// calls validate.js asynchronous validation mechanism
	},
	/**
	 * Updates information on existing user.
	 * Doesn't update userName, email and password fields
	 *
	 * @method updateUser
	 * @param {instance of User object} user first parameter
	 * @return {various} Resolves without return value on success, with object
	 * containg validation errors in the case of validate.js errors,
	 * and with an Error object in the case of other validation errors;
	 * rejects on database errors
	**/
	updateUser: function(user) {
		var that = this;

		var validationSuccess = function(){
			return that.updateUserDB(user);
		}
		var validationError = function (validationErrors) {
			return new Promise(function(resolve, reject){
				resolve(validationErrors);
			});
		}

		if (!user) return new Promise(function(resolve, reject){
				resolve(new ReferenceError("Required parameter is missing, null or an empty string"));
			});
		if (_.isEmpty(user)) return new Promise(function(resolve, reject){
				resolve(new ReferenceError("Parameter has to be non-empty object"));
		});
		if (!(user instanceof User)) {
			resolve(new TypeError("Parameter has to be a User object"));
			return;
		}

		this.trimFieldSpaces(user);

		return this.updateUserValidation(user).then(validationSuccess, validationError);
	},
	/** 
	 * Writes updated User object to the database
	 * private method (not techincally) called by updateUser method
	 *
	 * @method updateUserDB
	 * @param {user instance of User} user first parameter
	 * @return {none or reject Error} resolves with undefined on succesfull operation and
	 * and rejects with Error on database access error
	**/
	updateUserDB: function(user) {

		return new Promise(function(resolve, reject){
			// First save new image, of any
			var imageSaved = new Promise(function(resolve2, reject2){		
				// if user image already exist 
				if (user.image) {
					User
						.findOne({'userName' : user.userName})
						.populate('image', 'name')	// we look at image's name
						.exec(function(err, foundUser)
						 {
						if (err) {
							reject(err);	// TODO
						}
						// only placeholder image has a name; don't delete it, else delete the old image
						if (!foundUser.image.name) UserImage.remove({_id: foundUser.image}, function(err) {
							if (err) reject(err);
							// save new user image
							user.image.save(function(err) {
								if (err) reject(err);
								resolve2();
							});
						});
						else {
							// save new user image
							user.image.save(function(err) {
								if (err) reject(err);
								resolve2();
							});
						}
					});	// findOne
				}	// if
			}); // Image Saved
			imageSaved.then(User.findOneAndUpdate({ // we use model object itself, not an instance - it wouldn't work
				userName: user.userName
			}, 
			{ $set: {realName: user.realName, country: user.country, phone: user.phone, age: user.age, sex: user.sex, status: user.status, interestedIn: user.interestedIn, image: user.image} }
			,
			function(){
				resolve();
			})
			);
		});
	},
	/**
	 * Fetches a user profile form the database
	 *
	 * @method getUserProfile
	 * @param {String} userName first parameter
	 * @return {User, Error or undefined} Resolves with found user profile object on success, with ReferenceError
	 * on empty string parameter or other falsy value, or 'undefined' if user named userName is not found; rejects on database access error
	**/ 
	getUserProfile: function(userName) {
		return new Promise(function(resolve, reject){ 
			if (!userName) resolve(new ReferenceError("Paramter must be non-empty string"));
			User.findOne({'userName' : userName}, function(err, foundUser) {
				if (err) {
					reject(err);	// TODO
				}
				// foundUser will be 'null' if there is no user
				if (foundUser) {
					resolve(foundUser);
				}
				else {
					resolve();
				}
			});
		});
	},
	/** Returns found user image object, if user named userName exists, or 'undefined' if it doesn't
	 *
	 * @method getUserImage
	 * @param {String} userName first parameter
	 * @return {UserImage object, Error or undefined} Resolves with image object if user with name userName 
	 * is found, Error if parameter is empty string or other falsy value, undefined if use with the name
	 * userName is not found, and rejects on database access error
	**/
	getUserImage: function(userName) {
		return new Promise(function(resolve, reject){
			if (!userName) resolve(new ReferenceError("Paramter must be non-empty string"));
			User
			.findOne({'userName': userName})
			.populate('image')
			.exec(function(err, user) {
				if (err) {
					reject(err);	// TODO
				}
				// user will be 'null' if there is no user
				if (user) {
					resolve(user.image);
				}
				else {
					resolve();
				}
			});
		});
	},
	hashPassword: function(password) {
		var hashedPassword; // = hash algorhythm
		return password;
	},
	/**
	 * Trims leading and trailing whitespace characters of the operand
	 *
	 * @method trimFieldSpaces
	 * @param {User object} user first parameter
	 * @return {undefined} This method mofidies the object passed as the first parameter
	 * and returns undefined. Since it's a private method called from other methods in this module,
	 * it does no validation of passed parameter.
	**/
	trimFieldSpaces: function(user) {
		// trim spaces on the beggining and ending of string fields
		if (user.userName) user.userName = user.userName.trim();
		if (user.realName) user.realName = user.realName.trim();
		if (user.email) user.email = user.email.trim();
		if (user.password) user.password = user.password.trim();
		if (user.country) user.country = user.country.trim();
		if (user.phone) user.phone = user.phone.trim();
	}
};

module.exports = userProfile;