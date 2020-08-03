$( function() {
  var updateInterval = 1000
  
  /*======= AP =======*/
  var ssidName          = $( '#ssidName' )
  var ssidPassword      = $( '#ssidPassword' )
  var ssidHidden        = $( '#ssidHidden' )
  var channel           = $( '#channel' )
  var macAp             = $( '#macAp' )
  var randMacAp         = $( '#randMacAp' )
  var macInterval       = $( '#macInterval' )
  
  var ssidHiddenTooltip = $( '[for="ssidHidden"]' )
  var randMacApTooltip  = $( '[for="randMacAp"]' )

  /*=== WEB SERVER ===*/
  var serverUsername    = $( '#serverUsername' )
  var serverPassword    = $( '#serverPassword' )
  
  /*====== WIFI ======*/
  var wifiStatus        = $( '#wifiStatus' )
  var wifiName          = $( '#wifiName' )
  var wifiPassword      = $( '#wifiPassword' )
  
  var wifiTooltip       = $( '[for="wifiStatus"]' )
  
  var indicator         = $( '#indicator' )
  
  ssidHiddenTooltip.attr( 'title', this.checked ? 'Show' : 'Hide' )
  randMacApTooltip.attr( 'title', 'Random Mac ' + switchMAC() )
  wifiTooltip.attr( 'title', 'WiFi ' + switchWIFI() )
  
  
  function getConfig() {
    getResponse( 'config.json', function( responseText ) {
      try {
        var data = JSON.parse( responseText )
      } catch( e ) {
        showMessage( 'Error: getting configuration.', 8000 )
        return
      }
      /*======= AP =======*/
      ssidName.val( data.ssidName )
      ssidPassword.val( data.ssidPassword )
      ssidHidden[0].checked = data.ssidHidden
      channel.val( data.channel )
      macAp.val( data.macAp )
      randMacAp[0].checked = data.randMacAp
      macInterval.val( data.macInterval )

      /*=== WEB SERVER ===*/
      serverUsername.val( data.serverUsername )
      serverPassword.val( data.serverPassword )
      
      /*====== WIFI ======*/
      wifiStatus[0].checked = data.wifiStatus
      wifiName.val( data.wifiName )
      wifiPassword.val( data.wifiPassword )

      switchMAC()
      switchWIFI()
    } )
  } getConfig()
  
  $( 'form' ).submit( function() {
    indicator.html( 'saving...' )
    var url = 'configSave.json'

    /*======= AP =======*/
    url += '?ssidName='          + ssidName.val()
    url += '&ssidPassword='      + ssidPassword.val()
    url += '&ssidHidden='        + ssidHidden[0].checked
    url += '&channel='           + channel.val()
    if ( !randMacAp[0].checked ) {
      url += '&macAp='           + macAp.val()
      url += '&randMacAp='       + randMacAp[0].checked
    } else {
      url += '&randMacAp='       + randMacAp[0].checked
      url += '&macInterval='     + macInterval.val()
    }

    /*=== WEB SERVER ===*/
    url += '&serverUsername='    + serverUsername.val()
    url += '&serverPassword='    + serverPassword.val()
    
    /*====== WIFI ======*/
    url += '&wifiStatus='        + wifiStatus[0].checked
    if ( wifiStatus[0].checked ) {
      url += '&wifiName='        + wifiName.val()
      url += '&wifiPassword='    + wifiPassword.val()
    }
    
    getResponse( url, function( responseText ) {
      if ( responseText == 'true' ) {
        indicator.html( 'saved' )
        //getConfig()
        restart()
      } else showMessage( 'response error configSave.json', 8000 )
    } )
  } )

  $( '#reset-btn' ).click( function() {
    getResponse( 'configReset.json', function( responseText ) {
      if ( responseText == 'true' ) {
        indicator.html( 'saved' )
        //getConfig()
        restart()
      } else {
        showMessage( 'response error configReset.json', 8000 )
        vibrate()
      }
    } )
  } )

  $( '#restart-btn' ).click( function() { restart() } )

  function restart() {
    getResponse( 'restartEMART.json', function( responseText ) {
      if ( responseText == 'true' ) {
        showMessage( 'getting configuration.', 8000 )
        getConfig()
      } else {
        showMessage( 'response error restartEMART.json', 8000 )
        vibrate()
      }
    } )
  }
  
  ssidHidden.click( function() {
    ssidHiddenTooltip.attr( 'title', this.checked ? 'Show' : 'Hide' )
  } )
  
  randMacAp.click( function() {
    randMacApTooltip.attr( 'title', 'Random Mac ' + switchMAC( this ) )
  } )
  
  wifiStatus.click( function() {
    wifiTooltip.attr( 'title', 'WiFi ' + switchWIFI( this ) )
  } )
  
  function switchWIFI( _this ) {
    if ( _this = ( _this ? _this.checked : wifiStatus.checked ) ) {
      wifiName.removeAttr( 'disabled' )
      wifiPassword.removeAttr( 'disabled' )
    } else {
      wifiPassword.attr( 'disabled', '' )
      wifiName.attr( 'disabled', '' )
    } return _this ? 'Enabled' : 'Disabled'
  }
  
  function switchMAC( _this ) {
    if ( _this = ( _this ? _this.checked : randMacAp.checked ) ) {
      macAp.attr( 'disabled', '' )
      macInterval.removeAttr( 'disabled' )
    } else {
      macInterval.attr( 'disabled', '' )
      macAp.removeAttr( 'disabled' )
    } return _this ? 'Enabled' : 'Disabled'
  }
  
  $( 'input' ).attr( 'spellcheck', false )
} )