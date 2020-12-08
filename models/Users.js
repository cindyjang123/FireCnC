var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); //bcryptjs
var Schema = mongoose.Schema;

mongoose.connect(
  'mongodb+srv://sjang15:IM.nana_90@cluster0.akrlj.mongodb.net/firecnc?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const db = mongoose.connection;
db.once('open', (_) => {
  console.log('Database successfully connected!');
});
db.on('error', (err) => {
  console.error('Error: database failed to connect', err);
});

var userSchema = new Schema({
  email: String,
  password: String,
  fname: String,
  lname: String,
  address: String,
  city: String,
  province: String,
  postalcode: String,
  admin: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre('save', function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

//password verification function
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('Users', userSchema);
