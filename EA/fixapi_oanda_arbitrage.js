registerEA(
  "fixapi_oanda_arbitrage",
  "A test EA to trade arbitrage based on the price difference between FIX API and Oanda(v1.03)",
  [],
  function (context) { // Init()
    var account = getAccount(context, 0)
    var brokerName = getBrokerNameOfAccount(account)
    var accountId = getAccountIdOfAccount(account)
    window.arbitrageStatistics = []

    if (typeof window.oandaLoaded != "undefined" && window.oandaLoaded) {
      window.latestFIXTickTime = new Date().getTime()

      if (typeof window.arbitrageStatistics == "undefined") {
        for (var i in window.oandaApiLoader.oandaQuotes) {
          getQuotes(context, brokerName, accountId, i.replace("_", "/"))
          window.arbitrageStatistics[i] = {
            h0: 0,
            h1: 0,
            h2: 0,
            h3: 0,
            h4: 0,
            h5: 0,
            h6: 0,
            h7: 0,
            h8: 0,
            h9: 0,
            h11: 0,
            h10: 0,
            h12: 0,
            h13: 0,
            h14: 0,
            h15: 0,
            h16: 0,
            h17: 0,
            h18: 0,
            h19: 0,
            h20: 0,
            h21: 0,
            h22: 0,
            h23: 0,
            ph0: 0,
            ph1: 0,
            ph2: 0,
            ph3: 0,
            ph4: 0,
            ph5: 0,
            ph6: 0,
            ph7: 0,
            ph8: 0,
            ph9: 0,
            ph11: 0,
            ph10: 0,
            ph12: 0,
            ph13: 0,
            ph14: 0,
            ph15: 0,
            ph16: 0,
            ph17: 0,
            ph18: 0,
            ph19: 0,
            ph20: 0,
            ph21: 0,
            ph22: 0,
            ph23: 0
          }
        }

        window.countArbitrage = function (symbolName) {
          var hour = new Date().getHours()
          if (hour == 0) {
            window.arbitrageStatistics[symbolName].h0++
          } else if (hour == 1) {
            window.arbitrageStatistics[symbolName].h1++
          } else if (hour == 2) {
            window.arbitrageStatistics[symbolName].h2++
          } else if (hour == 3) {
            window.arbitrageStatistics[symbolName].h3++
          } else if (hour == 4) {
            window.arbitrageStatistics[symbolName].h4++
          } else if (hour == 5) {
            window.arbitrageStatistics[symbolName].h5++
          } else if (hour == 6) {
            window.arbitrageStatistics[symbolName].h6++
          } else if (hour == 7) {
            window.arbitrageStatistics[symbolName].h7++
          } else if (hour == 8) {
            window.arbitrageStatistics[symbolName].h8++
          } else if (hour == 9) {
            window.arbitrageStatistics[symbolName].h9++
          } else if (hour == 10) {
            window.arbitrageStatistics[symbolName].h10++
          } else if (hour == 11) {
            window.arbitrageStatistics[symbolName].h11++
          } else if (hour == 12) {
            window.arbitrageStatistics[symbolName].h12++
          } else if (hour == 13) {
            window.arbitrageStatistics[symbolName].h13++
          } else if (hour == 14) {
            window.arbitrageStatistics[symbolName].h14++
          } else if (hour == 15) {
            window.arbitrageStatistics[symbolName].h15++
          } else if (hour == 16) {
            window.arbitrageStatistics[symbolName].h16++
          } else if (hour == 17) {
            window.arbitrageStatistics[symbolName].h17++
          } else if (hour == 18) {
            window.arbitrageStatistics[symbolName].h18++
          } else if (hour == 19) {
            window.arbitrageStatistics[symbolName].h19++
          } else if (hour == 20) {
            window.arbitrageStatistics[symbolName].h20++
          } else if (hour == 21) {
            window.arbitrageStatistics[symbolName].h21++
          } else if (hour == 22) {
            window.arbitrageStatistics[symbolName].h22++
          } else if (hour == 23) {
            window.arbitrageStatistics[symbolName].h23++
          }
        }
      }

      if (typeof $("#arbitrage_dashboard").html() != "undefined") {
        $("#arbitrage_dashboard").remove()
      }

      var panel = '<div class="ui modal" id="arbitrage_dashboard">' +
        '<i class="close icon"></i>' +
        '<div class="content">' +
          '<table id="arbitrage_prices" class="cell-border">' +
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

      $("#arbitrage_dashboard").modal("show")

      window.arbitrageNotification = ""
    } else {
      throw new Error("You need to run fintechee_oanda_loader(you can find it in our Github repo -- Plugin-for-Data-API) first. If you have run the loader, please be patient with the loading time.")
    }
  },
  function (context) { // Deinit()
  },
  function (context) { // OnTick()
    if (typeof window.oandaLoaded != "undefined" && window.oandaLoaded) {
      if (typeof window.latestFIXTickTime == "undefined" || typeof window.latestOandaTickTime == "undefined") return

      var currTime = new Date().getTime()
      if (currTime - window.latestOandaTickTime > 30000) {
        window.oandaApiLoader.resetupSocket()
        window.oandaLoaded = false
        return
      }

      window.latestFIXTickTime = new Date().getTime()

      var account = getAccount(context, 0)
      var brokerName = getBrokerNameOfAccount(account)
      var accountId = getAccountIdOfAccount(account)

      var currentTick = getCurrentTick(context)
      var symbolName = currentTick.symbolName.replace("/", "_")
      var askFIXAPI = currentTick.ask
      var bidFIXAPI = currentTick.bid

      if (window.oandaApiLoader.oandaQuotes[symbolName] == null) return

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
          window.countArbitrage(symbolName)
          var msg = new Date() + " " + symbolName + " Chance!! Oanda Bid: " + bidOanda + ", FIXAPI Ask: " + askFIXAPI + ", Difference: " + (bidOanda - askFIXAPI) + "\n"
          printMessage(msg)
        }
        if (bidFIXAPI > askOanda) {
          window.countArbitrage(symbolName)
          var msg = new Date() + " " + symbolName + " Chance!! FIXAPI Bid: " + bidFIXAPI + ", Oanda Ask: " + askOanda + ", Difference: " + (bidFIXAPI - askOanda) + "\n"
          printMessage(msg)
        }
      }
    }
  }
)
