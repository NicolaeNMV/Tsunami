 tsunami.tools.namespace('tsunami.profile');

(function(){
  var profile = tsunami.profile;
  var tools = tsunami.tools;
  
  profile.Main = function() {
    
    var updatePosition = function() {
      var profile = $('#profile');
      var profilelink = $('#banner a.profile');
      if(profile.size())
        profile.css({
          top: $("#application").offset().top, 
          left: profilelink.offset().left + profilelink.width() - profile.width() - 4
        });
    };
    
    var toggleProfile = function(override){
      var profile = $('#profile');
      if(typeof(override)!="undefined" && !override || typeof(override)=="undefined" && profile.is(':visible')) {
        profile.hide();
        $('#banner a.profile').removeClass('folded');
      }
      else {
        $('#banner a.profile').addClass('folded');
        updatePosition();
        profile.show();
      } 
    };
    
    return {
      toggleProfile: toggleProfile,
 
      init: function() {
        $(window).resize(updatePosition);
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
        $('#profile .changeAvatar form').bind('filePosted', function(){
          tsunami.contacts.List.touchAvatar(tsunami.export.currentUser.userid);
        })
      }
    }
  }();
  
  $(document).ready(profile.Main.init);
  
}());