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



		if( useIntelligentAlgorithme != undefined && useIntelligentAlgorithme == true ){
			
			/**
			 *
			 * For all users a vector is compututed. this vector contain the bestTime to go to each map point in a resonable number of transport's changes
			 *
			 */
			for( var i=0 ; i < userArray.length ; i++ ){
			

				userArray[i]['vector'] = this.maps[ mapName ].computeV( userArray[i]  );
				
			}
			/**
			 *
			 * use all computed vectors to choose the best meetpoint for the users
			 *
			 */
			 					//console.log("this.maps[ mapName ].chooseBest( userArray ): %j", this.maps[ mapName ].chooseBest( userArray ));
			return this.maps[ mapName ].chooseBest( userArray );


		}


		/**
		 *
		 * compute the best point for all users without any transports
		 *
		 */

		 console.log("naive");
		return this.maps[ mapName ].naiveBestAdresse( userArray );


	}

};



