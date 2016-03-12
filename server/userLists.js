"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('mongoose');
var validate = require('validate.js');
var Set =  require('jsclass/src/set').Set;

var User = require('../model/UserSchema').User;
var UserList = require('../model/UserSchema').UserList;

var userCommon = require('./userCommon');

//
//	Validate.js will use the information that follows
//
// Validation.js constrains which will be used when creating a new user list
var createUserListConstraints = {
	name: {
		name: true,
		length: {
			maximum: 30,
			message:"too long"
		}
	}
}

var userLists = {
	createUserList: function(userName, listName) {
		var that = this, thisUserLists = [];
		return new Promise(function(resolve, reject){
			userCommon.checkUserExistence(userName).then(function(result){
				if (result === 'already exists.') {
					var validationResults = validate(listName, createUserListConstraints);
					if (validationResults !== {}) resolve(validationResults);
					User
						.findOne({ 'userName': userName })
						.populate('userLists', 'name')
						.exec(function(err, foundUser){
							if (err) throw err; // TODO

							that.saveNewUserList(foundUser, listName).then(function(newUserList) {
									thisUserLists = foundUser.userLists;
									thisUserLists.push(newUserList);
									User.findOneAndUpdate( // we use model object itself, not an instance - it wouldn't work
										{ userName: userName }, 
										{ $set: { userLists: thisUserLists } },
										function(err){
											if (err) throw err;	// TODO
											resolve();
											console.log('User List Created.');
										}
									);		
							}).catch(function(reason){
								console.log("An error occured: " + reason); // TODO
							});
							console.log('User List: ' + thisUserLists);
						});
				}
				else resolve2("this user doesn't exist");
			});
		});
	},
	// Adds new list to a MongoDB collection and returns the new user list
	saveNewUserList: function(user, listName) {
		return new Promise(function(resolve, reject){
			var thisUserLists = [], newUserList = [];

			// Fill thisUserLists array with names of the user lists
			thisUserLists = user.userLists.map(function(list){
				return list.name;
			});
		
			// We convert userList array to a set; this will make sure there will be no duplicate entries in the user list array
			var thisUserListsSet = new Set(thisUserLists);
			// If our new list name is not already in the set
			if (!thisUserListsSet.contains(listName)) {
					// save new list
					newUserList = new UserList({
						name: listName,
						users: []
					});
					newUserList.save(function(err){
						if (err) reject(err);
					});
			}
			else {
				reject("User list with the same name already exists.");
			}
			resolve(newUserList);
		});
	},
	tryAddingUserToList: function(user, userList) {
		userCommon.checkUserExistence(user.userName);
		this.addUserToList(user, userList);
		return null;
	},
	addUserToList: function(user, userList) {
		// TODO
	}
}
module.exports = userLists;