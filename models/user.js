//our User model

var mongoose     = require('mongoose'); //call mongodb driver to create an accurate Schema
var Schema       = mongoose.Schema; 


//that is one fucked up NESTED Schema that still is not working well, haven't figured out why yet ... will be working on it.
var Place = new Schema({ 
	name:String, 
	map: {points:[{id:String, lat:Number, lng:Number, adr:String}], edges: [{id:String, in:String, out: String,time:{type:String, t:Number}}]}
});


var MyUserSchema   = new Schema({
	firstname: String,
	lastname: String,
	email: String,
	date: { type: Date, default: Date.now },
	places_history: [{title:String, date: Date, place: {type: mongoose.Schema.Types.ObjectId, ref: 'Place'} }] //this should work, but doesn't seem to, the rest works though
});

module.exports = mongoose.model('MyUser', MyUserSchema);
//module.exports = mongoose.model('Place',Place);