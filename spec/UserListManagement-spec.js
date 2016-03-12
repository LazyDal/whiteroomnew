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
			expect(userLists.addUserToList).toBeDefined();
			// expect(UserList.removeUserFromList).toBeDefined();
			// expect(UserList.returnUsersLists).toBeDefined();
			// expect(UserList.renameUserList).toBeDefined();
			// expect(UserList.deleteUserList).toBeDefined();
			// expect(userCommon.checkUserExistence).toBeDefined();
		});
	});

	// User AnExistingName must exist in the database
	describe("Creating new user lists of user AnExistingName: ", function(){
			var i = 0;
			var userListName = ["List 1", "List 1", "List 2"];
			beforeEach(function(done){
				spyOn(userCommon, "checkUserExistence").andCallThrough();
				spyOn(userLists, "saveNewUserList").andCallThrough();
				userLists.createUserList("AnExistingName", userListName[i]).then(function(result){
						if (result) {
							console.log("An error occured: " + result);
						}
						else console.log('User List ' + userListName[i] + ' Created.');
						++i;
						done();
				}).catch(function(reason){
					console.log("An error while creating user list: " + reason);
					done();
				});
			});

			it("should add an user list to the user", function(){
				expect(userCommon.checkUserExistence).toHaveBeenCalled();
				expect(userLists.saveNewUserList).toHaveBeenCalled();
				expect(userLists.saveNewUserList.mostRecentCall.args[0] instanceof User).toBe(true);
				expect(typeof(userLists.saveNewUserList.mostRecentCall.args[1])).toMatch("string");
			});
			it("should add an user list to the user", function(){
				expect(userCommon.checkUserExistence).toHaveBeenCalled();
				expect(userLists.saveNewUserList).toHaveBeenCalled();
				expect(userLists.saveNewUserList.mostRecentCall.args[0] instanceof User).toBe(true);
				expect(typeof(userLists.saveNewUserList.mostRecentCall.args[1])).toMatch("string");
			});
			it("should add an user list to the user", function(){
				expect(userCommon.checkUserExistence).toHaveBeenCalled();
				expect(userLists.saveNewUserList).toHaveBeenCalled();
				expect(userLists.saveNewUserList.mostRecentCall.args[0] instanceof User).toBe(true);
				expect(typeof(userLists.saveNewUserList.mostRecentCall.args[1])).toMatch("string");
			});

		});

	// User Dalibor must exist in the database
	describe("Creating new user lists of user Dalibor: ", function(){
			var i = 0;
			var userListName = ["List 1", "List 2"];
			beforeEach(function(done){
				spyOn(userCommon, "checkUserExistence").andCallThrough();
				spyOn(userLists, "saveNewUserList").andCallThrough();
				userLists.createUserList("Dalibor", userListName[i]).then(function(result){
						if (result) {
							console.log("An error occured: " + result);
						}
						else console.log('User List ' + userListName[i] + ' Created.');
						++i;
						done();
				}).catch(function(reason){
					console.log("An error while creating user list: " + reason);
					done();
				});
			});

			it("should create an user list", function(){
				expect(userCommon.checkUserExistence).toHaveBeenCalled();
				expect(userLists.saveNewUserList).toHaveBeenCalled();
				expect(userLists.saveNewUserList.mostRecentCall.args[0] instanceof User).toBe(true);
				expect(typeof(userLists.saveNewUserList.mostRecentCall.args[1])).toMatch("string");
			});
			it("should create an user list", function(){
				expect(userCommon.checkUserExistence).toHaveBeenCalled();
				expect(userLists.saveNewUserList).toHaveBeenCalled();
				expect(userLists.saveNewUserList.mostRecentCall.args[0] instanceof User).toBe(true);
				expect(typeof(userLists.saveNewUserList.mostRecentCall.args[1])).toMatch("string");
			});

		});

		// AnExistingName and Jelena users must exist in the database
		describe("Adding user to an user list", function(){
			var i = 0;
			var userToAdd = ["AnExistingName", "NonexistingName", "Jelena"]

			beforeEach(function(done){
				spyOn(userCommon, "checkUserExistence").andCallThrough();
				userLists.addUserToList("Dalibor", "List 1", userToAdd[i]).then(function(reason){
					if (reason) console.log("Error while adding user to an user list: " + reason);
					else console.log("User added to list.");
					++i;
					done();
				}).catch(function(reason){
					console.log("Error while adding user to a list: " + reason);
					++i;
					done();
				});
			});

			it("should add an user to an user list", function(){
				expect(userCommon.checkUserExistence).toHaveBeenCalled();
				expect(typeof(userCommon.checkUserExistence.mostRecentCall.args[0])).toMatch("string");
			});
			it("should error out because of non-existing user", function(){
				expect(userCommon.checkUserExistence).toHaveBeenCalled();
				expect(typeof(userCommon.checkUserExistence.mostRecentCall.args[0])).toMatch("string");
			});
			it("should add an user to an user list", function(){
				expect(userCommon.checkUserExistence).toHaveBeenCalled();
				expect(typeof(userCommon.checkUserExistence.mostRecentCall.args[0])).toMatch("string");
			});
		}); // describe

		describe("Get all user lists of a user: ", function(){
			var results;
			beforeEach(function(done){
				userLists.getUsersLists("Dalibor").then(function(result){
					console.log("Lists of user Dalibor: " + JSON.stringify(result));
					results = result;
					done();
				}).catch(function(reason){
					console.log("Error: " + reason);
					done();
				});
			});
			it("should return an array of user list names", function(){
				expect(results instanceof Array).toBe(true);
				expect(results.length).toBeGreaterThan(0);
			});
		});

		describe("Get all users from Dalibor's user list 'List 1': ", function(){
			var results;
			beforeEach(function(done){
				userLists.getUsersFromList("Dalibor", "List 1").then(function(result){
					console.log("Lists of users from Dalibor's list 'List 1': " + JSON.stringify(result));
					results = result;
					done();
				}).catch(function(reason){
					console.log("Error: " + reason);
					done();
				});
			});
			it("should return an array of user names", function(){
				expect(results instanceof Array).toBe(true);
				expect(results.length).toBeGreaterThan(0);
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
