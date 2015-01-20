var tests = {};
var mpf = new MeetPointFinder ();
var map = {};


/*****************************************************************************


				initialisation


******************************************************************************/
	//var tests= {};
function initializeMap(){
	tests['initialisation'] = {} ;


	
	tests['initialisation']['mpf_maps_existance'] = ( mpf.maps != undefined );
	tests['initialisation']['mpf_findMeetPointFor_existance'] = ( mpf.findMeetPointFor != undefined );

	mpf.maps['STRASBOURG'] = new Map();

	tests['initialisation']['mpf_maps.STRASBOURG_existance'] = ( mpf.maps.STRASBOURG != undefined );

	tests['initialisation']['mpf_maps.STRASBOURG_db_existance'] = ( mpf.maps.STRASBOURG.db != undefined );
	tests['initialisation']['mpf_maps.STRASBOURG_loadMap_existance'] = ( mpf.maps.STRASBOURG.loadMap != undefined );
	tests['initialisation']['mpf_maps.STRASBOURG_worseDistance_existance'] = ( mpf.maps.STRASBOURG.worseDistance != undefined );
	tests['initialisation']['mpf_maps.STRASBOURG_worseTime_existance'] = ( mpf.maps.STRASBOURG.db != undefined );
	tests['initialisation']['mpf_maps.STRASBOURG_naiveBestAdresse_existance'] = ( mpf.maps.STRASBOURG.naiveBestAdresse != undefined );
	tests['initialisation']['mpf_maps.STRASBOURG_computeV_existance'] = ( mpf.maps.STRASBOURG.computeV != undefined );
	tests['initialisation']['mpf_maps.STRASBOURG_chooseBest_existance'] = ( mpf.maps.STRASBOURG.chooseBest != undefined); 
};


/*****************************************************************************


				load maps


******************************************************************************/
function loadMap(map_JSON){
		
	mpf.maps.STRASBOURG.loadMap(map_JSON);




	
	return mpf.maps;

};





/*****************************************************************************


				results


******************************************************************************/

function returnResultsMap()
{
	console.log( JSON.stringify(tests,null,4) );

};


