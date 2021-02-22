registerEA(
  "fixapi_oanda_arbitrage",
  "A test EA to trade arbitrage based on the price difference between FIX API and Oanda(v1.0)",
  [],
  function (context) { // Init()
    var account = getAccount(context, 0)
    var brokerName = getBrokerNameOfAccount(account)
    var accountId = getAccountIdOfAccount(account)

    if (typeof window.oandaApiLoader != "undefined") {
      for (var i in window.oandaApiLoader.oandaQuotes) {
        getQuotes(context, brokerName, accountId, i.replace("_", "/"))
      }

      if (typeof $("#arbitrage_dashboard").html() == "undefined") {
        var panel = '<div class="ui modal" id="arbitrage_dashboard">' +
          '<i class="close icon"></i>' +
          '<div class="content">' +
            '<textarea rows="10" id="arbitrage_log" style="width:100%;overflow:scroll"></textarea>' +
          '</div>' +
          '<div class="actions">' +
            '<div class="ui button">OK</div>' +
          '</div>' +
        '</div>'

        $("#reserved_zone").html(panel)
      }

      $("#arbitrage_dashboard").modal("show")

      window.arbitrageNotification = ""
      window.oandaLoaded = true
    } else {
      window.oandaLoaded = false
      throw new Error("You need to run fintechee_oanda_loader(you can find it in indicators list) first.")
    }
  },
  function (context) { // Deinit()
  },
  function (context) { // OnTick()
    if (window.oandaLoaded) {
      var account = getAccount(context, 0)
      var brokerName = getBrokerNameOfAccount(account)
      var accountId = getAccountIdOfAccount(account)

      var currentTick = getCurrentTick(context)
      var symbolName = currentTick.symbolName.replace("/", "_")
      var askFIXAPI = currentTick.ask
      var bidFIXAPI = currentTick.bid

      if (typeof window.oandaApiLoader.oandaQuotes[symbolName] == "undefined") return

      var askOanda = window.oandaApiLoader.oandaQuotes[symbolName].ask
      var bidOanda = window.oandaApiLoader.oandaQuotes[symbolName].bid

      if (askFIXAPI != null && bidFIXAPI != null && askOanda != null && bidOanda != null) {
        console.log("ok")
        if (bidOanda > askFIXAPI) {
          var msg = new Date() + " " + symbolName + " Chance!! Oanda Bid: " + bidOanda + ", FIXAPI Ask: " + askFIXAPI + ", Difference: " + (bidOanda - askFIXAPI) + "\n"
          window.arbitrageNotification += msg
          printMessage(msg)
          $("#arbitrage_log").val(window.arbitrageNotification)
        }
        if (bidFIXAPI > askOanda) {
          var msg = new Date() + " " + symbolName + " Chance!! FIXAPI Bid: " + bidFIXAPI + ", Oanda Ask: " + askOanda + ", Difference: " + (bidFIXAPI - askOanda) + "\n"
          window.arbitrageNotification += msg
          printMessage(msg)
          $("#arbitrage_log").val(window.arbitrageNotification)
        }
      }
    }
  }
)
