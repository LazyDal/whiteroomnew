'use strict';

const express = require('express');
var HelloWorld = require('./server/HelloWorld');

// constants
const PORT = 3000;

// App
const server = express();

// define static folder
server.use(express.static(__dirname + '/static'));

server.get('/', function(req, res) {
	HelloWorld(res);
});

server.listen(PORT);
console.log('Running on http://localhost:' + PORT);