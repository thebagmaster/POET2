function initTree(){
  function addCat(name,parent,db){
    parent.append('h3')
          .attr('class','tree_header tree_site')
          .html(name);
    return parent
          .append('div')
          .attr('class','accordion header_box')
          .attr('db',db);
  }
  function addTreeItem(name,parent,col){
    var db = parent.attr('db');
    parent.append('h3')
          .attr('class','tree_header tree_item')
          .attr('db',db)
          .attr('col',col)
          .html(name);
    return parent
          .append('div')
          .attr('class','tree_line');
  }

  var parent = d3.select('.tree')
                  .append('div')
                  .attr('class','accordion');

  for (var i = 0; i < dbtree.length; i++) {
    var cat = addCat(dbtree[i].site,parent,dbtree[i].db);
    for (var j = 0; j < dbtree[i].lines.length; j++) {
      var cat2 = addCat(dbtree[i].lines[j].name,cat,dbtree[i].lines[j].prefix);
      for (var k = 0; k < dbtree[i].lines[j].plcs.length; k++) {
        addTreeItem(dbtree[i].lines[j].plcs[k].name,cat2,dbtree[i].lines[j].plcs[k].col);
      }
    }
  }

  $( function() {
    $( ".accordion" ).accordion({
      heightStyle: "content"
    });

    $( ".tree_line" )
      .css('padding','0px')
      .css('height','0px');

    $( ".tree_header" )
      .click(function(){
        //console.log(this);
        //choosing a PLC
        db = $(this).attr('db');
        col = $(this).attr('col');
        col = db + '_' + col;
        var lineid = $(this).parent().attr('aria-labelledby');
        db = $('#' + lineid).parent().attr('db');

        //choosing a Line or Site
        if($(this).hasClass('tree_site')){
          //find out if line or site
          var pdb = $(this).parent().attr('db');
          if(pdb){
            //find the selected PLC in line
            db = pdb;
            var div = $(this).attr('aria-controls');
            var sdiv = $('#' + div).find('> h3.ui-state-active');
            col = sdiv.attr('db') + '_' + sdiv.attr('col');
          }else{
            //find the selected PLC in the selected site
            var div = $(this).attr('aria-controls');

            db = $('#' + div).attr('db');

            var ldiv = $('#' + div).find('> h3.ui-state-active').attr('aria-controls');
            var pdiv = $('#' + ldiv).find('> h3.ui-state-active');
            col = pdiv.attr('db') + '_' + pdiv.attr('col');
          }
        }
        //console.log(db,col);
        var newi = (bar_interval_i-1);
        $('#lsr' + newi).trigger( "click" );
        $('#sr' + newi).trigger( "click" );
      });

    $( ".header_box" ).css('padding','2px 2px 2px 50px');
    $( ".ui-accordion-content" ).css('border','none');
    //$( ">.ui-helper-reset" ).css('padding','4px');
    $( ".tree_item span" ).css('display','none');
  } );
}
