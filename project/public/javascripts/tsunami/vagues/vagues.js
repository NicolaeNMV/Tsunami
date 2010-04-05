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
          minTextLength: 3
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
		      '<button>'+tools.i18n('vagues.button.create')+'</button>'+
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
        '<ul class="vagues"></ul></div>'+
        '<div class="footer"> '+
        '<img src="/public/images/loading.gif" class="searchIndicator" style="display: none;"/>'+
          tpl_search()+
        '</div>'+
      '</div>');
    };
    
    var tpl_vague = function(vague) {
      return '<li class="vague" id="'+vagueid2string(vague.id)+'">'+
      '<div class="stats">'+
        '<span class="vagueletteCount">('+vague.vaguelettes.length+' messages)</span>'+
      '</div>'+
      '<div class="main">'+
        '<input type="checkbox" name="selection" />'+
        '<div class="movableContainer">'+
        '<div class="movable">'+
        '<span class="subject">'+(vague.subject||'Sans titre')+'</span> - '+
          '<span class="content">'+(vague.preview||'')+'</span>'+
        '</div>'+
        '</div>'+
      '</div>'+
      '</li>';
    };
    
    // Dynamic updates : touch //
    
    // EVENTS //
    
    var onGetVagues = function(vagues) {
      var html = "";
      for(var v in vagues)
        html += tpl_vague(vagues[v]);
      $('.vagues', g_vagueListNode).empty().append(html);
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
      /* // Don't remove this, wait for improvment
      var i = 0;
      var vague = vagueNodeHover = $(this);
      var maxWidth = Math.floor($('.movable', vague).width()-$('.movableContainer', vague).width());
      log(maxWidth);
      if(maxWidth>0) {
        var cycle = function() {
          if(vague==vagueNodeHover) {
            setTimeout(cycle, 30);
            var xPosAnimation = Math.floor(maxWidth*Math.cos(i/40)-$('.movableContainer', vague).width());
            $('.movable', vague).css('left', xPosAnimation+'px');
            ++i;
          }
        };
        cycle();
      }
      */
    };
    
    var onVagueHoverOut = function(vague) {
      /*
      $('.movable', vagueNodeHover).css('left', '0px');
      vagueNodeHover = null;
      */
    };
    
    // AJAX //
    
    var getVagues = function(search, trigger) {
      ajax("Vagues.list", {search: search}, function(data) {
        onGetVagues(data);
        if(trigger) $(document).trigger(trigger);
      });
    };
    
    // Binders //
    
    var bindVagueList = function() {
      $('form.fastCreate', g_vagueListNode).submit(function(){
        ajax('Vagues.create', {subject: ''}, function(data){
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
    };
    
    var bindVagues = function() {
      var vaguesNode = $('.vagues .vague', g_vagueListNode);
      bindVague(vaguesNode);
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
      
      
      var onResize = function() {
        $('#vagueList input[name=search]').width($('#vagueList').width()-60);
      };
      $('#vagueList').resize(onResize);
      onResize();
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
