var express = require('express');
var app = express();
var mysql      = require('mysql');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'docstore'
});

connection.connect();

app.set('views', __dirname + '/app');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(session({
  secret: 'keyboard cat'
}));


app.get('/allDocs', function (req, res) {

	connection.query('SELECT * FROM  documents inner join languages ON documents.language_id = languages.language_id inner join genre ON documents.genre_id = genre.genre_id', function(err, rows, fields) {
		if (err) {
			res.status(500).json(err);
			console.log("Error getting documents");
			console.log(err);
		} else {
			res.json(rows);
		}
	});

});

app.get('/details', function (req, res) {

	connection.query('SELECT * FROM documents  inner join languages ON documents.language_id = languages.language_id inner join genre ON documents.genre_id = genre.genre_id WHERE Doc_id=' + req.query.id, function(err, rows, fields) {
		if (err) {
			res.status(500).json(err);
			console.log("Error getting documents");
			console.log(err);
		} else {
			res.json(rows);
		}
	});

});

app.get('/feedbacks', function (req, res) {

	connection.query('SELECT * FROM feedbacks WHERE doc_id=' + req.query.id, function(err, rows, fields) {
		if (err) {
			res.status(500).json(err);
			console.log("Error getting documents");
			console.log(err);
		} else {

			var rating = 0;
			var i = 0;

			for(obj in rows){
				rating += Number(rows[obj].rate);	
				i++;
			} 

			rating = rating / i;
			rows[rows.length] = {rating: rating};
			res.json(rows);
		}
	});

});
app.post('/feedback', function (req, res) {

	connection.query('INSERT INTO feedbacks SET ? ', req.body, function(err, rows, fields) {
		if (err) {
			res.status(500).json(err);
			console.log("Error inserting transaction");
			console.log(err);
		} else {
			res.json(rows);
		}
	});

});



app.get('/user', function (req, res) {

	connection.query('SELECT * FROM members WHERE member_id = ' + req.query.id, function(err, rows, fields) {
		if (err) {
			res.status(500).json(err);
			console.log("Error getting user");
			console.log(err);
		} else {
			res.json(rows);
		}
	});

});

app.get('/transactions', function (req, res) {

	connection.query('SELECT * FROM transaction inner join documents on transaction.doc_id = documents.Doc_id WHERE transaction.member_id = ' + req.query.id, function(err, rows, fields) {
		if (err) {
			res.status(500).json(err);
			console.log("Error getting transactions");
			console.log(err);
		} else {
			res.json(rows);
		}
	});

});
app.post('/transactions', function (req, res) {

	connection.query('INSERT INTO transaction SET ? ', req.body, function(err, rows, fields) {
		if (err) {
			res.status(500).json(err);
			console.log("Error inserting transaction");
			console.log(err);
		} else {
			res.json(rows);
		}
	});

});


app.post('/login', function (req, res) {
	var kveri = "SELECT * FROM members WHERE username = '" + (req.body.username || "") + "' AND password = '" + (req.body.password || "") + "'";
	connection.query(kveri, function(err, rows, fields) {
		if (err) {
			res.status(500);
			console.log("Error logging in");
			console.log(err);
		}
		if (rows.length > 0) {
			res.json(rows[0]);
			req.session.user = JSON.parse(JSON.stringify(rows[0]));
			req.session.save();
		}
		else if (rows)
			res.status(400).json(err);
	});
});

app.post('/register', function(req,res) {
	var kveri = "INSERT INTO members(username, password) VALUES('" + req.body.username + "','" + req.body.password + "')";
	connection.query(kveri, function(err, rows) {
		if (err) {
			console.log("Error registering");
			console.log(err);
			res.status(500).json(err);
		}
		else
			res.json(rows);
	});
});

app.post('/addDoc', function(req,res) {
	var kveri = "INSERT INTO documents(Title, Edition, Short_Version, Full_Version, Author, Language_id, Genre_id, Description) VALUES('" + 
		req.body.title + "','" + 
		req.body.edition + "', '" +
		req.body.short_version + "', '" + 
		req.body.full_version + "', '" +
		req.body.author + "', " +
		req.body.language_id + ", " +
		req.body.genre_id + ", '"+
		req.body.description + "')";
	connection.query(kveri, function(err, rows) {
		if (err) {
			console.log("Error inserting document");
			console.log(hepek);
			console.log(err);
			res.status(500).json(err);
		}
		else
			res.json(rows);
	});
});
app.post('/editDoc', function(req,res) {
	var kveri = "UPDATE documents SET " + 
		"Title = '" + req.body.title + "'," + 
		"Edition = '" + req.body.edition + "'," + 
		"Short_Version = '" + req.body.short_version + "'," + 
		"Full_Version = '" + req.body.full_version + "', " +
		"Author = '" + req.body.author + "'," +
		"Description = '" + req.body.description + "'," +
		"genre_id = " + req.body.genre_id + "," +
		"language_id = " + req.body.language_id + " WHERE Doc_id = " + req.body.id;
	connection.query(kveri, function(err, rows) {
		if (err) {
			console.log("Error editing document");
			console.log(err);
			res.status(500).json(err);
		}
		else
			res.json(rows);
	});
});
app.delete('/delDoc', function(req, res) {
	var kveri = "DELETE FROM documents where Doc_id = " + (req.query.id || -1);
	connection.query(kveri, function(err, rows) {
		if (err) {
			console.log("Error deleting document");
			console.log(err);
			res.status(500).json(err);
		}
		else
			res.json(true);
	});
});


app.get('/genre', function(req, res) {
	var kveri = "SELECT * FROM genre";
	connection.query(kveri, function(err, rows) {
		if (err) {
			console.log("Error fetching genres");
			console.log(err);
			res.status(500).json(err);
		}
		else
			res.json(rows);
	});
});
app.get('/languages', function(req, res) {
	var kveri = "SELECT * FROM languages";
	connection.query(kveri, function(err, rows) {
		if (err) {
			console.log("Error fetching languages");
			console.log(err);
			res.status(500).json(err);
		}
		else
			res.json(rows);
	});
});

app.get('/me', function(req, res) {
	res.json(req.session.user);
});

app.delete('/me', function(req, res) {
	delete req.session.user;
	res.json(true);
});

var server = app.listen(3001, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});

app.use(express.static('app'));