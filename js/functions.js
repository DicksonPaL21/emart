var isDebugingModeEnabled = false

window.onload = function () {
  if ( isDebugingModeEnabled ) {
    console.log( 'Debugging Mode Enabled!' )
    var cmd = 'body a:not([href^="http"]):not([href^="#"]):not([href*="void"]):not([href$="html"])'
    var link = document.querySelectorAll( cmd )
    link.forEach( ( e, i ) => {
      var href = e.getAttribute( 'href' ) + '.html'
      e.setAttribute( 'href', href )
    })
  }
}

document.querySelector( '[type="image/x-icon"]' ).href = `data:image/png;base64,
iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADWklEQVR4AXWSA7AkRxjHezlY
e2cxnnnZnX1nPVtnP51t27btu0LspIy4ENu2XYj/6Y35VbX796vGR/4aAMgTTzxBvvrqK+bo
kSNju7s6n54yedITV65cHgnATd4GaXztK276cx/ZVjz5PvlbvP/++0WB7crlyz3nzp1zsbx8
0BeSlIFp6mhuavx89YplZw8+9FDZACBDvgcp/QG/gt9+++0v7Q033JBesnjRZrr57YKVgyKL
yGQEGLqKfImBnkOHoeHAkQ+2HTmy9cVnnhZGjRj2y4nJ448/4Vq9alXXkCFtj5cWrB81VYFp
aL8IBCGOXIkOs2UUEhuPQaysgqlrP06c0P3IoYMHxm/ZvNVJzpw+rTTU172syBJURYKmKTAM
HaKYQUqIQW9qR3TFjdCaR6DEUJFMxhGPR+npMs8lEokM2X/wgFFWNugNScxCphKZniArZSFk
U0gMGI5Q+zWQ68YiHgvTdRH+QAA2mw12u/0VjmVl8mQ23X5WSH61JBrBClpmhENY6OUwttCI
Yb2WYbPSjPm5AVgZFbCW5zDM6cRqhx07nY5PbuXZZvKA07HuGsaNLnqsA14PbnO7cCdttyYb
cdxrYY+vL3amB+N0KocLAT9qnA4souWw2/Vme9BfIDtdjrWLWOan2mgYU7w8BocCaBeSmBGI
YX7wKkwTWjEjImIxy2MOBSO0VNEynmFecUQiMpnXq2dDvSx93CMSRi4YgEhFOi15sx8KNUuQ
GTAROSrO01OK9HR+lwtZWnSeeyUYj8tk+YoVRt7Kv+H1eRGhYCwaQaTfQHCbboSnaSo8VMrx
HBiWgcvthovCxcJRQUoQZLJ48SKlULBe8lFBPBaFX1XBbd8N7+BR8Pk84CnMccXCgmUYuKmk
WHxe73PZbDZD1q1b52xpaWmnSfRoWpF/DE2YgGBtDfweHkWp1+spAr/ALMtSIf9jIBB4KB6L
jdU0zUEuXbpMitExblyq74QJ29Wysrej4dDvm3+RMBQuniAcCr0hCMm1qqomHQ4Hqa6qIiR3
N8iiR78ml6hk5cXL9qa6ulLLss7TjZ8HAn74/T5EI5HPspnMmRLTtNrHt9vKBg0i/xuDBw8m
EyZMYPr36zdKUZQnJEl81LLywxvqG9wDBw781/6fAeXwViyx8lpFAAAAAElFTkSuQmCC
`

var login = /login/.test( window.location.href )
var about = /about/.test( window.location.href )
var error = /error/.test( window.location.href )

if ( !isDebugingModeEnabled && !document.cookie && !login && !about && !error ) {
  window.location.assign( 'login' )
}

var ScrollMsg= 'Energy Meter Analysis and Reporting Technology - '
var CharacterPosition = 0
function StartScrolling() {
  document.title = ScrollMsg.substring( CharacterPosition, ScrollMsg.length )
                 + ScrollMsg.substring( 0, CharacterPosition )
  CharacterPosition++
  if ( CharacterPosition > ScrollMsg.length ) CharacterPosition = 0
    window.setTimeout( StartScrolling, 500 )
} StartScrolling()

function getE( elem ) {
  return document.querySelector( elem )
}

function getAllE( elem ) {
  return document.querySelectorAll( elem )
}

