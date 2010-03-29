%{
  ( _arg ) &&  ( _src = _arg);

  def content;
  if(_src) {
    try {
      _src.getClass().getMethod('toJson',null);
      content = fr.zenexity.json.JSON.toJSON(_src.toJson());
    }
    catch(NoSuchMethodException e) {
      content = fr.zenexity.json.JSON.toJSON(_src);
    }
  }
}%
#{if content}${content.raw()}#{else}{}#{/else}#{/if}