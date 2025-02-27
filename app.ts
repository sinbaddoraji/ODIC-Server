import express from 'express';
let createError = require('http-errors');
let path = require('path');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/realm-authorization');
let realmsRouter = require('./routes/realms');

import Database from "./database/database";


const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/realms', usersRouter);
app.use('/realms', realmsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(port, () => {
  return console.log(`Server is listening at http://localhost:${port}`);
});