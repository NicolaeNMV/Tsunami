tsunami.tools.namespace('tsunami.vagues');

(function(){

  var vagues = tsunami.vagues;
  var tools = tsunami.tools;
  var ajax = tsunami.tools.Router.ajax;
  var esc = tools.escapeHtml;
  var log = tsunami.tools.log;
  
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
    
    var tpl_vague = function(vague) {
      var ulParticipants = "<ul>";
      ulParticipants += '<li title="Ajouter"><a href="javascript:;" class="addNewParticipant" alt="Ajouter">&nbsp;</a></li>';
      for(var p in vague.participants) {
        var participant = vague.participants[p];
        ulParticipants += '<li title="'+participant.username+'">'+
        '<img class="avatar" src="/contacts/'+participant.userid+'/avatar/small.png"  />'+
        '<span class="username">'+participant.username+'</span>'+
        '</li>';
      }
      ulParticipants += "</ul>";
      
      return ( '<div id="participants">'+
      ulParticipants+
      '</div>'+
      '<ul class="vaguelettes"></ul>'+
      '<a href="javascript:;" class="createVaguelette">Ajouter une vaguelette</a>');
    };
    
    var tpl_vaguelette = function(v) {
      return ('<li class="vaguelette" id="'+vagueletteId2string(v.id)+'"><textarea rows="1">'+(v.body||"")+'</textarea>'+
          '<ul class="vaguelettes"></ul>'+
          '<a href="javascript:;" class="createVaguelette">Répondre</a>'+
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
      var appendTo = (vaguelette.parentId==0) ? $('.vagueContainer > .vaguelettes', vagueNode) : $('.vaguelettes:first', vagueletteId2node(vaguelette.parentId));
      $(appendTo).append(node);
      bindVaguelette(node);
    };
    
    var updateHeight = function() {
      var node = $('.vagueContainer', vagueNode);
      if(!node[0] || !g_vague) return;
      var height = Math.floor($(window).height()-node.offset().top);
      node.css('height', height+'px');
    };
    
    // EVENTS //
    
    var onVagueletteAddClick = function() {
      var vagueletteContext = $(this).parents().filter('.vaguelettes').size();
      var nodeToAppend = vagueletteContext ? string2vagueletteId($($(this).parents('.vaguelette')[0]).attr('id')) : 0;
      createVaguelette(g_vague.id, "", nodeToAppend);
    };
    
    var onAddNewParticipantClick = function() {
      alert("todo")
    };
    
    // from ajax
    
    var onAddVague = function(e, vague) {
      vagues.Vague.open(vague.id);
    };
    
    var onGetVague = function(vague) {
      g_vague = vague;
      $(document).trigger('vague.get', vague);
      $('.vagueContainer', vagueNode).empty().append(tpl_vague(vague));
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
    
    var dmp = (function() {
    	var dmp = new diff_match_patch();
    	dmp.Diff_Timeout = 1;
		dmp.Diff_EditCost = 4;
		return dmp;
    }());
    
    var bindPatchTextarea = function(conf) {
      textarea = conf.textarea;
      textarea.data('before',textarea.val());
      
      textarea.keyup(function(e) {
        if (textarea.data('before') == undefined) return;
        var text1 = textarea.data('before');
        var text2 = textarea.val();
        textarea.data('before',text2);
        
        var diff = dmp.diff_main(text1, text2);
        dmp.diff_cleanupEfficiency(diff);
		var patch_list = dmp.patch_make(text1, text2, diff);
		patch_text = dmp.patch_toText(patch_list);
		//      conf.vagueletteId
		console.log(patch_text);
      });
    }
    
    // Binders //
    var bindVaguelette = function(node) {
      var id = string2vagueletteId($(node).attr('id'));
      var textarea = $('textarea:first', node);
	  bindPatchTextarea({
	  	textarea: textarea,
	  	vagueletteId: id
	  });
      /*var rtu = new tools.RealTimeUpdate({
        node: textarea,
        update: function(value) {
          editVaguelette(id, value);
        },
        minInterval: 1000
      });*/
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
      $('.addNewParticipant').live('click', onAddNewParticipantClick);
    };
    
    var bindOpenMode = function() {
      $('.createVaguelette', vagueNode).live('click', onVagueletteAddClick);
    };
    
    var touchVaguelette = function(idVagulette) {
      // To implement
    }
    
    return {

      // Public //

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
      }
    }
  }();

  $(document).ready(vagues.Vague.init);
  
}());
