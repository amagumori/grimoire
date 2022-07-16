
      /*
  let tickTime = new Date( start - ( offset * pixToMsRatio ) )
  let tickEnd = new Date(tickTime.getTime() + ( clientWidth * pixToMsRatio ) )

  let tickSpan = tickEnd.getTime() - tickTime.getTime()
  let tickSpanDays = tickSpan / 86400000
  let tickPeriod = tickSpan / 7
  let tickFormat = 'time'
  
  if ( tickSpanDays > 3 ) {
    tickFormat = 'date'
  } else {
    tickFormat = 'time'
  }

  let ticks = []

  for ( let i=0; i < 7; i++ ) {
    let offset = tickPeriod * i;
    tickTime.setTime( tickTime.getTime() + offset );
    
    if ( tickFormat == 'time' ) {
      ticks.push( (<div className="tick-mark">{ tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }</div> ) );
    } else if ( tickFormat == 'date' ) {
      ticks.push( (<div className="tick-mark">{ tickTime.toLocaleDateString([], { day: 'numeric', month: 'numeric' }) }</div> ) );
    } else {
      console.log('whoops')
    }
    //console.log( tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) );
  }

    /*
  let sunSpanStart = start - 86400000
  let sunSpanEnd = end + 86400000
  let sunSpan = sunSpanEnd - sunSpanStart
  let sunBarWidth = sunSpan / span

  let sunStart = getSunrise( myLatitude, myLongitude, new Date(sunSpanStart) )
  let sunsetEnd = getSunset( myLatitude, myLongitude, new Date(sunSpanEnd) )

  let startDiff = start - sunStart.getTime()
  let endDiff = end - sunsetEnd.getTime()

  let sunEnd = new Date(end)

  var sunString = 'linear-gradient('

  var currentPerc = 0

  var currentTime = new Date(sunStart)
  let initialSunrise = getSunrise( myLatitude,  myLongitude, currentTime )

  while ( sunStart < sunEnd ) {

    // in UTC?
    let sunrise = getSunrise( myLatitude,  myLongitude, currentTime )
    let noon = new Date(sunrise)
    noon.setHours(12) // doesn't think it's a date object as a one-liner?
    let sunriseNoonDelta = noon.getTime() - sunrise.getTime()
    let sunriseNoonPerc = (sunriseNoonDelta / sunSpan) * 100

    let sunriseNoonStr = `${sunriseColor} ${currentPerc}%, ${noonColor} ${sunriseNoonPerc}%, `

    currentPerc += sunriseNoonPerc

    let sunset = getSunset( myLatitude, myLongitude, sunStart )
    let noonSunsetDelta = sunset.getTime() - noon.getTime()          
    let noonSunsetPerc = ( noonSunsetDelta / sunSpan ) * 100

    currentPerc += noonSunsetPerc 

    let noonSunsetStr = `${sunsetColor} ${currentPerc}%, `

    currentTime.setDate( currentTime.getDate() + 1 )
    sunrise = getSunrise(myLatitude, myLongitude, currentTime)
    let sunsetSunriseSpan = sunrise.getTime() - sunset.getTime()
    let sunsetSunriseDelta = ( sunsetSunriseSpan / sunSpan ) * 100
    sunsetSunriseDelta /= 2

    currentPerc += sunsetSunriseDelta
    let sunsetNightStr = `${nightColor} ${currentPerc}%, `
    currentPerc += sunsetSunriseDelta 
    let nightSunriseStr = `${sunriseColor} ${currentPerc}%, `

    sunString += sunriseNoonStr
    sunString += noonSunsetStr
    sunString += sunsetNightStr
    sunString += nightSunriseStr

  }

  sunString += ')'

  console.info('sun string: ' + sunString)

  var sunCSS = {
    width: width * sunBarWidth,
    transform: `translateX(${offset}px)`,
    background: sunString
  }

     */

  // <div className="sun-bar" style={sunCSS}></div>

