// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://slimane.agouram:03081990@ds053380.mongolab.com:53380/serveur_rd');
var MyUser = require('./models/user.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

//test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// // more routes for our API will happen here
// router.use(function(req,res,next){
// // do logging
// 	console.log('Something is happening.');
// 	next(); // make sure we go to the next routes and don't stop here
// });
// on routes that end in /users
// ----------------------------------------------------
router.route('/users')

	// create a user (accessed at POST http://localhost:8080/api/users)
	.post(function(req, res) {
			console.log("req.params: %j", req.params);
			console.log('req.body: %j', req.body);
		var myUser = new MyUser(); 		// create a new instance of the user model
		myUser.firstname = req.body.firstname;  // set the users name (comes from the request)
		myUser.lastname = req.body.lastname;
		myUser.email = req.body.email;
		// save the user and check for errors
		myUser.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'User created!' });
		});
		
	})

	.get(function(req, res) {
		console.log("req.params: %j", req.params);
			console.log('req.body: %j', req.body);
		MyUser.find(function(err, users) {
			if (err)
				res.send(err);

			res.json(users);
		});
	});

	//function to test if a string is an email, will be used for the get/put/ requests:
	function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} ;

	// on routes that end in /users/:user_id
// ----------------------------------------------------
router.route('/users/:user_id')
		
	// get the user with that id (accessed at GET http://localhost:8080/api/users/:user_id)
	.get(function(req, res) {
		console.log("req.params: %j", req.params);
		console.log('req.body: %j', req.body);
		console.log('test email: ' + validateEmail(req.params.user_id));
		if(!validateEmail(req.params.user_id))
		{
		MyUser.findById(req.params.user_id, function(err, user) {
			console.log('Get request for the user with the id: '+ req.params.user_id )
			if (err)
				res.send(err);
			res.json(user);
		});
		}
		else
		{
			MyUser.find({'email':req.params.user_id},function(err,user){
					console.log('Get request for the user with the email: '+ req.params.user_id )
			if (err)
				res.send(err);
			res.json(user);
			});
		}
	})

	// update the user with this id (accessed at PUT http://localhost:8080/api/users/:user_id)
	.put(function(req, res) {
			console.log("req.params: %j", req.params);
			console.log('req.body: %j', req.body);
		// use our user model to find the user we want
				if(!validateEmail(req.params.user_id))
				{
					console.log("PUT REQUEST BY ID");

			MyUser.findById(req.params.user_id, function(err, user) {
			console.log('res.params: ' + req.params );
			console.log('res.body: ' + req.body);

			if (err)
				res.send(err);

			user.firstname = req.body.firstname; 	// update the users info
			user.lastname = req.body.lastname;
			user.email = req.body.email;
			console.log("new attributes to be updated: " + user.firstname +" " + user.lastname );

			// save the user
			user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'User updated!' });
			});

		});
				}
				else
				{
			console.log("PUT REQUEST BY Email");
			MyUser.find({'email':req.params.user_id}, function(err, user) {
			console.log('res.params: %j', req.params );
			console.log('res.body: %j' ,req.body);

			if (err)
				res.send(err);

			console.log("how many found? " + user.length );
			if (user.length>0) {
			////////
			for (var i = user.length - 1; i >= 0; i--) {
				user[i].firstname = req.body.firstname; 	// update the users info
				user[i].lastname = req.body.lastname;
				user[i].email = req.body.email;
			};
			// save the user
			for (var i = user.length - 1; i >= 0; i--) {
				user[i].save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'User updated!' });
			});

			};

			///////////////if we didn't find no record, don't put the server on wait ... send empty response!
			}
			else
			{
				res.json(404,'User not found');
			}
			// user.save(function(err) {
			// 	if (err)
			// 		res.send(err);

			// 	res.json({ message: 'User updated!' });
			// });

		});
				}
//////////////////////////
		
	///////////////////////
	})

	.delete(function(req, res) {
		console.log("req.params: %j", req.params);
		console.log('req.body: %j', req.body);
		MyUser.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted user !' });
		});
	});

//

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);