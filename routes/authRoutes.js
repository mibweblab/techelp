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
    res.send('Or we can have something like: Welcome ', req.user.displayName);
    // console.log(req);
    console.log('your request came from:', req.user);
  });
};
