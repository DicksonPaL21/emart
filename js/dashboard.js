$( function() {
  if ( isDebugingModeEnabled ) {
    var script = $('<script>', {
      src: 'js/debugging.mode.dashboard.js'
    })
    
    script.insertAfter('[src="js/dashboard.js"]')
  }
  
  var updateInterval = 1000 // Fetch data every x milliseconds
  var websock, isUpdateCapacity = false
  
  if ( !isDebugingModeEnabled ) {
    var hostname = window.location.hostname
    var pathname = window.location.pathname
    websock = new WebSocket( 'ws://' + hostname + ':81' + pathname )
    websock.onopen = function( evt ) { console.log( 'websock open' ) }
    websock.onclose = function( evt ) { window.location.reload() }
    websock.onmessage = function( evt ) { updateData( evt.data ) }
    websock.onerror = function( evt ) { window.location.reload() }
  }
  
  Number.prototype.getDecimalsAllocated = function() {
    return this.toFixed( this < 10 ? 4 : this < 100 ? 3 : this < 1000 ? 2 : this < 10000 ? 1 : 0 )
  }
  
  function query() {
    getResponse( 'dataDashboard.json', function( response ) {
      try {
        var data = JSON.parse( response )
      } catch( e ) {
        showMessage( 'Error: getting data dashboard.', 8000 )
        return
      } clearTimeout( query )
      updateCapacity( data.capacity )
      updateConsumption( data.consumption )
      updateElectricityCost( data.electricityCost )
      updateEstimatedCost( data.estimatedCost )
      updateSwitches( data.switches )
    }, function() {
      showMessage( 'error loading dataDashboard.json', 8000 )
      setTimeout( query, updateInterval )
      vibrate()
    }, updateInterval )
  } if ( !isDebugingModeEnabled ) query()
  
  var capacity = []
  function updateCapacity( data ) {
    this.capacity = data
    isUpdateCapacity = true
  } updateCapacity( [ 260, 100, 26000, 99999 ] ) // Default
  
  
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
   * CONSUMPTION AREA
   * ----------------
   */
  function updateConsumption( data ) {
    var todayEnergy     = ( data[0] ).toFixed(4)
    var yesterdayEnergy = ( data[1] ).toFixed(4)
    
    $( '#today-energy' ).html( todayEnergy + ' kWh' )
    $( '#yesterday-energy' ).html( yesterdayEnergy + ' kWh' )
  } updateConsumption( [ 0, 0 ] )
  /*
   * END CONSUMPTION AREA
   */
  
  
  var _energyCost = 0
  
  
  /*
   * ELECTRICITY COST AREA
   * ---------------------
   */
  function updateElectricityCost( data ) {
    _energyCost = ( data[0] ).toFixed(2)
    $( '#this-month-electricity-cost' ).html( '&#8369; ' + _energyCost )
  } updateElectricityCost( [ 0 ] )
  /*
   * END ELECTRICITY COST AREA
   */
  
  
  /*
   * ESTIMATED COST AREA
   * -------------------
   */
  function updateEstimatedCost( data ) {
    var energyCost    = ( data[0] ).toFixed(2)
    var estimatedCost = ( data[1] ).toFixed(2)
    
    $( '#estimated-cost' ).html( '&#8369; ' + estimatedCost )
    $( '.progress .progress-bar span' ).html( energyCost + '&nbsp;/&nbsp;' + estimatedCost )
    
    var width = ( ( width = ( ( energyCost / estimatedCost ) * 100 ) ) > 100 ? 100 : width )
    var bgColor
    
    if ( width > 0 && width <= 50 ) bgColor = '#5CB85C'
    else if ( width > 50 && width <= 80 ) bgColor = '#F0AD4E'
    else if ( width > 80 && width <= 100 ) bgColor = '#D9534F'
    
    $( '.progress .progress-bar' ).css( { 'width': width + '%', 'background-color': bgColor } )
  } updateEstimatedCost( [ 0, 0 ] )
  /*
   * END ESTIMATED COST AREA
   */
  
  
  /*
   * SWITCH CONTROL AREA
   * -------------------
   */
  function updateSwitches( _switch ) {
    // _switch = { 'name':['switch 1','switch 2','switch 3','switch 4'], 'state':[0,0,0,0] }
    $( $( '.toggle-group label' )[0] ).html( _switch.name[0] )
    $( $( '.toggle-group label' )[2] ).html( _switch.name[1] )
    $( $( '.toggle-group label' )[4] ).html( _switch.name[2] )
    $( $( '.toggle-group label' )[6] ).html( _switch.name[3] )
    
    $( '.toggle-group input' )[0].checked = _switch.state[0]
    $( '.toggle-group input' )[1].checked = _switch.state[1]
    $( '.toggle-group input' )[2].checked = _switch.state[2]
    $( '.toggle-group input' )[3].checked = _switch.state[3]
  }
  /*
   * END SWITCH CONTROL AREA
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
    if ( isUpdateCapacity ) {
      try {
        var data = JSON.parse( response )
        if ( data.chart )           updateGaugeData( data.chart )
        if ( data.chart )           updateChartData( data.chart )
        if ( data.consumption )     updateConsumption( data.consumption )
        if ( data.electricityCost ) updateElectricityCost( data.electricityCost )
        if ( data.estimatedCost )   updateEstimatedCost( data.estimatedCost )
        if ( data.switches )        updateSwitches( data.switches )
      } catch( e ) {
        updateGaugeData( [ 0, 0, 0, 0 ] )
        updateChartData( [ 0, 0, 0 ] )
        showMessage( 'error getting data dashboard.', 8000 )
        vibrate()
      }
    }
  }
  
  function computeEstimatedEnergy( energy ) {
    return ( energy / 1000 ).getDecimalsAllocated()
  }
  
  function computeEstimatedCost( energy, cost ) {
    return ( ( energy / 1000 ) * cost ).getDecimalsAllocated()
  }
  
  $( '#id01 select' ).on( 'change', function() {
    var select = { Amps : 0, Watts : 1 }
    if ( select[ $( this ).val() ] == select.Watts ) {
      $( $( '#id01 input' )[0] ).attr( 'disabled', '' )
    } else {
      $( $( '#id01 input' )[0] ).removeAttr( 'disabled' )
    }
  } )
  
  $( '#calculator-btn' ).click( function() {
    $( $( '#id01 input' )[0] ).val( 0 )
    $( $( '#id01 input' )[1] ).val( 0 )
    $( $( '#id01 input' )[2] ).val( 1 )
    $( $( '#id01 input' )[3] ).val( _energyCost )
    
    $( $( 'table tbody th' )[1] ).html( '0.0000 kWh' )
    $( $( 'table tbody th' )[4] ).html( '0.0000 kWh' )
    $( $( 'table tbody th' )[7] ).html( '0.0000 kWh' )
    $( $( 'table tbody th' )[10] ).html( '0.0000 kWh' )
    $( $( 'table tbody th' )[13] ).html( '0.0000 kWh' )
    
    $( $( 'table tbody th' )[2] ).html( '&#8369; 0.0000' )
    $( $( 'table tbody th' )[5] ).html( '&#8369; 0.0000' )
    $( $( 'table tbody th' )[8] ).html( '&#8369; 0.0000' )
    $( $( 'table tbody th' )[11] ).html( '&#8369; 0.0000' )
    $( $( 'table tbody th' )[14] ).html( '&#8369; 0.0000' )
    
    $( '#id01' ).show()
  } )
  
  $( '#calculate-btn' ).click( function() {
    var volt      = $( $( '#id01 input' )[0] ).val()
    var amp_watts = $( $( '#id01 input' )[1] ).val()
    var hours     = $( $( '#id01 input' )[2] ).val()
    var cost      = $( $( '#id01 input' )[3] ).val()
    
    var power; $( '#id01 select' ).val() != "Watts" ? power = volt * amp_watts : power = amp_watts
  
    $( $( 'table tbody th' )[1] ).html( computeEstimatedEnergy( power, 1 ) + ' kWh' )
    $( $( 'table tbody th' )[4] ).html( computeEstimatedEnergy( power * hours ) + ' kWh' )
    $( $( 'table tbody th' )[7] ).html( computeEstimatedEnergy( ( power * hours ) * 7 ) + ' kWh' )
    $( $( 'table tbody th' )[10] ).html( computeEstimatedEnergy( ( power * hours ) * 30 ) + ' kWh' )
    $( $( 'table tbody th' )[13] ).html( computeEstimatedEnergy( ( power * hours ) * 365 ) + ' kWh' )
    
    $( $( 'table tbody th' )[2] ).html( '&#8369; '  + computeEstimatedCost( power, cost ) )
    $( $( 'table tbody th' )[5] ).html( '&#8369; '  + computeEstimatedCost( power * hours, cost ) )
    $( $( 'table tbody th' )[8] ).html( '&#8369; '  + computeEstimatedCost( ( power * hours ) * 7, cost ) )
    $( $( 'table tbody th' )[11] ).html( '&#8369; ' + computeEstimatedCost( ( power * hours ) * 30, cost ) )
    $( $( 'table tbody th' )[14] ).html( '&#8369; ' + computeEstimatedCost( ( power * hours ) * 365, cost ) )
  } )
  
  $( '#edit-this-month-electricity-cost-btn' ).click( function() {
    getResponse( 'electricityCost.json', function( response ) {
      try {
        var data = JSON.parse( response )
      } catch( e ) {
        showMessage( 'Error: getting electricity cost.', 8000 )
        return
      }
      var input = '<input id="electricityCost" type="text" placeholder="Amount" required autofocus/>'
      $( '#id02 #modal-title' ).html( 'Electricity Cost' )
      $( '#id02 .labelFix' ).html( 'Cost' )
      $( '#id02 .input_field' ).html( input )
      $( '#id02 #electricityCost' ).val( data.electricityCost[0] )
      $( '#id02' ).show()
    } )
  } )
  
  $( '#edit-estimate-btn' ).click( function() {
    getResponse( 'estimatedCost.json', function( response ) {
      try {
        var data = JSON.parse( response )
      } catch( e ) {
        showMessage( 'Error: getting estimated cost.', 8000 )
        return
      }
      var input = '<input id="estimatedCost" type="text" placeholder="Amount" required autofocus/>'
      $( '#id02 #modal-title' ).html( 'Estimate Cost' )
      $( '#id02 .labelFix' ).html( 'Cost' )
      $( '#id02 .input_field' ).html( input )
      $( '#id02 #estimatedCost' ).val( data.estimatedCost[1] )
      $( '#id02' ).show()
    } )
  } )
  
  $( '#edit-switch-name-btn' ).click( function() {
    getResponse( 'switches.json', function( response ) {
      try {
        var _switch = JSON.parse( response ).switches
      } catch( e ) {
        showMessage( 'Error: getting switches name.', 8000 )
        return
      }
      /*=== Switch Name ===*/
      $( $( '#id03 input' )[0] ).val( _switch.name[0] )
      $( $( '#id03 input' )[1] ).val( _switch.name[1] )
      $( $( '#id03 input' )[2] ).val( _switch.name[2] )
      $( $( '#id03 input' )[3] ).val( _switch.name[3] )
      $( '#id03' ).show()
    } )
  } )
  
  $( '[id*="close-btn"], .modal-btn' ).click( function() {
    $( '#' + $( this ).parents()[2].id ).hide()
    $( '#' + $( this ).parents()[2].id + ' input' ).val( '' )
  } )
  
  $( 'form' ).submit( function() {
    var url = '', id = $( this ).parents()[0].id
    if ( id == 'id02' ) {
      var amount = $( '#id02 input' ).val()
      var inputId = $( '#id02 input' )[0].id
      url = inputId + 'Save.json?' + inputId + '=' + amount
    } else if ( id == 'id03' ) {
      url = 'switchesNameSave.json'
      /*=== Switch Name ===*/
      url += '?switchName1=' + $( $( '#id03 input' )[0] ).val()
      url += '&switchName2=' + $( $( '#id03 input' )[1] ).val()
      url += '&switchName3=' + $( $( '#id03 input' )[2] ).val()
      url += '&switchName4=' + $( $( '#id03 input' )[3] ).val()
    } else return
    
    $( '#' + id + ' input' ).val( '' )
    $( '#' + id ).hide()
    
    getResponse( url, function( response ) {
      if ( response == 'true' ) {
        showMessage( 'Save Successful.', 8000 )
        websock.send( '' )
      } else {
        var json = url.substring( 0, url.indexOf( '?', 0 ) )
        showMessage( 'response error ' + json, 8000 )
      }
    } )
  } )
  
  $( '[id^="toggle-"]' ).click( function( e ) {
    e.preventDefault()
    var url = 'switchesToggleSave.json'
    url += '?switch' + this.id.substring( 7 ) + '=' + this.checked
    getResponse( url, function( response ) {
      if ( response == 'true' ) {
        showMessage( 'Save Successful.', 8000 )
        websock.send( '' )
      } else {
        var json = url.substring( 0, url.indexOf( '?', 0 ) )
        showMessage( 'response error ' + json, 8000 )
      }
    } )
  } )
} )