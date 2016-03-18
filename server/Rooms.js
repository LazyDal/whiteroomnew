"use strict";

var mongoose = require('./MongooseTestConnection.js');
var Promise = require('es6-promise').Promise;
var validate = require('validate.js');
var XRegExp = require('xregexp');
var _ = require('lodash');

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

/**
 * Provides room data manipulation
 *
 * @class roomManagement
**/
var roomManagement = {
	/**
	 * Returns root room id
	 *
	 * @method getRootRoomId
	 * @return {ObjectID} resolves with root room id or rejects on database access 
	 * error
	**/
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
	/**
	 * Saves new public room passed in as the second parameter to a room with id passed in
	 * as the first parameter
	 *
	 * @method savePublicRoom
	 * @return {undefined, validation errors, Error} resolves with undefined on success,
	 * validation errors objects on validate.js errors, Error on other validation
	 * errors and rejects on database access errors
	**/
	savePublicRoom: function(rootRoomId, roomToSave) {
		return new Promise(function(resolve, reject){
		if (!roomToSave || !rootRoomId) {
			resolve(new ReferenceError("Required parameter is missing, null or an empty string"));
			return;
		}
		if (_.isEmpty(roomToSave)) {
			resolve(new ReferenceError("Second parameter has to be non-empty object"));
			return;
		}
		if (!(roomToSave instanceof Room)) {
			resolve(new TypeError("Second parameter has to be a Room object"));
			return;
		}
		var validationResults = validate({'name': roomToSave.name}, createRoomConstraints);
			if (validationResults) { 
				resolve(validationResults);
				return;
			}
			if (roomToSave.defaultUserList || roomToSave.roomUserLists[0])  {
				resolve(new Error("Public room can't have user access constraints"));
				return;
			}
			roomToSave.type = "Public";
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
	},
	/**
	 * Gets subrooms of the room which's id is passed in as the first parameter
	 *
	 * @method getSubrooms
	 * @parameter {ObjectID} roomId id of the room whichs subrooms are required
	 * @return {Array, Error} resolves with a subroom array on success, Error on 
	 * validation errors and rejects on database access errors
	**/
	getSubrooms: function(roomId) {
		return new Promise(function(resolve, reject){
			if(!roomId) {
				resolve(new ReferenceError("Required parameter is missing, null or an empty string"));
				return;
			}
			if (_.isEmpty(roomId)) {
				resolve(new ReferenceError("Parameter has to be a non-empty object or string"));
				return;
			}
			Room
				.findById(roomId)
				.populate('subrooms')
				.exec(function(err,rootRoom) {
					if (err) reject(err);	// TODO
					resolve(rootRoom.subrooms);
			});	// findById
		}); // Promise
	}
}

module.exports = roomManagement;