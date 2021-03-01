registerEA(
  "fixapi_oanda_arbitrage",
  "A test EA to trade arbitrage based on the price difference between FIX API and Oanda(v1.07)",
  [{
    name: "autoLoad",
    value: true,
    required: true,
    type: PARAMETER_TYPE.BOOLEAN,
    range: null
  }, {
    name: "autoSave",
    value: true,
    required: true,
    type: PARAMETER_TYPE.BOOLEAN,
    range: null
  }, {
    name: "backgroundColor",
    value: "#dfc29a",
    required: true,
    type: PARAMETER_TYPE.STRING,
    range: null
  }],
  function (context) { // Init()
    var account = getAccount(context, 0)
    var brokerName = getBrokerNameOfAccount(account)
    var accountId = getAccountIdOfAccount(account)
    window.autoLoadArbitrageStats = getEAParameter(context, "autoLoad")
    window.autoSaveArbitrageStats = getEAParameter(context, "autoSave")
    window.arbitrageBgColor = getEAParameter(context, "backgroundColor")
    window.latestDay = new Date().getDay()

    if (typeof window.oandaLoaded != "undefined" && window.oandaLoaded) {
      window.latestFIXTickTime = new Date().getTime()
      window.latestSaveTime = window.latestFIXTickTime

      if (typeof window.arbitrageStatistics == "undefined") {
        for (var i in window.oandaApiLoader.oandaQuotes) {
          getQuotes(context, brokerName, accountId, i)
        }

        window.arbitrageStatistics = []

        for (var i in window.oandaApiLoader.oandaQuotes) {
          window.arbitrageStatistics[i] = {
            h: [],
            h2: [],
            ph: [],
            ph2: []
          }
          for (var j = 0; j <= 23; j++) {
            window.arbitrageStatistics[i].h.push(0)
            window.arbitrageStatistics[i].h2.push(0)
            window.arbitrageStatistics[i].ph.push(0)
            window.arbitrageStatistics[i].ph2.push(0)
          }
        }

        window.loadArbitrageStatistics = function (arbitrageStatistics) {
          if (typeof localStorage.reservedZone != "undefined") {
            var reservedZone = JSON.parse(localStorage.reservedZone)

            if (typeof reservedZone.arbitrageStatistics != "undefined" && typeof reservedZone.arbitrageStatistics.statistics != "undefined") {
              if (new Date(reservedZone.arbitrageStatistics.latestSaveTime).getDay() < window.latestDay) {
                for (var i in reservedZone.arbitrageStatistics.statistics) {
                  var statistics = reservedZone.arbitrageStatistics.statistics[i]
                  arbitrageStatistics[statistics.symbolName] = {
                    h: [],
                    h2: [],
                    ph: statistics.h,
                    ph2: statistics.h2
                  }
                  for (var j = 0; j <= 23; j++) {
                    arbitrageStatistics[symbolName].h.push(0)
                    arbitrageStatistics[symbolName].h2.push(0)
                  }
                }
              } else {
                for (var i in reservedZone.arbitrageStatistics.statistics) {
                  var statistics = reservedZone.arbitrageStatistics.statistics[i]
                  arbitrageStatistics[statistics.symbolName] = {
                    h: statistics.h,
                    h2: statistics.h2,
                    ph: statistics.ph,
                    ph2: statistics.ph2
                  }
                }
              }
            }
          }
        }

        window.saveArbitrageStatistics = function (arbitrageStatistics) {
          var reservedZone = {}

          if (typeof localStorage.reservedZone != "undefined") {
            reservedZone = JSON.parse(localStorage.reservedZone)
          }

          reservedZone.arbitrageStatistics = {
            latestSaveTime: new Date().getTime(),
            statistics: []
          }

          for (var i in arbitrageStatistics) {
            reservedZone.arbitrageStatistics.statistics.push({
              symbolName: i,
              h: arbitrageStatistics[i].h,
              h2: arbitrageStatistics[i].h2,
              ph: arbitrageStatistics[i].ph,
              ph2: arbitrageStatistics[i].ph2
            })
          }

          localStorage.reservedZone = JSON.stringify(reservedZone)
        }

        window.countArbitrage = function (symbolName, hour) {
          window.arbitrageStatistics[symbolName].h[hour]++
        }

        window.countArbitrage2 = function (symbolName, hour) {
          window.arbitrageStatistics[symbolName].h2[hour]++
        }
      }

      if (typeof $("#arbitrage_dashboard").html() != "undefined") {
        $("#arbitrage_dashboard").remove()
      }

      var arbitrageChartPanel = '<div id="arbitrage_chart_dashboard" style="background:' + window.arbitrageBgColor + ';height:100%">' +
        '<div class="row" style="background:' + window.arbitrageBgColor + ';text-align:center">' +
          '<div class="ui buttons">' +
            // '<div class="ui button" style="background:' + window.arbitrageBgColor + '" id="btn_show_arbitrage_prices">List</div>' +
            '<div class="ui button" style="background:' + window.arbitrageBgColor + '" id="btn_load_arbitrage_statistics">Load</div>' +
            '<div class="ui button" style="background:' + window.arbitrageBgColor + '" id="btn_save_arbitrage_statistics">Save</div>' +
          '</div>' +
        '</div>' +
        '<div class="row">' +
          '<table id="arbitrage_prices" class="cell-border">' +
          '</table>' +
        '</div>' +
        '<div class="row">' +
          '<div class="chart-container" style="background:' + window.arbitrageBgColor + ';position:relative;height:35vh">' +
            '<canvas id="arbitrage_chart"></canvas>' +
          '</div>' +
        '</div>' +
      '</div>'

      var arbitragePricesPanel = '<div class="ui fullscreen modal" id="arbitrage_prices_dashboard">' +
        '<div class="content">' +
        '</div>' +
      '</div>'

      $("#reserved_zone").html(arbitragePricesPanel)

      if (getLayoutId() != 3) {
  			changeLayout(3)
  		}

  		window.chartIds = getLayout(2)
  		for (var i in window.chartIds) {
  			moveLayout(window.chartIds[i], 1)
  		}

      embedHtml(arbitrageChartPanel, 2)

      if (!$.fn.dataTable.isDataTable("#arbitrage_prices")) {
  			window.arbitragePricesTable = $("#arbitrage_prices").DataTable({
  				data: [],
  				columns: [
            {title: "Instruments"},
            {title: "FIX-Oanda",
  					render: function (data, type, row) {
  							if (data > 0) {
  								return '<p style = "background:#21BA45;color:#FFFFFF" >' + data + '</p>'
  							} else {
  								return '<p style = "background:' + window.arbitrageBgColor + ';color:#DB2828" >' + data + '</p>'
  							}
  						}
  					},
            {title: "Oanda-FIX",
  					render: function (data, type, row) {
                if (data > 0) {
                  return '<p style = "background:#21BA45;color:#FFFFFF" >' + data + '</p>'
                } else {
                  return '<p style = "background:' + window.arbitrageBgColor + ';color:#DB2828" >' + data + '</p>'
                }
  						}
  					},
            {title: "Oanda"},
            {title: "Op"}
  				],
          headerCallback: function (thead, data, start, end, display) {
            $(thead).css("background-color", window.arbitrageBgColor)
          },
          rowCallback: function (row, data, index) {
            $("td", row).css("background-color", window.arbitrageBgColor)
          },
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
              defaultContent: '<button id="btn_check_arbitrage" class="ui button" style="padding:0;background:' + window.arbitrageBgColor + '"><i class="tachometer alternate blue icon"></i></button>' +
                              '<button id="btn_sell" class="ui button" style="padding:0;background:' + window.arbitrageBgColor + ';color:#DB2828">S</button>' +
                              '<button id="btn_buy" class="ui button" style="padding:0;background:' + window.arbitrageBgColor + ';color:#21BA45">B</button>'
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
            window.arbitrageChart.data.datasets[0].label = window.currentChartSymbolName + "(F-O)"
            window.arbitrageChart.data.datasets[1].label = window.currentChartSymbolName + "(O-F)"
            window.arbitrageChart.data.datasets[2].label = window.currentChartSymbolName + "(F-O)"
            window.arbitrageChart.data.datasets[3].label = window.currentChartSymbolName + "(O-F)"
            window.updateArbitrageChart(data[0], true, -1)
            window.updateArbitrageChart2(data[0], true, -1)
          }
        })

        $("#btn_load_arbitrage_statistics").on("click", function () {
          window.loadArbitrageStatistics(window.arbitrageStatistics)
        })

        $("#btn_save_arbitrage_statistics").on("click", function () {
          window.saveArbitrageStatistics(window.arbitrageStatistics)
        })
  		}

      if (window.autoLoadArbitrageStats) {
        window.loadArbitrageStatistics(window.arbitrageStatistics)
      }

      if (typeof window.initArbitrageChart != "undefined") {
        window.initArbitrageChart(window.arbitrageStatistics)
      } else {
        var script = document.createElement("script")
        document.body.appendChild(script)
        script.onload = function () {
          window.initArbitrageChart = function (arbitrageStatistics) {
            var ctx = document.getElementById("arbitrage_chart").getContext("2d")
            window.currentChartSymbolName = "EUR/USD"
            var statistics = arbitrageStatistics[window.currentChartSymbolName]

            var labels = []
            var data = []
            var data2 = []
            var pdata = []
            var pdata2 = []
            for (var i = 0; i <= 23; i++) {
              labels.push(i + "")
              data.push(statistics.h[i])
              data2.push(statistics.h2[i])
              pdata.push(statistics.ph[i])
              pdata2.push(statistics.ph2[i])
            }

            window.arbitrageChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: window.currentChartSymbolName + "(F-O)",
                        backgroundColor: "rgba(255,255,255,0)",
                        borderColor: "#DB2828",
                        data: data
                    }, {
                        label: window.currentChartSymbolName + "(O-F)",
                        backgroundColor: "rgba(255,255,255,0)",
                        borderColor: "#21BA45",
                        data: data2
                    }, {
                        label: window.currentChartSymbolName + "(F-O)",
                        backgroundColor: "rgba(255,255,255,0)",
                        borderColor: "#DB2828",
                        borderDash: [2, 3],
                        data: pdata
                    }, {
                        label: window.currentChartSymbolName + "(O-F)",
                        backgroundColor: "rgba(255,255,255,0)",
                        borderColor: "#21BA45",
                        borderDash: [2, 3],
                        data: pdata2
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
                window.arbitrageChart.data.datasets[2].data[i] = window.arbitrageStatistics[symbolName].ph[i]
              }
            } else {
              window.arbitrageChart.data.datasets[0].data[hour] = window.arbitrageStatistics[symbolName].h[hour]
            }

            window.arbitrageChart.update()
          }

          window.updateArbitrageChart2 = function (symbolName, bAll, hour) {
            if (bAll) {
              for (var i = 0; i <= 23; i++) {
                window.arbitrageChart.data.datasets[1].data[i] = window.arbitrageStatistics[symbolName].h2[i]
                window.arbitrageChart.data.datasets[3].data[i] = window.arbitrageStatistics[symbolName].ph2[i]
              }
            } else {
              window.arbitrageChart.data.datasets[1].data[hour] = window.arbitrageStatistics[symbolName].h2[hour]
            }

            window.arbitrageChart.update()
          }

          window.updatePrevArbitrage = function () {
            for (var i in window.arbitrageStatistics) {
              window.arbitrageStatistics[i].ph = window.arbitrageStatistics[i].h
              window.arbitrageStatistics[i].ph2 = window.arbitrageStatistics[i].h2
              window.arbitrageStatistics[i].h = []
              window.arbitrageStatistics[i].h2 = []

              for (var j = 0; j <= 23; j++) {
                window.arbitrageStatistics[i].h.push(0)
                window.arbitrageStatistics[i].h2.push(0)
              }
            }
          }

          window.initArbitrageChart(window.arbitrageStatistics)
        }
        script.onerror = function () {
          alert("Failed to load required libs. Please refresh this page again.")
        }
        script.async = true
        script.src = "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
      }

      window.arbitrageNotification = ""
    } else {
      throw new Error("You need to run fintechee_oanda_loader(you can find it in our Github repo -- Plugin-for-Data-API) first. If you have run the loader, please be patient with the loading time.")
    }
  },
  function (context) { // Deinit()
    embedHtml("", 2)

		for (var i in window.chartIds) {
			moveLayout(window.chartIds[i], 2)
		}
  },
  function (context) { // OnTick()
    if (typeof window.oandaLoaded != "undefined" && window.oandaLoaded) {
      if (typeof window.latestFIXTickTime == "undefined" || typeof window.latestOandaTickTime == "undefined") return

      var currTime = new Date().getTime()
      var hour = new Date(currTime).getHours()
      var day = new Date(currTime).getDay()
      if (currTime - window.latestOandaTickTime > 30000) {
        window.oandaApiLoader.resetupSocket()
        window.oandaLoaded = false
        return
      }

      if (window.latestDay != day) {
        window.updatePrevArbitrage()
      }

      if (window.autoSaveArbitrageStats && currTime - window.latestSaveTime > 60000) {
        window.saveArbitrageStatistics(window.arbitrageStatistics)
        window.latestSaveTime = currTime
      }

      window.latestFIXTickTime = currTime
      window.latestDay = day

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
          window.countArbitrage(symbolName, hour)
          if (symbolName == window.currentChartSymbolName) {
            window.updateArbitrageChart(symbolName, false, hour)
          }
          // var msg = new Date() + " " + symbolName + " Chance!! Oanda Bid: " + bidOanda + ", FIXAPI Ask: " + askFIXAPI + ", Difference: " + (bidOanda - askFIXAPI) + "\n"
          // printMessage(msg)
        }
        if (bidFIXAPI > askOanda) {
          window.countArbitrage2(symbolName, hour)
          if (symbolName == window.currentChartSymbolName) {
            window.updateArbitrageChart2(symbolName, false, hour)
          }
          // var msg = new Date() + " " + symbolName + " Chance!! FIXAPI Bid: " + bidFIXAPI + ", Oanda Ask: " + askOanda + ", Difference: " + (bidFIXAPI - askOanda) + "\n"
          // printMessage(msg)
        }
      }
    }
  }
)
