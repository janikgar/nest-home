import * as express from "express";
import * as axios from "axios";
import * as OAuth2Strategy from "passport-oauth2";
import * as session from "express-session";
import { nest } from "../client-config.json";
import passport = require('passport');

const app = express();
const port = 3000;

app.use(session({
  secret: 'nest test',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
}));

app.get("/", (_, res) => {
  res.send("Hello world");
});

passport.use(new OAuth2Strategy({
  authorizationURL: nest.auth_url,
  clientID: nest.client_id,
  clientSecret: nest.client_secret,
  state: nest.state,
  tokenURL: nest.token_url,
  },
  (accessToken, refreshToken, profile, done) => {
    done(null, profile);
  })
);

app.get("/auth",
  passport.authenticate("oauth2")
);

app.get("/auth/callback",
  passport.authenticate("oauth2"),
  (req, res) => {
    axios.default.get(`${nest.token_url}?code=${req.query.code}&state=${req.query.state}`).then((result) => {
      res.redirect('/getStructure')
    }).catch((err: Error) => {
      res.send(err.message);
    });
  }
)

app.get("/auth/failure",
  (req, res) => {
    res.send("auth failed");
  }
)

app.get("/getStructure",
  passport.authenticate("oauth2"),
  (req, res) => {
    axios.default.request({
      method: "get",
      url: "https://developer-api.nest.com",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer: ${req.query.code}`,
      }
    }).then((nestResponse) => {
      res.send(nestResponse);
    }).catch((err: Error) => {
      res.send(err.stack);
      res.redirect("/");
    });
  }
)

app.listen(port);

module.exports = app;
