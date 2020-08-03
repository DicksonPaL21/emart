/*
 * TOTAL CONSUMED AREA
 * -------------------
 */

//a = this month energy
//b = this month energy cost
//c = last month energy
//d = last month energy cost
//e = total energy
//f = total cost

var length = 0
var a = 0, b = 0, c = 0, d = 0, e = 0, f = 0
function updateSelectedTable( pos ) {
  while ( pos < _row.length && length++ < 20 ) {
    var date = new Date( _row[pos][0] )
    if (date.getDate() == 1) {
      $( '#last-month-energy-cost' ).html( '&#8369; ' + ( d = b ).toFixed(4) )
      $( '#last-month-energy' ).html( ( c = a ).toFixed(4) + ' kW' )
      a = 0
      b = 0
    }
    
    $( '#yesterday-energy-cost' ).html( '&#8369; ' + ( _row[pos][2] ).toFixed(4) )
    $( '#this-month-energy-cost' ).html( '&#8369; ' + ( b += _row[pos][2] ).toFixed(4) )
    
    $( '#yesterday-energy' ).html( ( _row[pos][1] ).toFixed(4) + ' kW' )
    $( '#this-month-energy' ).html( ( a += _row[pos][1] ).toFixed(4) + ' kW' )
    
    $( '#total-cost' ).html( '&#8369; ' + ( f += _row[pos][2] ).toFixed(4) )
    $( '#total-energy' ).html( ( e += _row[pos][1] ).toFixed(4) + ' kW' )
    
    $( '#this-month-electricity-cost' ).html( '&#8369; 5.68' )
    $( '#last-month-electricity-cost' ).html( '&#8369; 5.68' )
    
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

// Random Data Set
var thisDate = new Date().getTime()
function dataHistory() {
  var array = [], cc = 0
  for ( var x = 0; x < 100; x++ ) {
    array.push( [ thisDate += 86400000, cc = Math.random(),cc * 5.68 ] )
  } updateHistory( array )
} if ( isDebugingModeEnabled ) dataHistory()
//End Random Data Set
/*
 * END TOTAL CONSUMED AREA
 */