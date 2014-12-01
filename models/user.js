var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;



var Place = new Schema({
	name:String, 
	map: {points:[{id:String, lat:Number, lng:Number, adr:String}], edges: [{id:String, in:String, out: String,time:{type:String, t:Number}}]}
});


var MyUserSchema   = new Schema({
	firstname: String,
	lastname: String,
	email: String,
	date: { type: Date, default: Date.now },
	places_history: [{title:String, date: Date, place: {type: mongoose.Schema.Types.ObjectId, ref: 'Place'} }]
});

module.exports = mongoose.model('MyUser', MyUserSchema);
//module.exports = mongoose.model('Place',Place);