function escapeHTML( str ) {
  return str
    .replace( /&/g, '&amp;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' )
    .replace( /\"/g, '&quot;' )
    .replace( /\'/g, '&#39;' )
    .replace( /\//g, '&#x2F;' )
}

function showMessage( msg, closeAfter ) {
  var id, strNotif
  id = Math.random().toFixed(5).substring(2)
  id = `id${id}`
  
  strNotif = `<div id="${id}" class="msg f-1">${msg}</div>`
  
  var notifField = getE( '.notification-field' )
  notifField.innerHTML += strNotif
  
  if ( closeAfter !== undefined ) {
    setTimeout( function() {
      getE( `#${id}` ).remove()
    }, closeAfter )
  }
}

function getResponse( addr, callback, timeoutCallback, timeout, method ) {
  if ( timeoutCallback === undefined ) {
    timeoutCallback = function() {
      showMessage( 'error loading ' + addr, 3000 )
      vibrate()
    }
  }
  if ( timeout === undefined ) timeout = 8000 
  if ( method === undefined ) method = 'GET'
  var xmlhttp = new XMLHttpRequest()
  xmlhttp.onreadystatechange = function() {
    if ( xmlhttp.readyState == 4 ) {
      if ( xmlhttp.status == 200 ) {
        callback( xmlhttp.responseText )
      } else timeoutCallback()
    }
  }
  xmlhttp.open( method, addr, true )
  xmlhttp.send()
  xmlhttp.timeout = timeout
  xmlhttp.ontimeout = timeoutCallback
}

Element.prototype.show = function() {
  this.style.display = 'block'
}

Element.prototype.hide = function() {
  this.style.display = 'none'
}

Element.prototype.acceptAlphaNumericKey = function() {
  this.onkeypress = function( e ) {
    var regex = new RegExp( "^[a-zA-Z0-9 _.\b\r]+$" );
    var str = String.fromCharCode( !e.charCode ? e.which : e.charCode );
    if ( !regex.test( str ) ) {
      showMessage( 'Error: This input should not accept any symbols. Letters and Numbers only.' );
      e.preventDefault();
    }
  }
}

function toTop() {
  try {
    window.scrollTo( {
      'behavior': 'smooth',
      'left': 0,
      'top': 0
    } )
  } catch ( err ) {
    scroll( 0, 0 )
  }
}

/////////Disable right click script ////////////////////////////
//visit http://www.rainbow.arch.scriptmania.com/scripts/ 
var message = 'Sorry, right-click has been disabled' 
/////////////////////////////////// 
function clickIE() {
  if ( document.all ) {
    ( message )
    return false
  }
}

function clickNS( e ) {
  if ( document.layers || ( document.getElementById && !document.all ) ) { 
    if ( e.which == 2 || e.which == 3 ) {
      ( message )
      return false
    }
  }
}

if ( document.layers ) {
  document.captureEvents( Event.MOUSEDOWN )
  document.onmousedown = clickNS
} else {
  document.onmouseup = clickNS
  document.oncontextmenu = clickIE
} 

document.oncontextmenu = new Function( 'return false' ) 
///////////////////////end///////////////////////

//////////F12 disable code////////////////////////
//document.onkeypress = function( event ) {
//  event = ( event || window.event )
//  if ( event.keyCode == 123 ) {
//    alert( 'Warning: F12 Diasbled.' )
//    return false
//  }
//}
//
//document.onmousedown = function( event ) {
//  event = ( event || window.event )
//  if ( event.keyCode == 123 ) {
//    alert( 'Warning: F12 Diasbled.' )
//    return false
//  }
//}
//
//document.onkeydown = function( event ) {
//event = ( event || window.event )
//if ( event.keyCode == 123 ) {
//    alert( 'Warning: F12 Diasbled.' )
//    return false
//  }
//}
/////////////////////end///////////////////////


function vibrate() {
  navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate
  if ( navigator.vibrate ) navigator.vibrate( [40,60,70] )
}

console.log( '%c _________  _____    _____      ____      _________    _________\n|_  ____  ||_    |  |    _|    |    |    |_   ____  \\ |  _   _  |\n  | |_  |_|  | \\ \\  / / |      / /\\ \\      | |____|  ||_| | | |_|\n  |  _|  _   | |\\ \\/ /| |     / ____ \\     |  ___  _/     | |    \n _| |___| | _| |_\\  /_| |_  _/ /_  _\\ \\_  _| |_  \\ \\_    _| |_\n|_________||_____|\\\/|_____||_____||_____||_____||____|  |_____|%cV.1.1', 'color:#369BF2', 'color:#ff6c00' )

console.log( '\n %cCopyright (c) 2018%c Energy Meter Analysis and Reporting Technology', 'color:#696969',  'color:#359c64' )