mysql      = require 'mysql'
express    = require 'express'
bodyParser = require 'body-parser'
_          = require 'underscore'

connection = mysql.createConnection
  host     : 'localhost'
  database : 'test'

# Create table first
#
# CREATE TABLE todos(
#   id INT NOT NULL AUTO_INCREMENT,
#   task TEXT,
#   done BOOL,
#   PRIMARY KEY ( id )
# )
#
# Then create user table
#
# CREATE TABLE users(
#   username VARCHAR(10) NOT NULL,
#   password VARCHAR(255),
#   PRIMARY KEY (username)
# )
#
# and migrate todos table
#
# ALTER TABLE todos ADD COLUMN user VARCHAR(10); 
# ALTER TABLE FOREIGN KEY (user) REFERENCES users(username);

app = express()

app.use express.static 'public'
app.use bodyParser.json()

connection.connect()

app.get '/api', (req, res, next) ->
  connection.query 'SELECT * from todos', (err, rows, fields) ->
    next err if err
    res.json rows.map (t) ->
      t.done = !!t.done
      t

app.post '/api', (req, res, next) ->
  todo = _.pick req.body, 'task', 'done'
  connection.query 'INSERT INTO todos SET ?', todo, (err, result) ->
    return next err if err
    connection.query 'SELECT * from todos WHERE id=?', result.insertId, (err, rows, fields) ->
      return next err if err
      todo = rows[0]
      todo.done = !!todo.done
      res.json todo

app.put '/api/:id', (req, res, next) ->
  todo = _.pick req.body, 'task', 'done'
  id = req.params.id
  connection.query 'UPDATE todos SET ? WHERE id=?', [todo, id], (err, result) ->
    return next err if err
    connection.query 'SELECT * from todos WHERE id=?', id, (err, rows, fields) ->
      return next err if err
      todo = rows[0]
      todo.done = !!todo.done
      res.json todo
    
app.delete '/api/:id', (req, res, next) ->
  id = req.params.id
  connection.query 'DELETE FROM todos WHERE id=?', id, (err, results) ->
    return next err if err
    res.json results


app.use (err, req, res, next) ->
  console.error err?.stack
  res.status(500).json err

app.listen 3000

