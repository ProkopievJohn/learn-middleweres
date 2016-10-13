var http = require('http');

var middleware = {};

/*=============check favicon============*/
middleware.middleware0 = function () {
	return function ( req, res, next ) {
		if ( req.url.indexOf( 'favicon' ) ) {
			res.writeHead( 404, { 'Content-Type': 'text/plain' } );
			res.end( '' );
		} else {
			next();
		}
	}
}

/*===========split url and normalize==========*/
middleware.middleware1 = function () {
	return function ( req, res, next ) {
		var normalizedUrl = {};

		var urlParts = req.url.split( '?' );

		normalizedUrl.uri = urlParts[0];
		normalizedUrl.query = {};

		var params = urlParts[1] ? urlParts[1].split( '&' ) : [];
		var param = undefined;

		for ( var i = 0; i < params.length; i++ ) {
			param = params[i].split( '=' );
			normalizedUrl.query[param[0]] = param[1];
		}

		req.normalizedUrl = normalizedUrl;
		next();
	}
}

/*===========do something==========*/
middleware.middleware2 = function () {
	return function ( req, res, next ) {
		setTimeout( function () {
			req.something = 'something data for next middleware';
			next();
		}, 2000 )
	}
}

var app = {
	callbacks: [],

	use: function ( middleware ) {
		this.callbacks.push( middleware );
	},

	server: function () {
		return http.createServer( function ( req, res ) {
			var currentPos = 0;
			console.log( req.url );
			var next = function () {
				var pos = currentPos;
				if( app.callbacks.length > currentPos ) {
					currentPos++;
					app.callbacks[pos].apply( null, [req, res, next] );
				}
			}
			next();
		})
	}
}

app.use( middleware.middleware0() );
app.use( middleware.middleware1() );
app.use( middleware.middleware2() );

/*======use normalizedUrl and something======*/
app.use( function( req, res ) {
	console.log(req.normalizedUrl, req.something);
	res.end('helloworld!!!!');
});

app.server().listen(3000, 'localhost');