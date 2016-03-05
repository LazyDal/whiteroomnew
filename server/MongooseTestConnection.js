
/* This module creates Mongoose ORM to MongoDB connection and defines all the needed event handlers */
/* Configured for test (development on localhost) environment */

"use strict";

var mongoose = require( 'mongoose' );
var MongoDBTestCredentials = require('../config/MongoDBTestCredentials');

// Create the database connection 
mongoose.connect(MongoDBTestCredentials.dbURI);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function() {
	console.log('Mongoose default connection open to ' + MongoDBTestCredentials.dbURI);
});

// If the connection throws an error
mongoose.connection.on('error', function(err) {
	console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
	console.log('Mongoose default connection disconnected');
} );

// When Node server exits
process.on('SIGINT', function() {
	mongoose.connection.close(function () {
		console.log('Mongoose disconnected through app termination');
		process.exit(0);
	});
});

module.exports = mongoose;