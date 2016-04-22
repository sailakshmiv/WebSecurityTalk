const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const md5 = require('blueimp-md5');
const jwt = require('jsonwebtoken');
const uuid = require('node-uuid');


const connection = mysql.createConnection({
  host: 'localhost',
  database: 'test'
});

const app = express();

app.use(express.static('public'));

app.use(bodyParser.json());

connection.connect();

// Create table first
//
// CREATE TABLE todos(
//   id INT NOT NULL AUTO_INCREMENT,
//   task TEXT,
//   done BOOL,
//   PRIMARY KEY ( id )
// )
//
// Then create user table
//
// CREATE TABLE users(
//   username VARCHAR(10) NOT NULL,
//   password VARCHAR(255),
//   salt     VARCHAR(255),
//   PRIMARY KEY (username)
// )
//
// and migrate todos table
//
// ALTER TABLE todos ADD COLUMN user VARCHAR(10); 
// ALTER TABLE FOREIGN KEY (user) REFERENCES users(username);

const secret = 'foobar';

app.post('/login', (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;
  connection.query('SELECT * FROM user WHERE username=?', username, (err, rows) => {
    if (err) {
      next(err);
    } else if (rows.length !== 1) {
      res.status(401).json({error: 'Invalid username'});
    } else {
      var user = rows[0];
      password = md5(password + user.salt);
      if (password != user.password) {
        res.status(401).json({error: 'Invalid username'});
        return;
      }
      var token = jwt.sign({username: username}, secret);
      res.json({token: token}); 
    }
  });
});

app.post('/signup', (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;
  var salt = uuid.v1();
  password = md5(password + salt);
  var user = {username: username, password: password, salt: salt};
  connection.query('INSERT INTO user SET ?', user, (err, rows) => {
    if (err) {
      next(err);
    } else {
      var token = jwt.sign({username: username}, secret);
      res.json({token: token}); 
    }
  });
});

app.use('/api', (req, res, next) => {
  var token = req.headers['x-auth-token'];
  var decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (e) {
    return next(e);
  }
  if (!decoded) {
    res.status(403).json({error: 'Invalid login'});
  } else {
    req.username = decoded.username;
    next();
  }
});

app.get('/api', (req, res, next) => {
  connection.query('SELECT * from todos WHERE user=?', req.username, (err, rows, fields) => {
    if (err) {
      return next(err);
    }
    res.json(rows.map((t) => {
      // Convert to boolean, since MySQL stores as int.
      t.done = !!t.done;
      return t;
    }));
  });
});

app.post('/api', (req, res, next) => {
  var todo = _.pick(req.body, 'task', 'done');
  todo.user = req.username;
  connection.query('INSERT INTO todos SET ?', todo, (err, result) => {
    if (err) {
      return next(err);
    }
    todo.id = result.insertId;
    res.json(todo);
  });
});

app.put('/api/:id', (req, res, next) => {
  var todo = _.pick(req.body, 'task', 'done');
  var id = req.params.id;
  var username = req.username;
  connection.query('UPDATE todos SET ? WHERE id=? AND user=?', [todo, id, username], (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(todo);
  });
});

app.delete('/api/:id', (req, res, next) => {
  var id = req.params.id;
  var username = req.username;
  connection.query('DELETE FROM todos WHERE id=? AND user=?', [id, username], (err, results) => {
    if (err) {
      return next(err);
    }
    res.json(results);
  });
});

app.use(function(err, req, res, next) {
  console.error(err != null ? err.stack : "Error!");
  res.status(500).json({error: err});
});

app.listen(3000);

