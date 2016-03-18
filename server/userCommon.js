"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('mongoose');
var validate = require('validate.js');
var XRegExp = require('xregexp');

var User = require('../model/UserSchema').User;

/**
 * Provides common functinality for user data
 *
 * @class userCommon
**/
var userCommon = {
	/**
	 * This function adds a new user to the database.
	 *
	 * @method checkUserExistence
	 * @param {String} userName first parameter
	 * @return {various} Resolves with value "already exists." if user with name userName
	 * exists, undefined if not, and rejects with Error on database access errors
	**/
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
	}
}
// This validate.js validator is used for all generic name data fields
validate.validators.name = function(name, options, key, attributes) {
		var dissallowedCharacters = XRegExp('\\p{S}|\\p{C}'); // Matches Unicode character categories symbol and special characters
		if (dissallowedCharacters.test(name)) {
			return "contains invalid characters.";
		}
		else return;
}

module.exports = userCommon;