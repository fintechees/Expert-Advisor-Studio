registerEA(
  "fintechee_external_arbitrage",
  "A test EA to trade arbitrage based on the price difference between Fintechee and the external trading platform(v1.0)",
  [{
    name: "externalSys",
    value: "Oanda",
    required: true,
    type: PARAMETER_TYPE.STRING,
    range: null
  }, {
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
    var externalSys = getEAParameter(context, "externalSys")

    if (externalSys == "Oanda") {
      if (typeof window.pluginForOanda == "undefined") {
        throw new Error("You need to run plugin_for_oanda(you can find it in our Github repo -- Plugin-for-Oanda) first. If you have run the plugin, please be patient with the loading time.")
      }
    } else {
      throw new Error("The specific external trading platform is not supported.")
    }

    var account = getAccount(context, 0)
    var brokerName = getBrokerNameOfAccount(account)
    var accountId = getAccountIdOfAccount(account)

    var currTime = new Date().getTime()

    if (typeof window.arbitrage == "undefined") {
      window.arbitrage = {
        autoLoad: getEAParameter(context, "autoLoad"),
        autoSave: getEAParameter(context, "autoSave"),
        bgColor: getEAParameter(context, "backgroundColor"),
        latestDay: new Date().getDay(),
        latestSaveTime: currTime,
        quotes: [],
        statistics: [],
        loadStatistics: function () {
          if (typeof localStorage.reservedZone != "undefined") {
            var reservedZone = JSON.parse(localStorage.reservedZone)

            if (typeof reservedZone.arbitrageStatistics != "undefined" && typeof reservedZone.arbitrageStatistics.statistics != "undefined") {
              if (new Date(reservedZone.arbitrageStatistics.latestSaveTime).getDay() < window.latestDay) {
                for (var i in reservedZone.arbitrageStatistics.statistics) {
                  var statistics = reservedZone.arbitrageStatistics.statistics[i]
                  this.statistics[statistics.symbolName] = {
                    h: [],
                    h2: [],
                    ph: statistics.h,
                    ph2: statistics.h2
                  }
                  for (var j = 0; j <= 23; j++) {
                    this.statistics[statistics.symbolName].h.push(0)
                    this.statistics[statistics.symbolName].h2.push(0)
                  }
                }
              } else {
                for (var i in reservedZone.arbitrageStatistics.statistics) {
                  var statistics = reservedZone.arbitrageStatistics.statistics[i]
                  this.statistics[statistics.symbolName] = {
                    h: statistics.h,
                    h2: statistics.h2,
                    ph: statistics.ph,
                    ph2: statistics.ph2
                  }
                }
              }
            }
          }
        },
        saveStatistics: function () {
          var reservedZone = {}

          if (typeof localStorage.reservedZone != "undefined") {
            reservedZone = JSON.parse(localStorage.reservedZone)
          }

          reservedZone.arbitrageStatistics = {
            latestSaveTime: new Date().getTime(),
            statistics: []
          }

          for (var i in this.statistics) {
            reservedZone.arbitrageStatistics.statistics.push({
              symbolName: i,
              h: this.statistics[i].h,
              h2: this.statistics[i].h2,
              ph: this.statistics[i].ph,
              ph2: this.statistics[i].ph2
            })
          }

          localStorage.reservedZone = JSON.stringify(reservedZone)
        },
        count: function (symbolName, hour) {
          this.statistics[symbolName].h[hour]++
        },
        count2: function (symbolName, hour) {
          this.statistics[symbolName].h2[hour]++
        },
        chartLibUrl: "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
        bLibLoaded: false,
        loadChartJsLib: function () {
          var tags = document.getElementsByTagName("script")
          for (var i = tags.length - 1; i >= 0; i--) {
            if (tags[i] && tags[i].getAttribute("src") != null && tags[i].getAttribute("src") == this.chartLibUrl) {
              this.bLibLoaded = true
              break
            }
          }

          var that = this

          if (!this.bLibLoaded) {
            var script = document.createElement("script")
            script.id = "chartjs_lib"

            document.body.appendChild(script)
            script.onload = function () {
              that.bLibLoaded = true
              that.initArbitrageChart()
              popupMessage("The ChartJS lib has been loaded successfully!")
            }
            script.onerror = function () {
              that.bLibLoaded = false
              popupErrorMessage("Failed to load the ChartJS lib.")
            }
            script.async = true
            script.src = this.chartLibUrl
          } else {
            this.initArbitrageChart()
          }
        },
        currentChartSymbolName: "EUR/USD",
        initArbitrageChart: function () {
          var ctx = document.getElementById("arbitrage_chart").getContext("2d")
          var statistics = this.statistics[this.currentChartSymbolName]

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

          this.arbitrageChart = new Chart(ctx, {
              type: "line",
              data: {
                  labels: labels,
                  datasets: [{
                      label: this.currentChartSymbolName + "(F-X)", // F stands for Fintechee, X stands for eXternal sys
                      backgroundColor: "rgba(255,255,255,0)",
                      borderColor: "#DB2828",
                      data: data
                  }, {
                      label: this.currentChartSymbolName + "(X-F)",
                      backgroundColor: "rgba(255,255,255,0)",
                      borderColor: "#21BA45",
                      data: data2
                  }, {
                      label: this.currentChartSymbolName + "(F-X)",
                      backgroundColor: "rgba(255,255,255,0)",
                      borderColor: "#DB2828",
                      borderDash: [2, 3],
                      data: pdata
                  }, {
                      label: this.currentChartSymbolName + "(X-F)",
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
        },
        updateArbitrageChart: function (symbolName, bAll, hour) {
          if (bAll) {
            for (var i = 0; i <= 23; i++) {
              this.arbitrageChart.data.datasets[0].data[i] = this.statistics[symbolName].h[i]
              this.arbitrageChart.data.datasets[2].data[i] = this.statistics[symbolName].ph[i]
            }
          } else {
            this.arbitrageChart.data.datasets[0].data[hour] = this.statistics[symbolName].h[hour]
          }

          this.arbitrageChart.update()
        },
        updateArbitrageChart2: function (symbolName, bAll, hour) {
          if (bAll) {
            for (var i = 0; i <= 23; i++) {
              this.arbitrageChart.data.datasets[1].data[i] = this.statistics[symbolName].h2[i]
              this.arbitrageChart.data.datasets[3].data[i] = this.statistics[symbolName].ph2[i]
            }
          } else {
            this.arbitrageChart.data.datasets[1].data[hour] = this.statistics[symbolName].h2[hour]
          }

          this.arbitrageChart.update()
        },
        updatePrevArbitrage: function () {
          for (var i in this.statistics) {
            this.statistics[i].ph = this.statistics[i].h
            this.statistics[i].ph2 = this.statistics[i].h2
            this.statistics[i].h = []
            this.statistics[i].h2 = []

            for (var j = 0; j <= 23; j++) {
              this.statistics[i].h.push(0)
              this.statistics[i].h2.push(0)
            }
          }
        },
        chartIds: [],
        initDashboard: function () {
          if (typeof $("#arbitrage_chart_dashboard").html() == "undefined") {
            var arbitrageChartPanel = '<div id="arbitrage_chart_dashboard" style="background:' + this.bgColor + ';height:100%">' +
              '<div class="row" style="background:' + this.bgColor + ';text-align:center">' +
                '<div class="ui buttons">' +
                  // '<div class="ui button" style="background:' + this.bgColor + '" id="btn_show_arbitrage_prices">List</div>' +
                  '<div class="ui button" style="background:' + this.bgColor + '" id="btn_load_arbitrage_statistics">Load</div>' +
                  '<div class="ui button" style="background:' + this.bgColor + '" id="btn_save_arbitrage_statistics">Save</div>' +
                '</div>' +
              '</div>' +
              '<div class="row">' +
                '<table id="arbitrage_prices" class="cell-border">' +
                '</table>' +
              '</div>' +
              '<div class="row">' +
                '<div class="chart-container" style="background:' + this.bgColor + ';position:relative;height:35vh">' +
                  '<canvas id="arbitrage_chart"></canvas>' +
                '</div>' +
              '</div>' +
            '</div>'

            var arbitragePricesPanel = '<div class="ui fullscreen modal" id="arbitrage_prices_dashboard">' +
              '<div class="content">' +
              '</div>' +
            '</div>'

            $("#reserved_zone").append(arbitragePricesPanel)

            if (getLayoutId() != 3) {
        			changeLayout(3)
        		}

        		this.chartIds = getLayout(2)
        		for (var i in this.chartIds) {
        			moveLayout(this.chartIds[i], 1)
        		}

            embedHtml(arbitrageChartPanel, 2)
          }

          var that = this

          if (!$.fn.dataTable.isDataTable("#arbitrage_prices")) {
      			this.pricesTable = $("#arbitrage_prices").DataTable({
      				data: [],
      				columns: [
                {
                  title: "Instruments"
                }, {
                  title: "Fintechee-Ext",
                  render: function (data, type, row) {
      							if (data > 0) {
      								return '<p style = "background:#21BA45;color:#FFFFFF" >' + data + '</p>'
      							} else {
      								return '<p style = "background:' + that.bgColor + ';color:#DB2828" >' + data + '</p>'
      							}
      						}
      					}, {
                  title: "Ext-Fintechee",
                  render: function (data, type, row) {
                    if (data > 0) {
                      return '<p style = "background:#21BA45;color:#FFFFFF" >' + data + '</p>'
                    } else {
                      return '<p style = "background:' + that.bgColor + ';color:#DB2828" >' + data + '</p>'
                    }
      						}
      					}, {
                  title: "External"
                }, {
                  title: "Op"
                }
      				],
              headerCallback: function (thead, data, start, end, display) {
                $(thead).css("background-color", that.bgColor)
              },
              rowCallback: function (row, data, index) {
                $("td", row).css("background-color", that.bgColor)
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
                  defaultContent: '<button id="btn_check_arbitrage" class="ui button" style="padding:0;background:' + this.bgColor + '"><i class="tachometer alternate blue icon"></i></button>' +
                                  '<button id="btn_sell" class="ui button" style="padding:0;background:' + this.bgColor + ';color:#DB2828">S</button>' +
                                  '<button id="btn_buy" class="ui button" style="padding:0;background:' + this.bgColor + ';color:#21BA45">B</button>'
                }
              ]
      			})

            for (var i in this.quotes) {
              $("#arbitrage_prices").DataTable().row.add([
                i,
                "",
                "",
                "",
                ""
              ]).draw(false)
            }

            $("#arbitrage_prices tbody").on("click", "[id*=btn_check_arbitrage]", function () {
              if (typeof that.pricesTable != "undefined") {
                var data = that.pricesTable.row($(this).parents("tr")).data()
                if (typeof data == "undefined") {
                  data = that.pricesTable.row($(this)).data()
                }

                that.currentChartSymbolName = data[0]
                that.arbitrageChart.data.datasets[0].label = that.currentChartSymbolName + "(F-X)" // F stands for Fintechee, O stands for eXternal sys
                that.arbitrageChart.data.datasets[1].label = that.currentChartSymbolName + "(X-F)"
                that.arbitrageChart.data.datasets[2].label = that.currentChartSymbolName + "(F-X)"
                that.arbitrageChart.data.datasets[3].label = that.currentChartSymbolName + "(X-F)"
                that.updateArbitrageChart(data[0], true, -1)
                that.updateArbitrageChart2(data[0], true, -1)
              }
            })

            $("#btn_load_arbitrage_statistics").on("click", function () {
              that.loadStatistics()
            })

            $("#btn_save_arbitrage_statistics").on("click", function () {
              that.saveStatistics()
            })
      		}

          for (var i in this.quotes) {
            this.statistics[i] = {
              h: [],
              h2: [],
              ph: [],
              ph2: []
            }

            for (var j = 0; j <= 23; j++) {
              this.statistics[i].h.push(0)
              this.statistics[i].h2.push(0)
              this.statistics[i].ph.push(0)
              this.statistics[i].ph2.push(0)
            }
          }
        }
      }
    }

    if (externalSys == "Oanda") {
      window.arbitrage.quotes = window.pluginForOanda.quotes
    }

    window.arbitrage.initDashboard()
		window.arbitrage.loadChartJsLib()

    if (window.arbitrage.autoLoad) {
      window.arbitrage.loadStatistics()
    }

    for (var i in window.arbitrage.quotes) {
      getQuotes(context, brokerName, accountId, i.replace("_", "/"))
    }
  },
  function (context) { // Deinit()
    embedHtml("", 2)

		for (var i in window.arbitrage.chartIds) {
			moveLayout(window.arbitrage.chartIds[i], 2)
		}

    if (!window.arbitrage.bLibLoaded) {
			var script = document.getElementById("chartjs_lib")
			script.remove()
		}
  },
  function (context) { // OnTick()
    var externalSys = getEAParameter(context, "externalSys")

    if (externalSys == "Oanda") {
      if (typeof window.pluginForOanda == "undefined") {
        return
      }
    } else {
      return
    }

    var currTime = new Date().getTime()
    var hour = new Date(currTime).getHours()
    var day = new Date(currTime).getDay()

    if (window.arbitrage.autoSave && currTime - window.arbitrage.latestSaveTime > 60000) {
      window.arbitrage.saveStatistics()
      window.arbitrage.latestSaveTime = currTime
    }

    var account = getAccount(context, 0)
    var brokerName = getBrokerNameOfAccount(account)
    var accountId = getAccountIdOfAccount(account)

    var currentTick = getCurrentTick(context)
    var symbolName = currentTick.symbolName
    var askFintechee = currentTick.ask
    var bidFintechee = currentTick.bid

    if (window.arbitrage.latestDay != day) {
      window.arbitrage.updatePrevArbitrage()
      window.arbitrage.updateArbitrageChart(symbolName, true, -1)
      window.arbitrage.updateArbitrageChart2(symbolName, true, -1)
      window.arbitrage.latestDay = day
    }

    if (window.arbitrage.quotes[symbolName] == null) return

    var askExt = window.arbitrage.quotes[symbolName].ask
    var bidExt = window.arbitrage.quotes[symbolName].bid

    if (askFintechee != null && bidFintechee != null && askExt != null && bidExt != null) {
      var table = $('#arbitrage_prices').DataTable()
      var tb = $('#arbitrage_prices').dataTable()

      table.columns().eq(0).each(function (index) {
        if (index == 0) {
          var column = table.column(index).data()
          for (var i in column) {
            if (isNaN(i)) continue

            var rowId = parseInt(i)

            if (column[i] == symbolName) {
              tb.fnUpdate(Math.round((bidExt - askFintechee) * 100000) / 100000, rowId, 1, false, false)
              tb.fnUpdate(Math.round((bidFintechee - askExt) * 100000) / 100000, rowId, 2, false, false)
              tb.fnUpdate(Math.round((askExt + bidExt) / 2 * 100000) / 100000, rowId, 3, false, false)
              break
            }
          }
        }
      })

      if (bidExt > askFintechee) {
        window.arbitrage.count(symbolName, hour)
        if (symbolName == window.arbitrage.currentChartSymbolName) {
          window.arbitrage.updateArbitrageChart(symbolName, false, hour)
        }
        // var msg = new Date() + " " + symbolName + " Chance!! Ext Bid: " + bidExt + ", Fintechee Ask: " + askFintechee + ", Difference: " + (bidExt - askFintechee) + "\n"
        // printMessage(msg)
      }
      if (bidFintechee > askExt) {
        window.arbitrage.count2(symbolName, hour)
        if (symbolName == window.arbitrage.currentChartSymbolName) {
          window.arbitrage.updateArbitrageChart2(symbolName, false, hour)
        }
        // var msg = new Date() + " " + symbolName + " Chance!! Fintechee Bid: " + bidFintechee + ", Ext Ask: " + askExt + ", Difference: " + (bidFintechee - askExt) + "\n"
        // printMessage(msg)
      }
    }
  }
)
