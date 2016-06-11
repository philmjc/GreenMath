var User = require('../models/user');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config.js');

exports.getToken = function (user, cb) {
     return jwt.sign(user, config.secretKey, {expiresIn: 3600}, cb);
};

exports.verifyUser = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.query.token || req.headers['x-access-token'];
    var err;
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                err = new Error('You are not signed in!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token return an error
        err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyAdmin = function(req, res, next) {
  // Check that token has been verified and user is ADMIN.
  if (req.decoded && req.decoded._doc.admin) next();
  else {
      // if not an admin return an error with a message that can be shown to user.
      var err = new Error("You are not authorized to perform this operation!");
      err.status = 403;
      return next(err);
  }
} ;
