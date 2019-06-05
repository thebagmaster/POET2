function updateOEEStats(data){
  var comma_ = d3.format(",d");
  var pct_ = d3.format(".1%");
  var tot_ = d3.format(".1f");
  var cyc_ = d3.format(".2f");
  var target = targets.targets;
  target.to = target.ta * target.ty * target.te;
  target.to /= 100*100;

  if(d3.select(".oeePct").empty())
  {
    var margin = {top: 10, right: 12, bottom: 30, left: 10},
                width = 220 - margin.left - margin.right,
                height = 410 - margin.top - margin.bottom;

    var current = margin.top + 100;

    var svg = d3.select(".oeestats")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("titledata", "none");

    svg.append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", width)
        .attr("height", 130)
        .attr("fill", "none");

    svg.append("text")
        .attr("class", "oeetext")
        .attr("text-anchor", "middle")
        .attr("fill", '#666')
        .text("OEE")
        .attr("transform", "translate("+ (margin.left+width-13) +","+(margin.top + 70)+")")
        .attr("font-size", "20px");

    svg.append("text")
        .attr("class", "oeePct")
        .attr("text-anchor", "end")
        .text("78.6")
        .attr("fill",colors.orange)
        .attr("transform", "translate("+ (margin.left+width-33) +","+(margin.top + 70)+") scale(0.9,1)")
        .attr("font-size", "80px");

    //console.log(targets);

    svg.append("text")
        .attr("class", "oeePctt")
        .attr("text-anchor", "middle")
        .text('target:' + tot_(target.to))
        .attr("fill",'#666')
        .attr("font-style",'italic')
        .attr("transform", "translate("+ (margin.left+width/2) +","+(margin.top + 84)+")")
        .attr("font-size", "12px");

      function createLabel(label,tclass,color,bold,tiny){
        var fw = 'normal';
        var sz = '18px';
        var add = 20;
        var classadder ='';

        if(tiny){
          svg.append("text")
              .attr("class", tclass)
              .attr("text-anchor", "middle")
              .text('target:' + tot_(label))
              .attr("fill",'#666')
              .attr("font-style",'italic')
              .attr("transform", "translate("+ (margin.left+width/2) +","+(current-8)+")")
              .attr("font-size", "12px");
          current += 7;
          return;
        }

        if(color==undefined)
          color = "#000";

        if(bold){
          fw = 'bolder';
          classadder = ' oeetitle';
        }else{
          sz = '14px';
          add = 16;
        }



        svg.append("text")
            .attr("class", "oeelabel"+classadder)
            .attr("font-weight", fw)
            .attr("text-anchor", "start")
            .text(label)
            .attr("transform", "translate("+ (margin.left) +","+(current)+")")
            .attr("font-size", sz);

        svg.append("text")
            .attr("class", tclass)
            .attr("text-anchor", "end")
            .text("00.0")
            .attr("fill",color)
            .attr("font-weight", fw)
            .attr("transform", "translate("+ (margin.left+width) +","+(current)+")")
            .attr("font-size", sz);

        current += add;
      }

      current += 35;
      createLabel("Availability","oeeAvailability",undefined,true);
      createLabel(target.ta,"oeeAvailabilityt",undefined,true,true);
      createLabel("Planned","oeePlanned");
      createLabel("Actual","oeeUp");
      current += 40;

      createLabel("Yield","oeeYield",undefined,true);
      createLabel(target.ty,"oeeYieldt",undefined,true,true);
      createLabel("Good","oeeGood",colors.green);
      createLabel("Bad","oeeBad",colors.red);
      //createLabel("Total","oeeTotal");
      current += 40;
      createLabel("Efficiency","oeeEfficiency",undefined,true);
      createLabel(target.te,"oeeEfficiencyt",undefined,true,true);
      createLabel("Cycle Time","oeeCt");
      createLabel("Ideal Cycle","oeeIct");
  }
  function oeecolor(pct,tar){
    var t = tar/100.0;
    var dn = t - (1.0-t)*0.1;
    //console.log(pct,t,dn);
    if(pct > t)
      return colors.green;
    else if(pct > dn)
      return colors.orange;
    else
      return colors.red;
  }



  function fix(v,max){
    if(isNaN(v))
      v = 0;
    v = Math.max(0,v);
    if(max != undefined)
      v = Math.min(max,v);
    return v;
  }

  function pct(v){
    return pct_(fix(v));
  }

  function pct100(v){
    return pct_(v/100);
  }

  function comma(v){
    return comma_(fix(v));
  }

  function tot(v){
    return tot_(fix(v));
  }

  var avail;
  var eff;
  var yield_;

  avail = 1;
  eff = 1;

  var rct = div(total_uptime,data[0]['total']);//spp
  //console.log(total_uptime,shifts[0].possible);
  avail = div(total_uptime,shifts[0].possible);

  eff = div(cycleTime,rct);

  yield_ = div(data[0]['good'],data[0]['total']);

  var total = avail*eff*yield_;

  d3.select(".oeeGood")
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text(comma(data[0]['good']));

  d3.select(".oeeBad")
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text(comma(data[0]['bad']));

  d3.select(".oeeTotal")
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text(comma(data[0]['total']));

  d3.select(".oeeAvailability")
    .attr("fill",oeecolor(avail,target.ta))
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text(pct(avail));

  d3.select(".oeeEfficiency")
    .attr("fill",oeecolor(eff,target.te))
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text(pct(eff));

  d3.select(".oeeYield")
    .attr("fill",oeecolor(yield_,target.ty))
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text(pct(yield_));

  d3.select(".oeePct")
    .attr("fill",oeecolor(total,target.to))
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text(tot(total*100));

  d3.select(".oeePlanned")
    .attr("fill",'black')
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text(secondsToStr(shifts[0].possible));

  d3.select(".oeeUp")
    .attr("fill",'black')
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text(secondsToStr(total_uptime));

  d3.select(".oeeCt")
    .attr("fill",'black')
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text(cyc_(rct) + 's');

  d3.select(".oeeIct")
    .attr("fill",'black')
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text(cyc_(cycleTime) + 's');

  d3.select(".oeeAvailabilityt")
    .attr("fill",'#666')
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text('target: '+pct100(target.ta));

  d3.select(".oeeEfficiencyt")
    .attr("fill",'#666')
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text('target: '+pct100(target.te));

  d3.select(".oeeYieldt")
    .attr("fill",'#666')
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text('target: '+pct100(target.ty));

  d3.select(".oeePctt")
    .attr("fill",'#666')
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .text('target: '+tot_(target.to));
}
