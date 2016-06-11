// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
// Used by Angular to display the challenge
var questionSchema = new Schema({
    // type of question
    qt: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    // Used to generate question text
    genQuestion: [],
    // Used to generate Hint text
    genHint: [],
    // Used to generate Answer
    genAnswer: []
  }
);

// create a schema
var courseSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    // level of challenges
    category: {
        type: Number,
        required: true
    },
    label: {
        type: String,
        default: ""
    },
    price: {
        type: String,
    },
    description: {
        type: String,
        required: true
    },
    // array containing the challenges
    content: [{
        // seed data for AI module = mixed array
        data: {
          type : [],
        },
        // An embedded array containing the questions
        qs : {
          type : [questionSchema]
        },
      }],

});

// the schema is useless so far
// we need to create a model using it
var Courses = mongoose.model('Course', courseSchema);

// make this available to our Node applications
module.exports = Courses;
