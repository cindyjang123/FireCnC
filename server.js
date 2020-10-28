const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
var path = require('path');
var multer = require('multer');
var nodemailer = require('nodemailer');

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

function onHttpStart() {
  console.log(`Express http server listening on ${HTTP_PORT}`);
}

//HANDLEBAR
app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');

//STATIC FILES
app.use(express.static(path.join(__dirname, '/views')));
app.use(express.static(path.join(__dirname, '/public')));

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

app.get('/registered', function (req, res) {
  res.render('registered', { layout: false });
});

//SET UP ROUTE
app.post('/registration', UPLOAD.single('photo'), (req, res) => {
  const FORM_DATA = req.body;
  const FORM_FILE = req.file;

  //PROCESS EMAIL
  var mail = {
    from: 'web322.firecnc@gmail.com',
    to: FORM_DATA.email,
    subject: `Welcome to FireCnC, ${FORM_DATA.uname}`,
    html: `<p>Hello, ${FORM_DATA.fname} ${FORM_DATA.lname}!</p>
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

  //REDIRECT TO "REGISTERED" PAGE
  res.render('registered', { layout: false });
});

app.listen(HTTP_PORT, onHttpStart);
