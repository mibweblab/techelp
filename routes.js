var dbOperations = require('./db-operations');

function initialize(app, db, socket, io) {
  //A GET request to /cops should return back the nearest cops in the vicinity.
  //ex '/cops?lat=12.9718915&&lng=77.64115449999997'
  app.get('/cops', function(req, res) {
    /*extract the latitude and longitude info from the request. Then, fetch the nearest cops using MongoDB's geospatial queries and return it back to the client.
     */
    //convert the query strings into numbers
    var latitude = Number(req.query.lat);
    var longitude = Number(req.query.lng);

    dbOperations.fetchNearestCops(db, [latitude, longitude], function(results) {
      //return the results back to the client in the form of JSON
      res.json({
        cops: results,
        latitude: latitude,
        longitude: longitude
      });
    });
  });
  //get request to '/cops/info?userId=02'
  app.get('/cops/info', function(req, res) {
    var userId = req.query.userId; //extract userId from query params
    dbOperations.fetchCopDetails(db, userId, function(results) {
      res.json({
        copDetails: results //return the result to the client
      });
    });
  });
  //Listen to a 'request-for-help' event from connected students
  //socket.on(); //event listener, can be called on client to execute on server
  socket.on('request-for-help', function(eventData) {
    // eventData contains userId and location
    // 1. First save the request details inside a table requestsData
    // 2. AFTER saving, fetch nearby cops from student's location
    // 3. Fire a request-for-help event to each of the cop’s room
    console.log('in request for help in routes', eventData);
    var requestTime = new Date(); //Time of the request
    var ObjectID = require('mongodb').ObjectID;
    var requestId = new ObjectID(); //generate unique ID for the request
    //1. Save request details
    var location = {
      coordinates: [eventData.location.latitude, eventData.location.longitude],
      address: eventData.location.address
    };
    dbOperations.saveRequest(
      db,
      requestId,
      requestTime,
      location,
      eventData.studentId,
      'waiting',
      function(results) {
        //2. After saving, fetch cops from student's location
        dbOperations.fetchNearestCops(db, location.coordinates, function(
          results
        ) {
          eventData.requestId = requestId;
          console.log(
            'This happened in fetchNearestcop functino in dboperations',
            requestId
          );
          //3. after fetching nearest cops, fire a request-for-help event to each of them, so that means we're looping and sending each results to cops
          for (var i = 0; i < results.length; i++) {
            io.sockets
              .in(results[i].userId)
              .emit('request-for-help', eventData);
          }
        });
      }
    );
  });
  //When the server listens to a request-accepted event, it’ll use the above function to save the request details and then emit a request-accepted event to the Student.
  // //Listen to a 'request-accepted' event from connected cops
  // socket.on('request-accepted', function(eventData) {
  //   ///Convert string to MongoDb's ObjectId data-type
  //   var ObjectID = require('mongodb').ObjectID;
  //   var requestId = new ObjectID();
  //   //For the request with requestId, update request details
  //   dbOperations.updateRequest(
  //     db,
  //     requestId,
  //     eventData.copDetails.copId,
  //     'engaged',
  //     function(results) {
  //       console.log(results, 'in requestAccepted route');
  //       eventData.requestDetails.requestId = requestId;
  //       //fire a request-accepted event to the student and send cops details to them
  //       io.in(eventData.requestDetails.requestId).emit(
  //         'request-accepted',
  //         eventData.copDetails
  //       );
  //     }
  //   );
  // });
  //Listen to a 'request-accepted' event from connected cops
  socket.on('request-accepted', function(eventData) {
    console.log('in routes, this is eventData', eventData);
    //Convert string to MongoDb's ObjectId data-type
    console.log(
      'in routes, this is eventData.requestDetails',
      eventData.requestDetails
    );
    var ObjectID = require('mongodb').ObjectID;
    var requestId = new ObjectID(eventData.requestDetails.requestId);
    console.log('in routes, this is requestID', requestId);
    //For the request with requestId, update request details
    dbOperations.updateRequest(
      db,
      requestId,
      eventData.copDetails.copId,
      'engaged',
      function(results) {
        //Fire a 'request-accepted' event to the citizen and send cop details
        eventData.requestId = requestId;
        console.log(results, 'inside of updateRequest', 'for', requestId);
        io.sockets
          .in(eventData.requestDetails.studentId)
          .emit('request-accepted', eventData.copDetails);
      }
    );
  });
}
exports.initialize = initialize;
