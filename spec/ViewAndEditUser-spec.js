"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('../server/MongooseTestConnection'); // This will automaticaly open the MongoDB connection

// Unit Under Test
var userProfile = require('../server/userProfile');

/* MongoDB and imagemagick must be installed	and running	 */
var User = require('../model/UserSchema.js').User;

describe("Get user data:", function() {

	it("should return User object containing all the fields", function(){
		userProfile.getUserProfile('AnExistingName').then(function(result){
			expect(result).toBeDefined();
			expect(result.realName).toBeDefined();
			expect(result.email).toBeDefined();
			expect(result.password).toBeDefined();
			// We will not check non-required fields
		}).catch(function(reason) {
			console.log("Error: " + reason);
		});
	});

});	// describe

describe("Update user data:", function() {
		 	var validationResults = {};
		 	beforeEach(function(done) {
				// These spies will also actually execute the spied on methods because of andCallThrough() methods
				spyOn(userProfile, 'updateUser').andCallThrough();
				spyOn(userProfile, 'trimFieldSpaces').andCallThrough();
				spyOn(userProfile, 'updateUserValidation').andCallThrough();
				spyOn(userProfile, 'updateUserDB').andCallThrough();
				var editedUser = new User({userName: "AnExistingName", realName: "Another Name", country: "another country", age: 28
				});
				// Now we envoke the function which orchestrates updating user data process; it returns a promise, since it uses several async functions
		    userProfile.updateUser(editedUser).then(	// This is quite a complex process where all validation must happen first
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

				it("should have validated the user object argument and updated user calling updateUserDB method", function(done) {
						expect(userProfile.trimFieldSpaces).toHaveBeenCalled();
						expect(userProfile.updateUserValidation).toHaveBeenCalled();
						expect(userProfile.updateUserDB).toHaveBeenCalled();
						expect(validationResults).toEqual(undefined);
						userProfile.getUserProfile('AnExistingName').then(function(savedUser){ 
							expect(savedUser.realName).toMatch('Another Name');
							expect(savedUser.country).toMatch('another country');
							expect(savedUser.age).toEqual(28);
							done();
						});
				});	// it
		  }); // describe
