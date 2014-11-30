var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;




var MyUserSchema   = new Schema({
	firstname: String,
	lastname: String,
	email: String,
	date: { type: Date, default: Date.now },
	places_history: [{title:String, date: Date, coordinates: String }]
});

module.exports = mongoose.model('MyUser', MyUserSchema);