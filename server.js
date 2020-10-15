const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();

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

app.use(express.static(`${__dirname}/views`));

// app.get('/', (req, res) => {
//   res.sendFile(`${__dirname}/views/index.html`);
// });

// app.get('/room', (req, res) => {
//   res.sendFile(`${__dirname}/views/room.html`);
// });

// app.get('/book', (req, res) => {
//   res.sendFile(`${__dirname}/views/booknow.html`);
// });

// app.get('/confirm', (req, res) => {
//   res.sendFile(`${__dirname}/views/confirmation.html`);
// });

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/room', function (req, res) {
  res.sendFile(path.join(__dirname, '/views/room.html'));
});

app.get('/book', function (req, res) {
  res.sendFile(path.join(__dirname, '/views/booknow.html'));
});

app.get('/confirm', function (req, res) {
  res.sendFile(path.join(__dirname, '/views/confirmation.html'));
});

app.post('/contact-form-process', UPLOAD.single('photo'), (req, res) => {
  const FORM_DATA = req.body;
  const FORM_FILE = req.file;

  const DATA_RECEIVED =
    'Your submission was received: <br/><br/>' +
    'Your form data was:<br/>' +
    JSON.stringify(FORM_DATA) +
    '<br/><br/>' +
    'Your file data was:<br/>' +
    JSON.stringify(FORM_FILE) +
    '<br/><p>This was the image just uploaded:<br/>' +
    "<img src='/photos/" +
    FORM_FILE.filename +
    "'/>" +
    '<br/><br/>Welcome <strong>' +
    FORM_DATA.fname +
    ' ' +
    FORM_DATA.lname +
    '</strong>' +
    ' to the world of form processing.';

  var mailOptions = {
    from: 'Web322Clint@gmail.com',
    to: FORM_DATA.email,
    subject: 'Test email from NODE.js using nodemailer',
    html:
      '<p>Hello ' +
      FORM_DATA.fname +
      ':</p><p>Thank-you for contacting us.</p>',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('ERROR: ' + error);
    } else {
      console.log('SUCCESS: ' + info.response);
    }
  });

  res.send(DATA_RECEIVED);
});

app.listen(HTTP_PORT, onHttpStart);
