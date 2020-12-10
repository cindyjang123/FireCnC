const express = require('express');
const app = express();
const path = require('path'); //path
const exphbs = require('express-handlebars'); //express-handlebars
const bodyParser = require('body-parser'); //express body-parser for text only
const multer = require('multer'); //express multer for text and images
const clientSessions = require('client-sessions'); //client-sessions
const mongoose = require('mongoose');
const Users = require('./models/Users'); //import mongoUsers
const Rooms = require('./models/roomData'); //import mongoUsers
const fs = require('fs');

const HTTP_PORT = process.env.PORT || 8080;
// const express = require('express');
// const exphbs = require('express-handlebars');
// const app = express();
// var path = require('path');
// var multer = require('multer');
var nodemailer = require('nodemailer');

// const bodyParser = require('body-parser');
// const clientSessions = require('client-sessions');
// const mongoose = require('mongoose');
// const Users = require('./models/Users'); //import mongoUsers
// const { db } = require('./models/Users');

function onHttpStart() {
  console.log(`Express http server listening on ${HTTP_PORT}`);
}

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

// app.get('/', function (req, res) {
//   res.render('index', { layout: false });
// });

// app.get('/room', function (req, res) {
//   res.render('room', { layout: false });
// });

app.get('/book', function (req, res) {
  res.render('booknow', { layout: false });
});

app.get('/confirm', function (req, res) {
  res.render('confirmation', { layout: false });
});

app.get('/register', function (req, res) {
  res.render('register', { layout: false });
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
app.get('/', function (req, res) {
  res.render('index', {
    user: req.session.theUser,
    layout: false,
  });
});
//POST (/)
app.post('/', async function (req, res) {
  res.render('room_listing_page', {
    user: req.session.theUser,
    data: await Rooms.find({ location: req.body.location }).lean(),
    layout: false, // do not use the default Layout (main.hbs)
  });
});
//---------------------------------------------- home -------------------------------------------------------

//---------------------------------------------- roomlisting -------------------------------------------------------
//setup a route on roomlisting
app.get('/room', function (req, res) {
  Rooms.find({})
    .lean()
    .exec((err, rooms) => {
      if (!rooms) {
        return res.render('room', {
          user: req.session.theUser,
          error: 'There are no room listings at the moment',
          layout: false, // do not use the default Layout (main.hbs)
        });
      }
      if (err) {
        return res.render('room', {
          user: req.session.theUser,
          error: err,
          layout: false, // do not use the default Layout (main.hbs)
        });
      }

      res.render('room', {
        user: req.session.theUser,
        data: rooms,
        layout: false, // do not use the default Layout (main.hbs)
      });
    });
});

app.post('/', async function (req, res) {
  res.render('room', {
    user: req.session.theUser,
    data: await Rooms.find({ location: req.body.location }).lean(),
    layout: false,
  });
});

//---------------------------- UPLOAD ROOM IMAGES ---------//
const storage = multer.diskStorage({
  destination: './public/roomImages',
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

//populate the roomphoto with images (pushes each file path included to photoArr and return it)
function getArrayOfImg(req) {
  let photoArr = [];
  for (let i = 0; i < req.files.length; i++) {
    photoArr.push(req.files[i].filename);
  }
  return photoArr;
}
app.put('/roomDescription/:_id', ensureLogin, async function (req, res) {
  //registration
  res.send('get user with Id: ' + req.params._id);
});

//--------------------------- DASHBOARD ----------------//
//GET dashboard
app.get('/dashboard', ensureLogin, async function (req, res) {
  //registration
  //res.sendFile(path.join(__dirname,"/views/registration_page.hbs"));
  res.render('dashboard', {
    user: req.session.theUser,
    room: await Rooms.find().lean(),
    layout: false, // do not use the default Layout (main.hbs)
  });
});

//POST dashboard
app.post('/dashboard', ensureLogin, upload.array('photos'), async function (
  req,
  res
) {
  const v_roomtitle = req.body.title;
  const v_price = req.body.price;
  const v_description = req.body.desc;
  const v_location = req.body.location;
  const v_photos = req.body.photos;

  if (v_roomtitle === '' || v_price < 0 || v_location === '') {
    return res.render('dashboard', {
      error: 'Please provide information (Room name and location)',
      user: req.session.theUser,
      room: await Rooms.find({}).lean(),
      layout: false, // do not use the default Layout (main.hbs)
    });
  }

  if (req.files.length > 10) {
    return res.render('dashboard', {
      error: 'Only 10 files are allowed',
      user: req.session.theUser,
      room: await Rooms.find({}).lean(),
      layout: false, // do not use the default Layout (main.hbs)
    });
  }

  var createRoom = new Rooms({
    roomtitle: v_roomtitle,
    price: v_price,
    description: v_description,
    location: v_location,
    roomphoto: getArrayOfImg(req), //array of strings(room photo links)
    ownername:
      req.session.theUser.firstname + ' ' + req.session.theUser.lastname,
    owneremail: req.session.theUser.email,
  });

  createRoom.save((err) => {
    if (err) {
      console.log('There was an error saving room');
      //if error saving room
      res.render('register', {
        error: err,
        user: req.session.theUser,
        layout: false, // do not use the default Layout (main.hbs)
      });
    } else {
      console.log('The room was successfully saved to rooms collection');
      res.redirect('/dashboard');
    }
  });
});

app.post(
  '/dashboardUpdate',
  ensureLogin,
  upload.array('photos'),
  async function (req, res) {
    const v_roomID = req.body.roomID;

    const v_roomtitle = req.body.title;
    const v_price = req.body.price;
    const v_description = req.body.desc;
    const v_location = req.body.location;
    const v_photos = req.body.photos;
    const v_ownName =
      req.session.theUser.firstname + ' ' + req.session.theUser.lastname;
    const v_ownEmail = req.session.theUser.email;

    Rooms.findByIdAndUpdate(
      v_roomID,
      {
        $set: {
          roomtitle: v_roomtitle,
          price: v_price,
          description: v_description,
          location: v_location,
          roomphoto: getArrayOfImg(req),
          ownername: v_ownName,
          owneremail: v_ownEmail,
        },
      },
      function (err, updRoom) {
        if (err) {
          console.log(err);
        } else {
          console.log('update successful:' + updRoom);
          //loop through array of images and remove the previous images before updating with new one
          for (let i = 0; i < updRoom.roomphoto.length; i++) {
            fs.unlinkSync(
              __dirname + '/public/roomImages/' + updRoom.roomphoto[i]
            );
          }
          res.redirect('/dashboard');
        }
      }
    );
  }
);

app.post('/dashboardDelete', ensureLogin, async function (req, res) {
  const v_roomID = req.body.roomID;
  Rooms.findOneAndDelete(v_roomID, function (err, updRoom) {
    if (err) {
      console.log(err);
    } else {
      console.log('Successfully deleted:' + updRoom);
      //loop through array of images and remove the previous images before updating with new one
      for (let i = 0; i < updRoom.roomphoto.length; i++) {
        fs.unlinkSync(__dirname + '/public/roomImages/' + updRoom.roomphoto[i]);
      }
      res.redirect('/dashboard');
    }
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
app.get('/logout', function (req, res) {
  req.session.reset();
  res.redirect('/login');
});
//---------------------------------------------- Logout -------------------------------------------------------

app.listen(HTTP_PORT, onHttpStart);
