"use strict";

var mongoose = require('../server/MongooseTestConnection');

var userManagement = require('../server/userManagement');

// var UserSchema = require('../model/UserSchema.js').UserSchema;
var User = require('../model/UserSchema.js').User;
var user = new User({
	userName:"  Name Name  ",
	email: "some@email.TLD",
	age: 3
});

describe("Invalid user field values handling during the sign-up process", function() {
	var validationResults;
	beforeEach(function() {
		spyOn(userManagement, 'saveUser');
	});	
	it("should reject invalid user name and age and complain about the missing password; should return an object about these errors", function(){
		validationResults = userManagement.newUser(user);
		expect(userManagement.saveUser).not.toHaveBeenCalled();
		expect(validationResults).not.toEqual({});
	});
	it("should reject invalid age and email and return an object about errors", function() {
		user.userName = " NameName ";
		user.password = "goodone";
		user.email= "!what?@#4.!@#";

		validationResults = userManagement.newUser(user);
		expect(userManagement.saveUser).not.toHaveBeenCalled();
		expect(validationResults).not.toEqual({});
	});
	it("should reject short password and invalid email and return an object about errors", function() {
		user.age = 7;
		user.password = "four";

		validationResults = userManagement.newUser(user);
		expect(userManagement.saveUser).not.toHaveBeenCalled();
		expect(validationResults).not.toEqual({});
	})
});

