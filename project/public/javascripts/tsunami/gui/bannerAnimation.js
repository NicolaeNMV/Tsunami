(function(){
    
  /*
  var bannerAnimate = function() {
    $('#main').prepend('<div id="bannerCanvas"><canvas></canvas></div>');
    var canvas = $('#bannerCanvas canvas')[0];
    if(!canvas || !canvas.getContext)
      return;
    
    var ctx = canvas.getContext('2d');
    var waves = ["rgba(157, 187, 210, 0.2)", "rgba(130, 190, 215, 0.25)", "rgba(110, 205, 220, 0.3)"];
    var i = 0;

    var draw = function() {
      canvas.width = canvas.width;
      for(var j = waves.length - 1; j >= 0; j--) {
        var offset = i + j * Math.PI * 20;
        var randomLeft = Math.abs(Math.pow( Math.sin(offset/100), 2 )) * 120;
        var randomRight = Math.abs(Math.pow( Math.sin((offset/100) + 10), 2 )) * 120;
        var randomLeftConstraint = Math.abs(Math.pow( Math.sin((offset/90)+2), 2 )) * 160;
        var randomRightConstraint = Math.abs(Math.pow( Math.sin((offset/90)+1), 2)) * 160;

        ctx.fillStyle = (waves[j]);
        ctx.beginPath();
        ctx.moveTo(0, randomLeft + 10);
        ctx.bezierCurveTo(canvas.width / 3, randomLeftConstraint, canvas.width / 3 * 2, randomRightConstraint, canvas.width, randomRight + 10);
        ctx.lineTo(canvas.width , canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.lineTo(0, randomLeft + 10);
        ctx.closePath();
        ctx.fill();
        i++;
      }
    };
    setInterval(draw, 30);
  }
  $(document).ready(bannerAnimate);*/
}());
