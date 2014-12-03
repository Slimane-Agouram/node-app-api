var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


// var Place = new Schema({
// 	user:{
// 	email:{type:String,required:true},
// 	lat: {type:Number,required:true, default:0,required:true},
// 	lng:{type:Number,required:true, default:0,required:true},
// 	mode:  {type:String, default:'walk',enum:['walk', 'drive']},
// 	useTransports: {type: Boolean, default:true,required:true}
// 	},
// 	usersArray:[String]
// });


var Place = new Schema({
	user:{
	creatorEmail:{type:String,required:true,default:""},
	},
	usersArray:[{
	email:{type:String,required:true},
	lat: {type:Number,required:true, default:0,required:true},
	lng:{type:Number,required:true, default:0,required:true},
	mode:  {type:String, default:'walk',enum:['walk', 'drive']},
	useTransports: {type: Boolean, default:true,required:true}, 
	state:{type:String, required:true, default:"DK", enum:["Y","N","DK"]}
	}]
});

module.exports = mongoose.model('Place', Place);
