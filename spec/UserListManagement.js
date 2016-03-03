"use strict";

// Unit Under Test
var userManagement = require('../server/userManagement');

// var UserImage = require('../model/UserSchema').UserImage;
var UserList = require('../model/UserSchema').UserList;
var userList = new UserList();
var User = require('../model/UserSchema.js').User;
var user = new User({
	userName: 'AnExistingName'
});

describe("The User management object:", function(){
	it("should exist", function(){
		expect(userManagement).toBeDefined();
	});
	it("User list methods should exist", function() {
		expect(userManagement.tryAddingUserToList).toBeDefined();
		expect(userManagement.addUserToList).toBeDefined();
		expect(userManagement.checkUserExistence).toBeDefined();
	});
});

describe("Adding User To a List:", function(){
	it("should check if the user exists and call addUserToList with two arguments", function() {
		spyOn(userManagement, "tryAddingUserToList").andCallThrough();
		spyOn(userManagement, "addUserToList");
		spyOn(userManagement, "checkUserExistence");
		userManagement.tryAddingUserToList(user, userList);
		expect(userManagement.checkUserExistence).toHaveBeenCalled();
		expect(typeof(userManagement.checkUserExistence.mostRecentCall.args[0])).toEqual('string');
		expect(userManagement.addUserToList).toHaveBeenCalled();
		expect(userManagement.addUserToList.mostRecentCall.args[0] instanceof User).toBe(true);
		expect(userManagement.addUserToList.mostRecentCall.args[1] instanceof UserList).toBe(true);
	});
}); // describe
