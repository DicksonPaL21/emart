if ( isDebugingModeEnabled ) {
  var script = $('<script>', {
    src: 'js/debugging.mode.history.js'
  })

  script.insertAfter('[src="js/history.js"]')
}

var updateInterval = 1000 //Fetch data every x milliseconds
var currentPages = 0

/*
 * ELECTRICITY COST AREA
 * ---------------------
 */
function updateElectricityCost( data ) {
  var thisMonthElectricityCost = data[0].toFixed(2)
  var lastMonthElectricityCost = data[1].toFixed(2)

  $( '#this-month-electricity-cost' ).html( '&#8369;  ' + thisMonthElectricityCost )
  $( '#last-month-electricity-cost' ).html( '&#8369;  ' + lastMonthElectricityCost )
} updateElectricityCost( [ 0, 0 ] )
/*
 * END ELECTRICITY COST AREA
 */


/*
 * ENERGY COST AREA
 * ----------------
 */
function updateEnergyCost( data ) {
  var yesterdayEnergyCost = data[1].toFixed(2)
  var thisMonthEnergyCost = data[2].toFixed(2)
  var lastMonthEnergyCost = data[3].toFixed(2)

  $( '#yesterday-energy-cost' ).html( '&#8369;  ' + yesterdayEnergyCost )
  $( '#this-month-energy-cost' ).html( '&#8369;  ' + thisMonthEnergyCost )
  $( '#last-month-energy-cost' ).html( '&#8369;  ' + lastMonthEnergyCost )
} updateEnergyCost( [ 0, 0, 0, 0 ] )
/*
 * END ENERGY COST AREA
 */


/*
 * CONSUMPTION AREA
 * ----------------
 */
function updateConsumption( data ) {
  var yesterdayEnergy = data[1].toFixed(4)
  var thisMonthEnergy = data[2].toFixed(4)
  var lastMonthEnergy = data[3].toFixed(4)

  $( '#yesterday-energy' ).html( yesterdayEnergy + ' kW' )
  $( '#this-month-energy' ).html( thisMonthEnergy + ' kW' )
  $( '#last-month-energy' ).html( lastMonthEnergy + ' kW' )
} updateConsumption( [ 0, 0, 0, 0 ] )
/*
 * END CONSUMPTION AREA
 */


/*
 * TOTAL CONSUMED AREA
 * -------------------
 */
function updateTotalConsumed( data ) {
  var totalCost   = data[0].toFixed(2)
  var totalEnergy = data[1].toFixed(4)

  $( '#total-cost' ).html( '&#8369;  ' + totalCost )
  $( '#total-energy' ).html( totalEnergy + ' kW' )
} updateTotalConsumed( [ 0, 0 ] )
/*
 * END TOTAL CONSUMED AREA
 */


/*
 * TOTAL CONSUMED AREA
 * -------------------
 */
var _row = []
function updateHistory( data ) {
  if ( data != undefined ) {
    _row = data
    currentPages = Number.parseInt( data.length / 20 )
    currentPages = ( ( data.length % 20 ) == 0 ? currentPages : currentPages + 1 )

    var pageNum = 1
    $( '.pagination.dark' ).append('<a class="page dark active" href="javascript:void(0)">1</a>')
    while ( ++pageNum < currentPages + 1 ) {
      $( '.pagination.dark' ).append('<a href="#page' + pageNum + '" class="page dark">' + pageNum + '</a>')
    }  
    updateSelectedTable( 0 )
  }
}

var length = 0
var a = 0, b = 0, c = 0, d = 0, e = 0, f = 0
function updateSelectedTable( pos ) {
  while ( pos < _row.length && length++ < 20 ) {
    var date = new Date( _row[pos][0] )
    date = date.toDateString()
    date = date.substr( 4 )

    var col1 = $( '<th></th>' ).html( date )
    var col2 = $( '<th></th>' ).html( ( _row[pos][1] ).toFixed(4) + ' kW' )
    var col3 = $( '<th></th>' ).html( '&#8369; ' + ( _row[pos][2] ).toFixed(4) )
    
    var row = $( '<tr></tr>' )
    row.append( col1 )
    row.append( col2 )
    row.append( col3 )

    var cur  = $( 'table tbody' )
    var prev = $( 'table tbody tr' )

    cur.html( row )
    cur.append( prev )

    pos++
  } length = 0
}
/*
 * END TOTAL CONSUMED AREA
 */


function getData() {
  getResponse( 'dataHistory.json', function( response ) {
    try {
      var data = JSON.parse( response )
    } catch( e ) {
      showMessage( 'Error: getting data history.', 8000 )
      return
    } clearTimeout( getData )
    if ( data.electricityCost )   updateElectricityCost( data.electricityCost )
    if ( data.energyCost )        updateEnergyCost( data.energyCost )
    if ( data.consumption )       updateConsumption( data.consumption )
    if ( data.totalConsumed )     updateTotalConsumed( data.totalConsumed )
    if ( data.history )           updateHistory( data.history )
  }, function() {
    showMessage( 'error loading dataHistory.json', 8000 )
    setTimeout( getData, updateInterval )
    vibrate()
  }, updateInterval )
} if ( !isDebugingModeEnabled ) getData()

$( '#gauge-load-bar, .loader-wrapper' ).hide()
$( '.hide' ).removeClass( 'hide' )
$( '#error' ).addClass( 'hide' )
$( '#table' ).show()

$( 'select' ).on( 'change', function() {
  if ( $( this ).val() == '30 Mins' ) {}
  if ( $( this ).val() == 'Hour' ) {}
  if ( $( this ).val() == 'Day' ) {}
  console.log( $( this ).val() )
} )

$( 'a.page.dark' ).on( 'click', function() {
  var c_page = this.href.substring( this.href.indexOf( 'page' ) + 4 )
  if ( c_page > 0 ) {
    window.location.assign( 'history.html#table' )
    $( 'table tbody' ).html('')
    var pageNum = 0
    while ( pageNum < currentPages + 1 ) {
      $( $( 'a.page.dark' )[pageNum] ).removeClass('active')
      $( $( 'a.page.dark' )[pageNum] ).attr( 'href', '#page' + ( pageNum + 1 ) )
      pageNum++
    }
    $( this ).addClass('active')
    $( this ).attr( 'href', 'javascript:void(0)')
    
    updateSelectedTable( c_page > 0 ? ( c_page * 20 ) - 20 : c_page - 1 )
  }
} )
