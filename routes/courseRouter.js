var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');
var Courses = require('../models/courses');

var courseRouter = express.Router();
courseRouter.use(bodyParser.json());

courseRouter.route('/')
.get(function (req, res, next) {
    Courses.find({}, {content: false})
        .sort({cat:1})
        .populate('comments.postedBy')
        .exec(function (err, courses) {
        if (err) throw err;
        res.json(courses);
    });
});
/*
 *** Use alternative secure access until I get security certificate
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
*/
module.exports = courseRouter;
