tsunami.tools.namespace('tsunami.contacts');

(function(){

  var contacts = tsunami.contacts;
  var tools = tsunami.tools;
  var ajax = tsunami.tools.Router.ajax;
  var esc = tools.escapeHtml;
  var log = tsunami.tools.log;
  
  contacts.Utils = {
    getAvatarTimestamp: function(node) {
      var now = new Date();
      if(!node || !$(node)[0])
        return now.getTime();
      var imgSrc = $(node).attr('src');
      var timestamp = null;
      if(imgSrc) {
        var spl = imgSrc.split('?');
        if(spl.length==2)
          timestamp=spl[1];
      }
      return timestamp || now.getTime();
    }
  };
  
  /**
   * Manage the Avatar on mouse over effect
   */
  contacts.AvatarPopup = function() {

    // Private //
    var g_nodeid = 'contactListAvatarPopup';
    var g_node = null;

    var g_userid=null;
    var g_posx=0;
    var g_posy=0;
    
    var tpl_avatar = function(userid, size, timestamp) {
      return '<img src="'+tools.Router.url('Contacts.getAvatar', {size:size, userid:userid})+(timestamp?('?'+timestamp):'')+'" />';
    };
    var make = function() {
      if(!g_node) {
        $('#application').append('<div id="'+g_nodeid+'" />');
        g_node = $('#'+g_nodeid);
      }
      if(g_userid) {
        /* 
         * Apply the same timestamp used at small avatar load to force the large avatar reload.
         */
        var timestamp = contacts.Utils.getAvatarTimestamp('#'+contacts.List.userid2string(g_userid)+' .avatar img');
        g_node.empty().append(tpl_avatar(g_userid,'large',timestamp));
      }
      updatePosition();
    };
    var updatePosition = function() {
      g_node.css({top: g_posy, left: g_posx});
    };
    var recordArgs = function(userid, posx, posy) {
      if(userid)
        g_userid = userid;
      g_posx = posx+8;
      g_posy = posy+8-$('#application').position().top;
    };

    return {
      init: function() {
        make();
        g_node.hide();
      },
      show: function(userid, posx, posy) {
       recordArgs(userid, posx, posy);
        make();
        g_node.show();
      },
      hide: function() {
        g_node.hide();
      },
      updatePosition: function(posx, posy) {
        recordArgs(null, posx, posy);
        updatePosition();
      }
    }
  }();
    
  $(document).ready(contacts.AvatarPopup.init);
  
  /**
   * Manage the contact add form and effects (auto completion, on the fly validation, ...)
   */
  contacts.ContactAdd = function() {
    
    var g_node = null;
    
    var tpl_contactAdd = function() {
      return ('<div class="addContact theme theme-dark level-20">'+
        '<form>'+
          '<span class="contactLabel">'+tools.i18n('contacts.contact')+' : </span>'+
          '<div style="float:right;">'+
            '<input name="contact" type="text" title="'+tools.i18n('contacts.emailOrUsername')+'"/>'+
            '<button class="ok">'+tools.i18n('form.OK')+'</button>'+
          '</div>'+
        '</form>'+
        '<div class="contactContainer" style="clear:both;"/>'+
        '<span class="info ifHaveContact">'+tools.i18n('contacts.moveContactToAGroup')+'</span>'+
      '</div>');
    };
    
    var show = function() {
      g_node.slideDown(300);
      resizeInput();
      $('input[name=user]',g_node).focus();
      $('.addContactSlider',g_node.parent()).addClass('isOpen');
      $('.text.addContact',g_node.parent()).hide();
      $('.text.close',g_node.parent()).show();
    };
    var close = function() {
      g_node.slideUp(300);
      $('.addContactSlider',g_node.parent()).removeClass('isOpen');
      $('.text.addContact',g_node.parent()).show();
      $('.text.close',g_node.parent()).hide();
    };
    
    var isOpen = function() {
      return $('.addContactSlider',g_node.parent()).hasClass('isOpen');
    };
    
    var resizeInput = function() {
      var width = $('#contactList').width()-$('.contactLabel',g_node).width()-$('.ok',g_node).width()-50;
      $('input',g_node).width(width);
    };
    
    var onAddContact = function(data) {
      $('input[name=user]',g_node).val("");
      close();
      contacts.List.addContact(data.userid);
    };
    
    var onAddContactError = function(data) {
      $('.contactContainer',g_node).empty();
      $('.ifHaveContact',g_node).hide();
      $('form',g_node).after('<div class="error">'+tools.validation.getResponseTextError(data.responseText)+'</div>');
    };
    
    // EVENT
    var onSubmit = function() {
      $('.error', g_node).remove();
      ajax("Contacts.searchContact", {contact: $('input[name=contact]',g_node).val()}, onAddContact, onAddContactError);
      return false;
    };
    
    // BIND
    var bindContactAdd = function() {
      $('form',g_node).submit(onSubmit);
      $('#contactList').resize(function(){
        if(isOpen)
          resizeInput();
      });
    };
    
    return {
      init: function(actionTabBodyNode) {
        g_node = $(actionTabBodyNode);
        g_node.append( tpl_contactAdd() );
        $('.ifHaveContact',g_node).hide();
        g_node.hide();
        bindContactAdd();
      },
      
      show: show,
      close: close
    }
  }();
  
  /**
   * Manage the context menu of the contact list and the current selected user
   */
  contacts.ActionTab = function() {
    
    var g_node = null;
    
    // TEMPLATES
    var tpl_actionTab = function() {
      return ('<div class="body"></div>'+
      '<div class="addContactSlider theme theme-hover theme-dark level-60">'+
        '<span class="close text">Fermer</span>'+
        '<span href="javascript:;" class="addContact text">'+
          '<img class="icon" src="/public/images/user_add.png" />'+
          tools.i18n('contacts.addContact')+
        '</span>'+
      '</div>');
    };
    
    // EVENT
    var onAddContactButtonClick = function(e) {
      contacts.ContactAdd.show();
    };
    
    // BINDS
    var bindActionTab = function() {
      contacts.ContactAdd.init($('.body',g_node));
      $('.text.addContact',g_node).show();
      $('.text.close',g_node).hide();
      $('.addContactSlider',g_node).click(function() {
        if(!$('.addContactSlider',g_node).hasClass('isOpen'))
          contacts.ContactAdd.show();
        else
          contacts.ContactAdd.close();
      });
    };
    
    return {
      init: function(selector) {
        g_node = $(selector);
        g_node.append( tpl_actionTab() );
        bindActionTab();
      }
    }
  }();
  
}());
