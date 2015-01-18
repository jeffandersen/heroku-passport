var strategy = exports; exports.constructor = function strategy(){};

var util = require('util');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var InternalOAuthError = require('passport-oauth').InternalOAuthError;

var AUTHORIZATION_URL = 'https://id.heroku.com/oauth/authorize';
var TOKEN_URL = 'https://id.heroku.com/oauth/token';
var PROFILE_URL = 'https://api.heroku.com/account';

function Strategy(opts, verify) {
  opts = opts || {};

  opts.authorizationURL = opts.authorizationURL || AUTHORIZATION_URL;
  opts.tokenURL = opts.tokenURL || TOKEN_URL;
  opts.scopeSeparator = opts.scopeSeparator || '%20';

  OAuth2Strategy.call(this, opts, verify);
  this._oauth2.useAuthorizationHeaderforGET(true);
  this.name = 'heroku';
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, cb) {
  this._oauth2.get(PROFILE_URL, accessToken, function(err, body, res) {
    if (err) {
      return cb(new InternalOAuthError('failed to fetch user profile', err));
    }

    try {
      var json = JSON.parse(body);

      var profile = { provider: 'heroku' };
      profile.id = json.id;
      profile.name = json.name;
      profile.email = json.email;

      profile._raw = body;
      profile._json = json;

      cb(null, profile);
    } catch(e) {
      cb(e);
    }
  });
};

strategy.version = '0.0.1';

strategy.Strategy = Strategy;
