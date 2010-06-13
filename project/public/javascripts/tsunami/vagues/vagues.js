tsunami.tools.namespace('tsunami.vagues');

(function(){

  var vagues = tsunami.vagues;
  var tools = tsunami.tools;
  var ajax = tsunami.tools.Router.ajax;
  var esc = tools.escapeHtml;
  var log = tsunami.tools.log;
  
  vagues.AutocompleteSearch = function() {
    var rtu = null;
    var searchIndicatorHidden = true;
    
    return {
      init: function(searchFunction, inputNode) {
        var searchIndicator = $('.searchIndicator', $(inputNode).parent());
        rtu = new tools.RealTimeUpdate({
          node: inputNode,
          update: function(value) {
            searchFunction(value, 'searchIndicatorHide');
          },
          textChange: function(value) {
            if(searchIndicatorHidden) {
              searchIndicator.show();
              searchIndicatorHidden = false;
            }
          },
          minInterval: 1000,
          minTextLength: 1
        });
        $(document).bind('searchIndicatorHide', function(){ 
          searchIndicator.hide();
          searchIndicatorHidden = true;
        });
      }
    }
  }();
  
  vagues.List = function() {

    // PRIVATE //

    var g_vagueListNode = null;
    var g_vagueOpenedNode = null;
    
    var g_shiftPressed = false;
    $(document).keydown(function(e){
      if(e.keyCode==16 || e.keyCode==17)
        g_shiftPressed = true;
    })
    $(document).keyup(function(e){
      if(e.keyCode==16 || e.keyCode==17)
        g_shiftPressed = false;
    })
    
    // Utils //
    var vagueid2string = function(vagueid) {
      return 'vague_'+vagueid;
    };
    var string2vagueid = function(str) {
      return str.substring(6);
    };
    var node2vagueid = function(node) {
      return string2vagueid($(node).attr('id'));
    };
    var vagueid2node = function(vagueid) {
      return $('#'+vagueid2string(vagueid));
    };
    
    // Templates //
    
    var tpl_formFastCreate = function() {
      return ('<form class="fastCreate">'+
		      '<button>'+tools.i18n('vagues.button.fastCreate')+'</button>'+
		      '<input type="text" name="subject" />'+
	      '</form>');
    };
    
    var tpl_search = function() {
      return '<input type="text" name="search" placeholder="'+tools.i18n('vagues.search')+'" title="'+tools.i18n('vagues.search')+'" />';
    };
    
    var tpl_vagueList = function() {
      return ('<div class="theme theme-box level-60 radius">'+
      '<div class="head">'+tools.i18n('vagues.title')+'</div>'+
      '<div class="body">'+
        tpl_formFastCreate()+
      '<section>'+
        '<ul class="boxes">'+
          '<li><a rel="inbox" href="javascript:;" class="inbox enabled">inbox</a></li>'+
          '<li><a rel="archive" href="javascript:;" class="archive">archive</a></li>'+
          '<li><a rel="trash" href="javascript:;" class="trash">trash</a></li>'+
        '</ul>'+
        '<ul class="vagues"></ul>'+
      '</section>'+
      '<section>'+
        '<ul class="actions">'+
          '<li><button rel="inbox">Restaurer</button></li>'+
          '<li><button rel="archive">Archiver</button></li>'+
          '<li><button rel="trash">Supprimer</button></li>'+
        '</ul>'+
      '</section>'+
        '</div><div class="footer"> '+
        '<img src="/public/images/loading.gif" class="searchIndicator" style="display: none;"/>'+
          tpl_search()+
        '</div>'+
      '</div>');
    };
    
    var tpl_vague = function(vague) {
      var box = null;
      for(var p in vague.participants) {
        var user = vague.participants[p];
        if(user.userid == tsunami.export.currentUser.userid) {
          box = user.status;
          break;
        }
      }
      if(!box) box = 'input';
      var toBeDisplay = $('.boxes a.'+box,g_vagueListNode).is('.enabled');
      
      return '<li '+(!toBeDisplay?'':'style="display: none;"')+' class="vague '+(box.toLowerCase())+'" id="'+vagueid2string(vague.id)+'">'+
      '<div class="stats">'+
        '<span class="vagueletteCount">('+vague.vaguelettes.length+' messages)</span>'+
      '</div>'+
      '<div class="inboxes">'+
        '<input type="checkbox" name="selection" />'+
      '</div>'+
      '<div class="main">'+
        '<div class="movableContainer">'+
        '<div class="movable">'+
        '<span class="subject">'+esc(vague.subject||'Sans titre')+'</span> - '+
          '<span class="content">'+esc(vague.preview||'')+'</span>'+
        '</div>'+
        '</div>'+
      '</div>'+
      '</li>';
    };
    
    // Dynamic updates : touch //
    
    var updateNoItemInfo = function(){
      if($('.vagues .vague:visible', g_vagueListNode).size()==0)
        $('.vagues .noItemInfo', g_vagueListNode).show();
      else
        $('.vagues .noItemInfo', g_vagueListNode).hide();
    }
    
    var applyBoxFilter = function() { // refresh all vagues applying boxes filter
      $('.boxes a', g_vagueListNode).each(function(){
        var vagues = $('.vagues .vague.'+$(this).attr('rel'),g_vagueListNode);
        if($(this).hasClass('enabled')) 
          vagues.show();
        else
          vagues.hide();
      });
      updateNoItemInfo();
    };
    
    // EVENTS //
    
    var onGetVagues = function(vagues) {
      var html = "";
      for(var v in vagues)
        html += tpl_vague(vagues[v]);
      $('.vagues', g_vagueListNode).empty().append('<li class="noItemInfo">Aucune vague trouvée</li>').append(html);
      bindVagues();
    };
    
    var onAddVague = function(e, vague) {
      $('.vagues',g_vagueListNode).prepend(tpl_vague(vague));
      bindVague(vagueid2node(vague.id));
    };
    
    var onGetVagueEvent = function(e, vague) {
      var node = vagueid2node(vague.id);
      if(!node[0])
        return onAddVague(vague);
      $('.subject', node).text(vague.subject||'Sans titre');
      $('.content', node).text(vague.preview||'');
    };
    
    var vagueNodeHover = null;
    var onVagueHoverIn = function() {
       // Don't remove this, wait for improvment
      var i = 0;
      var vague = vagueNodeHover = $(this);
      var maxWidth = Math.floor($('.movable', vague).width()-$('.movableContainer', vague).width());
      log(maxWidth)
      if(maxWidth>0) {
        var cycle = function() {
          if(vague==vagueNodeHover) {
            setTimeout(cycle, 50);
            var xPosAnimation = -Math.floor((maxWidth*(1+Math.cos(Math.PI+i/20)))/2);
            
            $('.movable', vague).css('left', xPosAnimation+'px');
            ++i;
          }
        };
        cycle();
      }
      
    };
    
    var onVagueHoverOut = function(vague) {
      $('.movable', vagueNodeHover).css('left', '0px');
      vagueNodeHover = null;
    };
    
    // AJAX //
    
    var getVagues = function(search, trigger) {
      ajax("Vagues.list", {search: search}, function(data) {
        onGetVagues(data);
        if(trigger) $(document).trigger(trigger);
      });
    };
    
    // Binders //
    
    var bindFilters = function() {
      $('.boxes a',g_vagueListNode).click(function(){
        if(!g_shiftPressed)
          $('.boxes a').removeClass('enabled');
        $(this).toggleClass('enabled');
        applyBoxFilter();
        return false;
      })
    };
    
    var bindActions = function() {
      $('.actions button',g_vagueListNode).click(function(){
        var vagues = $('.vagues .vague:visible').filter(':has(input:checked)');
        if(vagues.size()==0)
          return false;
        var box = $(this).attr('rel');
        var vagueIds = [];
        vagues.each(function(i){
          vagueIds.push(string2vagueid($(this).attr('id')));
        });
        ajax('Vagues.changeBox', {vagueIds: vagueIds, box: box}, function(){
          vagues.removeClass('input');
          vagues.removeClass('archive');
          vagues.removeClass('trash');
          vagues.addClass(box);
          applyBoxFilter();
        });
      })
    };
    
    var bindVagueList = function() {
      $('form.fastCreate', g_vagueListNode).submit(function(){
        ajax('Vagues.create', {subject: $('.fastCreate input[name=subject]', g_vagueListNode).val()}, function(data){
          $(document).trigger('vague.create', data);
        });
        return false;
      });
      $(document).bind('vague.opened', function(e, id) {
        if(g_vagueOpenedNode)
          g_vagueOpenedNode.removeClass('opened');
        g_vagueOpenedNode = vagueid2node(id).addClass('opened');
      });
      $(document).bind('vague.closed', function(e, id) {
        g_vagueOpenedNode.removeClass('opened');
        g_vagueOpenedNode = null;
      });
      bindFilters();
      bindActions();
    };
    
    var bindVagues = function() {
      var vaguesNode = $('.vagues .vague', g_vagueListNode);
      bindVague(vaguesNode);
      applyBoxFilter();
    };
    
    var bindVague = function(vagueNode) {
      $(vagueNode).click(function(e) {
        if(!$(e.target).is('input'))
          vagues.Vague.open(node2vagueid(this));
      });
      $(vagueNode).hover(onVagueHoverIn, onVagueHoverOut);
    };
    
    var bindEvents = function() {
      $(document).bind('vague.create', onAddVague);
      $(document).bind('vague.get', onGetVagueEvent);
    };
    
    return {

      // Public //

      init: function() {
        
        $(document).bind('WindowManager.ready', function() {
          g_vagueListNode = $('#vagueList');
          g_vagueListNode.append( tpl_vagueList() );
          bindVagueList();
          getVagues();
          bindEvents();
          vagues.AutocompleteSearch.init(getVagues, $('input[name=search]', g_vagueListNode));
          $(document).trigger('window.vagueList.ready');
        });
      }
    }
  }();

  $(document).ready(vagues.List.init);
  
}());
