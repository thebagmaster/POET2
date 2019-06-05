$( document ).ready(function() {
    initTree();
    initParts();
    drawbar();
    initMenu();
    initAvail();
    initYield();
    initEff();
    createTitles();
});

var colors = {red:'#db3b3c',green:'#2ca066',orange:'#FF7F0E'};
//var colors = {red:'#1F77B4',green:'#ccc',orange:'#FF7F0E'};

var id_gap = 1000;
var id_stop = 1000;
var id_started = 2000;
var id_good = 5000;
var id_bad = 6000;

var dbtree = [
  {
    site:'NTH OEE Test',
    db:'oee',
    lines:[
      {
        name:'Line 1',
        prefix:'L1',
        plcs:[
          {
            name:'PLC 1',
            col:'PLC1'
          },
          {
            name:'PLC 2',
            col:'PLC2'
          }
        ]
      },
      {
        name:'Line 2',
        prefix:'L2',
        plcs:[
          {
            name:'PLC 1',
            col:'PLC1'
          },
          {
            name:'PLC 2',
            col:'PLC2'
          }
        ]
      },
    ]
  },
  {
    site:'NTH OEE Test2',
    db:'oee2',
    lines:[
      {
        name:'Line 1',
        prefix:'L1',
        plcs:[
          {
            name:'PLC 1',
            col:'PLC1'
          },
          {
            name:'PLC 2',
            col:'PLC2'
          }
        ]
      },
      {
        name:'Line 2',
        prefix:'L2',
        plcs:[
          {
            name:'PLC 1',
            col:'PLC1'
          },
          {
            name:'PLC 2',
            col:'PLC2'
          }
        ]
      },
    ]
  },
];

var db = dbtree[0].db;
var col = dbtree[0].lines[0].prefix + '_' + dbtree[0].lines[0].plcs[0].col;

var shift_sel = [true];

var LOADING = false;
var loaded = baseLoaded();
var allloaded = true;
var lkeys = Object.keys(loaded);
//var ints = [1,60,3600,86400,604800,2419200,31449600,314496000,15724800000];
//var ints = [1,60,3600,86400,604800,2629743,31556926,315569260,15778463000];
var ints = [1,60,3600,86400,604800,2592000,31536000,315360000,15778463000];
//   0:sec 1:min 2:hour 3:day 4:week 5:month 6:year 7:10year 8:50year
var formats = ["","%_I:%M:%S","%_I:%M","%_H:%M","%_m/%_d","%_m/%_d","W%U","%Y","%Y"];
var b_formats = ["",":%S",":%M","%_H","%_m/%_d","%_d","%_m","%Y","%Y"];
var tt_formats = ["","","%_I:%M:%S %p","%_I:%M %p","%_I:%M %p","%_m/%_d %I%p","%_m/%_d","W:%_W %_m/%_d",""];
var long_formats = ["","","%A %B %e %Y, %_I:%M %p","%A %B %e %Y, %_I:%M %p","%A %B %e %Y","Week %_U, Starting %A %B %e %Y","%B %Y","%Y",""];
//"%A %B %e %Y, %I:%M:%S%p"
var fnames = ["Second","Minute","Hour","Day","Week","Month","Year","Decade","Score"];
var interval = ints[2];
var start_day = new Date(2017,3,18);
var slider_start;
var bar_start;
var bar_add=0;
var bar_interval_i;
var time_offset=60*60*6;
var shifts = [];
var cycleTime;
var targets = {ta:90,ty:99,te:96};
var total_uptime;
var total_time;
var got_settings = 0;
var total_settings = 2;
var name_dict;

var part_data;
var avail_data;

var g_start,g_end,g_step;

var adjust_time = 0;

var fail;

//start_day.setTime(start_day.getTime()+time_offset*1000);

function getOEE(){
  //oee data
  $.ajax({
    type: 'POST',
    url: "../data",
    context: document.body,
    data: {
      'start': g_start,
      'end': g_end,
      'step': g_step,
      'type': 1,
      'db':db,
      'col':col,
      'shift':shifttolist()
  }
  }).done(function(data) {
      updateOEEStats(data);
      updateLoading('oee');
  });
}

