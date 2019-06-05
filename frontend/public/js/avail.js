function initAvail(){
  var margin = {top: 25, right: 12, bottom: 30, left: 10},
              width = 400 - margin.left - margin.right,
              height = 210 - margin.top - margin.bottom;

  var svg = d3.select(".avail")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("titledata", 'Availability');

  var availbar = svg.append("rect")
      .attr("x",-1)
      .attr("y", margin.top)
      .attr("width", width + margin.left + margin.right)
      .attr("height", 30)
      .attr("class", "availbar")
      .attr("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("shape-rendering", "crispEdges");

  makeGradient(svg,"gradient3",1,0,'#d62d20','#aa2419');
  makeGradient(svg,"gradient4",1,0,'#d68820','#935e16');

}

function updateAvail(data,start,end,step){
  d3.selectAll(".avail-bars").remove();
  d3.selectAll(".avail").selectAll("g").remove();

  //console.log(data);
  if(data == 'no rows'){
    avail_data = data;
    total_uptime = 0;
    return;
  }


  var gradients = ["url(#gradient3)","url(#gradient4)"];
  total_uptime = 0;
  var p = data[0].start;

  if(data[0].data == 'no rows')
    data = [{"_id":0,"time":start,"event":-1,"dt":0}];

  if(step == 600) //odd bug with daily viewing (querying hourly for avail chart)
    step = 3600;

  var len = data.length;
  var steps = parseInt(end/step);
  for(var i=0; i<steps; i++){
      var indata = false;
      for(var j=0; j<len; j++){
          var cur = start+step*i;
          if(data[j]["time"] == cur)
              indata = true;
      }
      if(!indata) {
          data.splice(i,0,{"_id":0,"time":cur,"event":-1,"dt":0});
      }
  }
  //console.log(data);

  var str = 'date\ttime\tevent\tdt\n';
  data.forEach(function(row,i){var d = new Date(row.time*1000); str+=parseDate(d) + '\t' + parseTime(d) + '\t' + row.event + '\t' + row.dt + '\n';});
  $('#availdata').val(str);

  var margin = {top: 25, right: 15, bottom: 30, left: 10},
              width = 400 - margin.left - margin.right,
              height = 210 - margin.top - margin.bottom;

  var svg = d3.select(".avail");

  var times = [];
  var datastack = {};

  var reasons = {};
  var bartime = {};

  var le = p;

  for(var i = 0; i < data.length; i++) {
    if(data[i].dt == undefined)
      data[i].dt = 1;

    //get up/down bar data
    if(datastack[data[i].time] == undefined) {
      times.push(data[i].time);
      datastack[data[i].time] = {up:0,dn:0};
    }

    if(data[i].event >= id_started && data[i].event < (id_started+id_gap)){
      //console.log(data[i].event,"up",data[i].dt);
      datastack[data[i].time].up += data[i].dt;
    }else if(data[i].event != -1){
      //console.log(data[i].event,"dn",data[i].dt);
      datastack[data[i].time].dn += data[i].dt;
    }

    avail_data = datastack;

    //console.log(datastack[data[i].time]);

    //console.log(data[i]);

    //get bar graph data
    if(data[i].event < id_started && data[i].event != -1)
      le = data[i].event;
    if(le < id_started && le != -1){
      qty = 1;
      if(data[i].qty)
        qty = data[i].qty;
      if(reasons[le] == undefined) {
        if(step == 1){
          reasons[le] = 0;
          bartime[le] = 1;
        }else{
          reasons[le] = qty;
          bartime[le] = data[i].dt;
        }
      }else{
        if(step == 1){
          reasons[le] += 0;
          bartime[le] += 1;
        }else{
          reasons[le] += qty;
          bartime[le] += data[i].dt;
        }
      }
    }
  }

  times.sort();

  //console.log(datastack);
  var prev;
  if (p >= id_started)
    prev = 1;
  else if (p < id_started)
    prev = 2;
  else
    prev = 0;
  if(step == 1)
    for(var i = 0; i < times.length; i++) {
      if(datastack[times[i]].up == 0 && datastack[times[i]].dn == 0)
        if(prev == 1)
          datastack[times[i]].up = 1;
        else if(prev == 2)
          datastack[times[i]].dn = 1;
      if(datastack[times[i]].up == 1)
        prev = 1;
      else if(datastack[times[i]].dn == 1)
        prev = 2;
      else
        prev = 0;
    }
    //console.log(datastack);

  var td = width/(end/step);//width/(times.length);
  var x = d3.scaleLinear()
      .domain([start,start+end])
      //.domain([times[0],times[times.length-1]])
      .range([margin.left, width+margin.left]);
    var w = d3.scaleLinear()
        .domain([0,end])
        //.domain([times[0],times[times.length-1]])
        .range([0, width]);


var div = d3.select(".tooltip-arc");

  for(var i = 0; i < times.length; i++) {

    var time = parseInt(times[i]);
    var up = parseFloat(datastack[times[i]].up);
    var dn = parseFloat(datastack[times[i]].dn);
    var tot = up+dn;

    total_uptime += up;//getValid(times[i],up);

    //console.log(up,dn);

    if(tot) {
      var upp = up/tot;
      var dnp = 1.0-upp;

      if(up > 0)
      svg.append('rect')
        .attr("x",x(times[i]))
        .attr("time",times[i])
        .attr("up",up)
        .attr("y", margin.top)
        .attr("height", 30)
        .attr("class", "avail-bars avail-bars-up")
        .attr("fill", colors.green)
        .on("click", function() {
          var time = parseInt(d3.select(this).attr('time'));
          $(".t_" + time + ":first").d3Click();
        })
        .on("contextmenu", function() {
          d3.event.preventDefault();
          var time = parseInt(d3.select(this).attr('time'));
          $(".t_" + time + ":first").d3RClick();
        })
        .on("mousemove",function(){
          var time = parseInt(d3.select(this).attr('time'));
          var up = parseInt(d3.select(this).attr('up'));
          time = d3.timeFormat(tt_formats[bar_interval_i])
                              (new Date((time+time_offset)*1000));
          var mouseVal = d3.mouse(this);
          div.style("display","none");
          div
            .html("<span>"+time+"</span><hr>"+secondsToStr(up)+"<br><span>uptime</span>")
            .style("left", (d3.event.pageX+12) + "px")
            .style("top", (d3.event.pageY-10) + "px")
            .style("display","block");
        })
        .on("mouseout",function(){div.html(" ").style("display","none");})
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .attr("width", w(up));
        //.attr("width", td*upp+.5);

      if(dn > 0)
      svg.append('rect')
        //.attr("x",x(times[i])+td*upp)
        .attr("x",x(times[i]+up))
        .attr("y", margin.top)
        .attr("time",times[i])
        .attr("dn",dn)
        .attr("height", 30)
        .attr("class", "avail-bars avail-bars-dn")
        .attr("fill", colors.red)
        .on("click", function() {
          var time = parseInt(d3.select(this).attr('time'));
          $(".t_" + time + ":first").d3Click();
        })
        .on("contextmenu", function() {
          d3.event.preventDefault();
          var time = parseInt(d3.select(this).attr('time'));
          $(".t_" + time + ":first").d3RClick();
        })
        .on("mousemove",function(){
          var time = parseInt(d3.select(this).attr('time'));
          var dn = parseInt(d3.select(this).attr('dn'));
          time = d3.timeFormat(tt_formats[bar_interval_i])
                              (new Date((time+time_offset)*1000));
          var mouseVal = d3.mouse(this);
          div.style("display","none");
          div
            .html("<span>"+time+"</span><hr>"+secondsToStr(dn)+"<br><span>dntime</span>")
            .style("left", (d3.event.pageX+12) + "px")
            .style("top", (d3.event.pageY-10) + "px")
            .style("display","block");
        })
        .on("mouseout",function(){div.html(" ").style("display","none");})
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .attr("width", w(dn));
        //.attr("width", td*dnp);
    }
  }
  //console.log(total_uptime);
d3.selectAll(".avail-bars").moveToBack();
d3.selectAll(".avail").selectAll("g").remove();
  //console.log(reasons,bartime);
  var keyValues = []
  for (var key in bartime) {
    keyValues.push([ key, bartime[key] ])
  }
  keyValues.sort(function compare(kv1, kv2) {
    return kv2[1] - kv1[1]
  });
  var series = [];
  var top5 = [];
  series.push({label:'downtime',values:[]});
  series.push({label:'occurrences',values:[]});
  for(var i = 0; i < 5; i++){
    if(i < keyValues.length){
      series[0].values.push(keyValues[i][1]);
      series[1].values.push(reasons[keyValues[i][0]]);
      top5.push(keyValues[i][0]);
    }
  }

var datas = {
    labels: top5,
    series: series
  };
  //console.log(datas);

  //begin copied code
  var chartWidth       = 300,
    barHeight        = 15,
    groupHeight      = barHeight * datas.series.length,
    gapBetweenGroups = 11,
    spaceForLabels   = 100,
    spaceForBar   = 55,
    spaceForLegend   = 0;

// Zip the series data together (first values, second values, etc.)
var zippedData = [];
for (var i=0; i<datas.labels.length; i++) {
  for (var j=0; j<datas.series.length; j++) {
    zippedData.push(datas.series[j].values[i]);
  }
}

var chartHeight = barHeight * zippedData.length + gapBetweenGroups * datas.labels.length;

var x = d3.scaleLinear()
    .domain([0, d3.max(zippedData)])
    .range([2, chartWidth-spaceForLabels]);

var y = d3.scaleLinear()
    .range([chartHeight + gapBetweenGroups, 0]);

var yAxis = d3.axisLeft()
    .scale(y)
    .tickFormat('')
    .tickSize(0);

// Specify the chart area and dimensions
var chart = d3.select(".avail")
    .attr("width", spaceForLabels + chartWidth + spaceForLegend)
    .attr("height", chartHeight + spaceForBar)
    .attr("title", 'Availability');

// Create bars
var bar = chart.selectAll("g")
    .data(zippedData)
    .enter().append("g")
    .attr("transform", function(d, i) {
      return "translate(" + spaceForLabels + "," + (spaceForBar + i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/datas.series.length))) + ")";
    });

