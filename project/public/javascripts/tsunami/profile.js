 tsunami.tools.namespace('tsunami.profile');

(function(){
  var profile = tsunami.profile;
  var tools = tsunami.tools;
  
  profile.Main = function() {
  
    var toggleProfile = function(override){
      var profile = $('#profile');
      if(typeof(override)!="undefined"&&!override
      || typeof(override)=="undefined"&&profile.is(':visible')) {
        profile.hide();
        $('#banner a.profile').removeClass('folded');
      }
      else {
        var profileLink = $('#banner a.profile').addClass('folded');
        profile.css({
          top: $("#application").offset().top, 
          left: profileLink.offset().left + profileLink.width() - profile.width() + 16
        });
        profile.show();
      } 
    };
    
    return {
      init: function() {
        $('#banner a.profile').click(function(){
          toggleProfile();
        })
        $(document).click(function(e){
          var target = $(e.target);
          if(target.parents('#profile').size() || !target.is('#profile') && !target.is('a.profile'))
            toggleProfile(false);
        });
      }
    }
  }();
  
  $(document).ready(profile.Main.init);
  
}());