registerEA(
  "fixapi_oanda_arbitrage",
  "A test EA to trade arbitrage based on the price difference between FIX API and Oanda(v1.04)",
  [],
  function (context) { // Init()
    var account = getAccount(context, 0)
    var brokerName = getBrokerNameOfAccount(account)
    var accountId = getAccountIdOfAccount(account)

    if (typeof window.oandaLoaded != "undefined" && window.oandaLoaded) {
      window.latestFIXTickTime = new Date().getTime()

      if (typeof window.arbitrageStatistics == "undefined") {
        window.arbitrageStatistics = []

        for (var i in window.oandaApiLoader.oandaQuotes) {
          getQuotes(context, brokerName, accountId, i.replace("_", "/"))
          window.arbitrageStatistics[i] = {
            h: []
          }
          for (var j = 0; j <= 23; j++) {
            window.arbitrageStatistics[i].h.push(0)
          }
        }

        window.countArbitrage = function (symbolName, hour) {
          window.arbitrageStatistics[symbolName].h[hour]++
        }

        var script = document.createElement("script")
        document.body.appendChild(script)
        script.onload = function () {
          window.renderArbitrageChart = function () {
            var ctx = document.getElementById("arbitrage_chart").getContext("2d")
            var labels = []
            var data = []
            for (var i = 0; i <= 23; i++) {
              labels.push(i + "")
              data.push(0)
            }
            window.arbitrageChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Frequencies of EUR/USD",
                        backgroundColor: "rgb(0, 99, 255)",
                        borderColor: "rgb(0, 99, 255)",
                        data: data
                    }]
                },
                options: {}
            })
          }

          window.updateArbitrageChart = function (symbolName, bAll, hour) {
            if (bAll) {
              for (var i = 0; i <= 23; i++) {
                window.arbitrageChart.data.datasets[0].data = []
                window.arbitrageChart.data.datasets[0].data.push(window.arbitrageStatistics[symbolName].h[i])
              }
            } else {
              window.arbitrageChart.data.datasets[0].data[hour] = window.arbitrageStatistics[symbolName].h[hour]
            }

            window.arbitrageChart.update()
          }

          window.renderArbitrageChart()
        }
        script.onerror = function () {
          alert("Failed to load required libs. Please refresh this page again.")
        }
        script.async = true
        script.src = "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
      }

      if (typeof $("#arbitrage_dashboard").html() != "undefined") {
        $("#arbitrage_dashboard").remove()
      }

      var panel = '<div class="ui fullscreen modal" id="arbitrage_dashboard">' +
        '<div class="content">' +
          '<div class="ui grid">' +
            '<div class="twelve wide column"><canvas id="arbitrage_chart"></canvas></div>' +
            '<div class="four wide column">' +
              '<table id="arbitrage_prices" class="cell-border">' +
              '</table>' +
            '</div>' +
          '</div>' +
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
            {title: "FIX-Oanda",
  					render: function (data, type, row) {
  							if (data >= 0) {
  								return '<p style = "background:#21BA45;color:#FFFFFF" >' + data + '</p>'
  							} else {
  								return '<p style = "background:#FFFFFF;color:#DB2828" >' + data + '</p>'
  							}
  						}
  					},
            {title: "Oanda-FIX",
  					render: function (data, type, row) {
                if (data >= 0) {
                  return '<p style = "background:#21BA45;color:#FFFFFF" >' + data + '</p>'
                } else {
                  return '<p style = "background:#FFFFFF;color:#DB2828" >' + data + '</p>'
                }
  						}
  					},
            {title: "Oanda"},
            {title: "Op"}
  				],
          ordering: true,
          searching: true,
          bPaginate: false,
          bLengthChange: false,
          bFilter: false,
          bInfo: false,
          scrollY: "50vh",
          scrollCollapse: true,
          paging: false,
          columnDefs: [
            {width: "20%", targets: 0, className: "dt-body-center"},
            {width: "20%", targets: 1, className: "dt-body-right"},
            {width: "20%", targets: 2, className: "dt-body-right"},
            {width: "20%", targets: 3, className: "dt-body-right"},
            {width: "20%", targets: 4, className: "dt-body-center"},
            {width: "20%", targets: [0], className: "dt-head-center"},
            {width: "20%", targets: [1], className: "dt-head-center"},
            {width: "20%", targets: [2], className: "dt-head-center"},
            {width: "20%", targets: [3], className: "dt-head-center"},
            {width: "20%", targets: [4], className: "dt-head-center"}
          ]
  			})

        for (var i in window.oandaApiLoader.oandaQuotes) {
          $("#arbitrage_prices").DataTable().row.add([
            i,
            "",
            "",
            "",
            ""
          ]).draw(false)
        }
  		}

      $("#arbitrage_dashboard").modal("show")

      if (typeof window.renderArbitrageChart != "undefined") {
        window.renderArbitrageChart()
      }

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
                tb.fnUpdate(Math.round((bidOanda - askFIXAPI) * 100000) / 100000, rowId, 1, false, false)
                tb.fnUpdate(Math.round((bidFIXAPI - askOanda) * 100000) / 100000, rowId, 2, false, false)
                tb.fnUpdate(Math.round((askOanda + bidOanda) / 2 * 100000) / 100000, rowId, 3, false, false)
                break
              }
            }
          }
        })

        if (bidOanda > askFIXAPI) {
          var hour = new Date().getHours()
          window.countArbitrage(symbolName, hour)
          if (symbolName == "EUR_USD") {
            window.updateArbitrageChart(symbolName, false, hour)
          }
          var msg = new Date() + " " + symbolName + " Chance!! Oanda Bid: " + bidOanda + ", FIXAPI Ask: " + askFIXAPI + ", Difference: " + (bidOanda - askFIXAPI) + "\n"
          printMessage(msg)
        }
        if (bidFIXAPI > askOanda) {
          var hour = new Date().getHours()
          window.countArbitrage(symbolName, hour)
          if (symbolName == "EUR_USD") {
            window.updateArbitrageChart(symbolName, false, hour)
          }
          var msg = new Date() + " " + symbolName + " Chance!! FIXAPI Bid: " + bidFIXAPI + ", Oanda Ask: " + askOanda + ", Difference: " + (bidFIXAPI - askOanda) + "\n"
          printMessage(msg)
        }
      }
    }
  }
)
