var mongoose = require('./server/MongooseTestConnection.js');

// var RoomImage = require('./model/RoomSchema').RoomImage
var Room = require('./model/RoomSchema').Room;

rootRoom = new Room;
rootRoom.name = 'Root Room';
rootRoom.createdOn = Date.now();
rootRoom.save(function(err) {
	if (err) throw err;
	console.log('Root room saved');
});
