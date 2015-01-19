
function MeetPointFinder (){

	this.maps = {} ;


	this.findMeetPointFor = function( userArray , researchId , mapName , useIntelligentAlgorithme ){

		console.log("length of userArrays: %j", userArray);

		if( useIntelligentAlgorithme != undefined && useIntelligentAlgorithme == true ){
		
			for( var i=0 ; i < UserArray.length ; i++ ){
			
				UserArray[i]['vector'] = this.maps[ mapName ].computeV( UserArray[i] );
			
			}
			return this.maps[ mapName ].chooseBest( userArray );

		}

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

