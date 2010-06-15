tsunami.tools.namespace('tsunami.auth');

(function() {
  
  var validation = tsunami.tools.validation;
  var auth  = tsunami.auth;
  
  auth.login = function() {
    
    // Ajax //
    
    var send = function() {
      $.ajax({
        url: '/login',
        type: 'post',
        dataType: 'json',
        data: {
          login: $('input[name=login]').val(),
          password: $('input[name=password]').val()
        },
        success: function(data) {
          window.location.pathname='/';
        },
        error: function(data) {
          var json=eval(data.responseText);
          if(json!=undefined && json[0])
            tsunami.tools.validation.showErrors(json, $('.authBox form'));
          else
            validation.globalError('Identifiant ou mot de passe incorrect.', $('.authBox form'));
        }
      });
      return false;
    };
    
    return {
      init : function() {
        $('input[name=login]').focus();
        $("#loginBox form").submit(send);
      }
    }
  }();
  $().ready(auth.login.init);
  
  auth.register = function() {
    
    // Ajax //
    
    var send = function() {
      $.ajax({
        url: '/register',
        type: 'post',
        dataType: 'json',
        data: {
          username: $('input[name=username]').val(),
          password: $('input[name=password]').val(),
          email   : $('input[name=email]'   ).val()
        },
        success: function(data) {
          window.location.pathname='/';
        },
        error: function(data) {
          var json=eval(data.responseText);
          if(json!=undefined && json[0])
            validation.showErrors(json, $('.authBox form'));
          else
            validation.showErrors(
            [{ message:'Cet identifiant existe déjà.',
               key:'username' }], $('.authBox form'));
        }
      });
    };
    
    return {
      init : function() {
        $('input[name=username]').focus();
        $("#registerBox form").submit(function() {
          if( $('input[name=password]').val() == $('input[name=passwordAgain]').val() )
            send();
          else
            validation.showErrors(
              [{ message:'Vous devez tapez le même mot de passe que dans le champ Mot de passe.',
                 key:'passwordAgain' }], $('.authBox form'));
             
          return false;
        });
      }
    }
  }();
  $().ready(auth.register.init);
  
  auth.logoutMessage = function() {
    return {
      init: function() {
        if(window.location.hash!='#logout') return;
        $('#main').prepend('<div id="logoutMessage" style="left: '+(($(window).width()-500)/2)+'px"><span>Déconnecté avec succès</span></div>');
        $('#logoutMessage').hide().slideDown(500);
        setTimeout(function(){ 
          $('#logoutMessage').slideUp(1000); 
          window.location.hash='';
        }, 5000);
      }
    }
  }();
  $().ready(auth.logoutMessage.init);
  
  auth.bannerAnimation = function() {
			var canvas = null;
			var ctx = null;
			var h1 = null;
      
			/**
			 * (xDelay, yDelay) is the bottom left position of the wave to trace
			 * width and height define the size of the wave
			 */
			var traceUpVague = function(width, height, xDelay, yDelay) {
				var baseY = yDelay;
				var y = height / 5;
				var x = width / 10;
				ctx.beginPath();
				ctx.moveTo(xDelay, yDelay);
				ctx.lineTo(xDelay+x*2, yDelay);
				ctx.bezierCurveTo(xDelay+x*2, yDelay, xDelay+x*2, yDelay-height, xDelay+x*7, yDelay-4*y);
				ctx.bezierCurveTo(xDelay+x*5, yDelay-2*y, xDelay+x*6, yDelay, xDelay+x*8, yDelay);
				ctx.lineTo(xDelay+width, yDelay);
				ctx.stroke();
			};
      
			var traceSubVague = function(width, height, xDelay, yDelay) {
				var y = height / 5;
				var x = width / 10;
				ctx.beginPath();
				ctx.moveTo(xDelay+x*3, yDelay);
				ctx.bezierCurveTo(xDelay+x*3, yDelay-y*2, xDelay+x*3, yDelay-4*y, xDelay+x*5, yDelay-4.5*y);
				ctx.bezierCurveTo(xDelay+x*4, yDelay-y*2, xDelay+x*5, yDelay, xDelay+width, yDelay);
				ctx.fill();
				ctx.beginPath();
				ctx.moveTo(xDelay, yDelay);
				ctx.lineTo(xDelay+width, yDelay);
				ctx.stroke();
			};
			
			var traceVague = function(width, height, xCenter, yBase, alpha) {
				var size = Math.floor(height);
				var x = Math.floor(xCenter-size/2);
				var y;
				ctx.strokeStyle='rgba(10,100,190,'+(alpha||1)+')';
				ctx.lineWidth = height/8;
				traceUpVague(size, size/2, x, yBase);
				ctx.beginPath();
				ctx.moveTo(0, yBase);
				ctx.lineTo(x, yBase);
				ctx.moveTo(x+size, yBase);
				ctx.lineTo(width, yBase);
				ctx.stroke();
				ctx.lineWidth = height/12;
				ctx.beginPath();
				y = Math.floor(yBase+height/4);
				ctx.moveTo(0, y);
				ctx.lineTo(width, y);
				ctx.stroke();
				ctx.strokeStyle=ctx.fillStyle='rgba(60,170,255,'+(alpha||1)+')';
				y = Math.floor(yBase+height/7);
				traceSubVague(size, size/2, x, y);
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(x, y);
				ctx.moveTo(x+size, y);
				ctx.lineTo(width, y);
				ctx.stroke();
				ctx.strokeStyle='#0865BF';
			};
      
      var repositionTsunamiName = function() {
        h1.css('left', Math.floor(($(window).width()-h1.width())/2)+'px');
      };
			
			return {
				init: function() {
          h1 = $('h1');
          h1.css('position','absolute');
					h1.before('<div id="bannerCanvas"><canvas></canvas></div>');
					canvas = $('#bannerCanvas canvas')[0];
					if(!canvas || !canvas.getContext)
						return;
					ctx = canvas.getContext('2d');
          
					setInterval(function() {
						var currentTime = new Date().getTime();
						canvas.width = canvas.width;
						var heightOn4 = canvas.height/4;
						traceVague(canvas.width, canvas.height, ((currentTime)/7)%(canvas.width+canvas.height)-2*heightOn4, 2.75*heightOn4, .9);
            var offset = canvas.height/2;
						
						var letter = $('span', h1);
						var top = Math.floor((1+Math.cos(currentTime/500))*offset/2)+10;
						h1.css('top', top+'px');
					}, 30);
          
          repositionTsunamiName();
          $(window).resize(repositionTsunamiName);
				}
			}
		}();
    $(document).ready(auth.bannerAnimation.init);
}());
