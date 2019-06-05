function initMenu() {

  d3.select(".mainbutton").attr('value',"MAIN");
  createModal('about','About','<p>Automation NTH OEE <br> Version 0.01 </p>');
  $(".mainbutton").click(function(){
        $("#about").modal();
    });

  //d3.select(".settingsbutton").attr('value',"SETTINGS");

  //$('.menubuttonui').addClass('ui-button ui-widget ui-corner-all').button();


  var tabheader = '<ul class="nav nav-tabs">'+
                    '<li class="active"><a href="#tabshifts" data-toggle="tab">Shifts</a></li>'+
                    '<li><a href="#tabcycle" data-toggle="tab">Targets</a></li>'+
                    '<li><a href="#tabcodes" data-toggle="tab">Codes</a></li>'+
                    '<li><a href="#tabdata" data-toggle="tab">Data</a></li>'+
                  '</ul>';
  var tabs = '<div class="tab-content">'+
              '<div id="tabshifts" class="tab-pane fade in active"></div>'+
              '<div id="tabcycle" class="tab-pane fade"></div>'+
              '<div id="tabcodes" class="tab-pane fade"></div>'+
              '<div id="tabdata" class="tab-pane fade"></div>'+
             '</div>';
  var mainDiv = document.createElement('div');
  var shiftTimeContainer = document.createElement('div');
  var dtContainer = document.createElement('div');
  var shiftTimeField = document.createElement('fieldset');
  var dayField = $(document.createElement('fieldset')).append('<div class="btn-group btn-group-justified day_sel"></div>').find('div');
  var shiftRadioField = $(document.createElement('fieldset')).append('<div class="btn-group btn-group-justified shift_sel"></div>').find('div');
  var plannedDTField = document.createElement('fieldset');
  var timeLeg = document.createElement('legend');
  var dayLeg = document.createElement('legend');
  var shiftLeg = document.createElement('legend');
  var dtLeg = document.createElement('legend');
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function addTime(id,name,time){
    var i = document.createElement('input');
    $(i).attr('type','time')
        .attr('class','time-input form-control')
        .attr('value',time)
        .attr('name',id)
        .attr('id',id);

    //$(l).append(i);
    //$(l).append(name);
    var $div = $('<div class="input-group"><span class="input-group-addon time-label">'+name+'</span></div>').append(i);
      $(shiftTimeField).append($div);
  }

  function addDay(index,name){
    var id = 'checkbox-' + name;
    var i = $('<button></button>');
    i.attr('value',index)
        .attr('href','#')
        .attr('class','btn btn-default week-day')
        .bind('click', function(){
          //$(this).parent().parent().find('button').removeClass('checked');
          $(this).toggleClass('checked').blur();
        })
        .attr('id',id)
        .html(name);
    var li = $('<div class="btn-group"></div>').append(i);
    $(dayField).append(li);
  }

  function addRadio(name,shiftno){
    var id = 'shift-radio-' + shiftno;
    var i = $('<button></button>');
    i.attr('value',shiftno)
        .attr('href','#')
        .attr('class','btn btn-default')
        .bind('click', function(){
          $(this).parent().parent().find('button').removeClass('checked');
          $(this).addClass('checked').blur();
          updateShifts(0);
        })
        .attr('id',id)
        .html('Shift ' + shiftno);
    var li = $('<div class="btn-group"></div>').append(i);
    $(shiftRadioField).append(li);
  }

  function addPdt(name,id){
    var s = name.split(',');
    var t = s[0].split(':');
    var suf = ' AM';
    if(t[0] >= 12){
      suf = ' PM';
      if(t[0] > 12)
        t[0]-=12;
    }
    if(t[0] == 0)
      t[0] = 12;

    var d = document.createElement('div');
    $(d)
      .attr('class','saved-dt')
      .on('click', function(){$( this ).toggleClass( "saved-dt-selected" );})
      .attr('value',name)
      .html(t[0] + ':' + t[1] + suf + ' for ' + s[1] + ' minutes');
    $(dtContainer).append(d);
  }

  function updateShifts(func,shift,start,end,days,dts){
    //.addClass('checked')
    // 0 get 1 insert 2 remove
    if (func == 0){
      var curshift = $(shiftRadioField).find(".checked").attr('value')[0];
      $.ajax({
        type: 'POST',
        url: "../shift",
        context: document.body,
        data: {
          'shift': curshift,
          'start': start,
          'end': end,
          'days': days,
          'dts': dts,
          'func': func,
          'db':db,
          'col':col
      }
      }).done(function(data) {
          //console.log(data);
          $(".saved-dt").remove();
          if(data != "no rows"){
            $.each(data, function(i, item) {
              $("#shift-start").val(item.start);
              $("#shift-end").val(item.end);
              bitsto7days(item.days);
              $.each(item.dts, function(i, item) {
                addPdt(item,item);
              });
              //console.log(item);
            });
          }else{
            $("#shift-start").val("08:00");
            $("#shift-end").val("17:00");
            bitsto7days(0);
          }
      });
    }else{
      $.ajax({
        type: 'POST',
        url: "../shift",
        context: document.body,
        data: {
          'shift': shift,
          'start': start,
          'end': end,
          'days': days,
          'dts':dts,
          'func': func,
          'db':db,
          'col':col
      }
      }).done(function(data) {
          //console.log(data);
          tmp = [];
          if(data != "false"){
            $('.indicator')
              .removeClass('saving')
              .removeClass('glyphicon-repeat')
              .addClass('success')
              .addClass('glyphicon-ok')
              .fadeOut();
          }
      });
      updateShifts(0);
    }
  }


  addTime('shift-start','Start','08:00');
  addTime('shift-end','End','18:00');

  $.each(days,addDay);

  $(shiftLeg).html("Shift");
  addRadio("Shift 1",1);
  addRadio("Shift 2",2);
  addRadio("Shift 3",3);


  $(dtContainer).attr('class','saved-shifts');
  $(dtLeg).html("Planned DT");
  //addPdt('time period');


  var i = document.createElement('input');
  $(i).attr('type','time')
      .attr('class','time-input form-control')
      .attr('value','10:00')
      .attr('name','dtTime')
      .attr('id','dtTime');
  var n = document.createElement('input');
  $(n).attr('type','number')
      .attr('value','10')
      .attr('class','form-control')
      .attr('name','dtAmt')
      .attr('min','1')
      .attr('max','120')
      .attr('id','dtAmt');
  var irow1 = $('<div class="input-group"></div>');
  irow1.append('<span class="input-group-addon">Time</span>');
  irow1.append(i);

  var irow2 = $('<div class="input-group"></div>');
  irow2.append(n);
  irow2.append('<span class="input-group-addon">Minutes</span>');
  var brow = $('<div class="btn-group"></div>');
  brow.append('<button type=button class="btn btn-default addPdt" style="width:96px">Add</button>');
  brow.append('<button type=button class="btn btn-default delShift" style="width:95px">Delete</button>');

  $(plannedDTField).append(irow1);
  $(plannedDTField).append(irow2);

  $(plannedDTField).append(brow);
  $(plannedDTField).append('<br><br>');


  $(shiftTimeContainer).attr('class','shift-time');shiftLeg
  $(shiftTimeContainer).append('<br>');
  $(shiftTimeContainer).append(shiftLeg);
  $(shiftTimeContainer).append(shiftRadioField);
  $(shiftTimeContainer).append('<br><br>');
  $(timeLeg).html("Time");
  $(shiftTimeContainer).append(timeLeg);
  $(shiftTimeContainer).append(shiftTimeField);
  $(dtContainer).append(dtLeg);
  $(dtContainer).append(plannedDTField);
  $(mainDiv).append(tabheader);
  $(mainDiv).append(tabs);
  var $shift = $(mainDiv).find('#tabshifts');
  $shift.append(shiftTimeContainer);
  $shift.append(dtContainer);
  $shift.append('<br><br>');
  $(dayLeg).html("Day");
  $shift.append(dayLeg);
  $shift.append(dayField);
  $shift.append('<br><br>');

  var $targets = $(mainDiv).find('#tabcycle');
  $targets.append('<div class="input-group"><span class="input-group-addon">Ideal Cycle Time</span>'+
                    '<input class="form-control" type=number value=1 name=ct id=ct></input>' +
                    '<span class="input-group-addon">Second(s)</span>' +
                    '<button type=button class="form-control saveCycle">Save</button>' +
                    '</div>');
  $targets.append('<div class="input-group"><span class="input-group-addon">Target Availability</span>'+
                    '<input class="form-control" type=number value=90 name=ta id=ta></input>' +
                    '<span class="input-group-addon">Percent(%)</span>' +
                    '<button type=button class="form-control saveTarget">Save</button>' +
                    '</div>');
  $targets.append('<div class="input-group"><span class="input-group-addon">Target Yield</span>'+
                    '<input class="form-control" type=number value=99 name=ty id=ty></input>' +
                    '<span class="input-group-addon">Percent(%)</span>' +
                    '<button type=button class="form-control saveTarget">Save</button>' +
                    '</div>');
  $targets.append('<div class="input-group"><span class="input-group-addon">Target Efficiency</span>'+
                    '<input class="form-control" type=number value=96 name=te id=te></input>' +
                    '<span class="input-group-addon">Percent(%)</span>' +
                    '<button type=button class="form-control saveTarget">Save</button>' +
                    '</div>');


  var $codes =  $(mainDiv).find('#tabcodes');
  $codes.append('<div class="code-holder"></div>');
  $codes.append('<div class="input-group">'+
                  '<input class="form-control" type=number placeholder="New Code" id=addcode></input>'+
                  '<span class="input-group-addon"></span>' +
                  '<button class="form-control" type=button onclick=newcode()>Add</button>'+
                '</div>');
  $codes.append('<button class="form-control" type=button onclick=savedict()>Save</button>');


  var $data =  $(mainDiv).find('#tabdata');
  $data.append('<div class="form-group">'+
                '<label for="partsdata">Parts Data:</label>'+
                '<textarea class="form-control" rows="5" id="partsdata"></textarea>'+
               '</div>');
   $data.append('<div class="form-group">'+
                 '<label for="availdata">Availability Data:</label>'+
                 '<textarea class="form-control" rows="5" id="availdata"></textarea>'+
                '</div>');
    $data.append('<div class="form-group">'+
                '<label for="yielddata">Yield Data:</label>'+
                '<textarea class="form-control" rows="5" id="yielddata"></textarea>'+
               '</div>');


  createModal('settings','Settings',mainDiv);
  $("#settings .modal-footer").prepend('<span class="glyphicon indicator"></span><button type=button class="btn btn-default saveShift">Save</button>');

  $(".settingsbutton").click(function(){
        $("#settings").modal();
        //getCycle();
        $("#shift-radio-1").addClass('checked');
        //$(".modal .shift-radio").click( "refresh" );
        updateShifts(0);
    });
  $( ".closemodal" ).on("click",refresh);
  $( ".saveCycle" ).on("click",saveCycle);
  $( ".saveTarget" ).on("click",saveTarget);
  $( "fieldset" ).attr('class','ui-controlgroup ui-controlgroup-horizontal ui-helper-clearfix');

  $(".addPdt").click(function(){
      var start = $("#dtTime").val();
      var mins = $("#dtAmt").val();
      var concat = start+','+mins;
      addPdt(concat,concat);
    });

  $(".saveShift").click(function(){
      $('.indicator')
        .removeClass('success')
        .removeClass('glyphicon-ok')
        .addClass('saving')
        .addClass('glyphicon-repeat')
        .fadeIn();

      var shift = $(shiftRadioField).find(".checked").attr('value')[0];

      var days = [];
      $(dayField).find(".checked").each(function(ind,ele){days.push(parseInt(ele.value));});
      //console.log(days);
      days = daysto7bit(days);

      var start = $("#shift-start").val();
      var end = $("#shift-end").val();

      var dts = [];
      $(dtContainer).find(".saved-dt").each(function(ind,ele){
        dts.push($(ele).attr('value'));
      });
      //console.log(dts);

      updateShifts(1,shift,start,end,days,dts);

      saveCycle();
      saveTarget();
      savedict();
    });

  $(".delShift").click(function(){
    $(dtContainer).find(".saved-dt-selected").each(function(ind,ele){
      $(ele).remove();
    });
  });

  $('.tab-pane').children().css('font-family','Lato');

  function bitsto7days(daysint){
    $(dayField)
      .find(".week-day")
        .each(function(ind,ele){
          if(get_bit(daysint,ind))
            $(ele).addClass("checked");
          else
            $(ele).removeClass("checked");
        });
  }

  function daysto7bit(days){
    var rtn = 0;
    for(var i = 0; i < days.length; i++){
        rtn = bit_set(rtn,days[i]);
    }
    return rtn;
  }

}

