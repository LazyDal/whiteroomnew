"use strict";

var mongoose = require('./MongooseTestConnection.js');
var Promise = require('es6-promise').Promise;
var validate = require('validate.js');
var XRegExp = require('xregexp');

var Room = require('../model/RoomSchema').Room;
var userCommon = require('./userCommon');

//
//	Validate.js will use the information that follows
//
// Validation.js constrains which will be used when creating a new room
var createRoomConstraints = {
	name: {
		name: true,
		length: {
			maximum: 40,
			message:"too long"
		}
	}
}

var roomManagement = {
	getRootRoomId: function() {
		return new Promise(function(resolve, reject){
			Room.findOne({'name': 'Root Room'}, function(err, foundRoom){
				if (err) reject(err);
				else {
					resolve(foundRoom._id);
				}
			});
		});
	},
	savePublicRoom: function(rootRoomId, roomToSave) {
		return new Promise(function(resolve, reject){
		var validationResults = validate({'name': roomToSave.name}, createRoomConstraints);
			if (validationResults) { 
				resolve(validationResults);
				return;
			}
			roomToSave.type = "Public";
			if (roomToSave.defaultUserList || roomToSave.roomUserLists[0])  {
				resolve("Public room can't have user access constraints");
				return;
			}
			roomToSave.save(function(err){
				if (err) reject(err);
				Room.findById(rootRoomId, function(err, rootRoom) {
					if (err) {
						reject(err)
						return;
					};	
					rootRoom.subrooms.push(roomToSave);
					rootRoom.save(function(err){
						if (err) reject(err);
						resolve();
					});
				});
			});
		});
	}
}

module.exports = roomManagement;