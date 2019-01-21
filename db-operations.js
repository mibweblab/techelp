//Logic to find the nearest cops... This function accepts three arguments: an instance of db, an array that contains co-ordinates in the order [<longitude>,<latitude>], and a callback function, to which it returns the results of your query. The createIndex ensures that an index is created on the specified field if it doesn’t exist, so you may want to skip that if you have already created an index prior to querying.
function fetchNearestCops(db, coordinates, callback) {
  console.log('got to fetchNearestCops', coordinates);
  db.collection('policeData').createIndex(
    {
      location: '2dsphere',
      unique: true
    },
    function() {
      db.collection('policeData')
        .find({
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: coordinates
              },
              $maxDistance: 400000
            }
          }
        })
        .toArray(function(err, results) {
          if (err) {
            console.log(err);
          } else {
            callback(results);
          }
        });
    }
  );
}
exports.fetchNearestCops = fetchNearestCops;

//we will now use the findOne query to fetch for a cop's info given their userId from the db and return the result to the callback;

function fetchCopDetails(db, userId, callback) {
  console.log(userId);
  db.collection('policeData').findOne(
    {
      userId: userId
    },
    function(err, results) {
      if (err) {
        console.log('this is your error from dbOperations ' + err);
      } else {
        // console.log(results);
        callback({
          copId: results.userId,
          displayName: results.displayName,
          phone: results.phone,
          location: results.location
        });
      }
    }
  );
}
exports.fetchCopDetails = fetchCopDetails;

//this function will save the request details in a new database table called requestData.
//saves details like student's location, time
//the status field will tell whether a cop has responded to the request or not
function saveRequest(
  db,
  issuedId,
  requestTime,
  location,
  studentId,
  status,
  callback
) {
  db.collection('requestsData').insert(
    {
      _id: issuedId,
      requestTime: requestTime,
      location: location,
      studentId: studentId,
      status: status
    },
    function(err, results) {
      if (err) {
        console.log(
          'This error comes from saveRequest function in dbOperations: ',
          err
        );
      } else {
        callback(results);
      }
    }
  );
}
exports.saveRequest = saveRequest;

//logic to handle request-accepted event sent to us from front end
//will update the request in the database with the cop’s userId and change the status field from waiting to engaged:
function updateRequest(db, requestId, copId, status, callback) {
  console.log(requestId, 'in dboperations');
  db.collection('requestsData').update(
    {
      _id: requestId //Perform update for the given requestId
    },
    {
      $set: {
        status: status, //Update status to 'engaged'
        copId: copId //save cop's userId
      }
    },
    function(err, results) {
      if (err) {
        console.log(
          'This error comes from update request function in dbOperations: ',
          err
        );
      } else {
        callback('Issue updated');
      }
    }
  );
}
exports.updateRequest = updateRequest;
