// switch this to module.exports later

'use strict';

const fs = require('fs');
const _  = require('lodash');

function f(e, params) {
  return Object.assign(document.createElement(e), params);
}
/*
 *  TODO!!!
 *  use localstorage to persist state between electron reload changes.
 *  so hopefully the app can still function even if it's being reloaded every time
 *  log.json changes.
 */

const topFragment = document.createDocumentFragment();
const header = createHeader();
const UI = {

  cliActive: false,

  buildListView: function () {

    const container =   f('div', { id: 'list-container' });

    const mon = f('img', { className: 'mon', src: 'mon.svg'});

    container.append(mon);
    setTimeout(function() {
      mon.parentNode.removeChild(mon);
    }, 4000);
   
    var form = addInput();
    form.addEventListener("submit", createEntry, false);
    container.append(form);
    var entries = buildEntries(Grimoire.entries);
    var cli = buildCli();
    appendAll(entries, container);
    topFragment.append(header);
    topFragment.append( f('br') );
    topFragment.append(container);
    main.append(topFragment);
 
    // @FIXME JUST PUTTING THIS HERE FOR NOW
    
    document.onkeypress = (e) => {
      if ( this.cliActive === false ) {
        console.log('hit');
        main.append(cli);
        cli.firstChild.focus();
        container.className += ' faded';
        this.cliActive = true;

      }
    }

    cli.oninput = function () {
      let el = document.getElementById('cli-input');
      parseCli(el);
    }
   
  },


  buildGraphView: function () {
    var monthTitle = f('h3', { className: 'graph-title', innerHTML: "month to date" });
    //const container = buildLastMonthGraph( Grimoire.entries );
    const container = buildThirtyDayGraph( Grimoire.entries );
    
    topFragment.append(header);
    topFragment.append(monthTitle);
    topFragment.append(container);

    var title = f('h3', { className: 'graph-title', innerHTML: "year to date" });
    topFragment.append(title);
    const gridContainer = buildGridGraph( Grimoire.entries );

    topFragment.append(gridContainer);
    document.body.append(topFragment);
  }
}

function buildCli ( ) {
  var cliContainer = f('div', { className: 'cli-wrapper' });
  var cliInput = f('input', { id: 'cli-input' });
  var cliInstructions = f('div', { className: 'cli-instructions', innerHTML: 'start typing a command.' });

  cliContainer.append(cliInput);
  cliContainer.append(cliInstructions);

  return cliContainer;
}

function parseCli ( el ) {
  let val = el.value;
  val.toLowerCase();
  let words = val.split(' ');
  for (let word of words ) {
    switch ( word ) {
      case 'start':
        console.log('hit the switch statement.');
        var instructionsDiv = document.querySelector('.cli-instructions');
        console.log(instructionsDiv);
        // @FIXME this isn't the right way to check if the returned NodeList is empty.
        if ( instructionsDiv == null ) {
          break;
        }
        instructionsDiv.innerHTML = '<b>start [area] [description]</b>';
        break;
      default:
        break;
    }
  }
}

function buildThirtyDayGraph ( entries ) {
  let unit    = 6;   // half of the 12px dot grid.
  let gap     = 0;
  let spacing = 24;

  const container = f('div', { className: 'bar-graph-container' });

  const getDayOfEntry = entry => {
    let date = new Date(entry['datetime']);
    return date.getDate();
  }
  // this works
  const res = _.groupBy(entries, getDayOfEntry);

  let now = new Date();
  let then = new Date();
  then.setDate( now.getDate() - 30 );

  for ( let day = new Date(); day > then; day.setDate(day.getDate() - 1) ) {
    let month = day.getMonth() + 1;
    let date   = day.getDate();

    var bar = f('div', { className: 'bar' });
    var label = f('div', { className: 'bar-label', innerHTML: month + '/' + date });
    bar.append(label);

    gap += spacing;

    let arr = res[date];

    console.log('res of date: ' + JSON.stringify(res[date]));

    if ( arr != undefined ) {
    
      var init = 0;
      let totalTime = arr.reduce(
        ( acc, curr ) => acc + parseFloat(curr.time)
        , init
      );
      console.log('totalTime: ' + totalTime);
      let barHeight = clamp(totalTime * unit, 0, 72);
      barHeight = Math.floor(barHeight);

      bar.style.cssText += 'height: ' + barHeight + 'px;';
      bar.style.cssText += 'left: ' + gap + 'px;';
      bar.style.maxHeight = '100%';
    } else {
      bar.style.cssText += 'height: 2px;';
      bar.style.cssText += 'left: ' + gap + 'px;';
    }
    container.append(bar);
  }

  console.log('result: ' + JSON.stringify(res));
  return container;
}

