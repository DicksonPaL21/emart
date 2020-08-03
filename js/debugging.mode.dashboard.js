$( function() {
  var updateInterval = 1000 // Fetch data every x milliseconds
  var websock, isUpdateCapacity = false
  
  Number.prototype.getDecimalsAllocated = function() {
    return this.toFixed( this < 10 ? 4 : this < 100 ? 3 : this < 1000 ? 2 : this < 10000 ? 1 : 0 )
  }
  /*
   * GAUGE METER
   * -----------
   */
  function maskCapacity( val, capacity ) {
    var _1_PERCENT = ( 1 * capacity ) / 100
    var _5_PERCENT = ( 5 * capacity ) / 100
    var _10_PERCENT = ( 10 * capacity ) / 100
    var _20_PERCENT = ( 20 * capacity ) / 100
    var _30_PERCENT = ( 30 * capacity ) / 100
    var _40_PERCENT = ( 40 * capacity ) / 100
    var _50_PERCENT = ( 50 * capacity ) / 100
    var _60_PERCENT = ( 60 * capacity ) / 100
    var _70_PERCENT = ( 70 * capacity ) / 100
    var _80_PERCENT = ( 80 * capacity ) / 100
    var _90_PERCENT = ( 90 * capacity ) / 100
    
    if ( val < _1_PERCENT ) return _1_PERCENT
    if ( val < _5_PERCENT ) return _5_PERCENT
    if ( val < _10_PERCENT ) return _10_PERCENT
    if ( val < _20_PERCENT ) return _20_PERCENT
    if ( val < _30_PERCENT ) return _30_PERCENT
    if ( val < _40_PERCENT ) return _40_PERCENT
    if ( val < _50_PERCENT ) return _50_PERCENT
    if ( val < _60_PERCENT ) return _60_PERCENT
    if ( val < _70_PERCENT ) return _70_PERCENT
    if ( val < _80_PERCENT ) return _80_PERCENT
    if ( val < _90_PERCENT ) return _90_PERCENT
    return capacity
  }
  
  function updateGaugeMeter( elem, prefix, val, total ) {
    var max   = total
    var value = $( elem + ' .value' )
    var meter = $( elem + ' .meter' )
    
    total = maskCapacity( val, total )
    
    var deg = ( ( ( ( val <= total ? val : total ) / ( total / 100 ) ) * 180 ) / 100 )
    
    max    = ( max < 1000 ? max + prefix : max / 1000 + 'k' + prefix )
    prefix = ( val < 1000 ? prefix : 'k' + prefix )
    val    = ( val < 1000 ? val : val / 1000 ).getDecimalsAllocated()
    total  = ( total < 1000 ? total : total / 1000 )
    
    
    $( elem + ' .gauge' ).attr( 'title', val + prefix + ' / ' + total + prefix + ' (MAX: ' + max + ')' )
    
    prefix = $( '<small class="f-3">' + prefix + '</small>' )
    
    value.html( val ).append( prefix )
    meter.css( { '-webkit-transform': 'rotate(' + deg + 'deg)' } )
    meter.css( { '-moz-transform': 'rotate(' + deg + 'deg)' } )
    meter.css( { '-ms-transform': 'rotate(' + deg + 'deg)' } )
    meter.css( { '-o-transform': 'rotate(' + deg + 'deg)' } ) 
    meter.css( { 'transform': 'rotate(' + deg + 'deg)' } )
  }
  
  function GaugeMeter( bgColor ) {
    var gauge     = $( '<div class="gauge"></div' )
    var meter     = $( '<div class="meter"></div' )
    var value     = $( '<div class="value sub-title">...</div' )
    
    meter.css( { 'background-color': bgColor } )
    
    gauge.html( value )
    gauge.append( meter )
    
    return gauge
  }
  
  $( '#voltage' ).append( GaugeMeter( '#D9534F' ) )
  $( '#current' ).append( GaugeMeter( '#337AB7' ) )
  $( '#power'   ).append( GaugeMeter( '#5CB85C' ) )
  $( '#energy'  ).append( GaugeMeter( '#F0AD4E' ) )
  
  function updateGaugeData( load ) {
    // load[0] is voltage, load[1] is current, load[2] is power, load[3] is energy
    updateGaugeMeter( '#voltage', 'V', load[0], this.capacity[0] )
    updateGaugeMeter( '#current', 'A', load[1], this.capacity[1] )
    updateGaugeMeter( '#power',   'W', load[2], this.capacity[2] )
    updateGaugeMeter( '#energy', 'Wh', load[3], this.capacity[3] )
  } updateGaugeData( [ 0, 0, 0, 0 ] )
  /*
   * END GAUGE METER
   */
  
  
  /*
   * Flot Interactive Chart
   * ----------------------
   */
  function getRandomData( data, val ) {
    var totalPoints = 100
    
    while ( data.length < totalPoints ) data.push(0)
    
    if ( data.length == totalPoints ) data = data.slice(1)

    data.push( val )
    
    // Zip the generated y values with the x values
    var res = []
    for ( var i = 0; i < data.length; ++i ) {
      res.push( [ i, data[i] ] )
    }

    return [ res, data ]
  }
  
  $( '#gauge-load-bar, .loader-wrapper' ).hide()
  $( '.hide' ).removeClass( 'hide' )
  $( '#error' ).addClass( 'hide' )
  
  var _load, pos = 0
  var data1 = [ [],[] ], data2 = [ [],[] ], data3 = [ [],[] ]
  
  $( '.container select' ).on( 'change', function() {
    var select = { Voltage : 0, Current : 1, Power : 2 }
    pos = select[ $( this ).val() ]
    updateChartData()
  } )
  
  function updateChartData( load ) {
    if ( load ) {
      _load = load
      // load[0] is voltage, load[1] is current, load[2] is power
      load[0] = ( load[0] <= this.capacity[0] ? load[0] : this.capacity[0] )
      load[1] = ( load[1] <= this.capacity[1] ? load[1] : this.capacity[1] )
      load[2] = ( load[2] <= this.capacity[2] ? load[2] : this.capacity[2] )

      data1 = getRandomData( data1[1], load[0] )
      data2 = getRandomData( data2[1], load[1] )
      data3 = getRandomData( data3[1], load[2] )
    }
    
    var line_data1 = { data : data1[0], color: '#F56954' }
    var line_data2 = { data : data2[0], color: '#00C0EF' }
    var line_data3 = { data : data3[0], color: '#00A65A' }
    var _lists     = [ line_data1, line_data2, line_data3 ]
    var _capacity  = this.capacity[pos].toFixed(0)
    
    load = _load[pos] < capacity - 10 ? _load[pos] : _load[pos].toFixed(0)

    $.plot( '#interactive', [ _lists[pos] ], {
      grid  : {
        borderColor: '#36393E',
        borderWidth: 1,
        tickColor  : '#37373D'
      },
      series: {
        shadowSize: 0, // Drawing is faster without shadows
      },
      lines : {
        fill : true
      },
      yaxis : {
        min : 0,
        max : load < _capacity - 10 ? null : _capacity,
        show: true
      },
      xaxis : {
        min : 0,
        show: true
      }
    } ).draw()
    
    $( '#interactive-label' ).html( $( '.container select' ).val().toUpperCase() )
  } updateChartData( [ 0, 0, 0 ] )
  /*
   * END INTERACTIVE CHART
   */
  

  // REALTIME DATA FETCHING
  function updateData( response ) {
    try {
      var data = JSON.parse( response )
      if ( data.chart ) updateGaugeData( data.chart )
      if ( data.chart ) updateChartData( data.chart )
    } catch( e ) {
      updateGaugeData( [ 0, 0, 0, 0 ] )
      updateChartData( [ 0, 0, 0 ] )
      showMessage( 'error getting data dashboard.', 8000 )
      vibrate()
    }
  }

  var ctr = 0
  function up() {
    setInterval( function() {
      var v = 0, i = 0, p = 0, e = 0, tt = 0
      var payload = '{'
      payload += '\"chart\":['
      payload += ( v = 220 + Math.random()+Math.random()+Math.random() ) + ','
      payload += ( i = Math.random() ) + ','
      payload += ( p = v * i ) + ','
      payload += ( tt = tt < p ? p : tt )
      payload += ']}'

      updateData( payload )
    }, 1000 )
  } if ( isDebugingModeEnabled ) up()

} )