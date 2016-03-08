"use strict";

var Promise = require('es6-promise').Promise;
var mongoose = require('../server/MongooseTestConnection'); // This will automaticaly open the MongoDB connection

// Unit Under Test
var userManagement = require('../server/userManagement');

/* MongoDB and imagemagick must be installed	and running	 */
var User = require('../model/UserSchema.js').User;

describe("Get user data:", function() {

	it("should return User object containing all the fields", function(){
		userManagement.getUserProfile('Dalibor').then(function(result){
			expect(result).toBeDefined();
			expect(result.realName).toBeDefined();
			// mongoose.connection.close(function () {
			// 		done();
			// });
		}).catch(function(reason) {
			console.log("Error: " + reason);
			// mongoose.connection.close(function () {
			// 		done();
			// });
		});
	});

});	// describe
