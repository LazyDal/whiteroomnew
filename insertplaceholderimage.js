var mongoose = require('./server/MongooseTestConnection'); // This will automaticaly open the MongoDB connection
var fs=require('fs');

// Unit Under Test
var userManagement = require('./server/userManagement');

/*****************************************************/
/* Objects which will be used as arguments for tests */
/*****************************************************/
/* User Image */
var UserImage = require('./model/UserSchema').UserImage;
var userImage = new UserImage({
	data: fs.readFileSync('./user-placeholder.jpg'),
	contentType: 'image/jpeg',
	name: "userImagePlaceholder"
});
userImage.save(function(err){
	if (err) throw err;
	mongoose.connection.close(function () {
					console.log('Mongoose disconnected');
					// process.exit(0);
				});
});
