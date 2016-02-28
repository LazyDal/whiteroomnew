"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('../server/MongooseTestConnection'); // This will automaticaly open the MongoDB connection

// Unit Under Test
var userManagement = require('../server/userManagement');

/*****************************************************/
/* Objects which will be used as arguments for tests */
/*****************************************************/
/* User Image */
var UserImage = require('../model/UserSchema').UserImage;
var userImage = new UserImage({
	data: 'dfgdfg',
	contentType: 'img/jpeg'
});
/* User Lists */
var UserList = require('../model/UserSchema').UserList;
var userList = new UserList({
	name:'ListName',
	users: null
});
/* User */
var User = require('../model/UserSchema.js').User;
var user = new User({
	userName: 'AGoodName',
	realName: 'Real Name',
	email: 'some@domain.com',
	password: 'somepassword',
	country: 'some country',
	phone: '+xxx yy zzz-zzz',
	age: 250,
	sex: 'Male/Female',
	status: 'Single/InRelation/Married/Divorced',
	interestedIn: 'Men/Women/Both',
	image: null,
	userLists: userList,
	createdOn: Date.now(),
	lastAction: Date.now(),
	totalPosts: 42,
	totalTopicsStarted: 12,
	points: 10
});


describe("User Sign Up Process:", function () {

	describe("The User Image Object:", function () {
		it("should exist", function(){
			expect(userImage).toBeDefined();
		});
		it("should contain all the neccesary fields", function() {
			expect(userImage.data).toBeDefined();
			expect(userImage.contentType).toBeDefined();
		});
	});

	describe("The User Object:", function() {
		it("should exist", function () {
			expect(user).toBeDefined();
		});
		it("should contain all the needed fields", function() {
			expect(user.userName).toBeDefined();
			expect(user.realName).toBeDefined();
			expect(user.email).toBeDefined();
			expect(user.password).toBeDefined();
			expect(user.country).toBeDefined();
			expect(user.phone).toBeDefined();
			expect(user.age).toBeDefined();
			expect(user.sex).toBeDefined();
			expect(user.status).toBeDefined();
			expect(user.interestedIn).toBeDefined();
			expect(user.image).toBeDefined();
			expect(user.userLists).toBeDefined();
			expect(user.createdOn).toBeDefined();
			expect(user.lastAction).toBeDefined();
			expect(user.totalPosts).toBeDefined();
			expect(user.totalTopicsStarted).toBeDefined();
			expect(user.points).toBeDefined();
		}); // it
	}); // describe

	describe("The User List Object:", function() { 
		it("should exist", function() {
			expect(userList).toBeDefined();
		});
		it("should contain all the needed fields", function() { 
			expect(userList.name).toBeDefined();
			expect(userList.users).toBeDefined();
		});
	});

	describe("The User management object:", function(){
		it("should exist", function(){
			expect(userManagement).toBeDefined();
		});
		// TODO
	});

	describe("New User Creation Process:", function () {
		var validationResults;

		// We will test some async functions so we need the special Jasmine done() argument
	 	beforeEach(function(done) {
			spyOn(userManagement, 'newUser').andCallThrough();
			spyOn(userManagement, 'saveUser').andCallThrough();
			spyOn(userManagement, 'hashPassword');
			spyOn(userManagement, 'trimFieldSpaces').andCallThrough();
			spyOn(userManagement, 'newUserValidation').andCallThrough();
			spyOn(userManagement, 'checkImage');
			// Now we envoke the function which orchestrates the new user creation process; it returns a promise, since it uses several async functions
	    userManagement.newUser(user).then(	
 				function (results) {
				  validationResults = results;
		      console.log(validationResults);
		      // Invoke the special Jasmine done callback; no further tests will run before this function is invoked
		      done();
 				}
 			).catch(function(reason){
 				console.log(reason);
 				done();
 			});
	  });
		it("should have validated the user object argument, hashed the password and called saveUser method", function(done) {
			expect(userManagement.trimFieldSpaces).toHaveBeenCalled();
			expect(userManagement.newUserValidation).toHaveBeenCalled();
			expect(validationResults["status"]).toEqual("O.K.");
			expect(userManagement.hashPassword).toHaveBeenCalled();
			expect(typeof(userManagement.hashPassword.mostRecentCall.args[0])).toMatch("string");
			expect(userManagement.checkImage).toHaveBeenCalled();
			expect(userManagement.saveUser).toHaveBeenCalled();
			expect(userManagement.saveUser.mostRecentCall.args[0] instanceof User).toBe(true);
			// mongoose.connection.close(function () {
			// 	console.log('Mongoose disconnected');
			// 	// process.exit(0);
			// });
		}); // it
	}); // describe

	describe("Adding User To a List:", function(){
			it("should check if the user exists and call addUserToList with two arguments", function() {
			spyOn(userManagement, "tryAddingUserToList").andCallThrough();
			spyOn(userManagement, "addUserToList");
			spyOn(userManagement, "checkUserExistence");
			var returnValue = userManagement.tryAddingUserToList(user, userList);
			expect(userManagement.checkUserExistence).toHaveBeenCalled();
			expect(typeof(userManagement.checkUserExistence.mostRecentCall.args[0])).toEqual('string');
			expect(userManagement.addUserToList).toHaveBeenCalled();
			expect(userManagement.addUserToList.mostRecentCall.args[0] instanceof User).toBe(true);
			expect(userManagement.addUserToList.mostRecentCall.args[1] instanceof UserList).toBe(true);
			expect(returnValue["status"]).toEqual("O.K.");
		});
	}); // describe
}); // describe