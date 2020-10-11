const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();

function onHttpStart() {
  console.log(`Express http server listening on ${HTTP_PORT}`);
}

app.use(express.static(path.join(__dirname + '/views')));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/index.html'));
// });

// app.get('/room', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/room.html'));
// });

// app.get('/book', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/booknow.html'));
// });

// app.get('/confirm', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views/confirmation.html'));
// });

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

app.get('/room', (req, res) => {
  res.sendFile(`${__dirname}/views/room.html`);
});

app.get('/book', (req, res) => {
  res.sendFile(`${__dirname}/views/booknow.html`);
});

app.get('/confirm', (req, res) => {
  res.sendFile(`${__dirname}/views/confirmation.html`);
});

app.listen(HTTP_PORT, onHttpStart);
