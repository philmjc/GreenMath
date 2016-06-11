'use strict';

angular.module('cap')
  // Using Controller 'as ctr' instead of $scope
  .controller('HelpController', ['userFactory', '$state', '$templateCache', '$http',
   function(uF, $state) {
    // Help - provide help if something goes wrong *** experimental***
    this.openHelp = function () {
      $state.go('app.help');
    };
    // Set up a non registered user to choose a course
    this.initCs = function() {
      $state.go('app.courses');
    };
    // Goto recovery mode if connection is lost
    this.recover = function() {
      $state.go("app.cor", {id: 'xxx'});
    };
    // Open Help page
    this.openHelp = function() {
      uF.setState($state.current);
      $state.go('app.help');
    };
    this.closeHelp = function () {
        if (uF.currState) {
          if (uF.currState.name === "app.cor") $state.go("app.cor", {id: uF.currState.id});
          else $state.go(uF.currState.name);
        }
        else $state.go('app');
    };
  }])

  // Once a user is created their progress is tracked in data arrays
  .controller('UserController', ['courseFactory', 'userFactory', '$state',
   function(cF, uF, $state) {
    this.user = uF.getUser();
    this.courses = this.user.courses;
    // message if user has no data yet
    this.progTxt = '';
    // return the data for user's progress chart.
    this.showProg = function(id, index) {
      var d3Data = uF.getChartData(undefined, index);
      if (d3Data) this.d3Data = d3Data;
      else this.progTxt = 'Sorry, no data is available right now.';
    };
    this.getName = function() {
      if (uF.getUser().username && uF.getUser().username.startsWith('frxz')) return null;
      else return uF.getUser().username;
    };
    // Get Help functionality
    this.openHelp = function() {
      uF.setState($state.current);
      window.scrollTo(0,0);
      $state.go('app.help');
    };
  }])

  .controller('CoursesController', ['courseFactory', 'userFactory', 'authFactory', '$state',
   function(cF, uF, aF, $state) {

    this.tab = 1;
    this.filtText = 0;
    this.showDetails = true;
    this.showCs = false;
    this.message = "Loading ...";
    // Used in asynchronous callbacks as alternative to fn.bind(this)
    var self = this;
    // get the courses (challenges)
    this.courses = cF.query(
      function(response) {
           self.courses = response;
           self.showCs = true;
       },
       function(response) {
           self.message = "Error: "+response.status + " " + response.statusText;
     });

     // For the tab list display
     this.select = function(setTab) {
        self.tab = setTab;

        if (setTab === 2) {
            self.filtText = 1;
        }
        else if (setTab === 3) {
            this.filtText = 2;
        }
        else if (setTab === 4) {
            self.filtText = 3;
        }
        else {
            self.filtText = 0;
        }
    };

    this.isSelected = function (checkTab) {
        return (self.tab === checkTab);
    };

    this.toggleDetails = function() {
        this.showDetails = !this.showDetails;
    };

    // Dual function enroll in a course + register/sign in
    // For demo only in Free Trial Mode
    this.enroll = function(course) {
      // Check if user already signed in
      if (!uF.getUser().isAuthenticated) {
        uF.updateUser({pendingCourse: course});
        aF.setState($state.current);
        window.scrollTo(0,0);
        $state.go('app.login');
      }
      else { // auto login + add course if user already authenticated
        uF.addCourse(course);
        aF.autoLogin(uF.getUser(), course);
        $state.go('app.user');
      }
    };

  }])

  .controller('CorController', ['$scope', '$stateParams', 'courseFactory',
   'userFactory', 'aiFactory', '$state', function($scope, $stateParams, cF, uF, aiF, $state) {
      var self = this;
      // Get current course id and cache it
      var cId = $stateParams.id;
      uF.setCurr(cId);
      this.errMsg = "Loading...";
      this.showCor = false;
      this.cor = [];

      // Set up user's progress data arrays
      this.user = uF.getUser();
      var progress = uF.getProgress();
      this.progress = progress ? progress : {track:0};
      var track = this.progress.track;
      this.track = track;
    /*
    *** Helper functions to create and set up data arrays
    */
    // used to convert an array of 'el's to an array of 'elems'
    function convertTo(elem) {
      return function(el) {
        return elem;
      };
    }
    // usd to map the qs array [contained in courseSchema] to an array of elems
    function convertToArrs(elem) {
      return function(el) {
        return el.qs.map(convertTo(elem));
      };
    }
    // usd to map the qs array [contained in courseSchema] to an empty array
    function convertToEmptyArrs(el) {
      var l = el.qs.length;
      return new Array(l);
    }
    // Array which links the submitted answer to feedback
    this.setFeedback = function(scorex,qTrack) {
      var l = scorex.length;
      this.rights[qTrack] = (scorex[l-1] ? scorex[l-1] : false);
    };

    // Convert an array of data to a readable string
    this.genS = function(array) {
      aiF.genS(array);
    };

    /*
     *** The challenges are downloaded in raw seed data format
     *** in an array - this.cors.content.
     *** This fn uses the AI factory to convert the raw data into usable arrays
     *** and human readable strings for the UI.
     */
    this.setUp = function(track1, repeat) {

      this.showCor = true;
      this.cor = this.cors.content[track1];
      // If it's just a template skip setup
      if (this.cor.qs[0].templ) {
        this.tries = [0];
        return;
      }
      // The # of questions to set up and display
      var ql = this.cor.qs.length;

      // Set up the core environment data for the module
      // The pattern is to Force Renewal or Retrieve From Cache
      if (repeat || this.progress.datas[track1].length === 0) {
        this.progress.datas[track1] = aiF.gen(this.cor);
        uF.updateProgress({datas : this.progress.datas});
      }
      aiF.setData(this.progress.datas[track1]);
      // set up answers
      this.progress.ans[track1] =
        ((repeat || this.progress.ans[track1].length === 0) ?
        new Array(ql) : this.progress.ans[track1]);
      // generate labels from the data ready to be inserted the page
      var genL = this.cor.envir.genL;
      this.progress.labs[track1] =
        (repeat || this.progress.labs[track1].length === 0) ?
        (genL ? genL.map(aiF.genS) : []) : this.progress.labs[track1];
      // generate questions from the data ready to be inserted in the page
      this.cor.qs.map((function(q, index) {
        if (q.genT)
          q.txts = q.genT.map(aiF.genS);
      }).bind(this)) ;

      // THIS SECTION KEEPS TRACK OF USER'S PROGRESS
      // Set up the user's scores data
      if (repeat || this.progress.scores[track1].length === 0)
        this.progress.scores[track1]
          .push(this.cor.qs.map(function(el) {
            return [];
          }));
      // Always take the latest pushed array
      var sl = this.progress.scores[track1].length - 1;
      this.scores = this.progress.scores[track1][sl];
      // Link scores to deliver user feedback
      this.scores.forEach((function(scorex, index) {
        this.setFeedback(scorex, index);
      }).bind(this)) ;
      // SET UP HINTS & CHEAT ANSWERS TO BE HIDDEN
      this.hints = this.cor.qs.map(function(q) {
        return false;
      });
      this.cheats = this.cor.qs.map(function(q) {
        return false;
      });
      if (repeat) this.progress.tries[track1] = this.cor.qs.map(convertTo(0));
      this.tries = this.progress.tries[track1];
    };
    // end setup fn.

    /**
    *** This section sets up the overall module at startup.
    *** These functions organise the complete set of data for all
    *** challenges - arrays of arrays.
    */

    // Helper fn to initiate data arrays from CONTENT downloaded from db if they
    // don't already exist.
    function initProgress(progress) {
      function initArray(array) {
        return array ? array : self.cors.content.map(function (el) {return [];});
      }
      progress.scores = initArray(progress.scores);
      progress.ans = initArray(progress.ans);
      progress.datas = initArray(progress.datas);
      progress.labs = initArray(progress.labs);
    }

     // INITIALISE THIS ENTIRE MODULE (FOR COMPLETE SET OF CHALLENGES) WHEN
     // STARTED.
    this.initModule = function() {
      this.showCor = true;
      // set up PROGRESS datas if they don't already exist
      initProgress(this.progress);
      this.progress.tries = (this.progress.tries ? this.progress.tries :
         this.cors.content.map(convertToArrs(0)));
      // Set up arrays which control feedback display
      this.rights = this.cors.content.map(function (el) {return [];});
      // Initialise the current challenge
      this.setUp(track);
    };

    // provide access to challenges from locally cached data if internet cuts out
    // *** FOR TRIAL MODE ONLY ***
    this.recover = function () {
      if (!this.user.courses || this.user.courses.length === 0) this.user.courses =
        [Object.assign(initCors[0], {_id : 'xxx'})];
      this.cors = initCors[0];
      this.initModule();
    };

    // *** Recovery Mode ***
    if (cId === 'xxx') this.recover();

    // *** Normal Mode
    // Get the challenges from db then initialise this module
    else this.cors = cF.get({id: $stateParams.id})
        .$promise.then(
          (function(response) {
            this.cors = response;
            this.initModule();
          }).bind(this),
          (function(response) {
            this.errMsg = "Error: "+response.status + " " + response.statusText;
          }).bind(this));

    // Toggle visibility of user feedback for Cheat Answers & Hints
    this.toggleCheat = function(index, cheats) {
      if (cheats) this.genCheat = cheats.map(aiF.genS);
      this.cheats[index] = !this.cheats[index];
    };

    this.toggleHint = function(index) {
      this.hints[index] = !this.hints[index];
    };
    this.forceHint = function(index) {
      this.hints[index] = true;
    };
    // Go to prev or next challenge
    this.shift = function(fwd) {
      window.scrollTo(0,0);
      if (track <= 0 && !fwd || track >= (this.cors.content.length - 1) && fwd) return;
      if (fwd) {
        track++;
        uF.updateTrack({track : track});
      }
      else track--;
      this.track = track;
      this.setUp(track, false);
    };
    // Go to specific challenge 'index'
    this.changeTrack = function(index) {
      window.scrollTo(0,0);
      uF.updateTrack({track : index});
      track = index;
      this.track = track;
      this.setUp(track, false);

    };
    // Repeat challenge
    this.repeat = function() {
      this.setUp(track, true);
      window.scrollTo(0,0);
    };
    /*
     *** HANDLES USER'S SUBMITTED ANSWER
     */ 
    this.answer = function(qTrack) {

      // PROCESS ANSWER USING AI
      if (!this.cor.qs[qTrack].genA) return;
      var l =  this.cor.qs[qTrack].genA.length;
      var generatedAnswer = aiF.genN(this.cor.qs[qTrack].genA[0]);
      var submittedAnswer = this.progress.ans[track][qTrack];
      if (submittedAnswer) submittedAnswer = submittedAnswer.trim();
      var parsedAnswer = parseInt(submittedAnswer, 10);
      var correct = generatedAnswer === parsedAnswer;
      this.scores[qTrack].push(correct);

      // LINK ANSWER TO DISPLAYED FEEDBACK
      if (l > 1 && correct && this.progress.tries[track][qTrack] === 0) {
        var labs = this.cor.qs[qTrack].genA[1].map(aiF.genS);
        labs.forEach((function(elem) {
          this.progress.labs[track].push(elem);
        }).bind(this));
      }

      // FINALLY UPDATE USER'S PROGRESS
      this.progress.tries[track][qTrack]++;
      this.setFeedback(this.scores[qTrack], qTrack);
      uF.updateProgress({
        scores : this.progress.scores,
        tries : this.progress.tries,
        ans : this.progress.ans,
        labs : this.progress.labs,
      }, cId, true);
    }; // END answer()

    // show users progress
    this.checkProg = function() {
      $state.go('app.user');
    };
    // Get Help functionality
    this.openHelp = function() {
      uF.setState({name : "app.cor", id : cId});
      $state.go('app.help');
    };

  }])

