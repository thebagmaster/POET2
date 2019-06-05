function initYield(){
  var margin = {top: 10, right: 12, bottom: 30, left: 10},
              width = 520 - margin.left - margin.right,
              height = 258 - margin.top - margin.bottom;

  var svg = d3.select(".yield")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("titledata", 'Yield');

  var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip-arc")
    .style('display','none');
}
function updateYield(data){

  d3.select(".yield").select('g').remove();
  if(data=='no rows')
    return;

  //sort data by number
  function compare(a,b) {
    if (a.qty < b.qty)
      return 1;
    if (a.qty > b.qty)
      return -1;
    return 0;
  }
  //console.log(data);
  data.sort(compare);

  var str = 'code\tqty\n';
  data.forEach(function(row,i){str+=row._id + '\t' + row.qty + '\n';});
  $('#yielddata').val(str);

  var legendx = 30;
  var legend_spacex = 50;
  var legend_spacedx = legend_spacex + legendx;

  //console.log(data);
  var margin = {top: 10, right: 12, bottom: 30, left: 10},
              width = 520 - margin.left - margin.right,
              height = 258 - margin.top - margin.bottom;

  radius = 130;
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var arc = d3.arc()
    .outerRadius(radius -95)
    .innerRadius(radius - 22)
    .cornerRadius(2);
  var arcOver = d3.arc()
    .outerRadius(radius + 160)
    .innerRadius(0);

  var a=width/2 - 20;
  var b=height/2 - 90;
  var svg = d3.select(".yield")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("title", 'Yield')
      .append("g")
      .attr("class", "piearea")
      .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2+margin.top+20) + ")");

  var div = d3.select(".tooltip-arc");

  var pie = d3.pie()
    .sort(null)
    .value(function(d){return d.qty;})
    .padAngle(.02);
  var g = svg.selectAll(".arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class",function(d){ return "a_" + d.data._id + " arc"; })
    .attr('stroke-width',3)
    .attr('stroke','#fff')
    .on("mousemove",function(d){
      d3.selectAll(".a_" + d.data._id).attr('stroke',color(d.data._id));
      var mouseVal = d3.mouse(this);
      div.style("display","none");
      div
        .html(d.data.qty +"<br><span>"+resolve(d.data._id)+"</span>")
        .style("left", (d3.event.pageX+12) + "px")
        .style("top", (d3.event.pageY-10) + "px")
        .style("display","block");
    })
    .on("mouseout",function(d){
      d3.selectAll(".a_" + d.data._id).attr('stroke','#fff');
      div.html(" ").style("display","none");
    });



  g.append("path")
    .style("fill",function(d){return color(d.data._id);})
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .attr("d",arc)
    .attr("d", arc);


    // add legend
  var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform","translate(-260,-110)")
    .attr("x", width - 65)
    .attr("y", 0)
    .attr("height", 100)
    .attr("width", 100);

  legend.selectAll('g').data(pie(data))
    .enter()
    .append('g')
    .each(function(d, i) {
      var ypos = (i * 27)%220;
      var xpos = (1-Math.floor((i * 27)/220))*legend_spacedx;
      var g = d3.select(this);
      g.append("rect")
      .attr("x", width - xpos - legendx)
      .attr("y", ypos)
      .attr("width", 20)
      .attr("height", 20)
      .attr("class",function(d){ return "a_" + d.data._id; })
      .attr("stroke-width", 3)
      .attr("stroke", '#fff')
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .style("fill", color(d.data._id));

      g.append("text")
      .attr("x", width - xpos- legendx+25)
      .attr("y", ypos + 15)
      .attr("height",30)
      .attr("width",100)
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .style("fill", color(d.data._id))
      .text(resolve(d.data._id));
    });

}