// Create rectangles of the correct width
bar.append("rect")
    .attr('class', function(d,i) { return 'avail-stopbar avail-stopbar-' + ((i%2==0)?'time':'qty'); })
    .attr("fill", function(d, i) { if(i%2==0)return colors.red;else return colors.orange;})
    .attr("height", barHeight - 1)
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .attr("width", x);

// Add text label in bar
bar.append("text")
    .attr("y", barHeight / 2)
    .attr('class', function(d,i) { return 'avail-stopbar avail-stopbar-' + ((i%2==0)?'time':'qty'); })
    .attr("fill", function(d, i) { if(i%2==0)return colors.red;else return colors.orange;})
    .attr("dy", ".35em")
    .attr("text-anchor", "start")
    .text(function(d,i) { if(i%2==0) return secondsToStr(d); else return parseInt(d) + ' times'; })
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .attr("x", function(d) { return x(d) + 3; });

// Draw labels
bar.append("text")
    .attr("x", function(d) { return - 10; })
    .attr("y", groupHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .style("font-size", "10px") 
    .text(function(d,i) {
      if (i % datas.series.length === 0)
        return resolve(datas.labels[Math.floor(i/datas.series.length)]);
      else
        return ""});

chart.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + spaceForLabels + ", " + spaceForBar + ")")
      .call(yAxis);
}
