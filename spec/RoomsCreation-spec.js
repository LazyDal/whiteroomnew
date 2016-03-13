"use strict";

var mongoose = require('../server/MongooseTestConnection.js');
var Promise = require('es6-promise').Promise;

var Room = require('../model/RoomSchema').Room;
var roomManagement = require('../server/Rooms');

describe("Saving of the new room inside root room", function() {
	var i = 0, roomName = ["Room 2", "TooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongANameTooLongAName", "Room3"]
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
	it("should reject new room due to too long a name", function(){
		;
	});
	it("should have saved room and subroom", function(){
		;
	});
});