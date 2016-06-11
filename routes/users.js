var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify');
var Courses = require('../models/courses');
var Utils = require('../utils/utils');

/* GET users listing.
*** Use alternative secure access to real collections until I get security certificate
*** Demo User Collection access only during Trial Mode.
*/
//router.get('/', Verify.verifyUser, Verify.verifyAdmin, function(req, res, next) {
router.get('/', function(req, res, next) {
  // Find all users using the User schema
  User.find({}, function (err, users) {
      if (err) next(err);
      res.json(users);
  });
});

// FOR DEMO ONLY - ANONYMOUS USAGE UNTIL I GET SECURITY CERTIFICATE
router.get('/username', function(req, res, next) {
  User.findOne({username : req.params.username}, function (err, user) {
      if (err) next(err);
      res.json(user);
  });
});

// Updates the users progress (Username is Anonymous in Trial Mode)
router.put('/progress', Verify.verifyUser, function(req, res, next) {
  User.update({username : req.body.username, 'courses._id' : req.body.courseId},
    { $set: { "courses.$.prog" : req.body.prog }, }, {upsert: true}, function(err, response) {
      if (err) next(err);
      else res.json(response);
    });
});

/*
 *** DEMO ONLY IN TRIAL MODE
 *** DUAL REGISTER + ENROL IN COURSE - reduce latency
 */
router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }),
      req.body.password, function(err, user) {
        // Get course id - if any
        var pId = req.body.pendingId;
        if (err) {
            return res.status(500).json({err: err});
        }
        if(req.body.firstname) {
            user.firstname = req.body.firstname;
        }
        if(req.body.lastname) {
            user.lastname = req.body.lastname;
        }
        if (pId) {
          user.courses = [{_id:pId, prog:{track:0}}];
        }
        user.save(function(err,user1) {
          if (err) {
            return res.status(500).json({err: err});
          }
            // Use Passport To Authenticate
            passport.authenticate('local', function(err, user2, info) {
              if (err) {
                return res.status(500).json({err: err});
              }
              if (!user2) {
                return res.status(401).json({
                  err: info
                });
              }
              /*
              ** req.login() called by middleware in passport.authenticate
              req.logIn(user, function(err) {
                if (err) {
                  return res.status(500).json({
                    err: 'Could not log in user'
                  });
                }
                }
                */
              // Issue token once authenticated
              Verify.getToken(user2, function(token) {
                var id;
                // Find course that user requested to enroll in
                if (pId) Courses.findOne({_id: pId}, {content : false}, function(err, course) {
                  id = pId;
                  if (err) return res.status(500).json({err: err});
                  return res.json({
                      token: token,
                      user : user2,
                      courses : [course]
                  });
                }); else
                  return res.json({
                      token: token,
                      user : user2
                  });
              });
            })(req,res);
          });
    });
});

/*
 *** DEMO ONLY IN TRIAL MODE
 *** DUAL LOGIN + ENROL IN COURSE - reduce latency
 */
router.post('/login', function(req, res, next) {
  var pId = req.body.pendingId;
  var chx = false;
  function find(el) {
    return el._id == pId;
  }
  // CUSTOM POPULATE FUNCTION
  // Syncs users progress with course info
  function addProg(courses, userCourses, courseIds) {
    return courses.map(function(course) {
      var newCourse;
      idx = Utils.findIndex(userCourses, function(c) {
         return (c._id.toString() === pId);
      });
      if (idx > -1) {
        newCourse = Object.assign(course, {prog : userCourses[idx].prog}) ;
      }
      return newCourse ? newCourse : course;
    });
  }
  // Helper fn to shape the response
  function reply(token, usr) {
    var courseIds = usr.courses.map(function(el) {return el._id;});
    Courses.find({_id : {$in : courseIds}}, {content : false},
      function(err, courses) {
      if (err) {
        return res.status(500).json({err: err});
      }
      res.status(200).json({
        token: token,
        courses: addProg(courses, usr.courses, courseIds),
        newCourse: pId
      });
    });
  }
  // Use passport to authenticate
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.status(500).json({err: err});
      //return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    // Issue token once authenticated
    Verify.getToken(user, function(token) {
      // If there's a new course, form an object to add to courses array
      if (pId) {
        var cs = {
          _id : pId,
          prog : {
            track : 0
          }
        };
        if (user.courses) {// user has a courses array set up
          // Check new course not already added then add it.
          if (user.courses.findIndex(find) == -1) {
            user.courses.push(cs);
            chx = true;
          }
        } else { // No courses array - set up a new one.
          user.courses = [{_id:pId, prog:{track:0}}];
          chx = true;
        }
        // Sync user object only if there's been a change -
        // (minimise network calls) then send response.
        if (chx) return user.save(function(err, user1) {
          if (err) return res.status(500).json({err: err});
          reply(token, user1);
        });
      }
      // THIS IS A NORMAL LOGIN - NO COURSE WAS ADDED - send response.
      reply(token, user);
      });
    })(req,res);
  });

router.get('/logout', function(req, res) {
    req.logout();
    res.status(200).json({
    status: 'Bye!'
    });
});

module.exports = router;
