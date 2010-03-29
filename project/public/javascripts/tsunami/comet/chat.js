tsunami.tools.namespace('tsunami.chat');

(function() {
	var ajax = tsunami.tools.Router.ajax;
	var stomp = tsunami.comet.stomp;
	

  tsunami.chat= function() {
	// anytext_id, id that follow after _ will be returned, you cannot have _ in anytext
	var extractUserId = function(s) {
		return s.substr(s.indexOf("_")+1);
	}

	return {
		init: function() {
			$(document).bind('comet.connect', function() {
				// Envoi de message a soi meme ;)
				// $.post("/chat/send", { userid: tsunami.export.currentUser.userid, msg: "Hello world" } );
			});
			
			$(document).bind('comet.event.chat.msg',function(e,data) {
				alert(data);
			});
			$(document).bind('window.contactList.ready',function() {
				$('#contactList .contact .chat.action').live('click',function() {
					var id = $(this).parents('.contact:first').attr('id');
					var msg = prompt("Message to send");
					if (msg) {
						$.post("/chat/send", { userid: extractUserId(id), msg: msg } );
					}
				});
			});
		}
	}
  }()

  $(document).ready(tsunami.chat.init);
 
}());