// Dual REGISTER and LOGIN functionality - same template for BOTH

/*** MOST OF THIS IS ONLY FOR DEMO OR FURURE REFERENCE
 *** WHILE THIS PROTOTYPE IS IN FREE TRIAL MODE
 */

  .controller('AuthController', ['userFactory', 'authFactory', '$state', 'ngDialog',
   function(uF, aF, $state, ngDialog) {
    var self = this;
    this.user = uF.getUser();
    this.msg = '';
    this.msg1 = '';
    this.freeMode = false;
    this.reqLog = false;
    this.regTxt = ' .';

    // toggle the member (already registered) flag
    this.claim = function() {
      this.user.newUser = !this.user.newUser;
    };
    // Skip registration and use Trial Mode
    this.skip = function() {
      // Store anonymous user for metrics purposes - valuable info for trial

      var d = Date.now();
      this.user.username = 'frxz' + d;
      this.user.password = 'frxz' + d;

      var course = uF.getUser().pendingCourse;
      if (course) uF.addCourse(course);
      // bypass normal registration
      if (uF.getUser().newUser) this.register(true);
      $state.go('app.user');
    };

    // Dual Login & Registration popup
    this.openLogin = function() {
      aF.setState($state.current);
      $state.go('app.login');
    };
    this.toggleLogin = function () {
        if (aF.currState) $state.go(aF.currState.name);

        else $state.go('app');
    };

    /*
     *** DUAL LOG IN & ENROL IN course
     *** Cuts down on wait time - only one network call
     */
    this.login = function() {
     if (this.user.isAuthenticated) {
      return $state.go('app.user');
     }
     this.msg = "Signing In... Won't be long.";
     // check for course if any
     var pc = this.user.pendingCourse;
     aF.login().save({
       username : this.user.username,
       password : this.user.password,
       pendingId : pc ? pc._id : undefined
     }).$promise.then(
          (function(response){
              // securely store token & pw
              aF.storeUserCredentials({
                token : response.token,
                password : self.user.password
              });
              // Update user
              uF.updateUser({
                isAuthenticated : true,
                newUser : false,
                username : this.user.username,
                //courses : response.courses, *** could result in duplicates ***
                newCourse: response.newCourse,
                curr : response.curr ? response.curr : response.newCourse,
                pendingCourse: undefined,
                // protect pw
                password : undefined
              });

              // Sync the users list of courses
              response.courses.forEach(function(course) {
                uF.addCourse(course);
              });
              $state.go('app.user');
          }).bind(this),
          (function(response) {
              // this.message = "Error: "+response.status + " " + response.statusText;
              // this.user.register = true;
              if (response.data && response.data.err)
                this.msg = "Unable To Sign In. " + response.data.err.message;
              this.msg1 = "Please Register Before Signing In.";
          }).bind(this));
    };

    this.register = function(skip) {
      if (!this.user.newUser) this.login();
      else {
        this.msg = "Registering... Won't be long.";
        // check for course if any
        var pc = this.user.pendingCourse;
        aF.register().save({
          username : this.user.username,
          password : this.user.password,
          pendingId : pc ? pc._id : undefined
        })
        .$promise.then(
            function(response){
                // securely store token and password
                aF.storeUserCredentials( {
                  token : response.token,
                  password : self.user.password
                });
                // update user
                uF.updateUser({
                  isAuthenticated: true,
                  newUser : false, // need to register = false
                  freeMode : skip,
                  courses : response.courses,
                  newCourse : response.newCourse,
                  curr : response.curr ? response.curr : response.newCourse,
                  pendingCourse: undefined,
                  username : self.user.username,
                  // protect password
                  password : undefined
                });

                // take user to user page
                var dest = (uF.getUser().dest ? uF.getUser().dest : 'app.user');
                if (!skip) $state.go(dest);
                $state.go('app.user');
            },
            // if registration failed notify user of error
            function(response) {
                //this.message = "Error: "+response.status + " " + response.statusText;
                if (response.data && response.data.err)
                  self.msg = "Unable To Register. " + response.data.err.message;
                self.msg1 = "If you've already registered, Please Sign In.";
            });
      }
    }; // end register()

    this.logout = function() {
      aF.logout();
    };

  }])

  .filter('level', function() {
    return function(l1,l2) {
      if (l2 === 0) return l1;
      return l1.filter(function(el){
        return el.cat === l2;
      });
    };
  })
;
