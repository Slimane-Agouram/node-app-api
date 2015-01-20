


// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser'); //calling our JSON parser to handle requests 
var mongoose = require('mongoose'); //call our database driver
var credentials = require('./data.json'); //put all our credentials for database and SMTP in a specific file, for maximum security.
//mongoose.connect('mongodb://slimane.agouram:03081990@ds053380.mongolab.com:53380/serveur_rd'); //mongolab NoSQL database
mongoose.connect(credentials.mongoose_driver.url);
var MyUser = require('./models/user.js'); //invocation of user model
var Place = require('./models/place.js'); //invocation of meeting model
var nodemailer = require('./nodemailer.js'); //invocation of nodemailer templater and configuration
var path = require('path');
var mapStrasbourg = require('./rechercheDePointDeRencontre/STRASBOURG.json');

var fs = require('fs'); //invocation of filesystem access
var vm = require('vm'); // we are going to evaluate some external code (by Julien casarin)
var includeInThisContext = function(path) { //adding julien Library, local database and code to our scope.
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);
includeInThisContext(__dirname +"/rechercheDePointDeRencontre/taffydb-master/taffy.js");
includeInThisContext( __dirname + "/rechercheDePointDeRencontre/geo.js");
includeInThisContext( __dirname + "/rechercheDePointDeRencontre/map.js")
includeInThisContext( __dirname + "/rechercheDePointDeRencontre/meetPointFinder.js");
includeInThisContext(  __dirname + "/rechercheDePointDeRencontre/tests.js");


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

	function getUserName(email_to_search){
		console.log("recherhce du nom et prenom : " + email_to_search);
		MyUser.find({email:email_to_search}, function(err,user){
			var result = {first: '', last: ''};
			if (err)
			{
				console.log("err:" + err);
				return result;
			};


			if(user.length>0)
			{
				 result.first= user[0].firstname;
				result.last=user[0].lastname;
				return result;
			}
			else
			{
				return result;
			};
		});
	};
///Function to call the JS Library routine and perform adequate calculation to finaly return the meeting point.
	function getPoint(usersArray,mpf)
	{
					mpf = new MeetPointFinder ();
					initializeMap(map);
					mpf.maps = loadMap(mapStrasbourg);
					mpf.maps.STRASBOURG.loadMap(mapStrasbourg);
					var res = mpf.findMeetPointFor(usersArray,1,'STRASBOURG',true);//call calculation routines

					return res;
	}


//END OF TOOLS///////////////////////////////


//TEST function for SMTP templates/////
function test_SMTP(template,subject, whoFrom){
var users_to_mail = [{
								email: "slimane.agouram@gmail.com",
								password: "dummy",
								 name: {
				         			 first: "slimane___",
				          			last: "agouram____"},
				          		creator:{
				          			email: "dummy@dummy.com",
				          			first: "slimane",
				          			last: "AGOURAM"
				          		}
				        		}];

	//console.log("testing SMTP, from: " + whoFrom + " ,template: "+ template + " ,subject: " + subject);
nodemailer.sendMails(users_to_mail,template,subject,whoFrom);
};

//test_SMTP(credentials.nodemailer_templates.signup_template,credentials.email_subjects.signup_subject,credentials.email_senders.signup_sender );
//test_SMTP(credentials.nodemailer_templates.welcome_template,credentials.email_subjects.welcome_subject, credentials.email_senders.welcome_sender);
//test_SMTP(credentials.nodemailer_templates.change_template, credentials.email_subjects.changing_subject,credentials.email_senders.changing_subject);

////end///////////////////////


