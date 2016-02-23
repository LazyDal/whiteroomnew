"use strict";

var mongoose = require('mongoose');

var userManagement = require('../server/userManagement');

// Global parts of Unit Under Test
var UserImageSchema = require('../server/UserImageSchema.js');
var UserImage = mongoose.model('UserImage', UserImageSchema);
var userImage = new UserImage({
	data: 'dfgdfg',
	contentType: 'img/jpeg'
});

var UserListSchema = require('../server/UserSchema').UserListSchema;
var UserList = require('../server/UserSchema').UserList;
var userList = new UserList({
	name:'ListName',
	users: null
});

var UserSchema = require('../server/UserSchema.js').UserSchema;
var User = require('../server/UserSchema.js').User;
var user = new User({
	userName: 'Name',
	realName: 'Real Name',
	email: 'some@mail',
	password: 'somepassword',
	country: 'some country',
	phone: '+xxx yy zzz-zzz',
	age: 25,
	sex: 'Male/Female',
	status: 'Single/InRelation/Married/Divorced',
	interestedIn: 'Men/Women/Both',
	image: userImage,
	userLists: userList,
	createdOn: Date.now(),
	lastAction: Date.now(),
	totalPosts: 42,
	totalTopicsStarted: 12
});

describe("User Management:", function () {

	describe("User Images Database schema:", function () {
		it("schema should exist", function() {
			expect(UserImageSchema).toBeDefined();
		});
		it("user image instance should exist", function(){
			expect(userImage).toBeDefined();
		});
		it("user image should contain all the neccesary fields", function() {
			expect(userImage.data).toBeDefined();
			expect(userImage.contentType).toBeDefined();
		});
	});

	describe("User Database Schema:", function() {
		it("schema should exist", function() {
			expect(UserSchema).toBeDefined();
		});
		it("user should exist", function () {
			expect(user).toBeDefined();
		});
		it("user should contain all the needed fields", function() {
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
		}); // it
	}); // describe

	describe("User List Schema:", function() { 
		it("should exist", function() {
			expect(userList).toBeDefined();
		});
		it("should contain all needed fields", function() { 
			expect(userList.name).toBeDefined();
			expect(userList.users).toBeDefined();
		});
	});

	describe("User Management Object:", function () {
		it("should exist", function(){
			expect(userManagement).toBeDefined();
		});
		it("when creating a new user, it should call saveUser method with a User as argument", function() {
			spyOn(userManagement, 'saveUser');
			userManagement.newUser();
			expect(userManagement.saveUser).toHaveBeenCalled();
			expect(userManagement.saveUser.mostRecentCall.args[0] instanceof User).toBe(true);
		});
		it("when creating a new user, it should hash the password", function() { 
			spyOn(userManagement, 'hashPassword');
			userManagement.newUser();
			expect(userManagement.hashPassword).toHaveBeenCalled();
			expect(typeof(userManagement.hashPassword.mostRecentCall.args[0])).toMatch("string");
		});
		//it("when adding an existing user to list, it should call addUserToList with a ")
			//it

	}); // describe

}); // describe