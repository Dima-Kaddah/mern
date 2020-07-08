const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

//middleware to handle request for images// return requset file//
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

//middleware to allow connect between 3000,5000 servers// its open to any domain//set more headers//for CORS cross origin resorse shearing error... that the requset must be from same sever .... this code bellow make the access
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next(); // to let complete journey to other middlewares :)
});

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@clustermbd-wjb8o.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  )

  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
