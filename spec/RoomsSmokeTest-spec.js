"use strict";

var mongoose = require('../server/MongooseTestConnection.js');
var Promise = require('es6-promise').Promise;

//
// For the following tests MongoDB must be installed and running
// root room must be present in MongoDB - you can insert it by entering the spec directory and typing 'node insertrootroom'
//

// Mongoose Room model
var Room = require('../model/RoomSchema').Room;

// Unit Under Test
var roomManagement = require('../server/Rooms');

describe("Rooms functionality: ", function(){
	describe("Saving new rooms inside of root room", function() {
		var i = 0, roomName = ["Room 2", "Room3"]
		beforeEach(function(done){
			roomManagement.getRootRoomId().then(function(rootRoomId){
				var newRoom = new Room({
					name: roomName[i],
					subrooms: []
				});
				roomManagement.savePublicRoom(rootRoomId, newRoom).then(function(response){
					if (response) {
						console.log("Validation error: " + JSON.stringify(response));
						++i;
						// Invoke the special Jasmine done callback; no further tests will run before this function is invoked
						done();
					}
					else {
						console.log("Room saved.");
						++i;
						done();
					}
				}).catch(function(reason){
					console.log("Internal error occured: " + reason);
					++i;
					done();
				});
			}).catch(function(reason){
				console.log("An error occured: " + reason);
				done();
			});
		});
		it("should have saved room and subroom", function(){
			;
		});
		it("should have saved room and subroom", function(){
			;
		});
	});

	describe("Getting subrooms of a room: ", function(){
		var result;
		beforeEach(function(done){
			roomManagement.getRootRoomId().then(function(rootRoomId){
				roomManagement.getSubrooms(rootRoomId).then(function(response){
						result = response;
						done();
				}).catch(function(reason){
					console.log("Internal error occured: " + reason);
					done();
				});
			}).catch(function(reason){
				console.log("An error occured: " + reason);
				done();
			});
		});
		it("should return all subrooms of the root room", function(){
			expect(result instanceof Array).toBe(true);
			expect(result.length).toEqual(2);
			expect(result[0].name).toMatch('Room 2');
			mongoose.connection.close();
		});
	});
});
