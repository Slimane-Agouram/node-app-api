
function MeetPointFinder (){

	this.maps = {} ;

	this.findMeetPointFor = function( userArray , researchId , mapName ){

		return maps[ mapName ].naiveBestAdresse( userArray );

	}

}
/*
var fs = require('fs');
var vm = require('vm');
var includeInThisContext = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);
includeInThisContext(__dirname+"/models/car.js");
*/