//ROUTES/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
			var password= new Buffer(req.body.password,'base64');
			password = password.toString();
			myUser.password = password;
			MyUser.find({email:myUser.email},function(err,user){
				if (err)
					res.send(err);

				if (user.length!=0) {
					res.json(401,'User already exists, could not post the user');

				}else{

					myUser.save(function(err) {
			if (err)
				res.send(err);
			// save the user and check for errors
			res.json({ success:"true", message: 'User created!' });
			var users_to_mail = [{
								email: myUser.email,
								password: myUser.password,
								 name: {
				         			 first: myUser.firstname,
				          			last: myUser.lastname.toUpperCase()},
				        		}];
							
							var template =credentials.nodemailer_templates.signup_template; 
							var subject = credentials.email_subjects.signup_subject;
							var fromWho = credentials.email_senders.signup_sender;
							nodemailer.sendMails(users_to_mail,template,subject,fromWho);

		});
				};
		});
		}
		else
		{
			//res.send("updated properties bu not the email adress,since it does not seem to be correct...");
			res.json(401,'Email is not valid, could not post the user');

		}


		
		
	})
	//get request that return the list of all registred users 
	.get(function(req, res) {

		MyUser.find(function(err, users) {
			if (err)
				res.send(err);
			var new_users = [];
			for (var i = users.length - 1; i >= 0; i--) {
				var new_user_temp = {
					email: users[i].email,
					firstname: users[i].firstname,
					lastname: users[i].lastname.toUpperCase()
				};
				new_users.push(new_user_temp);
			};
			res.json(users);
		});
	});

	

	// on routes that end in /users/:user_id
	//user_id could be the id or the email, we should manage the 2 cases...
