tsunami.tools.namespace('tsunami.comet');

(function() {
	// set up stomp client.
	var comet = tsunami.comet;
	var stomp = comet.stomp = new STOMPClient();
    
	/**
		Trigger custom jQuery events from stomp events
	**/

	// We can send data (ex. subscribe), only when stomp is opened
	stomp.onopen = function() {
	    $(document).trigger('comet.open');
	};
	stomp.onclose = function(code) {
		$(document).trigger('comet.close', code);
	};
	stomp.onerror = function(error) {
		$(document).trigger('comet.error', error);
	};
	// @to delete
	/*stomp.onerrorframe = function(frame) {
	    alert("onerrorframe: " + frame.body);
	};*/
	stomp.onconnectedframe = function() {
		$(document).trigger('comet.connect');
	};
	// frame contain more data than body
	stomp.onmessageframe = function(frame) {
		var data = frame.body;
		$(document).trigger('comet.message', data);
		
		
		// Copy&paste of jQuery code ;]
		if (/^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
			.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
			.replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {

			// Try to use the native JSON parser first
			if ( window.JSON && window.JSON.parse ) {
				data = window.JSON.parse( data );

			} else {
				data = (new Function("return " + data))();
			}

		} else {
			throw "Invalid JSON: " + data;
		}
		
	    // Event name construction,
	    $(document).trigger('comet.event.'+data.event, data.data);
	};

	/**
		Connection
	**/
	var currentUser = tsunami.export.currentUser;

	$(document).bind('comet.connect',function() {
		stomp.subscribe('/events/'+currentUser.userid, {exchange:''});
	});

	$(document).ready(function() {
		if(!window.TCPSocket) { // If the browser doesn't support the sockets (html5)
			document.domain=document.domain;
			Orbited.settings.port = 8001;
			TCPSocket = Orbited.TCPSocket;
		}
		stomp.connect('localhost', 61613, currentUser.userid, '');
	});

	$(document).unload(function() {
	// stomp.reset();
	});
}());
