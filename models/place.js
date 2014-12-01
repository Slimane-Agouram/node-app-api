var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


var Place = new Schema({
	user:{
		email:{type:String,required:true},
	lat: {type:Number,required:true, default:0},
	lng:{type:Number,required:true, default:0},
	mode:  {type:String, default:"walk"},
	useTransports: {type: Boolean, default:true}
	},
	usersArray:[String]
});

module.exports = mongoose.model('Place', Place);
