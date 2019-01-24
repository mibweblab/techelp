//key.js - figure out what set of credentials to return
//when we are on heroku, heroku has this already set for you so that's how we can figure out whether we are in production or not because when we are on our local machine there's no NODE_ENV
if (process.env.NODE_ENV === 'production') {
  //we are in production - return prod set of keys
  module.exports = require('./prod');
} else {
  //we are in development - return the dev keys
  module.exports = require('./dev');
}
