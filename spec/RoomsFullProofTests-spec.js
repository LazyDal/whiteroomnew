"use strict";

var mongoose = require('../server/MongooseTestConnection.js');
var Promise = require('es6-promise').Promise;

var Room = require('../model/RoomSchema').Room;
var roomManagement = require('../server/Rooms');

describe("Full proof tests of rooms functionality", function(){
		it("should handle empty arguments when getting subrooms", function(done){
			roomManagement.getSubrooms().then(function(result){
				// we should get an error
				expect(result instanceof Error).toBe(true);
				console.log("Validation error occured: " + result);
				done();
			}).catch(function(reason){
				console.log("Internal error occured: " + reason);
				done();
			})
		});
		it("should handle empty object argument when getting subrooms", function(done){
			roomManagement.getSubrooms({}).then(function(result){
				// we should get an error
				expect(result instanceof Error).toBe(true);
				console.log("Validation error occured: " + result);
				done();
			}).catch(function(reason){
				console.log("Internal error occured: " + reason);
				done();
			})
		});
		it("should handle missing or null arguments when saving a public room", function(done){
			roomManagement.savePublicRoom().then(function(result){
				expect(result instanceof Error).toBe(true);
				console.log("Validation error occured: " + result);
				done();
			}).catch(function(reason){
				console.log("Internal error occured: " + reason);
				done();
			})
		});
		it("should handle empty objects as arguments when saving a public room", function(done){
			roomManagement.savePublicRoom().then(function(result){
				expect(result instanceof Error).toBe(true);
				console.log("Validation error occured: " + result);
				done();
			}).catch(function(reason){
				console.log("Internal error occured: " + reason);
				done();
			})
		});
		it("should handle invalid object type as second argument when saving a public room", function(done){
			roomManagement.savePublicRoom("bogusId343434", roomManagement).then(function(result){
				expect(result instanceof Error).toBe(true);
				console.log("Validation error occured: " + result);
				done();
			}).catch(function(reason){
				console.log("Internal error occured: " + reason);
				done();
			})
		});
		it("should handle too long a name when saving a public room", function(done){
			var newRoom = new Room({
				name: "TooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongAName",
				subrooms: []
			});
			roomManagement.savePublicRoom("bogusId343434", newRoom).then(function(result){
				console.log("Validation error occured: " + JSON.stringify(result));
				mongoose.connection.close();
				done();
			}).catch(function(reason){
				console.log("Internal error occured: " + reason);
				mongoose.connection.close();
				done();
			});
		});
		
	});