function drawbar(){
    var scale;
    var axis;
    var td;

    var inames = ['bback','back','fwd','ffwd','now'];

    function drawbar_scale(start,ind){
        if(!allloaded)
          return;
        var myStart = new Date(start);

        switch(ind-1){
            case 1:
                myStart.setMinutes(myStart.getMinutes());
                myStart.setSeconds(0);
                break;
            case 2:
                myStart.setHours(myStart.getHours());
                myStart.setMinutes(0);
                myStart.setSeconds(0);
                break;
            case 3:
                myStart.setHours(0);
                myStart.setMinutes(0);
                myStart.setSeconds(0);
                break;
            case 4:
              var currentDay = myStart.getDay();
              var distance = 0 - currentDay;
              myStart.setDate(myStart.getDate() + distance);
              myStart.setHours(0);
              myStart.setMinutes(0);
              myStart.setSeconds(0);
              break;
            case 5:
              myStart = new Date(myStart.getFullYear(), myStart.getMonth(), 1);
              break;
            case 6:
              myStart = new Date(myStart.getFullYear(), 0, 0);
              break;
        }

        bar_interval_i = ind;
        //myStart.setSeconds(start.getSeconds());

        //console.log(myStart.getSeconds());
        //myStart.setTime(myStart.getTime() - myStart.getTime()%(ints[ind-1]*1000) + time_offset*1000);
        slider_start = new Date(myStart);
        bar_start = new Date(slider_start);
        //console.log(myStart.getSeconds());
        var end = new Date(myStart);
        end.setSeconds(end.getSeconds() + ints[ind]);
        scale = d3.scaleTime()
            .domain([myStart,end])
            .range([0,width])
            .clamp(true);

        var ticks;
        switch (bar_interval_i) {
          case 5:
            ticks = ints[bar_interval_i]/ints[bar_interval_i-2];
            break;
          case 2:
            ticks = 12;
            break;
          default:
            ticks = ints[bar_interval_i]/ints[bar_interval_i-1];
            break;
        }
        axis = d3.axisBottom(scale)
            .ticks(ticks)
            .tickFormat(d3.timeFormat(b_formats[bar_interval_i]));


        d3.selectAll(".bar_axis").transition().duration(100).style("opacity", 0).remove();

        svg.append("g")
            .attr("class", "bar_axis")
            .attr("transform", "translate(0," + height + ")")
            .call(axis);

        var slidersize = new Date(slider_start);
        slidersize.setSeconds(slidersize.getSeconds() + ints[bar_interval_i-1]);
        td = scale(slidersize);

        setTimeout(function(){
          moveSlider(0);
          dragend(Object);
          slider.attr("width", td);
        },10);

        //d3.select(".bardate").style("opacity",0).transition().duration(700).style("opacity",1).text(d3.timeFormat("%Y-%m-%d_%H:%M:%S")(start));

    }

    var subdivide = 1;

    var margin = {top: 10, right: 110, bottom: 30, left: 20},
            width = 943 - margin.left - margin.right,
            height = 100 - margin.top - margin.bottom;

    var svg = d3.select(".timebar")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("titledata", "none")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    makeGradient(svg,"slider-gradient",1,0,'#ffa700','#b37500');
    makeGradient(svg,"bar-gradient",1,0,'#f6f6f6','#cfcfcf');

    drawbar_scale(start_day,4,0);

    var bar = svg.append("rect")
        .attr("x", -10)
        .attr("y", height-20)
        .attr("width", width+20)
        .attr("height", 20)
        .attr("class", "bar");
        //.attr("fill", "url(#bar-gradient)")



    svg.append("text")
        .attr("class","bardate")
        .attr("x", width/2)
        .attr("y", 40)
        .attr("dy", "1.2em");

    function moveBar(func){
      // bback 0
      // back 1
      // fwd 2
      // ffwd 3
      // now 4
      switch(func)
      {
        case 0:
          drawbar_scale(slider_start.getTime()-ints[bar_interval_i]*1000,bar_interval_i);
          break;
        case 1:
          drawbar_scale(slider_start.getTime()-ints[bar_interval_i-1]*1000,bar_interval_i); //check smaller inc
          break;
        case 2:
          drawbar_scale(slider_start.getTime()+ints[bar_interval_i-1]*1000,bar_interval_i);
          break;
        case 3:
          var diff = (bar_start.getTime()-scale.invert(slider.attr("x")).getTime())/1000;
          if (diff == 0)
            diff = ints[bar_interval_i];
          else
            diff = 0;
          drawbar_scale(slider_start.getTime()+diff*1000,bar_interval_i);
          break;
        case 4:
          drawbar_scale(roundDate(new Date()),bar_interval_i);
          break;
      }
    }


    var orig = d3.select(".timebar");
    d3.select(".timebarrow")
    .append("div")
    .attr("class", "select_period container")
    .append("div")
    .attr("class", "row")
    .append("div")
    .attr("class", "col-md-6");


    function addOptionShift(i,checked){
      var checked = (checked != undefined)
      $(".select_shift-main").append('<label class="shift-check" for="ss' + i + '" id="lss' + i + '">Shift ' + i + '</label>');
      var ip = document.createElement('input');
      $(ip)
        .attr('type','checkbox')
        .attr('name','sselect')
        .attr('value',i)
        .attr('id','ss' + i)
        .attr('class','shift-radio')
        .prop('checked',checked)
        .bind('click', function(){updateShift(i);});

      $(".select_shift-main").append(ip);
      $(".select_shift-main").append('<br>');
      $(ip).checkboxradio();
    }

    function addOption(i,checked){
      var checked = (checked != undefined)
      var ip = document.createElement('input');
      $(ip)
        .attr('type','radio')
        .attr('name','pselect')
        .attr('value',i)
        .attr('id','sr' + i)
        .attr('class','shift-radio')
        .prop('checked',checked)
        .bind('click', function(){updateScale(i+1);});

      $(".select_period .row .col-md-6").append(ip);
      $(".select_period .row .col-md-6").append('<label class="shift-radio-label" for="sr' + i + '" id="lsr' + i + '">' + fnames[i] + '</label>');
      //$(ip).checkboxradio();
    }

    function addButton(i,pre){

      var div = document.createElement('div');
      $(div)
        .attr('class','btn-move col-md-1')
        .bind('click', function(){moveBar(i);});

      var ico = document.createElement('div');
      $(ico)
        .attr('class','btn-move-icon btn-move-icon-'+inames[i]);

      var txt = document.createElement('p');
      $(txt)
        .attr('class','btn-move-text')
        .html(inames[i]);

      $(div).append(ico).append(txt);
      if(pre)
        $(".select_period .row").prepend(div);
      else
        $(".select_period .row").append(div);
      //$(ip).checkboxradio();
    }

    function updateScale(ind){
      if(adjust_time > 0){
        slider_start = new Date(adjust_time+time_offset*1000);
        adjust_time = 0;
      }
      bar_interval_i = ind;
      drawbar_scale(slider_start,bar_interval_i);
    }

    function updateShift(i){
      shift_sel[i] = !shift_sel[i];
      //refresh
      refresh();
      //console.log(shift_sel);
    }

    addButton(1,1);
    addButton(0,1);

    addOption(1);
    addOption(2);
    addOption(3,1);
    addOption(4);
    addOption(5);
    addOption(6);

    addButton(2);
    addButton(3);
    addButton(4);

    d3.select(".timebarrow .row")
    .append("div")
    .attr("class", "col-md-1 select_shift-main");


    addOptionShift(1,1);
    addOptionShift(2,1);
    addOptionShift(3,1);

    $(".select_shift-main .ui-checkboxradio-icon").css('display','none');

    function roundDate(timeStamp){
        timeStamp -= timeStamp % (24 * 60 * 60 * 1000);
        timeStamp += new Date().getTimezoneOffset() * 60 * 1000;
        return new Date(timeStamp);
    }
    function roundMonth(date){
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }


    bar.on("click", function() {
      //console.log(d3.event.pageX);
      var x = d3.event.pageX;
      var padright = 211;//parseInt($('.timebar').css('left')) + 11;
      x -= slider.attr("width") + margin.right;
      //console.log(x);
      moveSlider(x-margin.left-padright);
      dragend(Object());
      d3.event.stopPropagation();
    });

    var drag = d3.drag()
            .on("drag", dragmove)
            .on("start", function(d){
              slider.classed('slider-moving',true);
            })
            .on("end", dragend);


    var slider = svg.append("rect")
            .attr("y", height-20-5)
            .attr("width", td)
            .attr("height", 30)
            .attr("class", "slider")
            .call(drag);

    d3.select(".loading")
        .attr("width", 220)
        .attr("height", 220)
        .append("g")
        .attr("transform", "scale(1)")
        .html("<svg width='198px' height='198px' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid' class='uil-default'><rect x='0' y='0' width='100' height='100' fill='none' class='bk'></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00b2ff' transform='rotate(0 50 50) translate(0 -30)'>  </rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00b2ff' transform='rotate(30 50 50) translate(0 -30)'>  </rect><rect  x='46.5' y='40' width='7' height='20'"+ "rx='5' ry='5' fill='#00b2ff' transform='rotate(60 50 50) translate(0 -30)'>  </rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00b2ff' transform='rotate(90 50 50) translate(0 -30)'>  </rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00b2ff' transform='rotate(120 50 50) translate(0 -30)'>  </rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00b2ff' transform='rotate(150 50 50) translate(0 -30)'>  </rect><rect  x='46.5'"+ "y='40' width='7' height='20' rx='5' ry='5' fill='#00b2ff' transform='rotate(180 50 50) translate(0 -30)'>  </rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00b2ff' transform='rotate(210 50 50) translate(0 -30)'>  </rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00b2ff' transform='rotate(240 50 50) translate(0 -30)'>  </rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00b2ff' transform='rotate(270 50 50) translate(0"+ "-30)'>  </rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00b2ff' transform='rotate(300 50 50) translate(0 -30)'>  </rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00b2ff' transform='rotate(330 50 50) translate(0 -30)'>  </rect></svg>");

    function dragmove(d) {
        moveSlider((d3.event.x-td/2));
    }

    function moveSlider(x){
        //var nx = Math.max(0, Math.min(width - td, x));
        var sp = td/2;
        var nx = Math.max(0, Math.min(width-td, x));

        sx = (Math.round(nx / sp)) * sp;
        //week fix (overrrun) if
        if(sx+td > width)
          sx -= sp
        slider
        .attr("x", sx);
    }


    function dragend(d) {
        slider.classed('slider-moving',false);

        if(allloaded && !LOADING){
            LOADING = true;
            //console.log(bar_interval_i);
            var st = new Date(scale.invert(slider.attr("x")));
            d3.select(".loading").transition().duration(700).style("opacity", 1).style("display","block");
            //load failure -reload
            //fail = setTimeout(reffail,5000);
            slider_start = new Date(st);
            if(bar_interval_i >= 5)
              update((st.getTime()/1000)-time_offset,ints[bar_interval_i-1],ints[bar_interval_i-3]);
            else if(bar_interval_i <= 3)
              update((st.getTime()/1000)-time_offset,ints[bar_interval_i-1],ints[bar_interval_i-2]);
            else
              update((st.getTime()/1000)-time_offset,ints[bar_interval_i-1],600);
              //update((st.getTime()/1000)-time_offset,ints[bar_interval_i-1],ints[bar_interval_i-2]);
        }

    }

    var chart_margin = {top: 10, right: 30, bottom: 30, left: 30},
                chart_width = 400 - chart_margin.left - chart_margin.right,
                chart_height = 300 - chart_margin.top - chart_margin.bottom;
    d3.select(".chart")
        .attr("width", chart_width + chart_margin.left + chart_margin.right)
        .attr("height", chart_height + chart_margin.top + chart_margin.bottom)

    //dragend(Object);
}
