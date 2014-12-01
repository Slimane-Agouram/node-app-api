node-app-api
============

install dependencies:


	the app uses node-JS, mongoose to drive the database and Express 4 to rout all the shit coming in and  out :)
	sudo npm install (for linux users)
	npm install for OSX users

run :

	node server.js 

make rest requests :

	http://localhost/8080/api/users ====>fetch all users or create new one 
	http://localhost/8080/api/users/user_id ====> fetch particular user, modify it delete it ...
	please use POSTMAN extension to make them requests, been tested, works well
	