function saveCycle(){
  var cycle = $("#ct").val();
  //console.log(cycle);
  $.ajax({
    type: 'POST',
    url: "../cycle",
    context: document.body,
    data: {
      'func': 1,
      'cycle': cycle,
      'db':db,
      'col':col
  }
}).done(function(data) {});
}

function getCycle(){
  $.ajax({
    type: 'POST',
    url: "../cycle",
    context: document.body,
    data: {
      'func': 0,
      'cycle': 0,
      'db':db,
      'col':col
  }
}).done(function(data) {
  //console.log(data);
  $("#ct").val(data[0].cycle);
  cycleTime = data[0].cycle;
  updateLoading('cycle');
});
}

function saveTarget(){
  var ta = $("#ta").val();
  var ty = $("#ty").val();
  var te = $("#te").val();
  //console.log(cycle);
  $.ajax({
    type: 'POST',
    url: "../target",
    context: document.body,
    data: {
      'func': 1,
      'dict': {ta:ta,ty:ty,te:te},
      'db':db,
      'col':col
  }
}).done(function(data) {});
}

function getTarget(){
  $.ajax({
    type: 'POST',
    url: "../target",
    context: document.body,
    data: {
      'func': 0,
      'dict': 0,
      'db':db,
      'col':col
  }
}).done(function(data) {
  //console.log(data);
  $("#ta").val(data[0].targets.ta);
  $("#ty").val(data[0].targets.ty);
  $("#te").val(data[0].targets.te);
  targets = data[0];
  updateLoading('target');
});
}

