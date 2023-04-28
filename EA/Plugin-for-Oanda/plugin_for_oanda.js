registerEA(
	"plugin_for_oanda",
	"An EA to integrate with Oanda(v1.0)",
	[],
	function (context) { // Init()
		// Disclaimer: we are not affiliated with Oanda.
		if (typeof window.pluginForOanda == "undefined") {
			window.pluginForOanda = {
				oandaDemo: true,
				oandaAccountId: "",
				oandaTradeKey: "",
				wrapperLibUrl: "https://www.fintechee.com/js/oanda/oanda_wrapper.js",
				interval: 120000,
				latestHBTime: 0,
				bLibLoaded: false,
				bMonitoring: false,
				currenciesList: [],
				openPositions: [],
				clearTable: function () {
					var posTable = null

					if ($.fn.dataTable.isDataTable("#oanda_pos_list")) {
			      posTable = $("#oanda_pos_list").DataTable();
			      posTable.clear().draw();
			      posTable.destroy();
			      $("#oanda_pos_list").empty();
			    }

					$("#oanda_pos_list").DataTable({
						data: [],
						columns: [
							{title: "Instrument"},
							{title: "Units"},
							{title: "Type"}
						],
						ordering: false,
						searching: false,
						bPaginate: false,
						bLengthChange: false,
						bFilter: false,
						bInfo: false,
						scrollY: '50vh',
						scrollCollapse: true,
						paging: false,
						columnDefs: [
							{width: "40%", targets: 0, className: "dt-body-left"},
							{width: "30%", targets: 1, className: "dt-body-left"},
							{width: "30%", targets: 2, className: "dt-body-left"},
							{targets: [0, 1, 2], className: "dt-head-left"}
						]
					})
				},
				updatePositions: function (trade) {
					var rowId = -1
					var instrument = trade.instrument.replace("_", "/")
					var currentUnits = parseFloat(trade.currentUnits)
					var units = 0

					for (var i in this.openPositions) {
						var openPos = this.openPositions[i]
						if (openPos[0] == instrument) {
							rowId = parseInt(i)
							if (openPos[2] == "Long") {
								units = openPos[1]
							} else {
								units = -openPos[1]
							}
							units += currentUnits
							break
						}
					}

					if (rowId != -1) {
						if (units == 0) {
							this.openPositions.splice(rowId, 1)
							this.removePosFromTable(rowId)
						} else {
							if (units > 0) {
								this.openPositions[rowId][2] = "Long"
								this.openPositions[rowId][1] = units
								this.updatePosOnTable(rowId, "Long", units)
							} else {
								this.openPositions[rowId][2] = "Short"
								this.openPositions[rowId][1] = -units
								this.updatePosOnTable(rowId, "Short", -units)
							}
						}
					} else {
						var pos = [
							trade.instrument.replace("_", "/"),
							Math.abs(currentUnits),
							currentUnits > 0 ? "Long" : "Short"
						]
						this.openPositions.push(pos)
						this.addPosToTable(pos)
					}
				},
				addPosToTable: function (pos) {
					$("#oanda_pos_list").DataTable().row.add(pos).draw(false)
				},
				updatePosOnTable: function (rowId, orderType, units) {
					$("#oanda_pos_list").dataTable().fnUpdate(units, rowId, 1, false, false)
					$("#oanda_pos_list").dataTable().fnUpdate(orderType, rowId, 2, false, false)
				},
				removePosFromTable: function (rowId) {
					$("#oanda_pos_list").dataTable().postable.fnDeleteRow(rowId)
				},
				loadTrades: function () {
					var that = this
					if (typeof window.oandaOrderAPI != "undefined") {
						window.oandaOrderAPI.trades.listOpen(this.oandaAccountId)
						.then(function (res) {
							that.clearTable()

							for (var i in res.trades) {
			          that.updatePositions(res.trades[i])
			        }
						})
						.catch(function () {})
					}
				},
				sendOrder: function (symbolName, orderType, volume) {
					if (typeof window.oandaOrderAPI != "undefined") {
						window.oandaOrderAPI.orders.openOrder(this.oandaAccountId, {
							units: (orderType == ORDER_TYPE.OP_BUY ? (volume * 100000 + "") : (-volume * 100000 + "")),
							instrument: symbolName.replace("/", "_"),
							timeInForce: "FOK",
							type: "MARKET",
							positionFill: "DEFAULT"
						})
					}
				},
				loadLib: function () {
					var tags = document.getElementsByTagName("script")
					for (var i = tags.length - 1; i >= 0; i--) {
						if (tags[i] && tags[i].getAttribute("src") != null && tags[i].getAttribute("src") == this.wrapperLibUrl) {
							this.bLibLoaded = true
							break
						}
					}

					var that = this

					if (!this.bLibLoaded) {
						var script = document.createElement("script")
						script.id = "oanda_wrapper_lib"

						document.body.appendChild(script)
						script.onload = function () {
							that.bLibLoaded = true
							popupMessage("The wrapper lib for Oanda has been loaded successfully!")
						}
						script.onerror = function () {
							that.bLibLoaded = false
							popupErrorMessage("Failed to load the wrapper lib for Oanda.")
						}
						script.async = true
						script.src = this.wrapperLibUrl
					}
				},
				monitorConnection: function () {
					if (this.latestHBTime != 0 && new Date().getTime() - this.latestHBTime >= this.interval) {
						this.bMonitoring = false
						this.reconnect()
					}
					var that = this
					setTimeout(function () {that.monitorConnection()}, this.interval)
				},
				dataSubscribers: [],
				orderSubscribers: [],
				subscribeToDataChannel: function (subscriberName, subscriberCallback) {
					this.dataSubscribers[subscriberName] = subscriberCallback
				},
				subscribeToOrderChannel: function (subscriberName, subscriberCallback) {
					this.orderSubscribers[subscriberName] = subscriberCallback
				},
				unsubscribeFromDataChannel: function (subscriberName) {
					delete this.dataSubscribers[subscriberName]
				},
				unsubscribeFromOrderChannel: function (subscriberName) {
					delete this.orderSubscribers[subscriberName]
				},
				oandaDataCallback: function (res) {
					if (!this.bMonitoring) {
						popupMessage("Oanda has been connected successfully!")
						this.monitorConnection()
						this.bMonitoring = true
					}

					for (var i in this.dataSubscribers) {
						this.dataSubscribers[i](res)
					}
				},
				oandaOrderCallback: function (res) {
					if (typeof res.type != "undefined") {
						if (res.type == "ORDER_FILL") {
							res.currentUnits = res.units
							this.updatePositions(res)
						} else if (res.type == "HEARTBEAT") {
							this.latestHBTime = new Date().getTime()
						}
					}

					for (var i in this.orderSubscribers) {
						this.orderSubscribers[i](res)
					}
				},
				reconnect: function () {
					var that = this
					if (typeof window.oandaDataAPI != "undefined") {
						var symbolsList = []
		        for (var i in this.currenciesList) {
		          symbolsList.push(this.currenciesList[i].symbolName)
		        }

						window.oandaDataAPI.addToken(this.oandaDemo, this.oandaAccountId, this.oandaTradeKey)
						window.oandaDataAPI.pricing.stream(this.oandaAccountId, {instruments: symbolsList.join(","), snapshot: false}, function (res) {
							that.oandaDataCallback(res)
						})
					}
					if (typeof window.oandaOrderAPI != "undefined") {
						window.oandaOrderAPI.addToken(this.oandaDemo, this.oandaAccountId, this.oandaTradeKey)
						window.oandaOrderAPI.transactions.stream(this.oandaAccountId, function (res) {
							that.oandaOrderCallback(res)
						})
					}
				},
				charts: [],
	      chartChangeCallback: function (ctx) { // This callback function will be called once the chart switches from the normal mode to the takeover mode or the symbol of the chart under the takeover mode changes.
	        var symbolName = getExtraSymbolName(ctx)

	        if (typeof this.currenciesList[symbolName] != "undefined") {
	          var chartId = getChartHandleByContext(ctx)

	          setTakeoverMode(chartId)
	          var timeFrame = getTimeFrame(ctx)

	          if (typeof this.charts[chartId + ""] == "undefined") {
	            this.charts[chartId + ""] = {
	              chartId: chartId,
	              symbolName: null,
	              timeFrame: null
	            }
	          }
	          var chart = this.charts[chartId + ""]
	          chart.symbolName = this.currenciesList[symbolName].symbolName
	          chart.timeFrame = timeFrame

	          var that = this

	          window.oandaDataAPI.instruments.candles(this.oandaAccountId, chart.symbolName, {
	            granularity: timeFrame.toUpperCase()
	          })
	          .then(function (res) {
	            var data = []

	            if (Array.isArray(res.candles)) {
	              for (var i in res.candles) {
	                var ohlc = res.candles[i].mid

	                data.push({
	                  time: Math.floor(new Date(res.candles[i].time).getTime() / 1000),
	                  volume: res.candles[i].volume,
	                  open: parseFloat(ohlc.o),
	                  high: parseFloat(ohlc.h),
	                  low: parseFloat(ohlc.l),
	                  close: parseFloat(ohlc.c)
	                })
	              }

	              takeoverLoad(chartId, data)
	            }
	          })

	        } else {
	          var chartId = getChartHandleByContext(ctx)
	          unsetTakeoverMode(chartId)
	          takeoverLoad(chartId, [])
	          delete this.charts[chartId + ""]
	        }
	      },
	      chartRemoveCallback: function (ctx) { // This callback function will be called once the chart switches from the takeover mode to the normal mode or the chart is removed.
	        var chartId = getChartHandleByContext(ctx)
	        unsetTakeoverMode(chartId)
	        takeoverLoad(chartId, [])
	        delete this.charts[chartId + ""]
	      },
				quotes: [],
	      onTick: function (res) {
	        if (typeof res.instrument != "undefined") {
	          var ask = null
	          var bid = null
	          var price = null
	          if (Array.isArray(res.asks)) {
	            ask = parseFloat(res.asks[0].price)
	            price = ask
	          }
	          if (Array.isArray(res.bids)) {
	            bid = parseFloat(res.bids[0].price)
	            price = bid
	          }
	          if (ask == null) {
	            ask = price
	          }
	          if (bid == null) {
	            bid = price
	          }
	          if (ask == null || bid == null) {
	            return
	          }

	          for (var i in this.charts) {
	            var chart = this.charts[i]

	            if (chart.symbolName == res.instrument) {
	              var tick = {
	                time: Math.floor(new Date().getTime() / 1000),
	                volume: 0,
	                price: Math.round((bid + ask) / 2 * 100000) / 100000
	              }

	              if (chart.timeFrame == "M1") {
	                takeoverUpdate(chart.chartId, 60, tick)
	              } else if (chart.timeFrame == "M5") {
	                takeoverUpdate(chart.chartId, 300, tick)
	              } else if (chart.timeFrame == "M15") {
	                takeoverUpdate(chart.chartId, 900, tick)
	              } else if (chart.timeFrame == "M30") {
	                takeoverUpdate(chart.chartId, 1800, tick)
	              } else if (chart.timeFrame == "H1") {
	                takeoverUpdate(chart.chartId, 3600, tick)
	              } else if (chart.timeFrame == "H4") {
	                takeoverUpdate(chart.chartId, 14400, tick)
	              } else if (chart.timeFrame == "D") {
	                takeoverUpdate(chart.chartId, 86400, tick)
	              } else {
	                takeoverUpdate(chart.chartId, 86400, tick)
	              }
	            }
	          }

						this.quotes[res.instrument.replace("_", "/")] = {
							ask: ask,
							bid: bid
						}
	        }
	      },
				initDashboard: function () {
					if (typeof $("#oanda_dashboard").html() == "undefined") {
						var panel = '<div class="ui form modal" id="oanda_dashboard">' +
							'<div class="content">' +
								'<div class="row">' +
									'<div class="ui fluid action input">' +
										'<div class="ui selection dropdown" id="dropdownOandaDemo">' +
											'<input type="hidden" id="oandaDemo">' +
											'<i class="dropdown icon"></i>' +
											'<div class="default text">Demo (Default)</div>' +
											'<div class="menu">' +
												'<div class="item" data-value="true">Demo</div>' +
												'<div class="item" data-value="false">Live</div>' +
											'</div>' +
										'</div>' +
										'<input type="text" id="oandaAccountId" placeholder="Oanda Account ID">' +
										'<input type="password" id="oandaTradeKey" placeholder="Token">' +
										'<button id="connect_to_oanda" class="ui button">Connect</button>' +
									'</div>' +
								'</div>' +
								'<div class="description">' +
									'<table id="oanda_pos_list" class="cell-border" cellspacing="0">' +
									'</table>' +
								'</div>' +
							'</div>' +
							'<div class="actions">' +
								'<div class="ui button" id="close_oanda_dashboard">Close</div>' +
							'</div>' +
						'</div>'

						$("#reserved_zone").append(panel)

						$("#dropdownOandaDemo").dropdown()

						var that = this

						$("#connect_to_oanda").on("click", function () {
							that.oandaDemo = $("#oandaDemo").val() == "" || $("#oandaDemo").val() == "true"
							that.oandaAccountId = $("#oandaAccountId").val().trim()
							that.oandaTradeKey = $("#oandaTradeKey").val().trim()

							if (that.oandaAccountId != "" && that.oandaTradeKey != "" && that.bLibLoaded) {
								that.reconnect()
								that.subscribeToDataChannel("oanda_data", function (res) {
	                that.onTick(res)
	              })
								that.loadTrades()
							}
						})

						$("#close_oanda_dashboard").on("click", function () {
							$("#oanda_dashboard").modal("hide")
						})

						var currenciesList = [{
				      symbolName: "AUD_CAD",
				      displayName: "AUD/CAD (Oanda)"
				    }, {
				      symbolName: "AUD_CHF",
				      displayName: "AUD/CHF (Oanda)"
				    }, {
				      symbolName: "AUD_JPY",
				      displayName: "AUD/JPY (Oanda)"
				    }, {
				      symbolName: "AUD_USD",
				      displayName: "AUD/USD (Oanda)"
				    }, {
				      symbolName: "EUR_GBP",
				      displayName: "EUR/GBP (Oanda)"
				    }, {
				      symbolName: "EUR_JPY",
				      displayName: "EUR/JPY (Oanda)"
				    }, {
				      symbolName: "EUR_USD",
				      displayName: "EUR/USD (Oanda)"
				    }, {
				      symbolName: "GBP_AUD",
				      displayName: "GBP/AUD (Oanda)"
				    }, {
				      symbolName: "GBP_CHF",
				      displayName: "GBP/CHF (Oanda)"
				    }, {
				      symbolName: "GBP_JPY",
				      displayName: "GBP/JPY (Oanda)"
				    }, {
				      symbolName: "GBP_USD",
				      displayName: "GBP/USD (Oanda)"
				    }, {
				      symbolName: "USD_CAD",
				      displayName: "USD/CAD (Oanda)"
				    }, {
				      symbolName: "USD_CHF",
				      displayName: "USD/CHF (Oanda)"
				    }, {
				      symbolName: "USD_JPY",
				      displayName: "USD/JPY (Oanda)"
				    }]

						for (var i in currenciesList) {
				      this.currenciesList[currenciesList[i].displayName] = currenciesList[i]
							this.quotes[currenciesList[i].symbolName.replace("_", "/")] = null
				    }

						var chartIds = getLayout(1).concat(getLayout(2)).concat(getLayout(3)).concat(getLayout(4))
				    for (var i in chartIds) {
				      if (typeof this.charts[chartIds[i] + ""] == "undefined") {
				        this.charts[chartIds[i] + ""] = {
				          chartId: chartIds[i],
				          symbolName: null,
				          timeFrame: null
				        }
				        createTakeover(chartIds[i],
				          function (ctx) {
				            that.chartChangeCallback(ctx)
				          },
				          function (ctx) {
				            that.chartRemoveCallback(ctx)
				          }
				        )
				      }
				    }

				    addExtraSymbols(this.currenciesList)
					}

					$("#oanda_dashboard").modal({autofocus:false}).modal("show")

					this.clearTable()
					for (var i in this.openPositions) {
						this.addPosToTable(this.openPositions[i])
					}
				}
			}
		}

		window.pluginForOanda.initDashboard()
		window.pluginForOanda.loadLib()
	},
	function (context) { // Deinit()
		if (!window.pluginForOanda.bLibLoaded) {
			var script = document.getElementById("oanda_wrapper_lib")
			script.remove()
		}
	},
	function (context) { // OnTick()
	}
)
