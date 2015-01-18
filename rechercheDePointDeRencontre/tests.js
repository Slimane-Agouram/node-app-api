var tests = {};

/*****************************************************************************


				initialisation


******************************************************************************/

	tests['initialisation'] = {} ;

	var mpf = new MeetPointFinder ();

	
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
	tests['initialisation']['mpf_maps.STRASBOURG_chooseBest_existance'] = ( mpf.maps.STRASBOURG.chooseBest != undefined );



/*****************************************************************************


				load maps


******************************************************************************/



	var map = {
	    name:"Strasbourg",
	    map:
	    {
		points:[
		    {
			id:"V0",
			lat:48.58315,
			lng:7.74788,
			adr:"Strasbourg"
		    },
		     {
			id:"V1",
			lat:47.75084,
			lng:7.33589,
			adr:"Mulhouse"
		    }
		],
		edges:[
		    {
			id:"E1",
			in:"V1",
			out:"V2",
			time:
			    {
				type : "drive",
				t : 4000
			    }
		    }
		]
	    }
	};



	mpf.maps.STRASBOURG.loadMap(
		map
	);



	console.log( "nb edges : " + JSON.stringify(mpf.maps.STRASBOURG.db({type:"edge"}).count(),null,4) );
	console.log( "nb points : " + JSON.stringify(mpf.maps.STRASBOURG.db({type:"point"}).count(),null,4) );





/*****************************************************************************


				results


******************************************************************************/
console.log( JSON.stringify(tests,null,4) );
