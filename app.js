const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');


const connection = mysql.createConnection({
  host: 'localhost',
  database: 'test'
});

const app = express();

app.use(express.static('public'));

app.use(bodyParser.json());

connection.connect();

app.get('/api', (req, res, next) => {
  connection.query('SELECT * from todos', (err, rows, fields) => {
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
  connection.query('UPDATE todos SET ? WHERE id=?', [todo, id], (err, result) => {
    if (err) {
      return next(err);
    }
    res.json(todo);
  });
});

app.delete('/api/:id', (req, res, next) => {
  var id = req.params.id;
  connection.query('DELETE FROM todos WHERE id=?', id, (err, results) => {
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

