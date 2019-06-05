function initEff(){
    var margin = {top: 30, right: 20, bottom: 30, left: 40},
                width = 497 - margin.left - margin.right,
                height = 125 - margin.top - margin.bottom;

    var svg = d3.select(".eff")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("titledata", 'Efficiency')
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function updateEff(){
  d3.select(".eff").select('g').selectAll('g').remove();
  d3.select(".eff").select('g').selectAll('path').remove();

  if(avail_data == 'no rows')
    return;


  var margin = {top: 30, right: 20, bottom: 30, left: 40},
              width = 497 - margin.left - margin.right,
              height = 125 - margin.top - margin.bottom;

  //console.log(part_data,avail_data);

  //condition data
  var data = [];
  var upt_id = 0;
  var upt = 0;
  var tot = 0;

  var cur = 0;
  var cnt = 0;

  for(var i = 0; i < part_data.length; i++) {
    var id = part_data[i]._id;

    //console.log(id,avail_data[id]);

    //special case for day, aggregate from minutes on bars to hours on avail-bars
    if(bar_interval_i == 4) {
      if(avail_data[id]){
        cur = id;
        cnt = 0;
      }
      data.push({id:id+cnt*6,pps:div2(part_data[i].total,avail_data[cur].up/6)});
      cnt++;
      //console.log(div2(part_data[i].total,avail_data[cur].up/6));
      // if(i%6 == 0){
      //   upt+=avail_data[id].up;
      //   upt_id = id;
      // } else {
      //   tot+=part_data[i].total;
      //   if(i%6 == 5) {
      //     data.push({id:id,pps:div(tot,upt)});
      //     upt = 0;
      //     tot = 0;
      //     upt_id = 0;
      //   }
      // }
    }else
    if(avail_data[id])
      data.push({id:id,pps:div2(part_data[i].total,avail_data[id].up)});
    else {
      data.push({id:id,pps:0});
    }
  }
  //console.log(data);

  function compare(a,b) {
    if (a.id < b.id)
      return -1;
    if (a.id > b.id)
      return 1;
    return 0;
  }
  data.sort(compare);

  //console.log(data);

  var x = d3.scaleTime()
    .range([0, width]);

  var y = d3.scaleLinear()
      .range([height, 0]);

  var xAxis = d3.axisBottom()
      .scale(x)
      .tickFormat(d3.timeFormat(b_formats[bar_interval_i-1]));;

  var yAxis = d3.axisLeft()
      .scale(y)
      .ticks(4, ",f");

  var area = d3.area()
      .x(function(d) { return x(d.id); })
      .y0(height)
      .y1(function(d) { return y(d.pps); });

  data.forEach(function(d) {
    d.id = new Date(d.id*1000+time_offset*1000);
    d.ppm = +d.pps;
  });

  x.domain(d3.extent(data, function(d) { return d.id; }));
  y.domain([0, d3.max(data, function(d) { return d.pps; })]);

  var svg = d3.select(".eff").select('g');

  svg.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("fill", "#1f77b4")
      .attr('stroke','#185a88')
      .attr('stroke-width','1')
      .attr('stroke-linecap','round')
      .attr('stroke-linejoin','round')
      .attr("fill-opacity", ".5")
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .attr("d", area);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Price ($)");
}
