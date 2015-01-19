
function MeetPointFinder (){

	this.maps = {} ;

	this.findMeetPointFor = function( userArray , researchId , mapName ){
		console.log("length of userArrays: %j", userArray);
		return this.maps[ mapName ].naiveBestAdresse( userArray );

	}

};


//exports.MeetPointFinder = MeetPointFinder;
// var fs = require('fs');
// var vm = require('vm');
// var includeInThisContext = function(path) {
    // var code = fs.readFileSync(path);
    // vm.runInThisContext(code, path);
// }.bind(this);
// includeInThisContext(__dirname+"/models/car.js");