function buildLastMonthGraph ( entries ) {

  const container   = f('div', { className: 'bar-graph-container' });

  let unit = 6;
  let gap = 0;
  let spacing = 24;

  let count = 0;

  let now = new Date();
  let then = new Date();
  then.setDate( now.getDate() - 31 );

  var timePerDay = [];
  for (let day = new Date(now); day > then; day.setDate(day.getDate() - 1) ) {
    console.log("the day is: " + day);

    var bar = f('div', { className: 'bar' });
    var label = f('div', { className: 'bar-label', innerHTML: ( day.getMonth() + 1 ) + '/' + day.getDate() });
    bar.append(label);

    gap += spacing;

    let totalTimePerDay = 0;
    for ( let entry of entries ) {

      let date = new Date( entry['datetime'] );
      if ( sameDay(date, day) ) {

        let time = entry['time'];
        let barHeight = clamp(time * unit, 0, 72);
        console.log("height: " + barHeight);
        bar.style.cssText += 'height: ' + barHeight + 'px;';
        bar.style.cssText += 'left: ' + gap + 'px;';

        bar.append(label); 
        var icon = pickIcon( entry['area'] );
        bar.append(icon);
        setTimeout(function() {
          bar.className += ' h';
        }, 300);
      } else {
        bar.style.cssText += 'height: 2px;';
        bar.style.cssText += 'left: ' + gap + 'px;';
      }
    }
    container.append(bar);
  }

  return container;
}

function buildGridGraph ( entries ) {
  var gridContainer = f('div', { id: 'grid-container' });

  let now = new Date();
  let then = new Date();
  then.setDate( now.getDate() - 365 );

  
  for (let day = new Date(now); day > then; day.setDate(day.getDate() - 1) ) {
    let box = f('div', { className: 'grid-box' });

    // this literally isn't correct
    for ( let entry of entries ) {
      let date = new Date( entry['datetime'] );
      if ( sameDay(date, day) ) {
        //box.style.backgroundColor = colorFromHours( entry['time'] );
        box.style.background = colorFromHours(entry['time']);
      }
    }

    gridContainer.append( box );
  }
  
  /*
  for (let i=0; i < 365; i++) {
    gridContainer.append( f('div', { className: 'grid-box' }) );
  }
  */

  return gridContainer;

}

function update(container) { 
  while ( container.firstChild ) {
    container.removeChild( container.firstChild );
  }

  var form = addInput();
  form.addEventListener("submit", createEntry, false);
  container.append(form);

  var divs = buildEntries( Grimoire.entries );

  appendAll(divs, container);

  topFragment.append(container);
}

function createEntry (e) {

  console.log('pow');
  
  var datetime = Date.now();
  var id   = md5(datetime);
  var area = e.target.elements[0].value;
  var time = e.target.elements[1].value;
  var insp = e.target.elements[2].value;
  var proj = e.target.elements[3].value;
  var desc = e.target.elements[4].value;

  Grimoire.entries.unshift({ id, datetime, area, time, insp, proj, desc });
  Grimoire.update();

  var div = buildEntry({ datetime, area, time, insp, proj, desc });
  let form = document.getElementById("new-entry-form");
  form.parentNode.removeChild(form);
  document.getElementById("list-container").insertAdjacentElement('afterbegin', div);
  document.getElementById("list-container").insertAdjacentElement('afterbegin', addInput());
  //document.getElementById("list-container").append(div);

  //console.log( JSON.stringify( data.get('entries') ) );
  e.preventDefault();
}

function appendAll ( divs, container ) {
  for ( var div of divs ) {
    container.append(div);
  }
}

function createHeader() {

  var div = f('div', { id: 'header' });
  var header = f('img', { className: 'logo c1 spin', src: 'mon.svg' });
  var title = f('div', { className: 'title', innerHTML: '<b>TAIRO</b>' }); 

  div.append(header);
  div.append(title);

  const icons = f('div', { className: 'icon-bar' });
  icons.append( f('i',   { id: 'new-btn', className: 'fa fa-edit pad-icn' }) );
  icons.append( f('i',   { id: 'new-btn', className: 'fa fa-signal pad-icn' }) );
  let graphBtn = f('i',  { id: 'graph-btn', className: 'fa fa-chart-pie pad-icn' });
  graphBtn.addEventListener('click', handleGraphClick, false);
  icons.append(graphBtn);
  icons.append( f('i',   { id: 'new-btn', className: 'fa fa-crow pad-icn' }) );

  icons.append( f('i',   { id: 'timer', className: 'fa fa-stopwatch stopwatch' }) );

  div.append(icons);

  return div;
}

