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

/**
 * Provides user list management functions
 *
 * @class userLists
 **/
var userLists = {
	/**
	 * Creates a user list for a user 
	 *
	 * @method createUserList
	 * @param {String} userName name of a user to create list for
	 * @param {String} listName name of a list to create
	 * @return {various} Resolves without a value on success, with an 
	 * object containing errors on validate.js errors, with an Error
	 * object on other validation errors, and rejects on database 
	 * access errors
   **/
	createUserList: function(userName, listName) {
		var that = this, thisUserLists = [];
		if (!userName || !listName) return new Promise(function(resolve, reject){
				resolve(new ReferenceError("Required parameter is missing, null or an empty string"));
				return;
			});
		return new Promise(function(resolve, reject){
			userCommon.checkUserExistence(userName).then(function(result){
				if (result === 'already exists.') {
					var validationResults = validate({'name': listName}, createUserListConstraints);
					if (validationResults) { 
						resolve(validationResults);
					}
					User
						.findOne({ 'userName': userName })
						.populate('userLists', 'name')
						.exec(function(err, foundUser) {
							if (err) reject(err); // TODO

							that.saveNewUserList(foundUser, listName).then(function(newUserList) {
									if (newUserList instanceof Error) resolve (newUserList); // This means there was a validation error

									thisUserLists = foundUser.userLists;
									thisUserLists.push(newUserList);
									User.findOneAndUpdate( // we use model object itself, not an instance - it wouldn't work
										{ userName: userName }, 
										{ $set: { userLists: thisUserLists } },
										function(err){
											if (err) reject(err);	// TODO
											resolve();
										}
									);		
							}).catch(function(reason){
								reject(reason); // TODO
							});
						});
				}
				else resolve(new Error("This user doesn't exist"));
			});
		});
	},
	// Private method (not technicaly) called by createUserList; adds new list to a MongoDB collection and returns the new user list
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
						resolve(newUserList);
					});
			}
			else {
				resolve(new ReferenceError("User list with the same name already exists."));
			}
		});
	},
	/**
	 * Adds a user to a user list
	 *
	 * @method addUserToList
	 * @param {String} userName name of a user to update list for
	 * @param {String} listName name of a list to update
	 * @param {String} userToAdd name of a user to add to list
	 * @return {various} Resolves without a value on success, with an 
	 * Error object on validation errors, and rejects on database 
	 * access errors
   **/
	addUserToList: function(userName, listName, userToAdd) {
		var foundUserList, listToSave, listToSaveSet;

		if (!userName || !listName || !userToAdd) return new Promise(function(resolve, reject){
				resolve(new ReferenceError("Required parameter is missing, null or an empty string"));
				return;
			});

		return new Promise(function(resolve, reject){ 
			User
			.findOne({'userName' : userName})
			.populate('userLists')
			.exec(function(err, foundUser) {
				if (err) reject(err);	// TODO
				if (foundUser) {
					for (var i = 0; i < foundUser.userLists.length; ++i) {
						if (foundUser.userLists[i].name === listName) {
							foundUserList = foundUser.userLists[i];
						}
					}
					if (foundUserList) {
						userCommon.checkUserExistence(userToAdd).then(function(result) {
							if (result === "already exists.") {
								
								// We use a set so duplicate user entries inside a user list are impossible
								listToSaveSet = new Set(foundUserList.users);
								listToSaveSet.add(userToAdd);
								listToSave = listToSaveSet.map(function(usr){
									return usr;
								})
								UserList.update( // we use model object itself, not an instance - it wouldn't work
									{ _id: foundUserList._id }, 
									{ $set: { users: listToSave } },
									function(err){
										if (err) reject(err);	// TODO
										resolve();
									}
								);
							} // if result
							else {
								resolve(new ReferenceError("User to add doesn't exist"));
							}
						}).catch(function(reason){
							reject(reason);	// TODO
						});
					} // if foundUserList
					else {
						resolve(new ReferenceError("User list doesn't exist"));
					}
				} // if foundUser
				else {
					resolve(new ReferenceError("User doesn't exist"));
				}
			});
		});
	},
	/**
	 * Returns all lists of a User
	 *
	 * @method getUsersLists
	 * @param {String} userName name of a user whose list to return
	 * @return {Array} Resolves with an array of list names (strings)
	 * on success, with an Error object on validation errors, and 
	 * rejects on database access errors
   **/
	getUsersLists: function(userName) {
		if (!userName) return new Promise(function(resolve, reject){
				resolve(new ReferenceError("Required parameter is missing, null or an empty string"));
			});
		return new Promise(function(resolve, reject){ 
			var userListNames;
			User
			.findOne({'userName' : userName})
			.populate('userLists', 'name')
			.exec(function(err, foundUser) {
				if (err) reject(err);	// TODO
				if (foundUser) {
					userListNames = foundUser.userLists.map(function(userList){
						return userList.name;
					});
					resolve(userListNames);
				}
				else {
					resolve(new ReferenceError("User doesn't exist"));
				}
			});
		});
	},
	/**
		 * Returns all users from a list 
		 *
		 * @method getUsersFromList
		 * @param {String} userName name of a user to whom a list belongs to
		 * @param {String} listName name of a list to return names from
		 * @return {various} Resolves with an Array of strings on 
		 * success, with an Error object on other validation errors, and * rejects on database access errors
	   **/
	getUsersFromList: function(userName, listName) {
		if (!userName || !listName) return new Promise(function(resolve, reject){
						resolve(new ReferenceError("Required parameter is missing, null or an empty string"));
					});
		return new Promise(function(resolve, reject){ 
			var foundUserList, usersFromList;
			User
			.findOne({'userName' : userName})
			.populate('userLists')
			.exec(function(err, foundUser) {
				if (err) reject(err);	// TODO
				if (foundUser) {
					foundUserList = foundUser.userLists.filter(function(userList){
						return userList.name === listName;
					});
					if (foundUserList) {
						resolve(foundUserList[0].users);
					}
					else resolve(new ReferenceError("List doesn't exist"));
				}
				else {
					resolve(new ReferenceError("User doesn't exist"));
				}
			});
		}); 
	}
}
module.exports = userLists;