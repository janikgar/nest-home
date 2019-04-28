// import * as express from "express";
import * as express from "express";
import * as passport from "passport";
import * as OAuth2Strategy from "passport-oauth2";
// const nest = require("../client-config.json");
import * as nest from "../client-config.json";

const app = express();
const port = 3000;

passport.use(
  new OAuth2Strategy({
    authorizationURL: nest.nest.auth_url,
    callbackURL: "/auth/callback",
    clientID: nest.nest.client_id,
    clientSecret: nest.nest.client_secret,
    tokenURL: nest.nest.token_url,
  },
    (accessToken, refreshToken, profile, cb) => {
      console.log(`accessToken: ${accessToken}
refreshToken: ${refreshToken}
profile: ${profile}
cb: ${cb}`);
    })
);

app.get("/", (_, res) => {
  res.send("Hello world");
});

app.get("/auth",
  passport.authenticate("oauth2"),
  (req, res) => {
    console.log(res);
  }
);

app.get("/auth/callback",
  passport.authenticate("oauth2", { failureRedirect: "/" }),
  (req, res) => {
    console.log(res);
  }
);

app.listen(port);

module.exports = app;
