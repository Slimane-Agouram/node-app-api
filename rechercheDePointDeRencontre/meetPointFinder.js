/**
 * Creates an instance of MeetPointFinder.
 *
 * @constructor
 * @this {MeetPointFinder}
 */
function MeetPointFinder (){

	/**
	 * Contain all map of an instance of MeetPointFinder.
	 *
	 * @this {MeetPointFinder}
	 * 
	 */
	this.maps = {} ;

	/**
	 * Return the best meetpoint for an array of users.
	 *
	 *
	 * @this {MeetPointFinder}
	 * @param {object array} userArray an array of users
	 * @param {number or string} researchId The research id.
	 * @param {string} mapName the name of the used map.
	 * @param {boolean} useIntelligentAlgorithme set to true when the advanced algorithm is used.
	 */
	this.findMeetPointFor = function( userArray , researchId , mapName , useIntelligentAlgorithme ){

		console.log("length of userArrays: %j", userArray);

		if( useIntelligentAlgorithme != undefined && useIntelligentAlgorithme == true ){
			
			/**
			 *
			 * For all users a vector is compututed. this vector contain the bestTime to go to each map point in a resonable number of transport's changes
			 *
			 */
			for( var i=0 ; i < UserArray.length ; i++ ){
			
				UserArray[i]['vector'] = this.maps[ mapName ].computeV( UserArray[i] );
			
			}

			/**
			 *
			 * use all computed vectors to choose the best meetpoint for the users
			 *
			 */
			return this.maps[ mapName ].chooseBest( userArray );

		}


		/**
		 *
		 * compute the best point for all users without any transports
		 *
		 */
		return this.maps[ mapName ].naiveBestAdresse( userArray );

	}

};



