function initParts(){
  var margin = {top: 30, right: 30, bottom: 30, left: 50},
              width = 700 - margin.left - margin.right,
              height = 400 - margin.top - margin.bottom;

  var svg = d3.select(".chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("titledata", 'Parts');

  //makeGradient(svg,"gradient1",0,1,ltcolors[0],dkcolors[0]);
  //makeGradient(svg,"gradient2",0,1,ltcolors[1],dkcolors[1]);
}

function updateParts(data,start,end,step){
    var grey_bars = [];

    var gradients = ["#gradient1","#gradient2"];
    var margin = {top: 30, right: 30, bottom: 30, left: 50},
                width = 700 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

    d3.select(".bardate")
      .style("opacity",0)
      .transition()
      .duration(700)
      .style("opacity",1)
      .text(d3.timeFormat(long_formats[bar_interval_i])(new Date((start+time_offset)*1000)));
    d3.select(".slider").moveToFront();
    d3.select(".loading").transition().duration(700).style("opacity", 0).style("display","none");
    d3.select(".chart").selectAll("g").transition().duration(700).style("opacity", 0).attr("y", height).attr("height", 0).remove();
    if(data == "no rows")
        return;

    var len = data.length;
    var steps = parseInt(end/step);
    //console.log(steps);
    for(var i=0; i<steps; i++){
        var indata = false;
        var cur = start+step*i;
        for(var j=0; j<len; j++){
            if(data[j]["_id"] == cur)
                indata = true;
        }
        if(!indata)
            data.splice(i,0,{"_id":cur,"good":0,"bad":0,"total":0});
        grey_bars.push({time:new Date((cur+time_offset)*1000)});
    }

    var str = 'date\ttime\tgood\tbad\ttotal\n';

    data.forEach(function(row,i){var d = new Date(row._id*1000); str+=parseDate(d) + '\t' + parseTime(d) + '\t' + row.good + '\t' + row.bad + '\t' + row.total + '\n';});
    $('#partsdata').val(str);

    var min = d3.min(data, function(d) { return d._id; });
    var max = d3.max(data, function(d) { return d._id; });

    var x = d3.scaleTime()
        .domain([createDateAsUTC(min * 1000),createDateAsUTC(max * 1000 + step * 1000)])
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain([0, Math.max(d3.max(data, function(d) { return d.total; }),step/cycleTime)])
        .range([height, 0]);

    //console.log(data);

    //make avail to eff graph
    part_data = data;

    //convert to 'stacked' data
    var dataset = d3.stack().keys(["good","bad"])(data);


    //console.log(dataset);

    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("title", 'Parts')
        .append("g")
        .attr("class", "chartarea")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var barspace = 2;

    var groups = svg.selectAll("g.serie")
        .data(dataset)
        .enter().append("g")
        .attr("class", function(d, i) { return "serie " + ("pserie"+i);})
        .attr("fill", function(d, i) { if(i==0)return colors.green;else return colors.red;})
        .attr("stroke", function(d, i) { if(i==0)return colors.green;else return colors.red;});

    //console.log(x(new Date(min*1000 + step*1000)));

    var div = d3.select(".tooltip-arc");

    var rect = groups.selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("x", function(d) { return 2+x(createDateAsUTC(d.data._id*1000)); })
        .style('cursor','pointer')
        .attr("class",function(d) {return 't_' + d.data._id + ' parts_rect';})
        .attr("width", x(createDateAsUTC(min*1000 + step*1000))-barspace)
        .on("mouseout", function(d) {
          div.html(" ").style("display","none");
        })
        .on("mousemove", function(d) {
          //console.log(d);
          var txt = "<span>";
          txt += d3.timeFormat(tt_formats[bar_interval_i])
                              (new Date((d.data._id+time_offset)*1000));
          txt += "</span><hr>";
          txt += d.data.good + '<br><span>Pass</span>';
          txt += "<hr>";
          txt += d.data.bad + '<br><span>Failure</span>';

          var mouseVal = d3.mouse(this);
          div.style("display","none");
          div
            .html(txt)
            .style("left", (d3.event.pageX+12) + "px")
            .style("top", (d3.event.pageY-10) + "px")
            .style("display","block");
        })
        .on("click", function(d) {
            var newi = (bar_interval_i-2);
            if(newi > 0 && newi < 7 && allloaded){
              div.html(" ").style("display","none");
              $('.serie rect').css('pointer-events','none');
              //console.log(d.data._id,slider_start);

              adjust_time = d.data._id*1000;
              if(newi==1)
                adjust_time -= 60;
              //console.log(adjust_time);
              //var time = $(this).attr('class');
              //console.log(time);
              //d3.selectAll('.' + time)
              //d3.select(this)

              var tw = d3.select(this).attr('width');
              var tx = d3.select(this).attr('x');
              var sc = width/tw;
              var w = (tx/width)*width*sc;

              d3.selectAll('.serie')
                .transition()
                .duration(500)
                //.attr("width", width)
                .attr("transform", "translate(-" + w + ",0) scale(" + sc + ",1)")
                //.attr("height", height)
                //.attr("x", 0)
                .style("opacity",0.05);
              setTimeout(function(){
              $('#lsr' + newi).trigger( "click" );
              $('#sr' + newi).trigger( "click" );
            },300);
          }
        })
        .on("contextmenu", function (d, i) {

            d3.event.preventDefault();
           // react on right-clicking
           var newi = (bar_interval_i);
           if(newi > 0 && newi < 7 && allloaded){
             div.html(" ").style("display","none");
             $('.serie rect').css('pointer-events','none');
              d3.selectAll('.serie')
              //d3.select(this)
              .transition()
              .duration(500)
              .attr("transform", "translate(" + width/4 + ",0) scale(.5,1)")
              //.attr("height", height)
              .style("opacity",0.05);
              setTimeout(function(){
              $('#lsr' + newi).trigger( "click" );
              $('#sr' + newi).trigger( "click" );
            },300);

           }
        })
        .attr("y", height)
        .attr("height", 0)
        .transition()
        .delay(function(d,i) { return i*4; })
        .duration(500)
        //.ease(d3.easeQuad)
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("y", function(d) { return y(d[1]); })
        .attr('loaded',1);

  var ticks;
  switch (bar_interval_i) {
    case 4:
    case 5:
      ticks = 6;
      break;
    case 6:
      ticks = 7;
      break;
    case 7:
      ticks = 13;
      break;
    case 2:
    case 3:
      ticks = 6; //5 minutes 5 seconds
      break;
    default:
      ticks = (1.0*end)/step+1;
      break;
  }
  var xaxis = d3.axisBottom(x)
              .tickFormat(d3.timeFormat(formats[bar_interval_i-1]))
              .ticks(ticks);

  svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xaxis);

  svg.append("g")
      .attr("class", "axis axis--y")
      .attr("x", -2)
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y).tickFormat(
        function(e){
          if(Math.floor(e) != e)
              return;
          return e;
        }).ticks(5)
      );
    var target = targets.targets;
    var tar = target.ta*target.ty*target.te/1000000;
    var ytar = y(step/cycleTime*tar);
    //console.log(step/cycleTime);
    svg.insert("line",":first-child")
      .attr('class','targetline')
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", ytar)
      .attr("y2", ytar);

  svg.insert("text",":first-child")
      .attr("text-anchor", "end")
      .text('target')
      .attr("fill",'#666')
      .attr("font-style",'italic')
      .attr("transform", "translate("+ (width) +","+(ytar-5)+")")
      .attr("font-size", "12px");

if(bar_interval_i <= 5){

  for (var i = grey_bars.length-1; i >= 0 ; i--) {
    grey_bars[i].value = 1;
    var all = true;
    for(var s = 1; s < shift_sel.length; s++){
      if(!shift_sel[s])
        all = false;
      if(shift_sel[s] && shifts[s])
        if(inShift(grey_bars[i].time.getTime()/1000-time_offset,shifts[s])){
          grey_bars[i].value = 0;
        }
    }
    if(all)
      grey_bars[i].value = 0;
      //grey_bars.splice(i, 0, {time:grey_bars[i].time,value:0});

    if(i == 0 || i == grey_bars.length - 1)
      grey_bars[i].value = 0;
  }


  var valueline = d3.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { if(d.value == 1) return height; else return 0; });

  svg.append("path")
        .data([grey_bars])
        .attr("class", "line")
        .attr('opacity',0.2)
        .attr('fill','black')
        .attr("d", valueline);
      }
}
