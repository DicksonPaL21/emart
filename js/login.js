if ( document.cookie ) {
  window.location.assign( 'dashboard' )
}

document.forms[ 'login' ].onsubmit = function() {
  document.cookie = 'EMARTSESSIONID=' + getE( '#username' ).value
  window.location.assign( `dashboard${ isDebugingModeEnabled ? '.html' : ''}` )
}

var updateInterval = 1000

function dateTimeStamp() {
  /*======= Date Stamp =======*/
  var url = 'dateTimeStamp.json'
  url += '?year='    + Number( new Date().getFullYear() )
  url += '&month='   + Number( new Date().getMonth() + 1 )
  url += '&day='     + Number( new Date().getDate() )
  url += '&hours='   + Number( new Date().getHours() )
  url += '&minutes=' + Number( new Date().getMinutes() )
  url += '&seconds=' + Number( new Date().getSeconds() )

  getResponse( url, function( responseText ) {
    if ( responseText != 'true' ) {
      showMessage( 'response error dateTimeStamp.json' )
    }
  }, function() {
    setTimeout( dateTimeStamp, updateInterval )
    vibrate()
  }, updateInterval )
} //dateTimeStamp()

document.querySelector( 'img#emart' ).src = `data:image/png;base64,
iVBORw0KGgoAAAANSUhEUgAAAoEAAACZCAYAAABQSeBnAAAAGXRFWHRTb2Z0d2FyZQBBZG9i
ZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tl
dCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1l
dGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUu
My1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpS
REYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgt
bnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6
Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRv
YmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9u
cy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRp
ZDo4RDVGNTgxNDE1MDVFQTExQTU2OUNFMUQzQUUzQzg4MSIgeG1wTU06RG9jdW1lbnRJRD0i
eG1wLmRpZDozMUFGNDZFRTA2MDIxMUVBODA1RUJEREJDOUZFQjI3RiIgeG1wTU06SW5zdGFu
Y2VJRD0ieG1wLmlpZDozMUFGNDZFRDA2MDIxMUVBODA1RUJEREJDOUZFQjI3RiIgeG1wOkNy
ZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJp
dmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkI4M0MwQjJCMDIwNkVBMTE5Nzk1
OEM0ODIxRDVDODFDIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjhENUY1ODE0MTUwNUVB
MTFBNTY5Q0UxRDNBRTNDODgxIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwv
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
cwAAAABJRU5ErkJggg==
`