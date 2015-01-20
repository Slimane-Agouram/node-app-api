//our User model

var mongoose     = require('mongoose'); //call mongodb driver to create an accurate Schema
var Schema       = mongoose.Schema; 





var MyUserSchema   = new Schema({
	firstname: String,
	lastname: String,
	email: String,
	password: String,
	date: { type: Date, default: Date.now },
	places_history: [{title:String, date: Date, place: {type: mongoose.Schema.Types.ObjectId, ref: 'Place'} }] 
});

module.exports = mongoose.model('MyUser', MyUserSchema);
