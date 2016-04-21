mysql      = require 'mysql'
express    = require 'express'
bodyParser = require 'body-parser'
_ = require 'underscore'

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

app.get '/api', (req, res) ->
  connection.query 'SELECT * from todos', (err, rows, fields) ->
    throw err if err
    res.json rows

app.post '/api', (req, res) ->
  todo = _.pick req.body, 'task', 'done'
  connection.query 'INSERT INTO todos SET ?', todo, (err, result) ->
    throw err if err
    connection.query 'SELECT * from todos WHERE id=?', result.insertId, (err, rows, fields) ->
      throw err if err
      res.json rows[0]

app.put '/api/:id', (req, res) ->
  todo = _.pick req.body, 'task', 'done'
  id = req.params.id
  connection.query 'UPDATE todos SET ? WHERE id=?', [todo, id], (err, result) ->
    throw err if err
    connection.query 'SELECT * from todos WHERE id=?', id, (err, rows, fields) ->
      throw err if err
      res.json rows[0]
    
app.delete '/api/:id', (req, res) ->
  connection.query 'DELETE FROM todos WHERE id=?', req.params.id, (err, results) ->
    throw err if err
    res.json results


app.use (err, req, res, next) ->
  console.error err?.stack
  res.status(500).json err

app.listen 3000

