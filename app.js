const http = require('http');
const express = require('express');
const consolidate = require('consolidate'); //1
const _ = require('underscore');
const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const keys = require('./config/key');

const routes = require('./routes'); //File that contains our endpoints
const mongoClient = require('mongodb').MongoClient;

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(
  bodyParser.json({
    limit: '5mb'
  })
);

app.set('views', 'views'); //Set the folder-name from where you serve the html page.
app.use(express.static('./public')); //setting the folder name (public) where all the static files like css, js, images etc are made available

app.set('view engine', 'html');
app.engine('html', consolidate.underscore); //Use underscore to parse templates when we do res.render

const server = http.Server(app);
const portNumber = 8000; //for locahost:8000

const io = require('socket.io').listen(server); //Creating a new socket.io instance by passing the HTTP server object

server.listen(portNumber, function() {
  //Runs the server on port 8000
  console.log('Server listening at port ' + portNumber);

  var url = 'mongodb://localhost:27017/unLuck'; //Db name
  mongoClient.connect(
    url,

    // mongoose.connect(
    //   keys.mongoURI,
    { useNewUrlParser: true },
    function(err, db) {
      //a connection with the mongodb is established here.
      console.log('Connected to Database');

      app.get('/student.html', function(req, res) {
        //a request to /student.html will render our student.html page
        //Substitute the variable userId in student.html with the userId value extracted from query params of the request.
        res.render('student.html', {
          userId: req.query.userId
        });
      });

      app.get('/cop.html', function(req, res) {
        res.render('cop.html', {
          userId: req.query.userId
        });
      });

      io.on('connection', function(socket) {
        //Listen on the 'connection' event for incoming sockets
        console.log('A user just connected');

        socket.on('join', function(data) {
          //Listen to any join event from connected users
          socket.join(data.userId); //User joins a unique room/channel that's named after the userId
          console.log('User joined room: ' + data.userId);
        });

        routes.initialize(app, db, socket, io); //Pass socket and io objects that we could use at different parts of our app
      });
    }
  );
});

// var http = require('http');
// var express = require('express');
// var consolidate = require('consolidate');
// var _ = require('underscore');
// var bodyParser = require('body-parser');

// var routes = require('./routes'); //File that contains our endpoints
// var mongoClient = require('mongodb').MongoClient;

// var app = express();
// app.use(
//   bodyParser.urlencoded({
//     extended: true
//   })
// );

// app.use(bodyParser.json({ limit: '5mb' }));

// app.set('views', 'views'); //Set the folder-name from where you serve the html page. look for html files inside the views folder whenever there is a request from a particular page.
// app.use(express.static('./public')); //setting the folder name (public) where all the static files like css, js, images etc are made available

// app.set('view engine', 'html'); //these two lines tell our app to use the underscore template engine to parse our html files.
// app.engine('html', consolidate.underscore);
// var portNumber = 8000; //for locahost:8000

// var server = http.Server(app);
// var portNumber = 8000;

// var io = require('socket.io')(server); // creating a new socket.io instance by passing the http server object

// server.listen(portNumber, function() {
//   console.log('New server with socket listening at port ' + portNumber);

//   var url = 'mongodb://localhost:27017/unLuck'; //db name
//   mongoClient.connect(
//     url,
//     function(err, db) {
//       console.log('Connected to Database with socket');
//       app.get('./student.html', function(req, res) {
//         res.render('student.html', {
//           userId: req.query.userId
//         });
//       });

//       app.get('./cop.html', function(req, res) {
//         res.render('cop.html', {
//           userId: req.query.userId
//         });
//       });

//       io.on('connection', function(socket) {
//         //listen for connection event for incoming sockets
//         console.log('A user just connected');

//         socket.on('join', function(data) {
//           //listen to any join event from connected
//           socket.join(data.userId); //User joins a unique room/channel that's named after the userId
//           console.log('User joined room: ' + data.userId);
//         });

//         routes.initialize(app, db, socket, io); //pass socket and io objects that we could use at different parts of our app
//       });
//     }
//   );
// });

// // //since we're using socket.io we had to replace this to the code above
// // http.createServer(app).listen(portNumber, function() {
// //   //creating the server which is listening to the port number:8000, and calls a function within in which calls the initialize(app) function in the router module...
// //   //you create a new instance of the MongoClient object from the mongodb module. Once the web server begins, you connect to your MongoDB database using the connect function that’s exposed by your MongoClient instance. After it initializes the connection, it returns a Db instance in the callback. You can now pass both the app and db instances to the initialize function of your routes.js file.
// //   console.log('Server listening at port ' + portNumber);

// //   var url = 'mongodb://localhost:27017/unLuck';
// //   mongoClient.connect(
// //     url,
// //     function(err, db) {
// //       //a connection with the mongodb is established here.
// //       console.log('Connected to Database');
// //       routes.initialize(app, db); //function defined in routes.js which is exported to be accessed by other modules

// //       //to render the student page and the cop page
// //       app.get('/student.html', function(req, res) {
// //         res.render('student.html', {
// //           userId: req.query.userId
// //         });
// //       });
// //       app.get('/cop.html', function(req, res) {
// //         res.render('cop.html', {
// //           userId: req.query.userId
// //         });
// //       });
// //     }
// //   );
// // });
