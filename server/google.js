const passport = require('passport');
const Strategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('./lib/user');

function auth({ ROOT_URL, app, database }) {
  const verify = async (accessToken, refreshToken, profile, verified) => {
    let email;
    let avatarUrl;
    console.log("profuke", profile);

    if (profile.emails) {
      email = profile.emails[0].value;
    }

    if (profile.photos && profile.photos.length > 0) {
      avatarUrl = profile.photos[0].value.replace('sz=50', 'sz=128');
    }

    try {
      const user = await User.signInOrSignUp({ database,
        googleId: profile.id,
        email,
        googleToken: { accessToken, refreshToken },
        displayName: profile.displayName,
        avatarUrl,
      });
      verified(null, user);
    } catch (err) {
      verified(err);
      console.log(err); // eslint-disable-line
    }
  };

  passport.use(new Strategy(
    {
      clientID: process.env.NODE_ENV == 'production' ? process.env.Google_clientID : process.env.Google_clientIDDEV,
      clientSecret: process.env.NODE_ENV == 'production' ? process.env.Google_clientSecret : process.env.Google_clientSecretDEV,
      callbackURL: `${ROOT_URL}/oauth2callback`,
    },
    verify,
  ));

  passport.serializeUser((user, done) => {
    console.log("SerializeUser id", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      console.log("deserializing user");
      const user = await User.getUserById(database, id);
      done(null, user);
    } catch (error) {
      console.error("DeserializeUser error", error);
      done(error, null)
    }
    
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // Express routes
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
    prompt: 'select_account',
  }));

  app.get(
    '/oauth2callback',
    passport.authenticate('google', {
      failureRedirect: '/login',
    }),
    (req, res) => {
      res.redirect('/');
    },
  );

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
  });
}

module.exports = auth;