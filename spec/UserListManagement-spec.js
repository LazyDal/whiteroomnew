"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('../server/MongooseTestConnection'); // This will automaticaly open the MongoDB connection

// Unit Under Test
var userLists = require('../server/userLists');
var userCommon = require('../server/userCommon');

// var UserImage = require('../model/UserSchema').UserImage;
var UserList = require('../model/UserSchema').UserList;

var User = require('../model/UserSchema.js').User;
var user = new User({
	userName: 'AnExistingName',
	userLists: []
});

// Unit under test
var userLists = require('../server/userLists');

describe ("User List Functionality: ", function(){
	
	describe("The User List object:", function(){
		it("should exist", function(){
			expect(userLists).toBeDefined();
		});
		it("User list methods should exist", function() {
			expect(userLists.createUserList).toBeDefined();
			expect(userLists.saveNewUserList).toBeDefined();
			// expect(UserList.tryAddingUserToList).toBeDefined();
			// expect(UserList.addUserToList).toBeDefined();
			// expect(UserList.removeUserFromList).toBeDefined();
			// expect(UserList.returnUsersLists).toBeDefined();
			// expect(UserList.renameUserList).toBeDefined();
			// expect(UserList.deleteUserList).toBeDefined();
			// expect(userCommon.checkUserExistence).toBeDefined();
		});
	});

	describe ("Saving new user list to MongoDB: ", function(){
		var newUserList = [];
		beforeEach(function(done){
			userLists.saveNewUserList(user, 'A New List').then(function(result){
			newUserList = result;
			console.log("New userLists array: " + result);
			done();
		}).catch(function(reason){
			console.log("An error occured: " + reason);
			newUserList = reason;	// a hack; the newUserList object will contain a string in the case of an error
			done();
		});
		});

		it ("should return an _id of a new user list", function(){
			expect(newUserList instanceof Object).toBe(true);
			expect(newUserList.name).toMatch("A New List");
			user.userLists = [newUserList];	// we memorize this user list inside of user object
		});

		it ("should reject new list due to a same name with an existing user list", function(){
			expect(typeof(newUserList)).toMatch("string"); // we expect a string, since an error should occur
		});
	});

	describe("Creating a new user list: ", function(){
			beforeEach(function(done){
				spyOn(userCommon, "checkUserExistence").andCallThrough();
				spyOn(userLists, "saveNewUserList").andCallThrough();
				userLists.createUserList("Dalibor", "List 1").then(function(result){
						if (result) {
							console.log("An error occured: " + result);
						}
						done();
				});
			});
			it("should add an user list to an user", function(){
				expect(userCommon.checkUserExistence).toHaveBeenCalled();
				expect(userLists.saveNewUserList).toHaveBeenCalled();
				expect(userLists.saveNewUserList.mostRecentCall.args[0] instanceof User).toBe(true);
				expect(typeof(userLists.saveNewUserList.mostRecentCall.args[1])).toMatch("string");
			});
		});

		// describe("Creating User Lists:", function(done){
		// 	beforeEach(function(done) {
		// 		spyOn(userCommon, "checkUserExistence").andCallThrough();
		// 		userProfile.createUserList('AnExistingName', 'First List').then(function(results){
		// 			if (results)
		// 				console.log("Validation error" + results);
		// 			done();
		// 		}).catch(function(result){
		// 			console.log("An error occured:" + result);
		// 			done();
		// 		});
		// 	});
		// 	it("should check if the user exists and create user list", function() {
						
		// 		expect(userProfile.checkUserExistence).toHaveBeenCalled();
		// 		expect(typeof(userProfile.checkUserExistence.mostRecentCall.args[0])).toEqual('string');

		// 		expect(userManagement.addUserToList).toHaveBeenCalled();
		// 		expect(userManagement.addUserToList.mostRecentCall.args[0] instanceof User).toBe(true);
		// 		expect(userManagement.addUserToList.mostRecentCall.args[1] instanceof UserList).toBe(true);
		// 	});
		// }); // describe
});
