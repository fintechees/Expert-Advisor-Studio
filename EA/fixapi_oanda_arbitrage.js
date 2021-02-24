registerEA(
  "fixapi_oanda_arbitrage",
  "A test EA to trade arbitrage based on the price difference between FIX API and Oanda(v1.05)",
  [],
  function (context) { // Init()
    var account = getAccount(context, 0)
    var brokerName = getBrokerNameOfAccount(account)
    var accountId = getAccountIdOfAccount(account)

    if (typeof window.oandaLoaded != "undefined" && window.oandaLoaded) {
      window.latestFIXTickTime = new Date().getTime()

      if (typeof window.arbitrageStatistics == "undefined") {
        for (var i in window.oandaApiLoader.oandaQuotes) {
          getQuotes(context, brokerName, accountId, i)
        }

        window.arbitrageStatistics = []

        window.loadArbitrageStatistics = function (symbolNames, arbitrageStatistics) {
          var bLoaded = false

          if (typeof localStorage.reservedZone != "undefined") {
            var reservedZone = JSON.parse(localStorage.reservedZone)

            if (typeof reservedZone.arbitrageStatistics != "undefined") {
              for (var i in reservedZone.arbitrageStatistics) {
                arbitrageStatistics[reservedZone.arbitrageStatistics[i].symbolName] = {
                  h: reservedZone.arbitrageStatistics[i].h
                }
              }

              bLoaded = true
            }
          }

          if (!bLoaded) {
            for (var i in symbolNames) {
              arbitrageStatistics[i] = {
                h: []
              }
              for (var j = 0; j <= 23; j++) {
                arbitrageStatistics[i].h.push(0)
              }
            }
          }
        }

        window.saveArbitrageStatistics = function (arbitrageStatistics) {
          var reservedZone = {}

          if (typeof localStorage.reservedZone != "undefined") {
            reservedZone = JSON.parse(localStorage.reservedZone)
          }

          reservedZone.arbitrageStatistics = []

          for (var i in arbitrageStatistics) {
            reservedZone.arbitrageStatistics.push({
              symbolName: i,
              h: arbitrageStatistics[i].h
            })
          }

          localStorage.reservedZone = JSON.stringify(reservedZone)
        }

        window.countArbitrage = function (symbolName, hour) {
          window.arbitrageStatistics[symbolName].h[hour]++
        }

        window.loadArbitrageStatistics(window.oandaApiLoader.oandaQuotes, window.arbitrageStatistics)

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

            window.currentChartSymbolName = "EUR/USD"

            window.arbitrageChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: window.currentChartSymbolName,
                        backgroundColor: "#FFFFFF",
                        borderColor: "#0099FF",
                        data: data
                    }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false
                }
            })
          }

          window.updateArbitrageChart = function (symbolName, bAll, hour) {
            if (bAll) {
              for (var i = 0; i <= 23; i++) {
                window.arbitrageChart.data.datasets[0].data[i] = window.arbitrageStatistics[symbolName].h[i]
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
            '<div class="ten wide column"><canvas id="arbitrage_chart" style="height:100%"></canvas></div>' +
            '<div class="six wide column">' +
              '<table id="arbitrage_prices" class="cell-border">' +
              '</table>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="actions">' +
          '<div class="ui button" id="btn_save_arbitrage_statistics">Save</div>' +
        '</div>' +
      '</div>'

      $("#reserved_zone").html(panel)

      if (!$.fn.dataTable.isDataTable("#arbitrage_prices")) {
  			window.arbitragePricesTable = $("#arbitrage_prices").DataTable({
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
            {width: "20%", targets: [4], className: "dt-head-center"},
            {
              targets: -1,
              data: null,
              defaultContent: '<button id="btn_check_arbitrage" class="ui button" style="padding:0;background:#FFFFFF"><i class="tachometer alternate green icon"></i></button>' +
                              '<button id="btn_send_order" class="ui button" style="padding:0;background:#FFFFFF"><i class="edit grey icon"></i></button>'
            }
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

        $("#arbitrage_prices tbody").on("click", "[id*=btn_check_arbitrage]", function () {
          if (typeof window.arbitragePricesTable != "undefined") {
            var data = window.arbitragePricesTable.row($(this).parents("tr")).data()
            if (typeof data == "undefined") {
              data = window.arbitragePricesTable.row($(this)).data()
            }

            window.currentChartSymbolName = data[0]
            window.arbitrageChart.data.datasets[0].label = window.currentChartSymbolName
            window.updateArbitrageChart(data[0], true, -1)
          }
        })

        $("#btn_save_arbitrage_statistics").on("click", function () {
          window.saveArbitrageStatistics(window.arbitrageStatistics)
        })
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
      var symbolName = currentTick.symbolName
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
          if (symbolName == window.currentChartSymbolName) {
            window.updateArbitrageChart(symbolName, false, hour)
          }
          var msg = new Date() + " " + symbolName + " Chance!! Oanda Bid: " + bidOanda + ", FIXAPI Ask: " + askFIXAPI + ", Difference: " + (bidOanda - askFIXAPI) + "\n"
          printMessage(msg)
        }
        if (bidFIXAPI > askOanda) {
          var hour = new Date().getHours()
          window.countArbitrage(symbolName, hour)
          if (symbolName == window.currentChartSymbolName) {
            window.updateArbitrageChart(symbolName, false, hour)
          }
          var msg = new Date() + " " + symbolName + " Chance!! FIXAPI Bid: " + bidFIXAPI + ", Oanda Ask: " + askOanda + ", Difference: " + (bidFIXAPI - askOanda) + "\n"
          printMessage(msg)
        }
      }
    }
  }
)
