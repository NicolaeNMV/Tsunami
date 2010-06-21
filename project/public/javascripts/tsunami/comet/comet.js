tsunami.tools.namespace('tsunami.comet');

(function() {
	// set up stomp client.
	var comet = tsunami.comet;
	var stomp = comet.stomp = new STOMPClient();
	comet.connected = false;
    comet.unloadingPage = false;
    var debug = false;
    
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
		
	    
        if (debug) {
            console.log("comet.event."+data.event);
            console.log(data.data);
        }
        // Event name construction
	    $(document).trigger('comet.event.'+data.event, data.data);
	};

	/**
		Connection
	**/
	var currentUser = tsunami.export.currentUser;

	$(document).bind('comet.connect',function() {
		stomp.subscribe('/events/'+currentUser.userid, {exchange:''});
		comet.connected = true;
	});
	$(document).bind('comet.close',function() {
        if (comet.unloadingPage) return;
		comet.connected = false;
		comet.connect();
	});
	
	comet.setup = function () {
		if(!window.TCPSocket) { // If the browser doesn't support the sockets (html5)
			document.domain=document.domain;
			Orbited.settings.port = 8001;
			TCPSocket = Orbited.TCPSocket;
		}
	}
	
	comet.firstConnect = false;
	comet.connectTimerWait = false; // mutex
	// This will try to connect until the connection is enstablished
	comet.connect = function() {
		if (comet.connectTimerWait == true) return;
		comet.connectTimerWait = true;
		
		if (comet.connected == true) {
			comet.connectTimerWait = false;
			return;
		}
		if (comet.firstConnect == true) stomp.reset();
		else comet.firstConnect = true;
		
		stomp.connect('localhost', 61613, currentUser.userid, '');
		
		setTimeout(function(){comet.connectTimerWait=false;comet.connect()},2500);
	}

	$(document).ready(function() {
		comet.setup();
		comet.connect();
	});
    window.onbeforeunload = function() {
        comet.unloadingPage = true;
        //stomp.reset();
        return;
    }
	/*$(document).unload(function() {
		stomp.reset();
	});*/
}());

// A global function
function remoteBind(event,func) {
	return $(document).bind('comet.event.'+event,func);
}