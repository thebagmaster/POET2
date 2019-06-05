function requestShifts(start,end,step){
  $.ajax({
    type: 'POST',
    url: "../shift",
    context: document.body,
    data: {
      'func': 0,
      'shift': 0,
      'db':db,
      'col':col
  }
  }).done(function(data) {
      updateShifts(start,end,step,data);
      updateLoading('shift');
  });
}

function checkDay(time,shift){
  var d = new Date(time*1000);
  var n = d.getDay();
  return in7bit(shift.days,n);
}

function inMinute(d,shift,pdts){

  var rtn = 0;

  var ins = inShift(d.getTime()/1000,shift);
  var nd = new Date(d.getTime() + time_offset*1000);

  if(ins)
    rtn += 60;
  //console.log(ch,cm,t.start.hour,t.start.min,t.end.hour,t.end.min);
  //console.log(after_start,before_end,rtn);

  //console.log(pdts);
  //console.log(ins,'here');

  if(!pdts)
    return rtn;
  for(var i = 0; i < pdts.length; i++){
    //console.log(d.getMinutes(),pdts[i].min,d.getHours(),pdts[i].hour);
    //console.log(d.getMinutes() >= pdts[i].min, d.getMinutes() < (pdts[i].min + pdts[i].len/60), d.getHours() == pdts[i].hour)
    if(nd.getMinutes() >= pdts[i].min && nd.getMinutes() < (pdts[i].min + pdts[i].len/60) && nd.getHours() == pdts[i].hour) {
      //console.log('zero');
      return 0;
    }
  }
  return rtn;
}

function getPossibleTime(time,shift,end){
  if(!shift.dts || !shift_sel[shift.shift])
    return 0;

  var d = new Date(time*1000);
  var e = new Date(end*1000);
  var dt = end-time;
  var days = dt/(24*60*60);
  var hours = dt/(60*60);

  var pdts = [];
  var put = 0;
  var pdt_day = 0;

  if(shift.dts)
  for(var j = 0; j < shift.dts.length; j++){
    pdts.push({hour:parseInt(shift.dts[j].split(',')[0].split(':')[0]),min:parseInt(shift.dts[j].split(',')[0].split(':')[1]),len:parseInt(shift.dts[j].split(',')[1])*60});
    pdt_day += pdts[j].len;
  }
  //console.log(pdts);

 // >= day
 if(days >= 1){
   var day,daycount=0;
   while(d < e)
   {
      day=d.getDay();
      //console.log(d);
      //if(day != 0 && day != 6)
      if(in7bit(shift.days,day)){
        daycount++;
      }
      d.setDate(d.getDate()+1) ;
    }
    put += daycount*(shift.seconds - pdt_day);

  }else{
    console.log(d,shift.days,d.getDay(),in7bit(shift.days,d.getDay()));
    if(in7bit(shift.days,d.getDay())){

      d = new Date(d.getTime());
      e = new Date(e.getTime());
      var min;
      while(d < e) {
         min=d.getMinutes();
         put += inMinute(d,shift,pdts);
         //console.log(put);
         d.setMinutes(d.getMinutes()+1) ;
       }
    }
  }
  return put;
}

function inShift(time,shift){
  var d = new Date((time+time_offset)*1000);
  var dates = shift_time_date(d,shift);
  var after_start = (d >= dates.start);
  var before_end = (d < dates.end);
  //console.log(d,after_start,before_end);
  //console.log(dates);
  return (after_start && before_end);
}

function filterShifts(data){
  //console.log(data);
  var key = '_id';
  if(data[0]['time'] != undefined)
    key = 'time';
  var all = true;
  for(var s = 1; s < shift_sel.length; s++)
    all = shift_sel[s];
  if(!all)
  for(var s = 1; s < shift_sel.length; s++){
    for(var i = data.length - 1; i >= 0; i--){
      //console.log(data[i]['_id'],new Date(data[i]['_id']*1000),inShift(data[i]['_id'],shifts[s]));
      if(!inShift(data[i][key],shifts[s]))
        data.splice( i, 1 );
    }
  //console.log(data);
  }
}

function updateShifts(start,end,step,data){
  if(data == 'no rows')
    return;

  if(shift_sel.length == 1)
  // for(var i = 0; i < data.length; i++){
  //   shift_sel[data[i].shift] = true;
  // }
  for(var i = 0; i <= 3; i++){
    shift_sel[i] = true;
  }

  var possible = 0;
  for(var i = 0; i < data.length; i++){
    shifts[data[i].shift] = data[i];
    if(shift_sel[data[i].shift]){
      var shift = shifts[data[i].shift];
      var pdt = 0;
      if(shift.dts)
        for(var j = 0; j < shift.dts.length; j++)
          pdt += parseInt(shift.dts[j].split(',')[1]);
      var t = shift_time_int(shift);

      shift.start_sec = t.start.hour*3600 + t.start.min*60;
      shift.end_sec = t.end.hour*3600 + t.end.min*60;
      if(t.end.hour < t.start.hour)
      shift.pdt = pdt;
      if(t.end.hour < t.start.hour)
        shift.total = (t.end.hour - t.start.hour + 24)*3600 + (t.end.min - t.start.min)*60;
      else
        shift.total = (t.end.hour - t.start.hour)*3600 + (t.end.min - t.start.min)*60;
      shift.seconds = shift.total  - pdt;

      possible += getPossibleTime(start,shift,start+end);
      console.log(start,shift,start+end,getPossibleTime(start,shift,start+end));
    }
  }
  shifts[0] = {possible:possible};
}
