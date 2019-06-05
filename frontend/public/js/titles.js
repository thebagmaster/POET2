function createTitle(obj){
  var svg = d3.select(obj);
  var title = svg.attr('titledata');
  var w = svg.attr('width');
  if(title == 'Parts')
    w = 700;
  var w2 = w/2;
  if(title != "none") {
    svg.append('rect')
      .attr('width',w)
      .attr('x',-1)
      .attr('height','30')
      .attr('y',-10)
      .attr('class','titlebar');
    svg.append('text')
      .attr('x',w2)
      .attr('y',15)
      .attr('class','titlebar-text')
      .text(title);
  }
}

function createMainTitle(){
  $('.title').append(
    $("<span></span>")
      .addClass('maintitle')
      .text('OEE Optimizer')
  );
  $('.maintitle').prepend(
    $("<span></span>")
      .addClass('maintitleicon')
  );

}

function createTitles(){
  $('.viewWindow').each(function(i,o){
    createTitle(o);
  });
  createMainTitle();
}
