var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');
var Courses = require('../models/courses');

var courseRouter = express.Router();
courseRouter.use(bodyParser.json());

courseRouter.route('/')
.get(Verify.verifyUser, function (req, res, next) {
    Courses.find({}, {content: false})
        .sort({cat:1})
        .populate('comments.postedBy')
        .exec(function (err, courses) {
        if (err) throw err;
        res.json(courses);
    });
})

.post(Verify.verifyUser, Verify.verifyAdmin, function (req, res, next) {
    Courses.create(req.body, function (err, course) {
        if (err) throw err;
        res.json(course);
    });
})

.delete(Verify.verifyUser, Verify.verifyAdmin, function (req, res, next) {
    Courses.remove({}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

courseRouter.route('/:id')
.get(Verify.verifyUser, function (req, res, next) {
    Courses.findById(req.params.id)
        .populate('comments.postedBy')
        .exec(function (err, course) {
        if (err) next(err);
        else res.json(course);
    });
})

.put(Verify.verifyUser, Verify.verifyAdmin, function (req, res, next) {
    Courses.findByIdAndUpdate(req.params.courseId, {
        $set: req.body
    }, {
        new: true
    }, function (err, course) {
        if (err) throw err;
        res.json(course);
    });
})

.delete(Verify.verifyUser, Verify.verifyAdmin, function (req, res, next) {
        Courses.findByIdAndRemove(req.params.courseId, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

courseRouter.route('/:id/less')
.get(Verify.verifyUser, function (req, res, next) {
    Courses.findById(req.params.id)
        .populate('comments.postedBy')
        .exec(function (err, courses) {
        if (err) next(err);
        else res.json(courses);
    });
});

courseRouter.route('/:id/comments')
.all(Verify.verifyUser)

.get(function (req, res, next) {
    Courses.findById(req.params.id)
        .populate('comments.postedBy')
        .exec(function (err, course) {
        if (err) throw err;
        res.json(course.comments);
    });
})

.post(function (req, res, next) {
    Courses.findById(req.params.courseId, function (err, course) {
        if (err) throw err;
        req.body.postedBy = req.decoded._doc._id;
        course.comments.push(req.body);
        course.save(function (err, course) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(course);
        });
    });
})

.delete(Verify.verifyAdmin, function (req, res, next) {
    Courses.findById(req.params.courseId, function (err, course) {
        if (err) throw err;
        for (var i = (course.comments.length - 1); i >= 0; i--) {
            course.comments.id(course.comments[i]._id).remove();
        }
        course.save(function (err, result) {
            if (err) throw err;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all comments!');
        });
    });
});

courseRouter.route('/:courseId/comments/:commentId')
.all(Verify.verifyUser).get(function (req, res, next) {
    Courses.findById(req.params.courseId)
        .populate('comments.postedBy')
        .exec(function (err, course) {
        if (err) throw err;
        res.json(course.comments.id(req.params.commentId));
    });
})

.put(function (req, res, next) {
    // We delete the existing commment and insert the updated
    // comment as a new comment
    Courses.findById(req.params.courseId, function (err, course) {
        if (err) throw err;
        course.comments.id(req.params.commentId).remove();
                req.body.postedBy = req.decoded._doc._id;
        course.comments.push(req.body);
        course.save(function (err, course) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(course);
        });
    });
})

.delete(function (req, res, next) {
    Courses.findById(req.params.courseId, function (err, course) {
        if (course.comments.id(req.params.commentId).postedBy !=
            req.decoded._doc._id) {
            var error = new Error('You are not authorized to perform this operation!');
            error.status = 403;
            return next(error);
        }
        course.comments.id(req.params.commentId).remove();
        course.save(function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });
});

module.exports = courseRouter;
