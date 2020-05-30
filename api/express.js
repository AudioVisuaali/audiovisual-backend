const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const errorHandler = require('./middleware/error');
const handleLiveTwitchViewers = require('./live/twitch');
const renderRoomWithMeta = require('./routes/room');

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).send('');
  }
  next();
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/current-time', (req, res) => {
  res.status(200).json({
    currentTime: new Date().getTime(),
  });
});
app.get('/room/:roomId', renderRoomWithMeta);

app.get('/api/live/twitch/:channel/viewers', handleLiveTwitchViewers);

app.use((req, res) =>
  res.status(404).json({
    error: {
      message: 'Invalid request address',
    },
  })
);

app.use(errorHandler);

module.exports = app;