function newcode(){
  var key = $("#addcode").val();
  $("#addcode").val('');
  var $codes = $('#tabcodes .code-holder');
  $codes.append('<div class="input-group codes">'+
                '<span class="input-group-addon">'+key+'</span>'+
                '<input type="text" class="form-control" placeholder="New Description" id=dict'+key+'>'+
                '</div>');
}

function updateDict(data){
  name_dict = data[0].dict;
  var $codes = $('#tabcodes .code-holder');
  var keys = Object.keys(name_dict);
  keys.sort();
  $codes.empty();
  keys.forEach(function(key,i){
    $codes.append('<div class="input-group codes">'+
                  '<span class="input-group-addon">'+key+'</span>'+
                  '<input type="text" class="form-control" value="'+name_dict[key]+'" id=dict'+key+'>'+
                  '</div>');
  });
}

function savedict(){
  var dict = {};
  $('#tabcodes .code-holder .codes').each(function(i,e){
    var $e = $(e);
    var key = $e.find('span').text();
    var val = $e.find('input').val();
    dict[key] = val;
  });
  //console.log(cycle);
  $.ajax({
    type: 'POST',
    url: "../dict",
    context: document.body,
    data: {
      'func': 1,
      'dict': dict,
      'db':db,
      'col':col
  }
}).done(function(data) {});
}
