import * as express from "express";
import * as OAuth2Strategy from "passport-oauth2";
import * as session from "express-session";
import * as axios from "axios";
import { Moment } from "moment";
import { nest } from "../client-config.json";
import passport = require('passport');
import moment = require('moment');

const app = express();
const port = 3000;

app.use(session({
  secret: nest.client_secret,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
}));

passport.use(new OAuth2Strategy({
  authorizationURL: nest.auth_url,
  clientID: nest.client_id,
  clientSecret: nest.client_secret,
  state: true,
  tokenURL: nest.token_url,
},
(accessToken, refreshToken, profile, cb) => {
  console.log(profile);
  cb(null, profile);
})
);

app.get("/", (_, res) => {
  res.json({"hello": "world"})
  // res.send("Hello world");
});

app.get("/err/:error", (req, res) => {
  res.json({"message": req.params.error})
});

app.get("/auth",
  passport.authenticate("oauth2")
);

app.get("/auth/callback",
  // passport.authenticate("oauth2"),
  (req, res) => {
    axios.default.post(
      nest.token_url,
      `code=${req.query.code}&client_id=${nest.client_id}&client_secret=${nest.client_secret}&grant_type=authorization_code`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    ).then(tokenRes => {
      req.session.token = tokenRes.data.access_token;
      req.session.expiration = parseInt(tokenRes.data.expires_in);
      req.session.save(err => {
        console.log(err);
      })
      res.json(req.session);
    }).catch(tokenRes => {
      res.status(400).json(tokenRes.response.data);
    });
  },
  (req, res) => {
    res.redirect(`/err/${req.body}`)
  }
)

app.get("/getBasic",
  (req, res) => {
    axios.default.get(
      "https://developer-api.nest.com/",
      { headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${req.session.token}`
      }}
    ).then(response => {
      res.send(response.data);
    }).catch(error => {
      // console.log(error);
      // res.send(error);
    })
  }
)

app.listen(port);

module.exports = app;