function createTextHeader() {
  var div = f('div', { id: 'header' });
  var header = f('img', { className: 'logo c1 spin', src: 'mon.svg' });
  var title = f('div', { className: 'title', innerHTML: '<b>LIME</b>' }); 
  
  var list = f('ul', { className: 'text-bar' });
  list.append( f('li', { className: 'link', innerHTML: 'entries' }) );
  list.append( f('li', { className: 'link', innerHTML: 'projects' }) );
  list.append( f('li', { className: 'link', innerHTML: 'graph' }) );

  div.append(header);
  div.append(title);
  div.append(list);
  return div;
}

function addInput () {
  var fields = [];

  var form = f('form', { id: 'new-entry-form' });

  //form.append( f('div',   { className: 'date c1', innerHTML: 'NEW' }));
  form.append( f('input', { className: 'input-small c2', placeholder: 'area' }));
  form.append( f('input', { className: 'input-small c3', placeholder: 'time' }));
  form.append( f('input', { className: 'input-small c4', placeholder: 'insp' }));
  form.append( f('input', { className: 'input-med   c5 project', placeholder: 'project' }));
  form.append( f('input', { className: 'c6 desc', placeholder: 'description' }));
  form.append( f('input', { type: 'submit', style: 'position: absolute; left: -9999px' }) );

  return form;
}

function buildEntry ( entry ) {
  
  var date  = new Date( entry.datetime );
  console.log('date: ' + date);
  var month = date.getMonth() + 1;
  var day   = date.getDate();

  var div = f('div', { className: 'wrapper' } );

  div.append( f('div', { className: 'date c1 fi', innerHTML: "<b>" + month + "/" + day + "</b>"}) );

  var icon = f('div', { className: 'area c2 shade fi' });

  icon.append( pickIcon( entry.area ) );

  div.append(icon);

  div.append( f('div', { className: 'time c3 shade fi', innerHTML: entry.time }) );
  div.append( f('div', { className: 'insp c4 shade fi', innerHTML: entry.insp }) );
  div.append( f('div', { className: 'project c5 shade fi', innerHTML: entry.proj }) );
  div.append( f('div', { className: 'desc c10 shade fi', innerHTML: entry.desc }) );

  return div;
}

function pickIcon ( area ) {

  switch(area) {
    case "mus":
      return f('i', { className: 'fa fa-headphones fi' });
      break;
    case "phy":
      return f('i', { className: 'fa fa-running fi' });
      break;
    case "art":
      return f('i', { className: 'fa fa-pen-fancy fi' });
      break;
    case "prg":
      return f('i', { className: 'fa fa-terminal fi' });
      break;
    default:
      return f('i', { className: 'fa fa-headphones fi' });
      break;
  }

}

function createBubble ( e ) {
  let el = e.target;
  console.log('offset: ' + el.offsetTop);
  var bubble = f('div', { className: 'speech-bubble', innerHTML: 'testing' });

  bubble.style.left = '-5em';
  bubble.style.top  = el.offsetTop + 20 + 'px';
  el.appendChild(bubble);

}


function buildEntries ( entries ) {

  var divs = [];

  for ( const entry of entries ) {
    var div = buildEntry(entry);
    divs.push(div);
  }

  return divs;
}

function handleClick() {
  var container = document.getElementById('list-container');

  while( container.firstChild ) {
    container.removeChild(container.firstChild);
  }
}

function handleGraphClick() {

  while( document.body.firstChild ) {
    document.body.removeChild(document.body.firstChild);
  }

  UI.buildGraphView();
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function colorFromHours ( hrs ) {
  let startHue = 205;
  let endHue   = 148;
  let saturation = 1.0;
  let value    = 0.64;
  let alpha    = 1.0;

  let hueDifference = startHue - endHue;

  // just clamping hours at 16 max bc you should sleep 8 hrs.
  let hours = clamp( hrs, 0, 16 );

  let hoursPercentage = hours / 16;

  hueDifference *= hoursPercentage;

  let hue = startHue - hueDifference;
  
  var cssString = `hsla(${hue}, ${saturation}, ${value}, ${alpha});`;
  console.log('color: ' + cssString);
  return cssString;

}
