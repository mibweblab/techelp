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
};
