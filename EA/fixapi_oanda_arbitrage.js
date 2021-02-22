registerEA(
  "fixapi_oanda_arbitrage",
  "A test EA to trade arbitrage based on the price difference between FIX API and Oanda(v1.01)",
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
            '<table id="arbitrage_prices" class="cell-border" cellspacing="0">' +
            '</table>' +
          '</div>' +
          '<div class="actions">' +
            '<div class="ui button">OK</div>' +
          '</div>' +
        '</div>'

        $("#reserved_zone").html(panel)

        if (!$.fn.dataTable.isDataTable("#arbitrage_prices")) {
    			$("#arbitrage_prices").DataTable({
    				data: [],
    				columns: [
              {title: "Instruments"},
              {title: "Bid(FIX)"},
    					{title: "Ask(FIX)"},
              {title: "Bid(Oanda)"},
    					{title: "Ask(Oanda)"},
              {title: "FIX-Oanda",
    					render: function (data, type, row) {
    							if (data >= 0) {
    								return '<p style = "color:#21BA45" >' + data + '</p>'
    							} else {
    								return '<p style = "color:#DB2828" >' + data + '</p>'
    							}
    						}
    					},
              {title: "Oanda-FIX",
    					render: function (data, type, row) {
                if (data >= 0) {
                  return '<p style = "color:#21BA45" >' + data + '</p>'
                } else {
                  return '<p style = "color:#DB2828" >' + data + '</p>'
                }
    						}
    					}
    				],
            ordering: false,
            searching: false,
            bPaginate: false,
            bLengthChange: false,
            bFilter: false,
            bInfo: false,
            scrollY: "50vh",
            scrollCollapse: true,
            paging: false,
            columnDefs: [
              {width: "22%", targets: 0, className: "dt-body-center"},
              {width: "13%", targets: 1, className: "dt-body-right"},
              {width: "13%", targets: 2, className: "dt-body-right"},
              {width: "13%", targets: 3, className: "dt-body-right"},
              {width: "13%", targets: 4, className: "dt-body-right"},
              {width: "13%", targets: 5, className: "dt-body-right"},
              {width: "13%", targets: 6, className: "dt-body-right"},
              {width: "22%", targets: [0], className: "dt-head-center"},
              {width: "13%", targets: [1], className: "dt-head-center"},
              {width: "13%", targets: [2], className: "dt-head-center"},
              {width: "13%", targets: [3], className: "dt-head-center"},
              {width: "13%", targets: [4], className: "dt-head-center"},
              {width: "13%", targets: [5], className: "dt-head-center"},
              {width: "13%", targets: [6], className: "dt-head-center"}
            ]
    			})

          for (var i in window.oandaApiLoader.oandaQuotes) {
            var quote = window.oandaApiLoader.oandaQuotes[i]

            $("#arbitrage_prices").DataTable().row.add([
              i,
              "",
              "",
              "",
              "",
              "",
              ""
            ]).draw(false)
          }
    		}
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
        var table = $('#arbitrage_prices').DataTable()
        var tb = $('#arbitrage_prices').dataTable()

        table.columns().eq(0).each(function (index) {
          if (index == 0) {
            var column = table.column(index).data()
            for (var i in column) {
              if (isNaN(i)) continue

              var rowId = parseInt(i)

              if (column[i] == symbolName) {
                tb.fnUpdate(bidFIXAPI, rowId, 1, false, false)
                tb.fnUpdate(askFIXAPI, rowId, 2, false, false)
                tb.fnUpdate(bidOanda, rowId, 3, false, false)
                tb.fnUpdate(askOanda, rowId, 4, false, false)
                tb.fnUpdate(Math.round((bidOanda - askFIXAPI) * 100000) / 100000, rowId, 5, false, false)
                tb.fnUpdate(Math.round((bidFIXAPI - askOanda) * 100000) / 100000, rowId, 6, false, false)
                break
              }
            }
          }
        })

        if (bidOanda > askFIXAPI) {
          var msg = new Date() + " " + symbolName + " Chance!! Oanda Bid: " + bidOanda + ", FIXAPI Ask: " + askFIXAPI + ", Difference: " + (bidOanda - askFIXAPI) + "\n"
          printMessage(msg)
        }
        if (bidFIXAPI > askOanda) {
          var msg = new Date() + " " + symbolName + " Chance!! FIXAPI Bid: " + bidFIXAPI + ", Oanda Ask: " + askOanda + ", Difference: " + (bidFIXAPI - askOanda) + "\n"
          printMessage(msg)
        }
      }
    }
  }
)
