function getOffset(){
  function secondSunday (month,year) {
    var date = new Date(year, month, 7);
    date.setDate(7 + (7 - date.getDay()));
    return date;
  }
  function firstSunday (month,year) {
    var date = new Date(year, month, 1);
    date.setDate(1+(7 - date.getDay()));
    return date;
  }
  var offset = 6;
  var year = new Date();
  year = year.getFullYear();

  var start = secondSunday(2,year);
  var end = firstSunday(10,year);
  var now = new Date();
  if(start < now && now < end)
    offset--;
  //console.log(start,end);
  return offset*60*60;
}

function refresh(){
  var newi = (bar_interval_i-1);
  $('#lsr' + newi).trigger( "click" );
  $('#sr' + newi).trigger( "click" );
}

function shifttolist(){
  r = [];
  all = true;
  for(var i =1; i < shift_sel.length; i++)
    if(shift_sel[i]){
      r.push(i);
    }else
      all = false;
    if(all)
      r.push(0);
  return r;
}

jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("click");
    e.dispatchEvent(evt);
  });
};

jQuery.fn.d3RClick = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("contextmenu");
    e.dispatchEvent(evt);
  });
};

d3.selection.prototype.getTransition = function() {
    if(this[0][0].__transition__) {
        return this[0][0].__transition__[1];
    } else return undefined;
}

function reffail(){
  console.log(d3.select(".loading").style("display"));
  if(d3.select(".loading").style("display") == "block"){
    console.log('clear');
    clearTimeout(fail);
    refresh();
  }
}

function resolve(inp){
  var r = '(' + inp + ')';
  if(name_dict[parseInt(inp)])
    r = name_dict[parseInt(inp)];
  return r;
}

function strip(txt){
  return txt.replace(/\W+/g, " ");
}



function secondsToStr (milliseconds) {

    function numberEnding (number) {
        return '';
        return (number > 1) ? 's' : '';
    }

    var temp = Math.floor(milliseconds);
    //var years = (temp / 31536000).toFixed(2);
    //if (years >= 1) {
    //    return years + ' y' + numberEnding(years);
    //}
    //TODO: Months! Maybe weeks?
    //var days = ((temp %= 31536000) / 86400).toFixed(2);
    //if (days >= 1) {
    //    return days + ' d' + numberEnding(days);
    //}
    var hours = (temp / 3600).toFixed(2);
    if (hours >= 1) {
        return hours + ' h' + numberEnding(hours);
    }
    var minutes = ((temp %= 3600) / 60).toFixed(2);
    if (minutes >= 1) {
        return minutes + ' m' + numberEnding(minutes);
    }
    var seconds = temp % 60;
    if (seconds >= 1) {
        return seconds + ' s' + numberEnding(seconds);
    }
    return '< 1s'; //'just now' //or other string you like;
}

function parseIntArray(array){
  for(var i = 0; i < array.length; i++)
    array[i] = parseInt(array[i]);
}

function shift_time_int(shift){
  //console.log(shift);
  var start = shift.start.split(':');
  var end = shift.end.split(':');

  parseIntArray(start);
  parseIntArray(end);

  return {start:{hour:start[0],min:start[1]}, end:{hour:end[0],min:end[1]}};
}

function shift_time_date(time,shift){
  var d = new Date(time.getTime());
  var e = new Date(time.getTime());
  var t = shift_time_int(shift);

  d.setMinutes(t.start.min);
  d.setHours(t.start.hour);
  e.setMinutes(t.end.min);
  e.setHours(t.end.hour);

  if(t.start.hour > t.end.hour)
    e.setDate(e.getDate()+1);

  return {start:d,end:e};
}

function bit_set(num, bit){
    return num | 1<<bit;
}
function get_bit(num, bit){
    return ((num>>bit) % 2 != 0)
}

function in7bit(bit7,dayofweek){
  return get_bit(bit7,dayofweek);
}

function timeStamp(now) {
  var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];
  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
  var suffix = ( time[0] < 12 ) ? "AM" : "PM";
  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
  time[0] = time[0] || 12;
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }
  return date.join("/") + " " + time.join(":") + " " + suffix;
}

    d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};
function createDateAsUTC(date) {
    date = new Date(date);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}
function createModal(id,title,text){
  var d = document.createElement('div');
  $(d).addClass('modal')
      .addClass('fade')
      .attr('id',id)
      .attr('role','dialog');

  var d2 = document.createElement('div');
  $(d2).addClass('modal-dialog');

  var d3 = document.createElement('div');
  $(d3).addClass('modal-content');

  var d4 = document.createElement('div');
  $(d4).addClass('modal-header')
        .html('<button type="button" class="close" data-dismiss="modal">&times;</button><h4 class="modal-title">'+title+'</h4>');

  var d5 = document.createElement('div');
  $(d5).addClass('modal-body')
        .html(text);

  var d6 = document.createElement('div');
  $(d6).addClass('modal-footer')
        .html('<button type="button" class="btn btn-default closemodal" data-dismiss="modal">Close</button>');

  $(d3).append(d4);
  $(d3).append(d5);
  $(d3).append(d6);
  $(d2).append(d3);
  $(d).append(d2);

  $("body").append(d);
}

function makeGradient(svg,id,x,y,inner,outer){
  var gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", id)
    .attr("x1", Math.floor(x*100) + "%")
    .attr("y1", Math.floor(y*100) + "%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", outer)
    .attr("stop-opacity", 1);

  gradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", inner)
    .attr("stop-opacity", 1);

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", outer)
    .attr("stop-opacity", 1);
}

function div(a,b){
  if(b==0){
    if(a != 0)
      return 1;
    if(a == 0)
      return 0;
  }
  return parseFloat(a)/b;
}

function div2(a,b){
  if(b == 0 || a == 0)
    return 0;
  return a/b;
}

var parseDate = d3.timeFormat("%Y/%m/%d");
var parseTime = d3.timeFormat("%_I:%M:%S");