function getAvail(){
  //avail data
  $.ajax({
    type: 'POST',
    url: "../data",
    context: document.body,
    data: {
      'start': g_start,
      'end': g_end,
      'step': g_step,
      'type': 2,
      'db':db,
      'col':col,
      'shift':shifttolist()
  }
  }).done(function(data) {
      //filterShifts(data);
      updateAvail(data,g_start,g_end,g_step);
      updateLoading('avail');
  });
}

function getYield(){
  //yield data
  $.ajax({
    type: 'POST',
    url: "../data",
    context: document.body,
    data: {
      'start': g_start,
      'end': g_end,
      'step': g_step,
      'type': 3,
      'db':db,
      'col':col,
      'shift':shifttolist()
  }
  }).done(function(data) {
      updateYield(data,g_start,g_end,g_step);
      updateLoading('yield');
  });
}

function getParts(){
  //g/b parts
  $.ajax({
    type: 'POST',
    url: "../data",
    context: document.body,
    data: {
      'start': g_start,
      'end': g_end,
      'step': g_step,
      'type': 0,
      'db':db,
      'col':col,
      'shift':shifttolist()
  }
  }).done(function(data) {
      //console.log(data);
      tmp = [];
      if(data != "no rows")
      $.each(data.reverse(), function(i, item) {
          tmp.push({"time":data[i].time, "event":data[i].event});
      });
      //filterShifts(data);
      updateParts(data,g_start,g_end,g_step);
      updateLoading('parts');
      LOADING = false;
  });
}

function getDict(){
  $.ajax({
    type: 'POST',
    url: "../dict",
    context: document.body,
    data: {
      'func': 0,
      'dict': 0,
      'db':db,
      'col':col
  }
}).done(function(data) {
  //console.log(data);
  updateDict(data);
  updateLoading('dict');
});
}

function baseLoaded(){
  return {
    shift:false,
    cycle:false,
    dict:false,
    target:false,
    oee:false,
    avail:false,
    yield:false,
    parts:false,
    main:false,
    eff:false
  };
}

function updateLoading(opt){
  allloaded = false;
  //console.log(opt);
  //console.log(loaded);

  if(opt != undefined){
    loaded[opt] = true;
  }

  var progress = 0;
  var pinc = Math.floor(100.0/lkeys.length);
  var whichloaded = [];
  var isallloaded = true;
  for (var l in lkeys) {
    //console.log(lkeys[l]);
    if(!loaded[lkeys[l]])
      isallloaded = false;
    else{
      whichloaded.push(lkeys[l]);
      progress+=pinc;
    }
  }
  //console.log(opt,whichloaded,whichloaded.indexOf('cycle'),whichloaded.indexOf('shift'));

  if(progress == pinc){ //first run
    $('.prog').fadeIn();
  }
  $('.prog').progressbar({value:progress});

  if(isallloaded){
    loaded = baseLoaded();
    allloaded = true;
    $('.prog').fadeOut();
    //clearTimeout(fail);
    console.log('loaded');
  }else if( whichloaded.includes('cycle') && whichloaded.includes('shift') && whichloaded.includes('dict') && !whichloaded.includes('main')) {
    updateLoading('main');
    getAvail();
    getYield();
    getParts();
  } else if( whichloaded.includes('avail') && whichloaded.includes('yield') && whichloaded.includes('parts') && !whichloaded.includes('oee')){
    getOEE();
  } else if( whichloaded.includes('avail') && whichloaded.includes('parts') && !whichloaded.includes('eff')) {
    updateEff();
    updateLoading('eff');
  }
}

function update(start,end,step){
  if(allloaded) {
    g_start = start;
    g_end = end;
    g_step = step;
    //shift data
    requestShifts(start,end,step);
    getCycle();
    getDict();
    getTarget();
  }
}
