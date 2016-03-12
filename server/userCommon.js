"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('mongoose');
var validate = require('validate.js');
var XRegExp = require('xregexp');

var User = require('../model/UserSchema').User;

var userCommon = {
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
validate.validators.name = function(name, options, key, attributes) {
		var dissallowedCharacters = XRegExp('\\p{S}|\\p{C}'); // Matches Unicode character categories symbol and special characters
		if (dissallowedCharacters.test(name)) {
			return "contains invalid characters.";
		}
		else return;
}

module.exports = userCommon;