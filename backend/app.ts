import * as express from "express";
import * as OAuth2Strategy from "passport-oauth2";
import * as axios from "axios";
import cookie_session = require('cookie-session');
import { nest } from "../client-config.json";
import passport = require('passport');

const app = express();
const port = 3000;

app.use(cookie_session({
  maxAge: 1000 * 60 * 60 * 24 * 200,
  secret: 'nest test'
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new OAuth2Strategy({
    authorizationURL: nest.auth_url,
    clientID: nest.client_id,
    clientSecret: nest.client_secret,
    state: true,
    tokenURL: nest.token_url,
  },
  (accessToken, refreshToken, profile, done) => {
    axios.default.get("https://developer-api.nest.com", {
      headers: {
        "Authorization" : `Bearer ${accessToken}`
      }
    }).then((res) => {
      done(null, {
        id: res.data.metadata.user_id,
        token: accessToken,
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

function isAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
  console.log
  if (req.user) {
    next()
  } else {
    res.json({'error': 'user not authenticated'});
  }
}

app.get("/", (_, res) => {
  res.json({"hello": "world"})
});

app.get("/err/:error", (req, res) => {
  res.json({"message": req.params.error})
});

app.get("/auth",
  passport.authenticate("oauth2")
);

app.get("/auth/callback",
  passport.authenticate("oauth2"),
  (req, res) => {
    res.redirect('/getBasic')
  },
  (req, res) => {
    res.redirect(`/err/${req.body}`)
  }
)

app.get("/getBasic",
  isAuthenticated,
  (req, res) => {
    axios.default.get(
      "https://developer-api.nest.com/",
      { headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${req.user.token}`
      }}
    ).then(response => {
      res.json(response.data);
    }).catch(error => {
      console.log(error);
      res.send(error);
    })
  }
)

app.listen(port);

module.exports = app;
