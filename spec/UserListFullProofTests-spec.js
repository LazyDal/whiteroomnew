"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('../server/MongooseTestConnection'); // This will automaticaly open the MongoDB connection

// Unit Under Test
var userLists = require('../server/userLists');

var userCommon = require('../server/userCommon');

// var UserImage = require('../model/UserSchema').UserImage;
var UserList = require('../model/UserSchema').UserList;

var User = require('../model/UserSchema.js').User;

describe("User list management full proof tests: ", function() {

	describe("Creating new user lists: ", function(){
		var i = 0;
		var userName = ["AnExistingName", "NonExistingUser", "AnExistingName", ""]
		var userListName = ["", "New list", "List 1", "List 3"];
		var returnValue;

		beforeEach(function(done){
			spyOn(userCommon, "checkUserExistence").andCallThrough();
			spyOn(userLists, "saveNewUserList").andCallThrough();
			userLists.createUserList(userName[i], userListName[i]).then(function(result){
					returnValue = result;
					if (result) {
						if (result instanceof Error)
							console.log("An error while creating user list occured: " + result);
						else
							console.log("A validation error occured: " + JSON.stringify(result));
					}
					else console.log('User List ' + userListName[i] + ' Created.');
					++i;
					done();
			}).catch(function(reason){
				console.log("An internal error while creating user list: " + reason);
				done();
			});
		});
		
		it("should not try to add an user list due to invalid agruments", function(){
			expect(userCommon.checkUserExistence).not.toHaveBeenCalled();
			expect(userLists.saveNewUserList).not.toHaveBeenCalled();
			expect(returnValue instanceof Error).toBe(true);
		});
		it("should error out because of non-existing user", function(){
			expect(userCommon.checkUserExistence).toHaveBeenCalled();
			expect(typeof(userCommon.checkUserExistence.mostRecentCall.args[0])).toMatch("string");
			expect(userLists.saveNewUserList).not.toHaveBeenCalled();
			expect(returnValue instanceof Error).toBe(true);
		});
		it("should error out due to the same name as an already existing list", function(){
			expect(userCommon.checkUserExistence).toHaveBeenCalled();
			expect(typeof(userCommon.checkUserExistence.mostRecentCall.args[0])).toMatch("string");
			expect(userLists.saveNewUserList).toHaveBeenCalled();
			expect(returnValue instanceof Error).toBe(true);
		});
		it("should not try to add an user list due to missing user name", function(){
			expect(userCommon.checkUserExistence).not.toHaveBeenCalled();
			expect(userLists.saveNewUserList).not.toHaveBeenCalled();
			expect(returnValue instanceof Error).toBe(true);
		});
	}); // describe

	describe("Adding users to a list: ", function(){
		var i = 0;
		var userName = ["", "NonExistingUser", "AnExistingName", "AnExistingName"];
		var listName = ["List 1", "List 1", "NonExisting List", "List 1"];
		var userToAdd = ["Dalibor", "Dalibor", "Dalibor", "NonExistingUser"];
		var returnValue;

		beforeEach(function(done){
			spyOn(userCommon, "checkUserExistence").andCallThrough();
			userLists.addUserToList(userName[i], listName[i], userToAdd[i]).then(function(reason){
				returnValue = reason;
				if (reason) console.log("Error while adding user to an user list: " + reason);
				++i;
				done();
			}).catch(function(reason){
				console.log("Error while adding user to a list: " + reason);
				++i;
				done();
			});
		});
		it("should error out due to a missing argument", function(){
			expect(userCommon.checkUserExistence).not.toHaveBeenCalled();
			expect(returnValue instanceof Error).toBe(true);
		})
		it("should error out due to non-existing user", function(){
			expect(returnValue instanceof Error).toBe(true);
		});
		it("should error out due to non-existing list", function(){
			expect(returnValue instanceof Error).toBe(true);
		});
		it("should error out due to non-existing user to add", function(){
			expect(userCommon.checkUserExistence).toHaveBeenCalled();
			expect(returnValue instanceof Error).toBe(true);
			mongoose.connection.close();
		});
	}); // describe

}); // describe





