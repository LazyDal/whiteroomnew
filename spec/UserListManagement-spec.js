"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('../server/MongooseTestConnection'); // This will automaticaly open the MongoDB connection

// Unit Under Test
var userManagement = require('../server/userManagement');

// var UserImage = require('../model/UserSchema').UserImage;
var UserList = require('../model/UserSchema').UserList;

var User = require('../model/UserSchema.js').User;

describe("The User management object:", function(){
	it("should exist", function(){
		expect(userManagement).toBeDefined();
	});
	it("User list methods should exist", function() {
		expect(userManagement.createUserList).toBeDefined();
		// expect(userManagement.returnUsersLists).toBeDefined();
		// expect(userManagement.tryAddingUserToList).toBeDefined();
		// expect(userManagement.checkUserExistence).toBeDefined();
		// expect(userManagement.addUserToList).toBeDefined();
		// expect(userManagement.removeUserFromList).toBeDefined();
		// expect(userManagement.returnUserList).toBeDefined();
		// expect(userManagement.deleteUserList).toBeDefined();
	});
});

describe("Creating User List:", function(done){
	beforeEach(function(done) {
		spyOn(userManagement, "checkUserExistence").andCallThrough();
		userManagement.createUserList('AnExistingName', 'First List').then(function(results){
			if (results)
				console.log("Validation error" + results);
			done();
		}).catch(function(result){
			console.log("An error occured:" + result);
			done();
		});
	});
	it("should check if the user exists and create user list", function() {
				
		expect(userManagement.checkUserExistence).toHaveBeenCalled();
		expect(typeof(userManagement.checkUserExistence.mostRecentCall.args[0])).toEqual('string');

		// expect(userManagement.addUserToList).toHaveBeenCalled();
		// expect(userManagement.addUserToList.mostRecentCall.args[0] instanceof User).toBe(true);
		// expect(userManagement.addUserToList.mostRecentCall.args[1] instanceof UserList).toBe(true);
	});
}); // describe
