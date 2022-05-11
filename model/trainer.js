const mongoose = require("mongoose");
const trainingType = require("../model/trainingType");
const { ObjectId } = mongoose.Schema;

// trainer schema
const trainerUser = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    maxlength: 32,
  },
  businessName: {
    type: String,
    required: true,
    maxlength: 32,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  gender: {
    type: String,
    required: true,
  },

  trainingType1:{
    type:String,
    
  },
  trainingType2:{
    type:String
  },
  trainingType3:{
    type:String
  },
  trainingType4:{
    type:String
  },
  specialty: {
    type: String,
    required: false,
  },

  city: {
    type: String,
    required: false,
  },

  phone: {
    type: String,
    required: false,
  },
  english: {
    type: Number,
    default: 0,
    required: false,
  },

  spanish: {
    type: Number,
    default: 0,
    required: false,
  },

  arabic: {
    type: Number,
    default: 0,
    required: false,
  },

  russian: {
    type: Number,
    default: 0,
    required: false,
  },

  hebrew: {
    type: Number,
    default: 0,
    required: false,
  },
  about: {
    type: String,
    required: false,
  },
  schoolName: {
    type: String,
    required: false,
  },
  schoolDate: {
    type: String,
    required: false,
  },
  schoolInfo: {
    type: String,
    required: false,
  },
  trainingTypes:[
    {
      myid: String,
      name: String,
      duration: Number,
      price:Number,
    },
  ],
  trainings:[
    {
      trainingType:String,
      trainingDate: Date,
      available: Boolean,
    },]
});

module.exports = mongoose.model("Trainer", trainerUser);
