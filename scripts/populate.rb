#! /usr/bin/env ruby

password = ARGV[0]
num_people = 30

if not password
  puts 'You forgot a password'
  exit 1
end

for i in (1..num_people) do
  database = "test#{i}"

  create_statement = "CREATE TABLE todos(id INT NOT NULL AUTO_INCREMENT,task TEXT,done BOOL,PRIMARY KEY ( id ))"

  puts 'creating db', database

  `mysql -uroot -p#{password} -e 'create database #{database};'`
  `mysql -uroot -p#{password} #{database} -e '#{create_statement}'`
end

  

