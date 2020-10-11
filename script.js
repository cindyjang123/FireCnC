const webpage = [
  { '/': './index.html' },
  { '/room': './room.html' },
  { '/detail': './detail.html' },
];
const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();

function onHttpStart() {
  console.log(`Express http server listening on ${HTTP_PORT}`);
}

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.get('/room', (req, res) => {
  res.sendFile(`${__dirname}/room.html`);
});

app.get('/book', (req, res) => {
  res.sendFile(`${__dirname}/booknow.html`);
});

app.get('/confirm', (req, res) => {
  res.sendFile(`${__dirname}/confirmation.html`);
});

app.listen(HTTP_PORT, onHttpStart);
