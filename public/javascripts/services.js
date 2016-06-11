'use strict';

angular.module('cap')
  .constant("baseURL","/")

  /*
   *** The AI module for dynamically creating interactive content
   *** from seed data downloaded from db
   */
  .factory('aiFactory', [function() {
    var aifac = {};
    var data;
    var track = 0;
    aifac.setData = function(array) {
      data = array;
    };
    // Returns a random integer between min (included) and max (included)
    aifac.getRnd = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    // GENERATES CORE ENVIRONMENT DATA FROM THE SEED
    aifac.gen = function(cor) {
      return cor.envir.facs.map(function(facx) {
          var yrs = aifac.getRnd(9,12);
          var rate = aifac.getRnd(1,9);
          return facx.map(function(fac) {
            return [
              (yrs * rate * fac), // initial state
              (rate * fac)        // rate of change
            ];
          });
      });
    };
    /**
      *** Functions cannot be stored in the db so they have to be parsd
      *** from data arrays.
      */
    // Parse in a function which takes and returns a Number result
    aifac.genN = function(z) {
      if (Array.isArray(z)) {
        switch (z[0]) {
          case '+' : return aifac.genN(z[1]) + aifac.genN(z[2]);
          case '-' : return aifac.genN(z[1]) - aifac.genN(z[2]);
          case '*' : return aifac.genN(z[1]) * aifac.genN(z[2]);
          case '/' : return aifac.genN(z[1]) / aifac.genN(z[2]);
          default  : return data[z[0]][z[1]][z[2]];
        }
      } else return z;
    };
    // parse in a function which takes and returns a String result
    aifac.genS = function(z) {
      var s = "";
      var i;
      for (i = 0; i < z.length; i++) {
        if (Array.isArray(z[i])) s += aifac.genN(z[i]);
        else s += z[i];
      }
      return s;
    };
    return aifac;
  }])

  .factory('courseFactory',['$resource', 'baseURL', function($resource,baseURL) {
     return $resource(baseURL + "courses/:id", null,  {'update':{method:'PUT' }});
  }])

  .factory('userFactory', ['$resource', 'baseURL', '$localStorage',
   function($resource, baseURL, $localStorage) {
    var userfac = {};
    var USER_KEY = 'user';
    // Retrieve user from local storage (or create new one) then set user up for TRIAL MODE.
    var user = $localStorage.getObject(USER_KEY, '{}');

    // Helper function - finds index of an existing courseId to
    // prevent duplicate course additiions
    userfac.getCsIndex = function(array, cId) {
      var index = -1;
      for (var i = 0; i < array.length; i++) {
        if (array[i]._id === cId) index = i;
      }
      return index;
    };
    // Helper to update user object
    userfac.updateUser = function(obj) {
      user = Object.assign(user, obj);
      $localStorage.updateObject(USER_KEY, obj);
    };
    userfac.getUser = function() {
      return user;
    };
    // helper fn which sets the user's current course id and caches it's index
    // (in [courses]) for quick access
    userfac.setCurr = function(currId, currIndex) {
      if (currIndex) userfac.updateUser({curr:currId,currIndex:currIndex});
      else if (user.courses) {
        var ids = user.courses.map(function(el) {return el._id;});
        var index = ids.indexOf(currId);
        if (index >= 0) userfac.updateUser({curr:currId,currIndex:index});
        else userfac.updateUser({curr:currId});
      }
      else userfac.updateUser({curr:currId});
    };
    // Add course to user.
    userfac.addCourse = function(course) {
      if (!course) return;
      if (!user.courses) user.courses = [];
      // Check it's not already added
      if (user.courses.findIndex(function(c) {
        return c._id === course._id;
      }) === -1) {
        user.courses.push(course);
        userfac.setCurr(course._id, user.courses.length - 1);
        $localStorage.updateObject(USER_KEY, user.courses);
      }
    };

    /*
     *** Users progress for each course is a subdocument of that course
     *** This helper function does all the access navigation
     */
    userfac.getProgress = function(id) {
      if (!user.courses) return false;
      if (!id && user.currIndex) {
        if (!user.courses[user.currIndex].prog) user.courses[user.currIndex].prog = {track:0};
        return user.courses[user.currIndex].prog;
      }
      var ids = user.courses.map(function(el) {return el._id;});
      var i = id ? id : user.curr;
      var index = ids.indexOf(i);
      if (index < 0) return false;
      userfac.updateUser({currIndex:index});
      if (!user.courses[index].prog) user.courses[index].prog = {track:0};
      return user.courses[index].prog;
    };
    // Helper to update progress.
    userfac.updateProgress = function(obj, courseId, sendData) {
      var pro = courseId ? userfac.getProgress(courseId) : userfac.getProgress();
      Object.assign(pro, obj);
      $localStorage.storeObject(USER_KEY, user);
      // Send anonymous usage data
      if (sendData) {
        var un;
        if (courseId === 'xxx'|| !user.username) un = 'xxx';
        userfac.upDateProgDb().update({
          username : un ? un : user.username,
          courseId : courseId,
          prog : {
            track : pro.track,
            scores : pro.scores
          }
        }).$promise.then(
             (function(response){
                 // console.log(response);
             }).bind(this),
             (function(response) {
                // console.log(response);
             }).bind(this));
      }
    };
    // Track the challenge index
    userfac.updateTrack = function(obj) {
      var prog = userfac.getProgress();
      if (obj.track && obj.track > prog.track) {
          prog.track = obj.track;
          $localStorage.storeObject(USER_KEY, user);
      }
    };
    // Helper fn to get data to show bar chart for users progress
    userfac.getChartData = function(courseId, index) {
      var scores;
      if (index) scores = user.courses[index].prog.scores;
      else scores = userfac.getProgress(courseId).scores;
      if (!scores) return undefined;
      var data = [];
      for (var i = 0 ; i < scores.length ; i++) {
        for (var j = 0 ; j < scores[i].length ; j++) {
          for (var k = 0 ; k < scores[i][j].length ; k++) {
            var l = scores[i][j][k].length;
            if (l > 0)
            data.push ({
              challenge : i + 1,
              repeat : j + 1,
              qu : k,
              attempts : l,
              score : scores[i][j][k][l-1]
            });
          }
        }
      }
      return data;
    };

    // Helper fn to keep track of users navigation
    userfac.setState = function(state) {
      userfac.currState = state;
    };

    // get user from db
    userfac.getUsers = function() {
      return $resource(baseURL + "users/:username", null, {'update':{method:'PUT' }});
    };

    // convenience API for updating progress (an embedded Array that needs custom code)
    userfac.upDateProgDb = function() {
      return $resource(baseURL + "users/progress/:_id", null, {'update':{method:'PUT' }});
    };

    // Initial setup of user
    if (user.username) userfac.updateUser({isAuthenticated : false}); // force auto login
    else userfac.updateUser({newUser : true});

    return userfac;
  }])
  // Set up local storage
  .factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        },
        updateObject : function(key, obj) {
          var stored = this.getObject(key, '{}');
          this.storeObject(key, Object.assign(stored, obj));
        }
    };
  }])

  /*
  *** DUAL login + register
  *** Most of this is for demo or future reference while in Free Trial Mode.
  */
  .factory('authFactory', ['$resource', 'baseURL', '$http', '$localStorage', 'userFactory',
    function($resource, baseURL, $http, $localStorage, uF) {

    var authFac = {};
    var SECURE_KEY = 'secure';
    // Make it available on scope
    authFac.SECURE_KEY = SECURE_KEY;

    // keep track of where user was before login
    authFac.setState = function(state) {
      this.currState = state;
    };

    authFac.register = function() {
      return $resource(baseURL + "users/register/:_id", null);
    };

    authFac.login = function() {
      return $resource(baseURL + "users/login/:_id", null);
    };
    //DUAL automatic login (+ enroll) (for quicker response)
    authFac.autoLogin = function(user, addCourse) {
      //retrieve password
      var secure = $localStorage.getObject(SECURE_KEY, '{}');
      if (!user.username || !secure.password) return;
      authFac.login().save({
        username : user.username,
        password : secure.password,
        // Check for course if any
        pendingId : addCourse ? addCourse._id : undefined
      }).$promise.then(
           (function(response){
               // Store token
               authFac.storeUserCredentials({
                 token : response.token,
               });
               // Sync the users list of courses
               response.courses.forEach(function(course) {
                 uF.addCourse(course);
               });
           }).bind(this),
           (function(response) {

           }).bind(this));
     };

    function loadUserCredentials() {
      var credentials = $localStorage.getObject(SECURE_KEY,'{}');
      if (credentials.username !== undefined) {
        useCredentials(credentials);
      }
    }

    authFac.storeUserCredentials = function(credentials) {
      $localStorage.updateObject(SECURE_KEY, credentials);
      useCredentials(credentials);
    };

    function useCredentials(credentials) {
      uF.updateUser({isAuthenticated : true});
      // Set the token as header for your requests!
      $http.defaults.headers.common['x-access-token'] = credentials.token;
    }

    authFac.destroyUserCredentials = function() {
      uF.updateUser({isAuthenticated : false});
      $http.defaults.headers.common['x-access-token'] = undefined;
      $localStorage.updateObject(SECURE_KEY, {token: undefined});
    };
    authFac.logout = function() {
        $resource(baseURL + "users/logout").get(function(response){
        });
        this.destroyUserCredentials();
    };

    // Auto login user
    authFac.autoLogin(uF.getUser());

    return authFac;
  }])
;
