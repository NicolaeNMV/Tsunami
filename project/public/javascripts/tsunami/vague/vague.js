tsunami.tools.namespace('tsunami.vagues');

(function(){

  var vagues = tsunami.vagues;
  var tools = tsunami.tools;
  var ajax = tsunami.tools.Router.ajax;
  var esc = tools.escapeHtml;
  var log = tsunami.tools.log;
  
  var Period = tsunami.tools.Period;
  
  var dmp = (function() {
  	var dmp = new diff_match_patch();
  	dmp.Diff_Timeout = 1;
	  dmp.Diff_EditCost = 4;
	  return dmp;
  }());
  
  vagues.History = function() {
    
    var node2vagueletteId = function(node) {
      return $(node).attr('id').substring(11);
    };
    
    var tpl_viewing = function() {
      return '<header>'+
        '<a href="javascript:;" class="editMode" title="Editer la vaguelette">Editer la vaguelette</a>'+
        '<a class="folder" href="javascript:;">&nbsp;</a>'+
      '</header>'+
      '<div class="participant"> </div>'+
      '<img class="loading" src="/public/images/loadingVaguelette.gif" />'+
      '<nav>'+
        '<div class="sliderContainer"><div class="slider"> </div></div>'+
        '<div class="infos">'+
          '<span class="time"> </span>'+
          '<span class="step"> </span>'+
        '</div>'+
      '</nav>'+
      '<div class="content">'+
      '</div>';
    };
    
    var getHistoryIndexByVersion = function(histories, version) {
      for(var h in histories)
        if(histories[h].version == version)
          return h;
      return -1;
    }
    
    var onListVagueletteHistories = function(vagueletteNode, vaguelette) {
      if(!vaguelette.histories)
        vaguelette.histories = [];
      
      computeHistories(vaguelette.histories);
      $(vagueletteNode).data('vaguelette', vaguelette);
      $('> .viewing .loading', vagueletteNode).remove();
      
      var onSlide = function(e, ui) {
        var vagueletteNode = $(this).parents('.vaguelette');
        var vaguelette = $(vagueletteNode).data('vaguelette');
        var h = getHistoryIndexByVersion(vaguelette.histories, ui.value);
        if(h==-1) return;
        var history = vaguelette.histories[h];
        var historyBefore = h==0 ? {text: ""} : vaguelette.histories[h-1];
        var date = new Date(history.timestamp);
        $('> .viewing .participant', vagueletteNode).text(history.username);
        $('> .viewing .time', vagueletteNode).text(Period.tpl_dayAndHour(date));
        $('> .viewing .step', vagueletteNode).text((1+ui.value)+' sur '+vaguelette.histories.length);
        $('> .viewing .content', vagueletteNode).empty().html(boldDiff(historyBefore.text, history.text));
     };
    
      var slider = $('> .viewing .slider', vagueletteNode).slider({
        max: vaguelette.histories.length-1,
        slide: onSlide
      });
      onSlide.call(slider, null, {value: slider.slider('value'), handle: $('.ui-slider-handle', slider)});
    };
    
    var createHistory = function(node) {
      $('> .viewing', node).append(tpl_viewing());
      ajax('VagueletteHistories.list', {vagueletteId: node2vagueletteId(node)}, function(vaguelette) {
        onListVagueletteHistories(node, vaguelette);
      });
    };
    
    var computeHistories = function(histories) {
      for(var h=0; h<histories.length; ++h)
        histories[h].text = dmp.patch_apply(dmp.patch_fromText(histories[h].body), h==0 ? "" : histories[h-1].text)[0];
    };
    
    var boldDiff = function(currentText, oldText) {
      if(!currentText) return "";
      if(!oldText) oldText = "";
      var d = dmp.diff_main(currentText, oldText);
      dmp.diff_cleanupSemantic(d);
      var ds = dmp.diff_prettyHtml(d);
      return ds;
    };
    
    var setMode = function(vaguelette, on) {
      vaguelette = $(vaguelette);
      if(on) {
        $(vaguelette).addClass('historyOn');
        $('> .viewing', vaguelette).empty();
        createHistory(vaguelette);
      }
      else {
        $(vaguelette).removeClass('historyOn');
      }
    }
    
    return {
      init: function() {
        $('#vague .vaguelette .viewHistory').live('click', function(){
          setMode($(this).parents('.vaguelette:first'), true);
        });
        $('#vague .vaguelette .editMode').live('click', function(){
          setMode($(this).parents('.vaguelette:first'), false);
        });
      }
    }
  }();
  $(document).ready(vagues.History.init);
  
  
  vagues.Participants = function() {
    
    var onAddNewParticipantClick = function() {
      var offset = $('#vague .addNewParticipant').offset();
      var node = $('#addNewParticipant');
      node.css({top: offset.top-10, left: offset.left-node.width()-20});
      node.show();
      $('ul',node).append('<li>Chargement...</li>');
      
      ajax("Contacts.getAllContacts", null, function(groupedContacts) {
        var ulContact = "";
        var contacts = [];
        for(var g in groupedContacts.groups)
          for(var c in groupedContacts.groups[g].contacts) {
            var contact = groupedContacts.groups[g].contacts[c];
            if($('#vague .users-list .user[rel='+contact.userid+']').size()==0)
              contacts.push(contact);
          }
        
        for(var c in contacts) {
          var contact = contacts[c];
          ulContact += '<li class="user" rel="'+contact.userid+'" title="'+contact.username+'">'+
          '<img class="avatar" src="/contacts/'+contact.userid+'/avatar/small.png"  />'+
          '<span class="username">'+contact.username+'</span>'+
          '</li>';
        }
        
        if(contacts.length==0)
          ulContact = "Aucun contact ne peut être ajouté.";
        
        $('ul',node).empty().append(ulContact);
      })
    };
    
    var onUserAddClick = function(e) {
      var target = $(e.target);
      if(!target.is('.user')) {
        target = target.parents().filter('.user');
      }
      var userid = target.attr('rel');
      addParticipant(userid, function() {
        target.appendTo('#vague .users-list ul'); // move node to vague user-list
      });
    };
    
    // ajax
    var addParticipant = function(userid, callback) {
      var vague = vagues.Vague.getCurrentVague();
      if(!vague) return;
      var vagueId = vague.id;
      ajax('Vagues.inviteUser', {vagueId: vagueId, userid: userid}, callback);
    };
    
    return {
      init: function() {
        $('#vague .addNewParticipant').live('click', onAddNewParticipantClick);
        $('#addNewParticipant .user').live('click', onUserAddClick);
        $(document).click(function(e){
          var target = $(e.target);
          if(!target.is('.addNewParticipant') && (!target.parents().is('#addNewParticipant') && !target.is('#addNewParticipant')))
            $('#addNewParticipant').hide();
        });
      }
    }
  }();
  $(document).ready(vagues.Participants.init);
  
  vagues.Vague = function() {

    // PRIVATE //
    
    var vagueNode = null;
    
    var g_vague = null;
    
    // Utils //
    
    var string2vagueletteId = function(str) {
      return str.substring(11);
    };
    var vagueletteId2string = function(vagueletteId) {
      return 'vaguelette_'+vagueletteId;
    };
    var vagueletteId2node = function(vagueletteId) {
      return $('#'+vagueletteId2string(vagueletteId));
    };
    
    // Templates //
    
    var tpl_exit = function() {
      return '<a class="closeVague"><img src="/public/images/cancel.png"/></a>';
    };
    
    var tpl = function() {
      return '<div class="theme theme-box level-40 radius">'+
          '<div class="head">&nbsp;<span class="title"></span>'+tpl_exit()+'</div>'+
          '<div class="body vagueContainer"> </div>'+
          '</div>';
    };
    
    var tpl_close_mode = function() {
    return ('<form class="fastCreate">'+
		      '<button>'+tools.i18n('vagues.button.create')+'</button>'+
	      '</form>');
    };
    
    
    var updateVagueParticipants = function(participants){
      var ul = $('.users-list ul',vagueNode);
      $('li.user',ul).remove();
      
      for(var p in participants) {
        var participant = participants[p];
        ul.append('<li rel="'+participant.userid+'" class="user" title="'+participant.username+'">'+
        '<img class="avatar" src="/contacts/'+participant.userid+'/avatar/small.png"  />'+
        '<span class="username">'+participant.username+'</span>'+
        '</li>');
      }
    };
    
    var tpl_vague = function(vague) {
      return ( '<div class="users-list">'+
      '<ul><li title="Ajouter"><a href="javascript:;" class="addNewParticipant" alt="Ajouter">&nbsp;</a></li></ul>'+
      '</div>'+
      '<ul class="vaguelettes"></ul>'+
      '<a href="javascript:;" class="createVaguelette">Ajouter une vaguelette</a>');
    };
    
    var updateVagueletteParticipants = function(participants, vagueletteNode) {
      var node = $('ul.participants:first', vagueletteNode);
      var recentTime = 10*1000;
      node.empty();
      var now = new Date().getTime();
      for(var p in participants) {
        var participant = participants[p];
        var isRecent = (now-participant.timestamp)<recentTime;
        var li = $('<li '+(!isRecent?'':'class="recent"')+'>'+participant.username+'</li>');
        if(isRecent) {
          setTimeout(function(node){
            node.removeClass('recent');
          }, recentTime-(now-participant.timestamp), li);
        }
        node.append(li);
      }
    }
    
    var tpl_vaguelette = function(v) {
      var view = tools.i18n('vaguelette.history.view');
      return ('<li class="vaguelette" id="'+vagueletteId2string(v.id)+'">'+
        '<div class="editing">'+
          '<header>'+
        '<a href="javascript:;" class="viewHistory" title="'+view+'">'+view+'</a>'+
        '<a class="folder" href="javascript:;">&nbsp;</a>'+
      '</header>'+
          '<ul class="participants"> </ul>'+
          '<textarea rows="1">'+(v.body||"")+'</textarea>'+
        '</div>'+
        '<div class="viewing">'+
        '</div>'+
        '<ul class="vaguelettes"></ul>'+
        '<a href="javascript:;" class="createVaguelette">Répondre ici</a>'+
      '</li>');
    };
        
    // Dynamic actions
    
    var setCloseVisibility = function(show) {
      var node = $('.closeVague', vagueNode);
      if(show) node.show();
      else node.hide();
    };
    
    var appendVaguelette = function(vaguelette) {
      var node = $(tpl_vaguelette(vaguelette));
      updateVagueletteParticipants(vaguelette.participants,node);
      var textarea = $('textarea:first', node);
      textarea.data('object',vaguelette)
      var appendTo = (vaguelette.parentId==0) ? $('.vagueContainer > .vaguelettes', vagueNode) : $('.vaguelettes:first', vagueletteId2node(vaguelette.parentId));
      $(appendTo).append(node);
      bindVaguelette(textarea);
    };
    
    var updateHeight = function() {
      var node = $('.vagueContainer', vagueNode);
      if(!node[0] || !g_vague) return;
      var height = Math.floor($(window).height()-node.offset().top);
      node.css('height', height+'px');
    };
    
    var reloadVagueParticipants = function() {
      if(!g_vague) return;
      getVagueParticipants(g_vague.id, function(participants){
        updateVagueParticipants(participants);
      });
    };
    
    // EVENTS //
    
    var onVagueletteAddClick = function() {
      var vagueletteContext = $(this).parents().filter('.vaguelettes').size();
      var nodeToAppend = vagueletteContext ? string2vagueletteId($($(this).parents('.vaguelette')[0]).attr('id')) : 0;
      createVaguelette(g_vague.id, "", nodeToAppend);
      return false;
    };
    
    // from ajax
    
    var onAddVague = function(e, vague) {
      vagues.Vague.open(vague.id);
    };
    
    var onGetVague = function(vague) {
      g_vague = vague;
      $(document).trigger('vague.get', vague);
      $('.vagueContainer', vagueNode).empty().append(tpl_vague(vague));
      updateVagueParticipants(vague.participants);
      bindOpenMode();
      
      for( var v in vague.vaguelettes )
        appendVaguelette(vague.vaguelettes[v]);
      
      updateHeight();
      $(document).trigger('vague.opened', g_vague.id);
    };
    
    var onEditVaguelette = function(vaguelette) {
      
    };
    
    var onCreateVaguelette = function(vaguelette) {
      appendVaguelette(vaguelette);
    };
    
    // AJAX //
    
    var getVague = function(vagueid) {
      ajax('Vagues.show', {vagueId:vagueid}, onGetVague);
    };
    
    var createVaguelette = function(vagueid, body, vagueletteParentId) {
      var data = {vagueId:vagueid};
      if(body) data.content = body;
      if(vagueletteParentId) data.vagueletteParentId = vagueletteParentId;
      ajax('Vaguelettes.create', data, onCreateVaguelette);
    };
    
    var editVaguelette = function(vagueletteid, body) {
      var data = {vagueletteId:vagueletteid};
      if(body) data.content = body;
      ajax('Vaguelettes.edit', data, onEditVaguelette);
    };
    
    var getVagueletteParticipants = function(vagueletteId, callback) {
      getVaguelette(vagueletteId, function(v){
        callback(v.participants);
      });
    };
    var getVaguelette = function(vagueletteId, callback) {
      ajax('Vaguelettes.view', {vagueletteId: vagueletteId}, callback);
    };
    
    var getVagueParticipants = function(vagueId, callback) {
      ajax('Vagues.getParticipants', {vagueId: vagueId}, callback);
    };

    
    // Binders //
    var bindVaguelette = function(textarea) {
        tsunami.vagues.sync.bindTextarea(textarea);
        textarea.autoResize().trigger('change.dynSiz');
    };
    
    var bindCloseMode = function() {
      $('form.fastCreate', vagueNode).submit(function(){
        ajax('Vagues.create', {subject: ''}, function(data){
          $(document).trigger('vague.create', data);
        });
        return false;
      });
    };
    
    var bindEvents = function() {
      $(document).bind('vague.create', onAddVague);
      $(window).resize(updateHeight);
      $('#vague .vaguelette .folder').live('click', function(){
        $(this).parents('.vaguelette:first').toggleClass('folded');
      });
    };
    
    var bindOpenMode = function() {
      $('.createVaguelette', vagueNode).live('click', onVagueletteAddClick);
    };
    
    var reloadVagueletteParticipants = function(vagueletteId) {
      getVagueletteParticipants(vagueletteId, function(participants) {
        updateVagueletteParticipants(participants, vagueletteId2node(vagueletteId));
      });
    };
    
    return {

      // Public //
      
      getCurrentVague: function() {
        return g_vague;
      },
      
      init: function() {
        $(document).bind('WindowManager.ready', function() {
          vagueNode = $('#vague');
          vagueNode.empty().append(tpl());
          $('.closeVague', vagueNode).click(vagues.Vague.close);
          bindEvents();
          updateHeight();
          vagues.Vague.close();
          $(document).trigger('window.vague.ready');
          $(document).bind('comet.event.vaguelette.edit',function(e,data){touchVaguelette(data)});
        });
      },
      
      close: function() {
        $('.vagueContainer', vagueNode).empty().append(tpl_close_mode());
        setCloseVisibility(false);
        bindCloseMode();
        if(g_vague)
          $(document).trigger('vague.closed', g_vague.id);
        g_vague = null;
      },
      
      open: function(vagueid) {
        getVague(vagueid);
        setCloseVisibility(true);
      },
      reloadVagueletteParticipants: reloadVagueletteParticipants,
      reloadVagueParticipants: reloadVagueParticipants,
    }
  }();

  $(document).ready(vagues.Vague.init);
  
}());
