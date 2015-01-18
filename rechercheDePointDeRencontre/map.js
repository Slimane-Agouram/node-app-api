
function Map(){ 

	
	this.db = TAFFY();
	
	
	
	/*this.loadMap = function( data ){
		
		for(var i=0 ; i<data.map.points.length ; i++){
			
			this.db.insert( { type:"point" , data: data.map.points[i] } )
			
		}
		
		for(var i=0 ; i<data.map.edges.length ; i++){
			
			this.db.insert( { type:"edge" , data: data.map.edges[i] } )
			
		}
			
	};
	
	
	
	
	this.worseDistance = function( UserArray , point ){
		
		var res = -1 ;
		for( var i=0 ; i < UserArray.length ; i++ ){
			
			var d = GEO.computeDistance(point.lat , point.lng , UserArray[i].lat , UserArray[i].lng);
			
			if( res == -1 )res = d;
			else res = Math.max(res , d)
			
		}
		return res;
		
	}
	
	
	
	
	this.worseTime = function( UserArray , point ){
		
		var res = -1 ;
		for( var i=0 ; i < UserArray.length ; i++ ){
			
			var t = UserArray[i].vector[ point.id ];
			
			if( res == -1 )res = t;
			else res = Math.max(res , t)
			
		}
		return res;
		
	}


	
	
	
	this.naiveBestAdresse = function( UserArray ){

		var find = false ;
		var bestValue = -1 ;
		var res ;
		var wd = this.worseDistance ;
		this.db( { "type":"point" } ).each( function(node){

			var value = wd( UserArray , node.data ) ;

			if( value < bestValue || find == false ){

				find = true;
				best = value;
				res = node.data;

			}

		} );

		return res;

	}*/



	this.computeV = function( User ){

		var MAX_NB_STEP = 3 ;

		var Vo = {};
		var wd = this.worseDistance ;

		this.db( { "type":"point" } ).each( function(node){

			Vo[ node.id ] = GEO.computeDistance(node.data.lat , node.data.lng , User.lat , User.lng);
			Vo[ node.id ] /= 1.2 ;

		} );

		for( var step = 1 ; step < MAX_NB_STEP ; step ++ ){

			var V = JSON.parse(JSON.stringify(Vo));
			this.db( { "type":"edge" } ).each( function(edge){

				if( (User.useTransports==true) ){

					V[ edge.data.in ] = Math.min( Vo[ edge.data.in ] , Vo[ edge.data.out ] + edge.data.time.t );

				}
				else if(  edge.data.time.type != 'transport' ){

					V[ edge.data.in ] = Math.min( Vo[ edge.data.in ] , Vo[ edge.data.out ] + edge.data.time.t );

				}

			} );
			Vo = JSON.parse(JSON.stringify(V));

		}

		return Vo;

	}


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
