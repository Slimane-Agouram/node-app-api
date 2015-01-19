/**
 * Creates an instance of Map.
 *
 * @constructor
 * @this {Map}
 */
function Map(){ 


	this.MAX_NB_STEP = 3 ,
	this.STANDART_DEVIATION_IN_CITY = 1.2 ,
	this.WALK_SPEED_MperS = 1 ,

	/**
	 * db the TaffyDB instance
	 *
	 * @this {MeetPointFinder}
	 */
	this.db = TAFFY();
	
	
	/**
	 * load a map in db
	 *
	 *
	 * @this {Map}
	 * @param {Json Object} data the map object.
	 */
	this.loadMap = function( data ){
		
		for(var i=0 ; i<data.map.points.length ; i++){
			
			this.db.insert( { type:"point" , data: data.map.points[i] } )
			
		}
		
		for(var i=0 ; i<data.map.edges.length ; i++){
			
			this.db.insert( { type:"edge" , data: data.map.edges[i] } )
			
		}
			
	};
	
	
	
	/**
	 * Return the maximum of the distance between a point and a group of users
	 *
	 *
	 * @this {Map}
	 * @param {object array} userArray an array of users
	 * @param {Object} point The point
	 */
	this.worseDistance = function( UserArray , point ){
		
		var res = -1 ;
		for( var i=0 ; i < UserArray.length ; i++ ){
			
			var d = GEO.computeDistance(point.lat , point.lng , UserArray[i].lat , UserArray[i].lng);
			
			if( res == -1 )res = d;
			else res = Math.max(res , d)
			
		}
		return res;
		
	}
	
	
	
	/**
	 * Return the maximum travel time to go to a point for an array of users.
	 *
	 * /!\ user.vector[ point.id ] have to be setted (see Map.computeV method)
	 * @this {Map}
	 * @param {object array} userArray an array of users
	 * @param {Object} point The point
	 */
	this.worseTime = function( UserArray , point ){
		
		var res = -1 ;
		for( var i=0 ; i < UserArray.length ; i++ ){
			
			var t = UserArray[i].vector[ point.id ];
			
			if( res == -1 )res = t;
			else res = Math.max(res , t)
			
		}
		return res;
		
	}


	
	
	/**
	 * Return the best point for an array of users if they all walks.
	 *
	 *
	 * @this {Map}
	 * @param {object array} userArray an array of users
	 */
	this.naiveBestAdresse = function( UserArray ){

		var find = false ;
		var bestValue = -1 ;
		var res ;

		var wd = this.worseDistance ;

		/**
		 *  compute worseDistance for all points in Map and take the minimum
		 */
		this.db( { "type":"point" } ).each( function(node){

			var value = wd( UserArray , node.data ) ;

			if( value < bestValue || find == false ){

				find = true;
				best = value;
				res = node.data;

			}

		} );

		return res;

	}






	/**
	 * compute the faster road in Map.MAX_NB_STEP for all map point according to Map.STANDART_DEVIATION_IN_CITY and Map.WALK_SPEED_MperS
	 *
	 *
	 * @this {Map}
	 * @param {object} user a user
	 */
	this.computeV = function( User ){

		var MAX_NB_STEP = this.MAX_NB_STEP ;
		var STANDART_DEVIATION = this.STANDART_DEVIATION_IN_CITY;
		var WALK_SPEED_MperS = this.WALK_SPEED_MperS ;

		var Vo = {};
		var wd = this.worseDistance ;

		//the first step is wallked
		this.db( { "type":"point" } ).each( function(node){

			Vo[ node.id ] = GEO.computeDistance(node.data.lat , node.data.lng , User.lat , User.lng);
			Vo[ node.id ] *= STANDART_DEVIATION / WALK_SPEED_MperS ;

		} );

		//the other steps uses transports
		for( var step = 1 ; step < MAX_NB_STEP ; step ++ ){

			var V = JSON.parse(JSON.stringify(Vo));

			this.db( { "type":"edge" } ).each( function(edge){

				//check if it's possible to go faster in more transport's steps

				if( (User.useTransports==true) ){

					V[ edge.data.in ] = Math.min( Vo[ edge.data.out ] , Vo[ edge.data.in ] + edge.data.time.t );

				}
				else if(  edge.data.time.type != 'transport' ){

					V[ edge.data.in ] = Math.min( Vo[ edge.data.in ] , Vo[ edge.data.out ] + edge.data.time.t );

				}

			} );

			//update Vo
			Vo = JSON.parse(JSON.stringify(V));

		}

		return Vo;

	}



	/**
	 * Return the best meetpoint for an array of users.
	 *
	 *
	 * @this {Map}
	 * @param {object array} userArray an array of users
	 */
	this.chooseBest = function( UserArray ){

		var find = false ;
		var bestValue = -1 ;
		var res ;
		var wt = this.worseTime ;
		this.db( { "type":"point" } ).each( function(node){

			var value = wt( UserArray , node.data ) ;

			if( value < bestValue || find == false ){

				find = true;
				best = value;
				res = node.data;

			}

		} );

		return res;

	}
	
	
	
};
