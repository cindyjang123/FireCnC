const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const exphbs = require('express-handlebars');

const app = express();

var path = require('path');
var multer = require('multer');
var nodemailer = require('nodemailer');

const STORAGE = multer.diskStorage({
  destination: './public/photos/',
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const UPLOAD = multer({ storage: STORAGE });

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '', //your email account
    pass: '', // your password
  },
});

function onHttpStart() {
  console.log(`Express http server listening on ${HTTP_PORT}`);
}

app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(express.static(path.join(__dirname, '/views')));

app.get('/', function (req, res) {
  // res.sendFile(path.join(__dirname, '/views/index.html'));
  res.render('index', { layout: false });
});

app.get('/room', function (req, res) {
  // res.sendFile(path.join(__dirname, '/views/room.html'));
  res.render('room', { layout: false });
});

app.get('/book', function (req, res) {
  // res.sendFile(path.join(__dirname, '/views/booknow.html'));
  res.render('booknow', { layout: false });
});

app.get('/confirm', function (req, res) {
  // res.sendFile(path.join(__dirname, '/views/confirmation.html'));
  res.render('confirmation', { layout: false });
});

// app.post('/contact-form-process', UPLOAD.single('photo'), (req, res) => {
//   const FORM_DATA = req.body;
//   const FORM_FILE = req.file;

//   const DATA_RECEIVED =
//     'Your submission was received: <br/><br/>' +
//     'Your form data was:<br/>' +
//     JSON.stringify(FORM_DATA) +
//     '<br/><br/>' +
//     'Your file data was:<br/>' +
//     JSON.stringify(FORM_FILE) +
//     '<br/><p>This was the image just uploaded:<br/>' +
//     "<img src='/photos/" +
//     FORM_FILE.filename +
//     "'/>" +
//     '<br/><br/>Welcome <strong>' +
//     FORM_DATA.fname +
//     ' ' +
//     FORM_DATA.lname +
//     '</strong>' +
//     ' to the world of form processing.';

//   var mailOptions = {
//     from: 'Web322Clint@gmail.com',
//     to: FORM_DATA.email,
//     subject: 'Test email from NODE.js using nodemailer',
//     html:
//       '<p>Hello ' +
//       FORM_DATA.fname +
//       ':</p><p>Thank-you for contacting us.</p>',
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log('ERROR: ' + error);
//     } else {
//       console.log('SUCCESS: ' + info.response);
//     }
//   });

//   res.send(DATA_RECEIVED);
// });

app.listen(HTTP_PORT, onHttpStart);
