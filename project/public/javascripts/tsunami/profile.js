 tsunami.tools.namespace('tsunami.profile');

(function(){
  var profile = tsunami.profile;
  var tools = tsunami.tools;
  
  profile.Main = function() {
  
    var toggleProfile = function(override){
      var profile = $('#profile');
      if(typeof(override)!="undefined" && !override || typeof(override)=="undefined" && profile.is(':visible')) {
        profile.hide();
        $('#banner a.profile').removeClass('folded');
      }
      else {
        var profileLink = $('#banner a.profile').addClass('folded');
        profile.css({
          top: $("#application").offset().top, 
          left: profileLink.offset().left + profileLink.width() - profile.width() - 4
        });
        profile.show();
      } 
    };
    
    return {
      toggleProfile: toggleProfile,
 
      init: function() {
        $('#changePassword form').live('submit', function(){
          $(this).ajaxSubmit({
            success: function(html, status, form){
              $('#changePassword').empty().html(html);
            }
          });
          return false;
        });
        $('#banner a.profile').click(function(){
          toggleProfile();
        })
        $(document).click(function(e){
          var target = $(e.target);
          if(!target.parents().is('.profileEventClickIgnore') && !target.is('.profileEventClickIgnore'))
            toggleProfile(false);
        });
      }
    }
  }();
  
  $(document).ready(profile.Main.init);
  
}());