// ----------------------------------------------------
router.route('/users/:user_id')
		
	// get the user with that id (accessed at GET http://localhost:8080/api/users/:user_id)
	.get(function(req, res) {
		
		if(!validateEmail(req.params.user_id)) //if post param is not a mail, then fetch by id
		{
		MyUser.findById(req.params.user_id, function(err, user) {
			if (err)
				res.send(err);
			res.json(user);
		});
		}
		else //if it is an email adress then fetch by email this time
		{
			MyUser.find({'email':req.params.user_id},function(err,user){
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
		
		// use our user model to find the user we want
				if(!validateEmail(req.params.user_id)) //same goes here 
				{
					console.log("PUT REQUEST BY ID");

			MyUser.findById(req.params.user_id, function(err, user) {
			console.log('res.params: ' + req.params );
			console.log('res.body: ' + req.body);

			if (err)
				res.send(err);

			//check for correct information, don't stupidely assume client is gonna be nice.
			if (req.body.firstname!=null && req.body.firstname!=undefined) {
			user.firstname = req.body.firstname; 	// update the users info

			};

			if (req.body.lastname!=null && req.body.lastname!=undefined) {
			user.lastname = req.body.lastname;

			};

			if (req.body.email!=null && req.body.email!=undefined && req.body.email!='') {
			user.email = req.body.email;

			};

			if(req.body.password!=null && req.body.password!='' && req.body.password!=undefined){
				var password = new Buffer(req.body.password,'base64');
				password = password.toString();
			user.password = password;

			};

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
			//in this case, the client decided to look for the user using its email we must act as asked.
			MyUser.find({'email':req.params.user_id}, function(err, user) {

			if (err)
				res.send(err);

			if (user.length>0) {
			////////updating data with controlling its validity
			for (var i = user.length - 1; i >= 0; i--) {
				if (req.body.firstname!=null && req.body.firstname!=undefined) {
			user[i].firstname = req.body.firstname; 	// update the users info

			};

			if (req.body.lastname!=null && req.body.lastname!=undefined) {
			user[i].lastname = req.body.lastname;

			};

			if (req.body.email!=null && req.body.email!=undefined && req.body.email!='') {
			user[i].email = req.body.email;

			};

			if(req.body.password!=null && req.body.password!='' && req.body.password!=undefined){
			var password = new Buffer(req.body.password,'base64');
				password = password.toString();
			user[i].password = password;

			};
			};
			// save the user
			for (var i = user.length - 1; i >= 0; i--) {
				user[i].save(function(err) {
				if (err)
					res.send(err);

				res.json({success:"true", message: 'User updated!' });
			});

			};

			///////////////if we didn't find no record, don't put the server on wait ... send not found response!
			}
			else
			{
				res.json(404,'User not found');
			}
				
			var users_to_mail = [{
								email: user[0].email,
								password: user[0].password,
								 name: {
				         			 first: user[0].firstname,
				          			last: user[0].lastname.toUpperCase()},
				        		}];
							
							var template =credentials.nodemailer_templates.change_template; 
							var subject = credentials.email_subjects.changing_subject;
							var fromWho = credentials.email_senders.changing_sender;
							nodemailer.sendMails(users_to_mail,template,subject,fromWho);




		});
				}

	})

	//delete request: the client asks for deletion of a user, either by its ID or by its email.
	.delete(function(req, res) {
		if (!validateEmail(req.params.user_id)) { //delete request by ID
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
			//delete request by email
			var key='';
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
				else //if given email is not found, then return adequate response.
				{
					res.json(403,'User not found by email,could not delete');
				}
			});


		}
		
	})

	//this request is used to validate login, it will be used by the client app so as to perform authentification.
	.post(function(req,res){
		if(req.body.password!=null && req.body.password!=undefined){
				var password = new Buffer(req.body.password,'base64');
				password = password.toString();
				MyUser.find({email: req.params.user_id,password:password}, function(err,user){ //we look for the required email in our database 
				if (err) {
					res.json(err);
				};


				if(user.length>0  ) //we found something here
				{
					res.json('200', "Login successfull");
					
				}
				else//given credentials does not exist (specifically: email does not exist in our DB)
				{
					res.json(403,'No User found with these credentials.');
				}
			});
		}
		else
		{
			res.json('401','incomplete query');
		}


	});


///////////////////////////////////////////Routes for the Meetings RendezVous/////////////////////////////////////////////////////
//Create new meeting with new creatorEmail and new list of new mails of joining members
router.route('/rendezvous')
	//Post request to creqte new meeting, or add some user to an existing meeting depending on input JSON format!
	.post(function(req, res) {
				var rendezVous = new Place();
				var first= '';
				var last = '';
				var creator_first = '';
				var creator_last = '';
		if(req.body.id!=null && req.body.id!=NaN) //client asks to add user to a meeting since it sended an ID field in the JSON
		{
			var user_exists = false;
			Place.findById(req.body.id ,function(err,meeting){ //look for that ID in the database

					var response={success:"true",err:""};

					if (meeting==null) { //not found
						response.success="false";
						response.err="meeting not found using the given ID";
						res.json(response); //send not found response
					}
					else //all right, we found something!
					{
						for (var i = meeting.usersArray.length - 1; i >= 0; i--) { //don't just supidely add the user, check if the user already is in the meeting
							if(meeting.usersArray[i].email == req.body.user.email)
							{
								user_exists = true;  
								break;
							}
						};

					if (user_exists) { //user is already in, it will be dumb to add him again
						response.success ='false';
						response.err = 'this user already is in the requested Meeting, will not add twice';
						res.json(response); //notice the client
					} 
						else{//user is not in the meeting : well,  we should add him 
									var user_to_add = { //construct its object 
										email: req.body.user.email,
										lat:req.body.user.lat,
										lng:req.body.user.lng,
										mode:req.body.user.mode,
										useTransports: req.body.user.useTransports,
										state: req.body.user.state
								};

							meeting.usersArray.push(user_to_add);//push it to the found meeting's array
							meeting.save(function(err){ //then save everything

								if (err)
								{
									response.err = err;
									response.success = "false";
									res.json(response);
								}
									res.json(response);
							});
							
							MyUser.find({"email":req.body.user.email},function(err,user){ //since we are going to send notification mail, we have to get lastname and username of the user(if already registred in the app)
								if (err) {
									console.log(err);
								};

								if (user.length>0) {
									first = user[0].firstname; //fetching firstname and lastname 
									last = user[0].lastname.toUpperCase();
								};

								MyUser.find({"email":meeting.user.creatorEmail},function(err,creator){ //now, we need lastname and firstname of the meeting's creator, again for emails to include them
								if (err) {
									console.log(err);
								};

								if (creator.length>0) { //found creator
									creator_first = creator[0].firstname;  //fetching lastname and firstname
									creator_last = creator[0].lastname.toUpperCase();
								};
									//now we are going to call the mail sending routine
							var users_to_mail = [{ //we construct our object of the reciever and include jade data in it
								email: user_to_add.email,
								 name: {
				         			 first:first,
				          			last: last},
				        		creator:{
				        				email: meeting.user.creatorEmail,
				        				first: creator_first,
				        				last: creator_last
				        				}}];
							var template =credentials.nodemailer_templates.welcome_template;  //we call the template of the mail
							var subject = credentials.email_subjects.welcome_subject;//sêcify subject
							var fromWho = credentials.email_senders.welcome_sender;//specify sender

							nodemailer.sendMails(users_to_mail,template,subject,fromWho); //call nodemailer routine to send mails

							});

								
							});
							

						};

						

						}
					});

			
		}
		else//in the input JSON no id has been given, so we are asked to create new meeting from scratch
		{
			
		rendezVous.user.creatorEmail = req.body.user.email;  // set the users name (comes from the request)

		var user_creator ={						//create the creator user
				email: req.body.user.email,
				lat:req.body.user.lat,
				lng:req.body.user.lng,
				mode:req.body.user.mode,
				useTransports: req.body.user.useTransports,
				state:"DK"
			};
			rendezVous.usersArray.push(user_creator); //push it to the array of users in  a new meeting


		for (var i = req.body.usersArray.length - 1; i >= 0; i--) { //construct the array of the other users, fulfilling their fields with default data
			var user_temp = {
				email: req.body.usersArray[i],
				lat:0,
				lng:0,
				mode:'walk',
				useTransports: true,
				state:"DK"
			};
			rendezVous.usersArray.push(user_temp); //push theml to the new meeting's array of users
		};
		

		// save the user and check for errors
		rendezVous.save(function(err) {
			if (err)
			{
				console.log(err);
				res.send(err);

			}
			var response={id:""};
			response.id = rendezVous._id; //send the response
			res.json(response);
	
		});
		//agian we wanna fetch users's data and creator's data.
		MyUser.find({email: req.body.user.email}, function(err, user){ //we look for eqch user data
			if (err) {
				console.log(err);
			};

			if (user.length>0) {
				first = user[0].firstname; //if user already registred then fetch it's name data
				last = user[0].lastname.toUpperCase();
			};

			MyUser.find({email: rendezVous.user.creatorEmail}, function(err, creator){ //we look at first for the creator's name data
				if (err) {
					console.log(err);
				};

				if (creator.length>0) {
					creator_first = creator[0].firstname; //ok we fetch them
					creator_last = creator[0].lastname;
				};
				var users_to_mail = []; //construct the array of object to send notification
			for (var i = rendezVous.usersArray.length - 1; i >= 0; i--) {
				var user_mail_temp = {
				
				        email: rendezVous.usersArray[i].email,
				        name: {
				          first: first,
				          last: last,
				      },
				        creator:{
				        	email: rendezVous.user.creatorEmail,
				        	first: creator_first,
				        	last: creator_last.toUpperCase()
				        }

			};
			users_to_mail.push(user_mail_temp);
		}
		//specify sending data and call nodemail configuration to send mails.
		var template ='welcome-email'; 
		var subject = 'New meeting has been created for you.';
		var fromWho = 'Meeting-Me';
		nodemailer.sendMails(users_to_mail,template,subject,fromWho);

			});
		});

		
	}	
	})
//request to delete user from a given meeting
	.delete(function(req,res) {
		var key='';
			Place.findById(req.body.id ,function(err,meeting){ //we look for the meeting using given ID
				if (err) {
					console.log("error while looking for a meeting to delete a user");
					res.json(err);
				};
					var index = -1;
					var response={success:"true",err:""};

					if (meeting==null) { //the ID sent does not correspond
						response.success="false";
						response.err="meeting not found using the given ID";
						res.json(response);
					}
					else
					{ //THE id given corresponds, now look for our user in it, maybe it's not in it
						for (var i = meeting.usersArray.length - 1; i >= 0; i--) {
						if(meeting.usersArray[i].email== req.body.user.email)
						{
							index = i;
						}
					};

					if (index==-1) { //the user which should be deleted is not in that meeting
						response.success="false";
						response.err="user not found in pointed meeting";
						res.json(response);
					}
					else //ok, user found and we are going to delete him from requested meeting
					{
						meeting.usersArray.splice(index,1);
						meeting.save(function(err) {
						if (err)
						{
							response.err = err;
							response.success = "false";
							res.json(response);
						}

						res.json(response); //deleted with success, now send the response
						});
					}
					}

					
							
			
					

	});
		})

//put request for a user in a meeting, updating it's data for example
	.put(function(req, res) {
		
			Place.findById(req.body.id,function(err,meeting) //we look for the meeting
				{
					var response={success:"true", err:""};
					if (err) {
						response.success ='false';
						response.err = err;
						res.json(response);
					};
					if(meeting!=null) //meeting found, well boo yaaah!
					{
						var index = -1;
						for (var i = meeting.usersArray.length - 1; i >= 0; i--) { //check sent data and upadate it
							if (meeting.usersArray[i].email == req.body.user.email) {
								index = i;
								if (req.body.user.lat!= undefined && req.body.user.lat!= null) {
									meeting.usersArray[i].lat = req.body.user.lat;
								};
								if (req.body.user.lng!= undefined && req.body.user.lng!= null) {
									meeting.usersArray[i].lng = req.body.user.lng;
								};
								if (req.body.user.state!=undefined && req.body.user.state!=null){ 
									meeting.usersArray[i].state = req.body.user.state;
								};
								if (req.body.user.mode!=undefined && req.body.user.mode!=null) {
									meeting.usersArray[i].mode = req.body.user.mode;
								};
								if (req.body.user.useTransports!=undefined && req.body.user.useTransports!=null) {
									meeting.usersArray[i].useTransports = req.body.user.useTransports;
								};
							};
								
						};

						if (index==-1) { //the index is only used to know if the user existed, we could have omitted that, but then we wouldn't know if the user did not exist in that meeting
							response.success="false";
							response.err = "User not found in the given meeting, are you sure it has not being deleted?";
							res.json(404,response);
						}
						else
						{
						meeting.save(function(err) { //now we save everything
						if (err)
						{
							response.err = err;
							response.success = "false";
							res.json(response);
						}

						res.json(response);
						});
						}
					}
					else //given meeting is not not found 
					{
						response.success="false";
						response.err = "Meeting not found with the given ID";
						res.json(404,response);
					}

				});


	});
//strait forward get request to get all programmed meetings...
router.route('/rendezvous/:email')
.get(function(req, res) {
		Place.find({"usersArray":
		{
			 $elemMatch: {
                     email: req.params.email,
                     state: { $in: ['Y','DK','AT'] }
                }
		}}


	,function(err, meetings) {
			if (err)
				res.send(err);
			if (meetings.length==0) {
				res.json('404','no meetings have been found (or none accepted) by this user');
			}
			else
			{
				res.json(200,meetings);

			}
		});
	});

///////////////////////////////////////////////////////MettingPoint and caclulation calls////////////////////////////////
router.route('/meetingpoint')
//POST request to request calculation of meeting point.
	.post(function(req,res){
			var mpf = new MeetPointFinder ();
		
			var rendezVous = new Place();
			if(req.body.id!=null && req.body.id !=NaN) //the meeting in question is specified in the request:
			{
				Place.findById(req.body.id ,function(err,meeting){ //look for that meeting
					if(meeting == null) //meeting not found, then notify client
					{
						var response_null = {success:"false", err:"Requested ID does not match any meeting "};
						res.json(404,response_null);
					}
					else //meeting found
					{
						console.log("found meeting by id : %j", meeting);
						var array_people_coming = [];
						for (var i = meeting.usersArray.length - 1; i >= 0; i--) { //since the calculation is only done for users who wanna join the meeting
							//we have to reconstruct our data looking for only those users.
							if (meeting.usersArray[i].state == "DK" || meeting.usersArray[i].state=="Y") {
								array_people_coming.push(meeting.usersArray[i]);
							};
						};
						
						console.log("array after splice : %j", array_people_coming);
						var point_recoverd = getPoint(array_people_coming,mpf); //calling the calculation routine done by Julien Casarin
						var new_format_for_meeting = {   //constructing the new format of response to be sent to the client, including the meeting point 
							id:meeting._id,
							users: array_people_coming,
							point:point_recoverd
						};
						res.json(new_format_for_meeting); //send the list!
					}
				});
			}
			else
			{
				Place.find({"usersArray.email":req.body.user.email //the client did not give any meeting id in the request, we gonna look for all the meetings with this user in them
					},function(err,meetings){

					if(meetings.length==0) //meetings not found (remeber Schema.find returns an array, Schema.findById retruns an object!)
					{
						var response_null = {success:"false", err:"this user does not exist in any registred meeting."};
						res.json(404,response_null);
					}
					else //meetings found
					{ 
						var indexes = []; //perparing slicing indexes for the users that refused to come
						var points = []; // preparing the array to host our points of meeting for each point
						var new_array_to_return = []; //preparing the array for the new format of response sent to the client
						var array_people_coming = [];
						var new_meetings = [];


									for (var i = meetings.length - 1; i >= 0; i--) {

											for (var k = meetings[i].usersArray.length - 1; k >= 0; k--) { //register users who don't wanna come (AT :already there)
												if (meetings[i].usersArray[k].state == 'Y' || meetings[i].usersArray[k].state=='DK') {
													//indexes.push(k);
													array_people_coming.push(meetings[i].usersArray[k]);
												};
											};

											// for (var j = indexes.length - 1; j >= 0; j--) { //delete them from our meetings using array of splice indexes
											// 	meetings[i].usersArray.splice(indexes[j],1);
											// };
											// indexes = []; //remember to initialze the indexes array at each delete, either way, indexes will be cumulated.
											new_meetings.push(array_people_coming);

										points.push(getPoint(array_people_coming,mpf)); //for each meeting of ours, calculate meeting point 
												array_people_coming = [];


									};

						for (var i = meetings.length - 1; i >= 0; i--) { //constructing response object with diffrenent fields.
							var new_format_for_meeting = {
							id:meetings[i]._id,
							users: new_meetings[i],
							point: points[i]
						};
						new_array_to_return.push(new_format_for_meeting);
						};
						res.json(200,new_array_to_return); //sending result
					}


			});
			}

	});


//////////////////////////////ROUTE FOR WEBSITE CONTACT///////////////////////////////
router.route('/contactus')
	.post(function(req,res){
		
		var message = req.body.message;
		var email = req.body.email;
		var name = req.body.name;
		var phone = req.body.phone;
		var time_of_contact = req.body.time_of_contact;

		var user_to_contact = credentials.website_credentials.admin.email;
		var object_to_send = [{
			email: user_to_contact,
			message: {
				message: message,
				name:name,
				phone:phone,
				email:email,
				time_of_contact: time_of_contact
			}
		}];

		var template =credentials.nodemailer_templates.contact_template;  //we call the template of the mail
		var subject = credentials.email_subjects.contact_subject;//sêcify subject
		var fromWho = credentials.email_senders.contact_sender;//specify sender
		nodemailer.sendMails(object_to_send,template,subject,fromWho);
		res.json(200,"mail succesfully sent to admin");



	});



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
//We wanna display a HomePage of our application, so we grant access to the assets, otherwise only the html will be accepted
app.use(express.static(__dirname+'/basic_html'));
app.get('/', function(req, res) {
	//we then define what file to serve at what adress.
    res.sendFile(path.join(__dirname + '/basic_html/index.html'));
});


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Meeting API runing on port: ' + port);