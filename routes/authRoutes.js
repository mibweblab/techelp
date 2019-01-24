const passport = require('passport');

module.exports = app => {
  //pass user to passport where they will be authenticated
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );
  //callback route handler
  app.get('/auth/google/callback', passport.authenticate('google'));

  //whenever someone makes a get request to our app, we will have a route that returns whoever is currently logged in
  app.get('/api/current_user', (req, res) => {
    res.send(req.user);
    // console.log(req);
    console.log('your request came from:', req.user);
  });
  //Request handler for whenever a user makes a get request to log out of our app
  app.get('/api/logout', (req, res) => {
    req.logout(); //passport function to log out, it kills the cookie
    res.send(req.user);
  });
};
