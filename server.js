const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
var path = require('path');
var multer = require('multer');
var nodemailer = require('nodemailer');

const bodyParser = require('body-parser');
const clientSessions = require('client-sessions');
// const room = require('./public/js/rooms.json'); //import rooms.json file
const mongoose = require('mongoose');
const Users = require('./models/Users'); //import mongoUsers
const { db } = require('./models/Users');

function onHttpStart() {
  console.log(`Express http server listening on ${HTTP_PORT}`);
}

//create storage properties
const STORAGE = multer.diskStorage({
  //saved on Hard Drive
  destination: './public/photos/',
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const UPLOAD = multer({ storage: STORAGE });

// EMAIL LOGIN SETUP
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'web322.firecnc@gmail.com',
    pass: '1qq2ww3ee4rr0',
  },
});

//--------------------------- HANDLE BAR -----------------------------//

app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');

//STATIC FILES
app.use(express.static(path.join(__dirname, '/views')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.render('index', { layout: false });
});

app.get('/room', function (req, res) {
  res.render('room', { layout: false });
});

app.get('/book', function (req, res) {
  res.render('booknow', { layout: false });
});

app.get('/confirm', function (req, res) {
  res.render('confirmation', { layout: false });
});

app.get('/register', function (req, res) {
  res.render('register', { layout: false });
});

app.get('/dashboard', function (req, res) {
  res.render('dashboard', { layout: false });
});

app.get('/login', function (req, res) {
  res.render('login', { layout: false });
});

//--------------------------- CLIENT SESSION -----------------------------//

app.use(
  clientSessions({
    cookieName: 'session',
    secret: 'assignment',
    duration: 0.5 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);
//--------------------------- ROOM -----------------------------//

app.get('/room', function (req, res) {
  Rooms.find({})
    .lean()
    .exec((err, rooms) => {
      if (!rooms) {
        return res.render('room', {
          user: req.session.theUser,
          error: 'No available listing',
          layout: false,
        });
      }
      if (err) {
        return res.render('room', {
          user: req.session.theUser,
          error: err,
          layout: false,
        });
      }

      res.render('room', {
        user: req.session.theUser,
        data: rooms,
        layout: false,
      });
    });
});

//--------------------------- REGISTRATION -----------------------------//
app.post('/register', (req, res) => {
  const m_data = req.body;

  var loginUser = new Users({
    email: m_data.email,
    password: m_data.password,
    fname: m_data.fname,
    lname: m_data.lname,
    address: m_data.address,
    city: m_data.city,
    province: m_data.province,
    postalcode: m_data.postalcode,
    admin: false,
  });

  loginUser.save((err) => {
    if (err) {
      console.log('There was an error saving the user');
      res.render('register', {
        layout: false,
      });
    } else {
      console.log('The user was successfully created');
      res.redirect('/login');
    }
  });

  //PROCESS EMAIL
  var mail = {
    from: 'web322.firecnc@gmail.com',
    to: m_data.email,
    subject: `Welcome to FireCnC, ${m_data.fname}`,
    html: `<p>Hello, ${m_data.fname} ${m_data.lname}!</p>
      <p>Welcome to FireCnC. Thank you for registering with us.</p>`,
  };

  //SEND EMAIL
  transporter.sendMail(mail, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('welcome email sent! ' + info.response);
    }
  });
});

//---------------------------------------------- login -------------------------------------------------------
app.get('/login', function (req, res) {
  res.render('login', {
    logInError: false,
    layout: false,
  });
});

app.post('/login', function (req, res) {
  const m_data = req.body;
  Users.findOne({ email: m_data.email }, (err, theUser) => {
    if (err) {
      console.log(err);
    }
    if (!theUser) {
      console.log('E-mail is not found');
      return res.render('login', {
        logInError: true,
        layout: false,
      });
    }

    //PASSWORD COMPARISON
    theUser.comparePassword(m_data.password, (err, match) => {
      if (err) {
        throw err;
      }

      if (match) {
        req.session.theUser = {
          email: theUser.email,
          password: theUser.password,
          fname: theUser.fname,
          lname: theUser.lname,
          address: theUser.address,
          city: theUser.city,
          province: theUser.province,
          postalcode: theUser.postalcode,
        };

        delete req.session.theUser.password;
        res.redirect('/dashboard');
      } else {
        console.log('username and password is incorrect');
        return res.render('login', {
          logInError: true,
          layout: false,
        });
      }
    });
  });
});

//---------------------------------------------- dashboard -------------------------------------------------------

function ensureLogin(req, res, next) {
  if (!req.session.theUser) {
    res.redirect('/login');
  } else {
    next();
  }
}

// GET dashboard
app.get('/dashboard', ensureLogin, function (req, res) {
  res.render('dashboard', {
    user: req.session.theUser,
    layout: false,
  });
});

//---------------------------------------------- Logout -------------------------------------------------------
// app.get('/logout', function (req, res) {
//   req.session.reset();
//   res.redirect('/login');
// });
//---------------------------------------------- Logout -------------------------------------------------------

app.listen(HTTP_PORT, onHttpStart);
