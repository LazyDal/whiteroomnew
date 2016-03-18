var mongoose = require('../server/MongooseTestConnection'); // This will automaticaly open the MongoDB connection
var fs=require('fs');

/* User Image */
var UserImage = require('../model/UserSchema').UserImage;
var userImage = new UserImage({
	data: fs.readFileSync('../static/images/user-placeholder.jpg'),
	contentType: 'image/jpeg',
	name: "userImagePlaceholder",
	tmpPath: __dirname + "../static/images/user-placeholder.jpg"
});
userImage.save(function(err){
	if (err) throw err;
	mongoose.connection.close();
});
