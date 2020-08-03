var d = /dashboard/.test( window.location.href )
var h = /history/.test( window.location.href )
var s = /setting/.test( window.location.href )

var n = d ? 1 : h ? 2 : s ? 3 : 0

var navList = ''
navList += `<a class="${n === 1 ? 'active ' : ''}f-1" href="dashboard">Dashboard</a>`
navList += '<span style="color:#3C3F41">|</span>'
navList += `<a class="${n === 2 ? 'active ' : ''}f-1" href="history">History</a>`
navList += '<span style="color:#3C3F41">|</span>'
navList += `<a class="${n === 3 ? 'active ' : ''}f-1" href="setting">Setting</a>`
navList += `<a class="f-1" href="login">Logout</a>`

var nav = document.getElementsByTagName( 'nav' )[0]
if ( !isDebugingModeEnabled ) {
  if ( document.cookie ) nav.innerHTML = navList
  else nav.innerHTML = '<a href="login">Login</a>'
} else nav.innerHTML = navList

var header = window.location.pathname.split( '/' )
header = header[ header.length - 1 ]
header = !/html/.test( header ) ? header : header.replace( '.html', '' )
document.getElementsByTagName( 'h1' )[0].innerHTML = header.toLocaleUpperCase()

if( !/login/.test( window.location.pathname ) ) {
  nav.lastElementChild.onclick = function() {
    document.cookie = 'EMARTSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC'
  }
}