registerEA(
	  "sample_running_cnn_model",
	  "An EA sample to run neuron model(v1.01)",
	  [{ // parameters
	    name: "version",
	    value: 1,
	    required: true,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [0, 100]
	  }, {
	    name: "symbolName",
	    value: "EUR/USD",
	    required: true,
	    type: PARAMETER_TYPE.STRING,
	    range: null
	  }, {
	    name: "timeFrame",
	    value: "H1",
	    required: true,
	    type: PARAMETER_TYPE.STRING,
	    range: null
	  }, {
	    name: "inputNum",
	    value: 10,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	  }, {
	    name: "hiddenNum",
	    value: 20,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	  }, {
	    name: "predictNum",
	    value: 10,
	    required: true,
	    type: PARAMETER_TYPE.INTEGER,
	    range: [1, 100]
	  }, {
	    name: "volume",
	    value: 0.01,
	    required: true,
	    type: PARAMETER_TYPE.NUMBER,
	    range: [0.01, 1]
	  }],
	  function (context) { // Init()
	    if (typeof window.tf == "undefined") {
	      printErrorMessage("Please run the plugin to load Tensorflow first.")
	      return
	    }

	    var version = getEAParameter(context, "version")
	    var symbolName = getEAParameter(context, "symbolName")
	    var timeFrame = getEAParameter(context, "timeFrame")
	    var inputNum = getEAParameter(context, "inputNum")
	    var hiddenNum = getEAParameter(context, "hiddenNum")
	    var predictNum = getEAParameter(context, "predictNum")

	    context.runMyCnn = function (input) {
	      if (typeof input == "undefined" || input.length == 0) return -1

	      var result = window.tfModel.predict(tf.tensor3d(input, [1, inputNum, 1])).arraySync()[0][0]

	      printMessage(result)

	      return result
	    };

			var tfModelName = "Fintechee " + symbolName.replace("/", "") + "-" + timeFrame + "-" + inputNum + "-" + hiddenNum + "-" + predictNum + "-" + version

			window.loadCnn(tfModelName)
			.then(function (tfModel) {
				window.tfModel = tfModel
			})

	    var account = getAccount(context, 0)
	    var brokerName = getBrokerNameOfAccount(account)
	    var accountId = getAccountIdOfAccount(account)

	    context.chartHandle = getChartHandle(context, brokerName, accountId, symbolName, timeFrame)
	    context.indiHandleMacd = getIndicatorHandle(context, brokerName, accountId, symbolName, timeFrame, "macd", [{
	      name: "fastEMA",
	      value: 12
	    },{
	      name: "slowEMA",
	      value: 26
	    },{
	      name: "signalSMA",
	      value: 9
	    }])

			context.tradingManager = {
	      posLong: [],
	      posShort: [],
	      getPosInfo: function (brokerNm, accId, symbolNm) {
	        this.posLong = []
	        this.posShort = []

	        var cnt = getOpenTradesListLength(context)
	        for (var i = cnt - 1; i >= 0; i--) {
	          var openTrade = getOpenTrade(context, i)
	          var symbol = getSymbolName(openTrade)

	          if (symbol == symbolNm) {
	            var orderType = getOrderType(openTrade)

	            if (orderType == ORDER_TYPE.OP_BUY) {
	              this.posLong.push(getTradeId(openTrade))
	            } else {
	              this.posShort.push(getTradeId(openTrade))
	            }
	          }
	        }
	      },
	      trade: function (brokerNm, accId, symbolNm, odrType, volume, orderNum) {
	        if (orderNum < 0) return

	        if (orderNum > 0) {
	          var orderLots = volume * orderNum

	          if (odrType == ORDER_TYPE.OP_BUY) {
							if (this.posLong.length > 0) {
								return false
							}

	            sendOrder(brokerNm, accId, symbolNm, ORDER_TYPE.OP_BUY, 0, 0, Math.round(orderLots * 100) / 100, 0, 0, "", 0, 0)
	            return true
	          } else if (odrType == ORDER_TYPE.OP_SELL) {
							if (this.posShort.length > 0) {
								return false
							}

	            sendOrder(brokerNm, accId, symbolNm, ORDER_TYPE.OP_SELL, 0, 0, Math.round(orderLots * 100) / 100, 0, 0, "", 0, 0)
	            return true
	          }
	        } else {
	          if (odrType == ORDER_TYPE.OP_BUY) {
	            var bClosed = false
	            for (var i in this.posLong) {
	              closeTrade(brokerNm, accId, this.posLong[i], 0, 0)
	              bClosed = true
	            }
	          } else if (odrType == ORDER_TYPE.OP_SELL) {
	            var bClosed = false
	            for (var i in this.posShort) {
	              closeTrade(brokerNm, accId, this.posShort[i], 0, 0)
	              bClosed = true
	            }
	          }

	          if (bClosed) {
	            return true
	          }
	        }

	        return false
	      }
	    }

			context.signalManager = {
	      inputNum: inputNum,
	      checkCnnSignal: function (arrMain) {
	        var arrLen = arrMain.length

	        var input = []
	        var highVal = 0
	        var lowVal = 9999999999

	        for (var i = this.inputNum + 1; i >= 2; i--) {
	          if (arrMain[arrLen - i] > highVal) {
	            highVal = arrMain[arrLen - i]
	          }
	          if (arrMain[arrLen - i] < lowVal) {
	            lowVal = arrMain[arrLen - i]
	          }
	        }

	        var height = highVal - lowVal
	        if (height <= 0) {
	          return -1
	        }

					for (var i = this.inputNum + 1; i >= 2; i--) {
	          input.push((arrMain[arrLen - i] - lowVal) / height)
	        }

	        var result = window.tfModel.predict(window.tf.tensor3d(input, [1, this.inputNum, 1])).arraySync()[0][0]

	        return result >= 0.5 ? 1 : 0
	      },
	      upSl: 0,
	      downSl: 0,
	      predictNum: predictNum,
	      checkCloseSignal: function (currIdx) {
	        var signal = -1

	        if (this.upSl > 0) {
	          if (currIdx - this.upSl > this.predictNum) {
	            signal = 3
	          }
	        }

	        if (this.downSl > 0) {
	          if (currIdx - this.downSl > this.predictNum) {
	            signal = 2
	          }
	        }

	        return signal
	      }
	    }
	  },
	  function (context) { // Deinit()
	  },
	  function (context) { // OnTick()
	    if (typeof window.tf == "undefined") {
	      return
	    }

	    if (window.tfModel == null) return
	    var arrTime = getData(context, context.chartHandle, DATA_NAME.TIME)
	    if (typeof context.currTime == "undefined") {
	      context.currTime = arrTime[arrTime.length - 1]
	    } else if (context.currTime != arrTime[arrTime.length - 1]) {
	      context.currTime = arrTime[arrTime.length - 1]
	    } else {
	      return
	    }

	    var account = getAccount(context, 0)
	    var brokerName = getBrokerNameOfAccount(account)
	    var accountId = getAccountIdOfAccount(account)
	    var symbolName = getEAParameter(context, "symbolName")

	    var version = getEAParameter(context, "version")
	    var inputNum = getEAParameter(context, "inputNum")
	    var predictNum = getEAParameter(context, "predictNum")
			var arrClose = getData(context, context.chartHandle, DATA_NAME.CLOSE)
	    var arrMain = getData(context, context.indiHandleMacd, "main")

	    if (200 >= arrMain.length) throw new Error("No enough data.")

			var account = getAccount(context, 0)
		  var brokerName = getBrokerNameOfAccount(account)
		  var accountId = getAccountIdOfAccount(account)
		  var symbolName = getEAParameter(context, "symbolName")
		  var volume = getEAParameter(context, "volume")

		  var signal = -1
			var arrLen =  arrClose.length
		  var currTick = arrClose[arrLen - 1]

		  context.tradingManager.getPosInfo(brokerName, accountId, symbolName)

		  if (context.signalManager.upSl > 0 || context.signalManager.downSl > 0) {
		    signal = context.signalManager.checkCloseSignal(arrLen - 1)
		  }

		  if (signal == -1) {
		    signal = context.signalManager.checkCnnSignal(arrMain)
		  }

		  if (signal == 1) {
		    if (context.tradingManager.trade(brokerName, accountId, symbolName, ORDER_TYPE.OP_BUY, volume, 1)) {
		      context.signalManager.upSl = arrLen - 1
		    }
		  } else if (signal == 0) {
		    if (context.tradingManager.trade(brokerName, accountId, symbolName, ORDER_TYPE.OP_SELL, volume, 1)) {
		      context.signalManager.downSl = arrLen - 1
		    }
		  } else if (signal == 3) {
		    if (context.tradingManager.trade(brokerName, accountId, symbolName, ORDER_TYPE.OP_BUY, volume, 0)) {
		      context.signalManager.upSl = 0
		    }
		  } else if (signal == 2) {
		    if (context.tradingManager.trade(brokerName, accountId, symbolName, ORDER_TYPE.OP_SELL, volume, 0)) {
		      context.signalManager.downSl = 0
		    }
		  }
	  }
	)
