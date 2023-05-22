const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = mongoose.Schema({
    name: {
        type:String,
        maxlength:50
    },
    email: {
        type:String,
        trim: true,
        unique:1
    },
    password: {
        type: String,
        maxlength:50
    },
    lastname:{
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type:String
    },
    tokenExp: {
        type:Number
    }

})

userSchema.pre('save', function(next) {
    var user = this;
  
    if (!user.isModified('password')) {
      return next();
    }
  
    return bcrypt.genSalt(saltRounds)
      .then((salt) => {
        return bcrypt.hash(user.password, salt);
      })
      .then((hash) => {
        user.password = hash;
        return next();
      })
      .catch((err) => {
        return next(err);
      });
  });

const User = mongoose.model('User', userSchema)
module.exports= {User}

