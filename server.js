
// TODO Stuff
// =============================================================================
	//our api is still open, no authentication system has been installed, will be done later
	//we must concretize all the internal js libraries for nodeJS managinf maps and stuff
	//make sure that the backoffice is doing the accurate requests
	// write methods to manage the history of places one user has visited.





// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose'); //call our database driver
mongoose.connect('mongodb://slimane.agouram:03081990@ds053380.mongolab.com:53380/serveur_rd'); //mongolab NoSQL database
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


//TOOLS////////////////////////
//function to test if a string is an email, will be used for the get/put/ requests since it's so much easier to fetch users by email
	//rather than the ugly random id, we should though make sure that the email is unique, or a lot of shit will be going wrong...
	function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} ;



//END OF TOOLS///////////////////////////////

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
		if(req.body.email!= '' && req.body.email!= null && validateEmail(req.body.email))
		{
			myUser.email = req.body.email;
		}
		else
		{
			//res.send("updated properties bu not the email adress,since it does not seem to be correct...");
			res.json(500,'Email is not valid, could not post the user');

		}
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

	

	// on routes that end in /users/:user_id
	//user_id could be the id or the email, we should manage the 2 cases...
// ----------------------------------------------------
router.route('/users/:user_id')
		
	// get the user with that id (accessed at GET http://localhost:8080/api/users/:user_id)
	.get(function(req, res) {
		console.log("req.params: %j", req.params);
		console.log('req.body: %j', req.body);
		console.log('test email: ' + validateEmail(req.params.user_id));
		if(!validateEmail(req.params.user_id)) //if post param is not a mail, then fetch by id
		{
		MyUser.findById(req.params.user_id, function(err, user) {
			console.log('Get request for the user with the id: '+ req.params.user_id )
			if (err)
				res.send(err);
			res.json(user);
		});
		}
		else //if it is an email adress then fetch by email this time
		{
			MyUser.find({'email':req.params.user_id},function(err,user){
					console.log('Get request for the user with the email: '+ req.params.user_id )
			if (err)
				res.send(err);
			res.json(user);
			});
		}
	})

	//Warning: Model.find returns an array(if not found THEN an empty array) while findById returns an object or null, so we should be very careful of what we are modifying, again, no unique email means a lot of
	//weird things will be going crazy... 

	// update the user with this id (accessed at PUT http://localhost:8080/api/users/:user_id)
	.put(function(req, res) {
			console.log("req.params: %j", req.params);
			console.log('req.body: %j', req.body);
		// use our user model to find the user we want
				if(!validateEmail(req.params.user_id)) //same goes here 
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

			///////////////if we didn't find no record, don't put the server on wait ... send not found response!
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
		if (!validateEmail) {
			MyUser.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted user !' });
		});
		}
		else
		{
			var key='';
			console.log('deleting by email');
			MyUser.find({'email': req.params.user_id},function(err,user){
				if(user.length>0)
				{
					key =user[0]._id;
					MyUser.remove({
						_id:key
					},function(err,user){
						if(err)
							res.send(err);

					res.json({message:'Successfully deleted user by email'});
					});
				}
				else
				{
					res.json(404,'User not found by email');
				}
			})


		}
		
	});

//

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);