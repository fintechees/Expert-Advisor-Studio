	registerEA(
		"mql_ea_loader_plugin",
		"mql_plugin to make MQL-based EAs runnable on Fintechee(v1.01)",
		[{ // parameters
			name: "definition",
			value: "",
			required: false,
			type: PARAMETER_TYPE.STRING,
			range: null
		}],
		function (context) { // Init()
			var def = getEAParameter(context, "definition")
			var currDef = (def == null || def === "") ? null : JSON.parse(def)

			var loadMql = function (definition) {
				return new Promise(function (rs, rj) {
					var scriptPromise = new Promise(function (resolve, reject) {
						var tags = document.getElementsByTagName("script")
						for (var i = tags.length; i >= 0; i--) {
							if (tags[i] && tags[i].getAttribute("src") != null && tags[i].getAttribute("src") == definition.url) {
								tags[i].parentNode.removeChild(tags[i])
								break
							}
						}

					  var script = document.createElement("script")
					  document.body.appendChild(script)
					  script.onload = resolve
					  script.onerror = reject
					  script.async = true
					  script.src = definition.url
					})

					scriptPromise.then(function () {
						EAPlugIn().then(function (Module) {
							if (typeof window.mqlEAs == "undefined") {
								window.mqlEAs = []
								window.mqlEAsBuffer = []
								window.mqlEAUID = 0
							}

							var jChartClose = Module.addFunction(function (uid, chart_id) {
								if (chart_id == 0) {
									return removeChart(window.chartHandles[uid + ""])
								} else {
									return removeChart(chart_id)
								}
							}, "iii")
							var jChartID = Module.addFunction(function (uid) {
							  return window.chartHandles[uid + ""]
							}, "ii")
							var jChartOpen = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm)
							}, "iiii")
							var jChartPeriod = Module.addFunction(function (uid, chart_id) {
								var obj = window.mqlEAsBuffer[uid + ""]
								if (chart_id == 0) {
									return obj.convertTimeFrame(getChartTimeFrame(window.chartHandles[uid + ""]))
								} else {
									return obj.convertTimeFrame(getChartTimeFrame(chart_id))
								}
							}, "iii")
							var jChartSymbol = Module.addFunction(function (uid, chart_id) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = getChartSymbolName(chart_id)
								var lengthBytes = window.mqlEAs[obj.name].module.lengthBytesUTF8(symbolName) + 1
							  var stringOnWasmHeap = window.mqlEAs[obj.name].module._malloc(lengthBytes)
							  window.mqlEAs[obj.name].module.stringToUTF8(symbolName, stringOnWasmHeap, lengthBytes)
							  return stringOnWasmHeap
							}, "iii")
							var jPeriod = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								return obj.convertTimeFrame(getChartTimeFrame(window.chartHandles[uid + ""]))
							}, "ii")
							var jSymbol = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = obj.symbolName
								var lengthBytes = window.mqlEAs[obj.name].module.lengthBytesUTF8(symbolName) + 1
							  var stringOnWasmHeap = window.mqlEAs[obj.name].module._malloc(lengthBytes)
							  window.mqlEAs[obj.name].module.stringToUTF8(symbolName, stringOnWasmHeap, lengthBytes)
							  return stringOnWasmHeap
							}, "ii")
							var jAccountBalance = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var account = getAccount(obj.context, 0)
								return getBalanceOfAccount(account)
							}, "di")
							var jAccountCompany = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var account = getAccount(obj.context, 0)
								var brokerName = getBrokerNameOfAccount(account)
								var lengthBytes = window.mqlEAs[obj.name].module.lengthBytesUTF8(brokerName) + 1
							  var stringOnWasmHeap = window.mqlEAs[obj.name].module._malloc(lengthBytes)
							  window.mqlEAs[obj.name].module.stringToUTF8(brokerName, stringOnWasmHeap, lengthBytes)
							  return stringOnWasmHeap
							}, "ii")
							var jAccountCurrency = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var account = getAccount(obj.context, 0)
								var currency = getCurrencyOfAccount(account)
								var lengthBytes = window.mqlEAs[obj.name].module.lengthBytesUTF8(currency) + 1
							  var stringOnWasmHeap = window.mqlEAs[obj.name].module._malloc(lengthBytes)
							  window.mqlEAs[obj.name].module.stringToUTF8(currency, stringOnWasmHeap, lengthBytes)
							  return stringOnWasmHeap
							}, "ii")
							var jAccountEquity = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var account = getAccount(obj.context, 0)
								return getEquityOfAccount(account)
							}, "di")
							var jAccountFreeMargin = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var account = getAccount(obj.context, 0)
								return getMarginAvailableOfAccount(account)
							}, "di")
							var jAccountMargin = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var account = getAccount(obj.context, 0)
								return getMarginUsedOfAccount(account)
							}, "di")
							var jAccountProfit = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var account = getAccount(obj.context, 0)
								return getUnrealizedPLOfAccount(account)
							}, "di")
							var jOrdersTotal = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								return getOrdersTradesListLength(obj.context)
							}, "ii")
							var jOrdersHistoryTotal = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								return getHistoryPoolLength(obj.context)
							}, "ii")
							var jOrderSelect = Module.addFunction(function (uid, index, select, pool) {
								var obj = window.mqlEAsBuffer[uid + ""]
								try {
									var orderOrTrade = null
									if (select == 1) {
										if (pool == 2) {
											orderOrTrade = getOrderOrTradeFromHistoryByIndex(obj.context, index)
										} else {
											orderOrTrade = getOrderOrTradeByIndex(obj.context, index)
										}
									} else {
										if (pool == 2) {
											orderOrTrade = getOrderOrTradeFromHistoryById(obj.context, index + "")
										} else {
											orderOrTrade = getOrderOrTradeById(obj.context, index + "")
										}
									}
									obj.orderOrTrade = orderOrTrade.orderOrTrade
									obj.type = orderOrTrade.type
									return 1
								} catch(e) {
									return 0
								}
							}, "iiiii")
							var jOrderOpenPrice = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								return getOrderTradePrice(obj.orderOrTrade)
							}, "di")
							var jOrderType = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var orderType = getOrderType(obj.orderOrTrade)
								if ("BUY" == orderType) {
							    return 0;
							  } else if ("SELL" == orderType) {
							    return 1;
							  } else if ("BUY LIMIT" == orderType) {
							    return 2;
							  } else if ("SELL LIMIT" == orderType) {
							    return 3;
							  } else if ("BUY STOP" == orderType) {
							    return 4;
							  } else {
							    return 5;
							  }
							}, "ii")
							var jOrderTakeProfit = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								return getTakeProfit(obj.orderOrTrade)
							}, "di")
							var jOrderStopLoss = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								return getStopLoss(obj.orderOrTrade)
							}, "di")
							var jOrderLots = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								return getOrderTradeLots(obj.orderOrTrade)
							}, "di")
							var jOrderProfit = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								return getPL(obj.orderOrTrade)
							}, "di")
							var jOrderSymbol = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = getSymbolName(obj.orderOrTrade)
								var lengthBytes = window.mqlEAs[obj.name].module.lengthBytesUTF8(symbolName) + 1
							  var stringOnWasmHeap = window.mqlEAs[obj.name].module._malloc(lengthBytes)
							  window.mqlEAs[obj.name].module.stringToUTF8(symbolName, stringOnWasmHeap, lengthBytes)
							  return stringOnWasmHeap
							}, "ii")
							var jOrderTicket = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								return parseInt(getId(obj.orderOrTrade))
							}, "ii")
							var jOrderMagicNumber = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								return parseInt(getMagicNumber(obj.orderOrTrade))
							}, "ii")
							var jOrderOpenTime = Module.addFunction(function (uid) {
								var obj = window.mqlEAsBuffer[uid + ""]
								return getOrderTradeTime(obj.orderOrTrade)
							}, "ii")
							var jPrint = Module.addFunction(function (uid, s) {
								var obj = window.mqlEAsBuffer[uid + ""]
								printMessage(window.mqlEAs[obj.name].module.UTF8ToString(s))
							}, "vii")
							var jiTimeInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm)
							}, "iiii")
							var jiTime = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, chartHandle, "Time")
								return arr[arr.length - shift - 1]
							}, "iiii")
							var jiOpenInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm)
							}, "iiii")
							var jiOpen = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, chartHandle, "Open")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiHighInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm)
							}, "iiii")
							var jiHigh = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, chartHandle, "High")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiLowInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm)
							}, "iiii")
							var jiLow = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, chartHandle, "Low")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiCloseInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm)
							}, "iiii")
							var jiClose = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, chartHandle, "Close")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiVolumeInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm)
							}, "iiii")
							var jiVolume = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, chartHandle, "Volume")
								return arr[arr.length - shift - 1]
							}, "iiii")
							var jiACInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "ac", [])
							}, "iiii")
							var jiAC = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arrUp = getData(obj.context, indiHandle, "up")
								var arrDown = getData(obj.context, indiHandle, "down")
								return arrUp[arrUp.length - shift - 1] > 0 ? arrUp[arrUp.length - shift - 1] : arrDown[arrDown.length - shift - 1]
							}, "diii")
							var jiADXInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "adx_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiADX = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
								var arr = getData(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiAlligatorInit = Module.addFunction(function (uid, symbol, timeframe, jaw_period, jaw_shift, teeth_period, teeth_shift, lips_period, lips_shift, ma_method, applied_price) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								var method = window.mqlEAs[obj.name].module.UTF8ToString(ma_method)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "alligator_for_mql", [{
									name: "jawsPeriod",
									value: jaw_period
								},{
									name: "jawsShift",
									value: jaw_shift
								},{
									name: "teethPeriod",
									value: teeth_period
								},{
									name: "teethShift",
									value: teeth_shift
								},{
									name: "lipsPeriod",
									value: lips_period
								},{
									name: "lipsShift",
									value: lips_shift
								},{
									name: "method",
									value: method
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiiiiiiiii")
							var jiAlligator = Module.addFunction(function (uid, indiHandle, jaw_shift, teeth_shift, lips_shift, mode, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
								var arr = getData(obj.context, indiHandle, md)
								if (md == "jaws") {
									return arr[arr.length - jaw_shift - shift - 1]
								} else if (md == "teeth") {
									return arr[arr.length - teeth_shift - shift - 1]
								} else {
									return arr[arr.length - lips_shift - shift - 1]
								}
							}, "diiiiiii")
							var jiAOInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "ao", [])
							}, "iiii")
							var jiAO = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arrUp = getData(obj.context, indiHandle, "up")
								var arrDown = getData(obj.context, indiHandle, "down")
								return arrUp[arrUp.length - shift - 1] > 0 ? arrUp[arrUp.length - shift - 1] : arrDown[arrDown.length - shift - 1]
							}, "diii")
							var jiATRInit = Module.addFunction(function (uid, symbol, timeframe, period) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "atr", [{
									name: "period",
									value: period
								}])
							}, "iiiii")
							var jiATR = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, indiHandle, "atr")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiBearsPowerInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "bears_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiBearsPower = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, indiHandle, "bears")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiBandsInit = Module.addFunction(function (uid, symbol, timeframe, period, deviation, bands_shift, applied_price) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "bands_for_mql", [{
								    name: "period",
								    value: period,
								},{
								    name: "deviations",
								    value: deviation,
								},{
								    name: "shift",
								    value: bands_shift,
								},{
								    name: "method",
								    value: "sma"
								},{
									name: "appliedPrice",
									value: applied_price,
								}])
							}, "iiiiidii")
							var jiBands = Module.addFunction(function (uid, indiHandle, bands_shift, mode, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
								var arr = getData(obj.context, indiHandle, md)
								return arr[arr.length - bands_shift - shift - 1]
							}, "diiiii")
							var jiBandsOnArray = Module.addFunction(function (uid, array, total, period, deviation, bands_shift, mode, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlEAs[obj.name].module.getValue(array + i * nByteDouble, "double")
								}
								var dataInput = []
								dataInput[0] = data
								var dataOutput = calcIndicatorOnArray("bands_for_mql", [{
								    name: "period",
								    value: period,
								},{
								    name: "deviations",
								    value: deviation,
								},{
								    name: "shift",
								    value: bands_shift,
								},{
								    name: "method",
								    value: "sma"
								},{
									name: "appliedPrice",
									value: 0,
								}], dataInput, total)
								var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
								var arr = getDataOnArray(dataOutput, md)
								return arr[arr.length - bands_shift - shift - 1]
							}, "diiiidiii")
							var jiBullsPowerInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "bulls_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiBullsPower = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, indiHandle, "bulls")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiCCIInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "cci_for_mql", [{
							    name: "period",
							    value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiCCI = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, indiHandle, "cci")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiCCIOnArray = Module.addFunction(function (uid, array, total, period, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlEAs[obj.name].module.getValue(array + i * nByteDouble, "double")
								}
								var dataInput = []
								dataInput[0] = data
								var dataOutput = calcIndicatorOnArray("cci_for_mql", [{
								    name: "period",
								    value: period,
								},{
									name: "appliedPrice",
									value: 0,
								}], dataInput, total)
								var arr = getDataOnArray(dataOutput, "cci")
								return arr[arr.length - shift - 1]
							}, "diiiii")
							var jiCustomInit = Module.addFunction(function (uid, symbol, timeframe, name, paramString) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var indiName = window.mqlEAs[obj.name].module.UTF8ToString(name)
								if (typeof window.mqlIndicators == "undefined" || typeof window.mqlIndicators[indiName] == "undefined") {
									throw new Error("Please start MQL indicator loader plugin and load the specific indicator(" + indiName + ").")
								}
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								var params = window.mqlEAs[obj.name].module.UTF8ToString(paramString).split("|||")
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								var parameters = JSON.parse(JSON.stringify(window.mqlIndicators[indiName].definition.parameters))
								for (var i in parameters) {
									if (isInteger(params[i])) {
										parameters[i].value = parseInt(params[i])
									} else if (isNumeric(params[i])) {
										parameters[i].value = parseFloat(params[i])
									} else if (params[i] == "true") {
										parameters[i].value = true
									} else if (params[i] == "false") {
										parameters[i].value = false
									} else {
										parameters[i].value = params[i]
									}
								}
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, indiName, parameters)
							}, "iiiiii")
							var jiCustom = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
								var arr = getData(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiDeMarkerInit = Module.addFunction(function (uid, symbol, timeframe, period) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "demarker", [{
									name: "period",
									value: period
								}])
							}, "iiiii")
							var jiDeMarker = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, indiHandle, "demarker")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiEnvelopesInit = Module.addFunction(function (uid, symbol, timeframe, ma_period, ma_method, ma_shift, applied_price, deviation) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								var method = window.mqlEAs[obj.name].module.UTF8ToString(ma_method)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "envelopes_for_mql", [{
								    name: "period",
								    value: ma_period
								},{
								    name: "deviations",
								    value: deviation
								},{
								    name: "shift",
								    value: ma_shift
								},{
								    name: "method",
								    value: method
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiiiiid")
							var jiEnvelopes = Module.addFunction(function (uid, indiHandle, ma_shift, mode, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
								var arr = getData(obj.context, indiHandle, md)
								return arr[arr.length - ma_shift - shift - 1]
							}, "diiiii")
							var jiEnvelopesOnArray = Module.addFunction(function (uid, array, total, ma_period, ma_method, ma_shift, deviation, mode, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var method = window.mqlEAs[obj.name].module.UTF8ToString(ma_method)
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlEAs[obj.name].module.getValue(array + i * nByteDouble, "double")
								}
								var dataInput = []
								dataInput[0] = data
								var dataOutput = calcIndicatorOnArray("envelopes_for_mql", [{
										name: "period",
										value: ma_period
								},{
										name: "deviations",
										value: deviation
								},{
										name: "shift",
										value: ma_shift
								},{
										name: "method",
										value: method
								},{
									name: "appliedPrice",
									value: 0
								}], dataInput, total)
								var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
								var arr = getDataOnArray(dataOutput, md)
								return arr[arr.length - ma_shift - shift - 1]
							}, "diiiiiidii")
							var jiFractalsInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "fractals", [])
							}, "iiii")
							var jiFractals = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
								var arr = getData(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiIchimokuInit = Module.addFunction(function (uid, symbol, timeframe, tenkan_sen, kijun_sen, senkou_span_b) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "ichimoku", [{
								    name: "tenkan",
								    value: tenkan_sen
								},{
								    name: "kijun",
								    value: kijun_sen
								},{
								    name: "senkou",
								    value: senkou_span_b
								}])
							}, "iiiiiii")
							var jiIchimoku = Module.addFunction(function (uid, indiHandle, ichimoku_shift, mode, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
								var arr = getData(obj.context, indiHandle, md)
								return arr[arr.length - ichimoku_shift - shift - 1]
							}, "diiiii")
							var jiMAInit = Module.addFunction(function (uid, symbol, timeframe, ma_period, ma_shift, ma_method, applied_price) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								var params = [{
									name: "period",
									value: ma_period
								},{
									name: "shift",
									value: ma_shift
								},{
									name: "appliedPrice",
									value: applied_price
								}]
								if (ma_method == 1) {
									return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "ema_for_mql", params)
								} else if (ma_method == 2) {
									return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "smma_for_mql", params)
								} else if (ma_method == 3) {
									return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "lwma_for_mql", params)
								} else {
									return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "sma_for_mql", params)
								}
							}, "iiiiiiii")
							var jiMA = Module.addFunction(function (uid, indiHandle, ma_shift, ma_method, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var method = window.mqlEAs[obj.name].module.UTF8ToString(ma_method)
								var arr = getData(obj.context, indiHandle, method)
								return arr[arr.length - ma_shift - shift - 1]
							}, "diiiii")
							var jiMAOnArray = Module.addFunction(function (uid, array, total, ma_period, ma_shift, ma_method, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var method = window.mqlEAs[obj.name].module.UTF8ToString(ma_method)
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlEAs[obj.name].module.getValue(array + i * nByteDouble, "double")
								}
								var dataInput = []
								dataInput[0] = data
								var dataOutput = null
								var params = [{
									name: "period",
									value: ma_period
								},{
									name: "shift",
									value: ma_shift
								},{
									name: "appliedPrice",
									value: 0
								}]
								if (method == "ema") {
									dataOutput = calcIndicatorOnArray("ema_for_mql", params, dataInput, total)
								} else if (method == "smma") {
									dataOutput = calcIndicatorOnArray("smma_for_mql", params, dataInput, total)
								} else if (method == "lwma") {
									dataOutput = calcIndicatorOnArray("lwma_for_mql", params, dataInput, total)
								} else {
									dataOutput = calcIndicatorOnArray("sma_for_mql", params, dataInput, total)
								}
								var arr = getDataOnArray(dataOutput, method)
								return arr[arr.length - ma_shift - shift - 1]
							}, "diiiiiii")
							var jiMACDInit = Module.addFunction(function (uid, symbol, timeframe, fast_ema_period, slow_ema_period, signal_period, applied_price) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "macd_for_mql", [{
									name: "fastEMA",
									value: fast_ema_period
								},{
									name: "slowEMA",
									value: slow_ema_period
								},{
									name: "signalSMA",
									value: signal_period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiiiii")
							var jiMACD = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
								var arr = getData(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiMomentumInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "momentum_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiMomentum = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, indiHandle, "momentum")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiMomentumOnArray = Module.addFunction(function (uid, array, total, period, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlEAs[obj.name].module.getValue(array + i * nByteDouble, "double")
								}
								var dataInput = []
								dataInput[0] = data
								var dataOutput = calcIndicatorOnArray("momentum_for_mql", [{
								    name: "period",
								    value: period,
								},{
									name: "appliedPrice",
									value: 0,
								}], dataInput, total)
								var arr = getDataOnArray(dataOutput, "momentum")
								return arr[arr.length - shift - 1]
							}, "diiiii")
							var jiRSIInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "rsi_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiRSI = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, indiHandle, "rsi")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiRSIOnArray = Module.addFunction(function (uid, array, total, period, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlEAs[obj.name].module.getValue(array + i * nByteDouble, "double")
								}
								var dataInput = []
								dataInput[0] = data
								var dataOutput = calcIndicatorOnArray("rsi_for_mql", [{
								    name: "period",
								    value: period,
								},{
									name: "appliedPrice",
									value: 0,
								}], dataInput, total)
								var arr = getDataOnArray(dataOutput, "rsi")
								return arr[arr.length - shift - 1]
							}, "diiiii")
							var jiRVIInit = Module.addFunction(function (uid, symbol, timeframe, period) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "rvi", [{
									name: "period",
									value: period
								}])
							}, "iiiii")
							var jiRVI = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
								var arr = getData(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiSARInit = Module.addFunction(function (uid, symbol, timeframe, step, maximum) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "sar", [{
									name: "acceleration",
									value: step,
								},{
									name: "afMax",
									value: maximum,
								}])
							}, "iiiidd")
							var jiSAR = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, indiHandle, "sar")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiStochasticInit = Module.addFunction(function (uid, symbol, timeframe, Kperiod, Dperiod, slowing, ma_method) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								var method = window.mqlEAs[obj.name].module.UTF8ToString(ma_method)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "stochastic", [{
									name: "KPeriod",
									value: Kperiod
								},{
									name: "slowing",
									value: slowing
								},{
									name: "DPeriod",
									value: Dperiod
								},{
									name: "method",
									value: method
								}])
							}, "iiiiiiii")
							var jiStochastic = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
								var arr = getData(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiWPRInit = Module.addFunction(function (uid, symbol, timeframe, period) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlEAs[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandle(obj.context, obj.brokerName, obj.accountId, symbolName, timeFrm, "wpr", [{
									name: "period",
									value: period
								}])
							}, "iiiii")
							var jiWPR = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var arr = getData(obj.context, indiHandle, "wpr")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jARROW_CHECKCreate = Module.addFunction(function (uid, chart_id, object_name, time, price) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var name = window.mqlEAs[obj.name].module.UTF8ToString(object_name)
								var objId = addSignal(chart_id, name, time, price)
								if (objId != -1) {
									obj.objs.push({id: objId, chartId: chart_id, name: name})
									localStorage.mqlObjs = JSON.stringify(obj.objs)
									return 1
								} else {
									return 0
								}
							}, "iiiiid")
							var jARROW_CHECKDelete = Module.addFunction(function (uid, object_name) {
								var obj = window.mqlEAsBuffer[uid + ""]
								var name = window.mqlEAs[obj.name].module.UTF8ToString(object_name)
								var success = false
								for (var i = obj.objs.length - 1; i >= 0; i--) {
									if (obj.objs[i].name == name) {
										if (removeSignal(obj.objs[i].chartId, obj.objs[i].id)) {
											success = true
											obj.objs.splice(i, 1)
										}
									}
								}
								if (success) {
									localStorage.mqlObjs = JSON.stringify(obj.objs)
									return 1
								} else {
									return 0
								}
							}, "iii")

					    window.mqlEAs[definition.name] = {
								definition: definition,
								module: Module,
								setParamInt: Module.cwrap("setParamInt", null, ["number", "number"]),
								setParamDouble: Module.cwrap("setParamDouble", null, ["number", "number"]),
								setParamBool: Module.cwrap("setParamBool", null, ["number", "number"]),
								setParamString: Module.cwrap("setParamString", null, ["number", "string"]),
								setjPrint: Module.cwrap('setjPrint', null, ['number']),
								setjChartClose: Module.cwrap('setjChartClose', null, ['number']),
								setjChartID: Module.cwrap('setjChartID', null, ['number']),
								setjChartOpen: Module.cwrap('setjChartOpen', null, ['number']),
								setjChartPeriod: Module.cwrap('setjChartPeriod', null, ['number']),
								setjChartSymbol: Module.cwrap('setjChartSymbol', null, ['number']),
								setjPeriod: Module.cwrap('setjPeriod', null, ['number']),
								setjSymbol: Module.cwrap('setjSymbol', null, ['number']),
								setjAccountBalance: Module.cwrap('setjAccountBalance', null, ['number']),
								setjAccountCompany: Module.cwrap('setjAccountCompany', null, ['number']),
								setjAccountCurrency: Module.cwrap('setjAccountCurrency', null, ['number']),
								setjAccountEquity: Module.cwrap('setjAccountEquity', null, ['number']),
								setjAccountFreeMargin: Module.cwrap('setjAccountFreeMargin', null, ['number']),
								setjAccountMargin: Module.cwrap('setjAccountMargin', null, ['number']),
								setjAccountProfit: Module.cwrap('setjAccountProfit', null, ['number']),
								setjOrdersTotal: Module.cwrap('setjOrdersTotal', null, ['number']),
								setjOrdersHistoryTotal: Module.cwrap('setjOrdersHistoryTotal', null, ['number']),
								setjOrderSelect: Module.cwrap('setjOrderSelect', null, ['number']),
								setjOrderOpenPrice: Module.cwrap('setjOrderOpenPrice', null, ['number']),
								setjOrderType: Module.cwrap('setjOrderType', null, ['number']),
								setjOrderTakeProfit: Module.cwrap('setjOrderTakeProfit', null, ['number']),
								setjOrderStopLoss: Module.cwrap('setjOrderStopLoss', null, ['number']),
								setjOrderLots: Module.cwrap('setjOrderLots', null, ['number']),
								setjOrderProfit: Module.cwrap('setjOrderProfit', null, ['number']),
								setjOrderSymbol: Module.cwrap('setjOrderSymbol', null, ['number']),
								setjOrderTicket: Module.cwrap('setjOrderTicket', null, ['number']),
								setjOrderMagicNumber: Module.cwrap('setjOrderMagicNumber', null, ['number']),
								setjOrderOpenTime: Module.cwrap('setjOrderOpenTime', null, ['number']),
								setjiTimeInit: Module.cwrap('setjiTimeInit', null, ['number']),
								setjiTime: Module.cwrap('setjiTime', null, ['number']),
								setjiOpenInit: Module.cwrap('setjiOpenInit', null, ['number']),
								setjiOpen: Module.cwrap('setjiOpen', null, ['number']),
								setjiHighInit: Module.cwrap('setjiHighInit', null, ['number']),
								setjiHigh: Module.cwrap('setjiHigh', null, ['number']),
								setjiLowInit: Module.cwrap('setjiLowInit', null, ['number']),
								setjiLow: Module.cwrap('setjiLow', null, ['number']),
								setjiCloseInit: Module.cwrap('setjiCloseInit', null, ['number']),
								setjiClose: Module.cwrap('setjiClose', null, ['number']),
								setjiVolumeInit: Module.cwrap('setjiVolumeInit', null, ['number']),
								setjiVolume: Module.cwrap('setjiVolume', null, ['number']),
								setjiACInit: Module.cwrap('setjiACInit', null, ['number']),
								setjiAC: Module.cwrap('setjiAC', null, ['number']),
								setjiADXInit: Module.cwrap('setjiADXInit', null, ['number']),
								setjiADX: Module.cwrap('setjiADX', null, ['number']),
								setjiAlligatorInit: Module.cwrap('setjiAlligatorInit', null, ['number']),
								setjiAlligator: Module.cwrap('setjiAlligator', null, ['number']),
								setjiAOInit: Module.cwrap('setjiAOInit', null, ['number']),
								setjiAO: Module.cwrap('setjiAO', null, ['number']),
								setjiATRInit: Module.cwrap('setjiATRInit', null, ['number']),
								setjiATR: Module.cwrap('setjiATR', null, ['number']),
								setjiBearsPowerInit: Module.cwrap('setjiBearsPowerInit', null, ['number']),
								setjiBearsPower: Module.cwrap('setjiBearsPower', null, ['number']),
								setjiBandsInit: Module.cwrap('setjiBandsInit', null, ['number']),
								setjiBands: Module.cwrap('setjiBands', null, ['number']),
								setjiBandsOnArray: Module.cwrap('setjiBandsOnArray', null, ['number']),
								setjiBullsPowerInit: Module.cwrap('setjiBullsPowerInit', null, ['number']),
								setjiBullsPower: Module.cwrap('setjiBullsPower', null, ['number']),
								setjiCCIInit: Module.cwrap('setjiCCIInit', null, ['number']),
								setjiCCI: Module.cwrap('setjiCCI', null, ['number']),
								setjiCCIOnArray: Module.cwrap('setjiCCIOnArray', null, ['number']),
								setjiCustomInit: Module.cwrap('setjiCustomInit', null, ['number']),
								setjiCustom: Module.cwrap('setjiCustom', null, ['number']),
								setjiDeMarkerInit: Module.cwrap('setjiDeMarkerInit', null, ['number']),
								setjiDeMarker: Module.cwrap('setjiDeMarker', null, ['number']),
								setjiEnvelopesInit: Module.cwrap('setjiEnvelopesInit', null, ['number']),
								setjiEnvelopes: Module.cwrap('setjiEnvelopes', null, ['number']),
								setjiEnvelopesOnArray: Module.cwrap('setjiEnvelopesOnArray', null, ['number']),
								setjiFractalsInit: Module.cwrap('setjiFractalsInit', null, ['number']),
								setjiFractals: Module.cwrap('setjiFractals', null, ['number']),
								setjiIchimokuInit: Module.cwrap('setjiIchimokuInit', null, ['number']),
								setjiIchimoku: Module.cwrap('setjiIchimoku', null, ['number']),
								setjiMAInit: Module.cwrap('setjiMAInit', null, ['number']),
								setjiMA: Module.cwrap('setjiMA', null, ['number']),
								setjiMAOnArray: Module.cwrap('setjiMAOnArray', null, ['number']),
								setjiMACDInit: Module.cwrap('setjiMACDInit', null, ['number']),
								setjiMACD: Module.cwrap('setjiMACD', null, ['number']),
								setjiMomentumInit: Module.cwrap('setjiMomentumInit', null, ['number']),
								setjiMomentum: Module.cwrap('setjiMomentum', null, ['number']),
								setjiMomentumOnArray: Module.cwrap('setjiMomentumOnArray', null, ['number']),
								setjiRSIInit: Module.cwrap('setjiRSIInit', null, ['number']),
								setjiRSI: Module.cwrap('setjiRSI', null, ['number']),
								setjiRSIOnArray: Module.cwrap('setjiRSIOnArray', null, ['number']),
								setjiRVIInit: Module.cwrap('setjiRVIInit', null, ['number']),
								setjiRVI: Module.cwrap('setjiRVI', null, ['number']),
								setjiSARInit: Module.cwrap('setjiSARInit', null, ['number']),
								setjiSAR: Module.cwrap('setjiSAR', null, ['number']),
								setjiStochasticInit: Module.cwrap('setjiStochasticInit', null, ['number']),
								setjiStochastic: Module.cwrap('setjiStochastic', null, ['number']),
								setjiWPRInit: Module.cwrap('setjiWPRInit', null, ['number']),
								setjiWPR: Module.cwrap('setjiWPR', null, ['number']),
								setjARROW_CHECKCreate: Module.cwrap('setjARROW_CHECKCreate', null, ['number']),
								setjARROW_CHECKDelete: Module.cwrap('setjARROW_CHECKDelete', null, ['number']),
								onTick: Module.cwrap("onTick", null, ["number", "number", "number", "number"])
							}

							window.mqlEAs[definition.name].setjPrint(jPrint)
							window.mqlEAs[definition.name].setjChartClose(jChartClose)
							window.mqlEAs[definition.name].setjChartID(jChartID)
							window.mqlEAs[definition.name].setjChartOpen(jChartOpen)
							window.mqlEAs[definition.name].setjChartPeriod(jChartPeriod)
							window.mqlEAs[definition.name].setjChartSymbol(jChartSymbol)
							window.mqlEAs[definition.name].setjPeriod(jPeriod)
							window.mqlEAs[definition.name].setjSymbol(jSymbol)
							window.mqlEAs[definition.name].setjAccountBalance(jAccountBalance)
							window.mqlEAs[definition.name].setjAccountCompany(jAccountCompany)
							window.mqlEAs[definition.name].setjAccountCurrency(jAccountCurrency)
							window.mqlEAs[definition.name].setjAccountEquity(jAccountEquity)
							window.mqlEAs[definition.name].setjAccountFreeMargin(jAccountFreeMargin)
							window.mqlEAs[definition.name].setjAccountMargin(jAccountMargin)
							window.mqlEAs[definition.name].setjAccountProfit(jAccountProfit)
							window.mqlEAs[definition.name].setjOrdersTotal(jOrdersTotal)
							window.mqlEAs[definition.name].setjOrdersHistoryTotal(jOrdersHistoryTotal)
							window.mqlEAs[definition.name].setjOrderSelect(jOrderSelect)
							window.mqlEAs[definition.name].setjOrderOpenPrice(jOrderOpenPrice)
							window.mqlEAs[definition.name].setjOrderType(jOrderType)
							window.mqlEAs[definition.name].setjOrderTakeProfit(jOrderTakeProfit)
							window.mqlEAs[definition.name].setjOrderStopLoss(jOrderStopLoss)
							window.mqlEAs[definition.name].setjOrderLots(jOrderLots)
							window.mqlEAs[definition.name].setjOrderProfit(jOrderProfit)
							window.mqlEAs[definition.name].setjOrderSymbol(jOrderSymbol)
							window.mqlEAs[definition.name].setjOrderTicket(jOrderTicket)
							window.mqlEAs[definition.name].setjOrderMagicNumber(jOrderMagicNumber)
							window.mqlEAs[definition.name].setjOrderOpenTime(jOrderOpenTime)
							window.mqlEAs[definition.name].setjiTimeInit(jiTimeInit)
							window.mqlEAs[definition.name].setjiTime(jiTime)
							window.mqlEAs[definition.name].setjiOpenInit(jiOpenInit)
							window.mqlEAs[definition.name].setjiOpen(jiOpen)
							window.mqlEAs[definition.name].setjiHighInit(jiHighInit)
							window.mqlEAs[definition.name].setjiHigh(jiHigh)
							window.mqlEAs[definition.name].setjiLowInit(jiLowInit)
							window.mqlEAs[definition.name].setjiLow(jiLow)
							window.mqlEAs[definition.name].setjiCloseInit(jiCloseInit)
							window.mqlEAs[definition.name].setjiClose(jiClose)
							window.mqlEAs[definition.name].setjiVolumeInit(jiVolumeInit)
							window.mqlEAs[definition.name].setjiVolume(jiVolume)
							window.mqlEAs[definition.name].setjiACInit(jiACInit)
							window.mqlEAs[definition.name].setjiAC(jiAC)
							window.mqlEAs[definition.name].setjiADXInit(jiADXInit)
							window.mqlEAs[definition.name].setjiADX(jiADX)
							window.mqlEAs[definition.name].setjiAlligatorInit(jiAlligatorInit)
							window.mqlEAs[definition.name].setjiAlligator(jiAlligator)
							window.mqlEAs[definition.name].setjiAOInit(jiAOInit)
							window.mqlEAs[definition.name].setjiAO(jiAO)
							window.mqlEAs[definition.name].setjiATRInit(jiATRInit)
							window.mqlEAs[definition.name].setjiATR(jiATR)
							window.mqlEAs[definition.name].setjiBearsPowerInit(jiBearsPowerInit)
							window.mqlEAs[definition.name].setjiBearsPower(jiBearsPower)
							window.mqlEAs[definition.name].setjiBandsInit(jiBandsInit)
							window.mqlEAs[definition.name].setjiBands(jiBands)
							window.mqlEAs[definition.name].setjiBandsOnArray(jiBandsOnArray)
							window.mqlEAs[definition.name].setjiBullsPowerInit(jiBullsPowerInit)
							window.mqlEAs[definition.name].setjiBullsPower(jiBullsPower)
							window.mqlEAs[definition.name].setjiCCIInit(jiCCIInit)
							window.mqlEAs[definition.name].setjiCCI(jiCCI)
							window.mqlEAs[definition.name].setjiCCIOnArray(jiCCIOnArray)
							window.mqlEAs[definition.name].setjiCustomInit(jiCustomInit)
							window.mqlEAs[definition.name].setjiCustom(jiCustom)
							window.mqlEAs[definition.name].setjiDeMarkerInit(jiDeMarkerInit)
							window.mqlEAs[definition.name].setjiDeMarker(jiDeMarker)
							window.mqlEAs[definition.name].setjiEnvelopesInit(jiEnvelopesInit)
							window.mqlEAs[definition.name].setjiEnvelopes(jiEnvelopes)
							window.mqlEAs[definition.name].setjiEnvelopesOnArray(jiEnvelopesOnArray)
							window.mqlEAs[definition.name].setjiFractalsInit(jiFractalsInit)
							window.mqlEAs[definition.name].setjiFractals(jiFractals)
							window.mqlEAs[definition.name].setjiIchimokuInit(jiIchimokuInit)
							window.mqlEAs[definition.name].setjiIchimoku(jiIchimoku)
							window.mqlEAs[definition.name].setjiMAInit(jiMAInit)
							window.mqlEAs[definition.name].setjiMA(jiMA)
							window.mqlEAs[definition.name].setjiMAOnArray(jiMAOnArray)
							window.mqlEAs[definition.name].setjiMACDInit(jiMACDInit)
							window.mqlEAs[definition.name].setjiMACD(jiMACD)
							window.mqlEAs[definition.name].setjiMomentumInit(jiMomentumInit)
							window.mqlEAs[definition.name].setjiMomentum(jiMomentum)
							window.mqlEAs[definition.name].setjiMomentumOnArray(jiMomentumOnArray)
							window.mqlEAs[definition.name].setjiRSIInit(jiRSIInit)
							window.mqlEAs[definition.name].setjiRSI(jiRSI)
							window.mqlEAs[definition.name].setjiRSIOnArray(jiRSIOnArray)
							window.mqlEAs[definition.name].setjiRVIInit(jiRVIInit)
							window.mqlEAs[definition.name].setjiRVI(jiRVI)
							window.mqlEAs[definition.name].setjiSARInit(jiSARInit)
							window.mqlEAs[definition.name].setjiSAR(jiSAR)
							window.mqlEAs[definition.name].setjiStochasticInit(jiStochasticInit)
							window.mqlEAs[definition.name].setjiStochastic(jiStochastic)
							window.mqlEAs[definition.name].setjiWPRInit(jiWPRInit)
							window.mqlEAs[definition.name].setjiWPR(jiWPR)
							window.mqlEAs[definition.name].setjARROW_CHECKCreate(jARROW_CHECKCreate)
							window.mqlEAs[definition.name].setjARROW_CHECKDelete(jARROW_CHECKDelete)

							var parameters = []
							parameters.push({
								name: "symbol",
						    value: "EUR/USD",
						    required: true,
						    type: PARAMETER_TYPE.STRING,
						    range: null
							})
							parameters.push({
								name: "timeframe",
						    value: TIME_FRAME.M1,
						    required: true,
						    type: PARAMETER_TYPE.STRING,
						    range: null
							})
							for (var i in definition.parameters) {
								parameters.push(definition.parameters[i])
							}

							importBuiltInEA(
								definition.name,
								definition.description,
								parameters,
								function (context) { // Init()
									var eaName = getEAName(context)
									if (typeof window.mqlEAs == "undefined" || typeof window.mqlEAs[eaName] == "undefined") {
										throw new Error("Please start MQL EA loader plugin.")
									}

									var uid = null
									if (typeof context.uid == "undefined") {
										uid = window.mqlEAUID++
										context.uid = uid
									} else {
										uid = context.uid
									}
									var currDefinition = window.mqlEAs[eaName].definition

									var nByteDouble = 8
									var nByteString = 1
									var length = 1
									var buffer = null

									for (var i in currDefinition.parameters) {
										if (currDefinition.parameters[i].type == PARAMETER_TYPE.INTEGER) {
											window.mqlEAs[eaName].setParamInt(uid, getEAParameter(context, currDefinition.parameters[i].name))
										} else if (currDefinition.parameters[i].type == PARAMETER_TYPE.NUMBER) {
											window.mqlEAs[eaName].setParamDouble(uid, getEAParameter(context, currDefinition.parameters[i].name))
										} else if (currDefinition.parameters[i].type == PARAMETER_TYPE.BOOLEAN) {
											window.mqlEAs[eaName].setParamBool(uid, getEAParameter(context, currDefinition.parameters[i].name))
										} else if (currDefinition.parameters[i].type == PARAMETER_TYPE.STRING) {
											window.mqlEAs[eaName].setParamString(uid, getEAParameter(context, currDefinition.parameters[i].name))
										}
									}

									if (typeof window.mqlEAsBuffer[uid + ""] == "undefined") {
										var account = getAccount(context, 0)
										var brokerName = getBrokerNameOfAccount(account)
										var accountId = getAccountIdOfAccount(account)
										var symbolName = getEAParameter(context, "symbol")
										var timeFrame = getEAParameter(context, "timeframe")

										window.mqlEAsBuffer[uid + ""] = {
											name: definition.name,
											context: context,
											brokerName: brokerName,
											accountId: accountId,
											symbolName: symbolName,
											timeFrame: timeFrame,
											objs: typeof localStorage.mqlObjs != "undefined" ? JSON.parse(localStorage.mqlObjs) : [],
											lock: false,
											convertTimeFrame: function () {
											  if (TIME_FRAME.M1 == timeframe) {
											    return 1
											  } else if (TIME_FRAME.M5 == timeframe) {
											    return 5
											  } else if (TIME_FRAME.M15 == timeframe) {
											    return 15
											  } else if (TIME_FRAME.M30 == timeframe) {
											    return 30
											  } else if (TIME_FRAME.H1 == timeframe) {
											    return 60
											  } else if (TIME_FRAME.H4 == timeframe) {
											    return 240
											  } else if (TIME_FRAME.D == timeframe) {
											    return 1440
											  } else if (TIME_FRAME.W == timeframe) {
											    return 10080
											  } else if (TIME_FRAME.M == timeframe) {
											    return 43200
											  } else {
											    return 0
											  }
											}
										}

										getQuotes (context, brokerName, accountId, symbolName)
										if (typeof window.chartHandles == "undefined") {
											window.chartHandles = []
										}
										window.chartHandles[uid + ""] = getChartHandle(context, brokerName, accountId, symbolName, timeFrame)
									}

									window.mqlEAs[eaName].onTick(uid, 10000, 0, 0)
								},
								function (context) { // Deinit()
									delete window.mqlEAsBuffer[context.uid + ""]
									delete window.chartHandles[context.uid + ""]
								},
								function (context) { // OnTick()
									var eaName = getEAName(context)
									if (typeof window.mqlEAs == "undefined" || typeof window.mqlEAs[eaName] == "undefined") {
										return
									}

									var uid = context.uid
									if (typeof window.mqlEAsBuffer[uid + ""] == "undefined" || window.mqlEAsBuffer[uid + ""].lock) {
										return
									}

									window.mqlEAsBuffer[uid + ""].context = context
									var brokerName = window.mqlEAsBuffer[uid + ""].brokerName
									var accountId = window.mqlEAsBuffer[uid + ""].accountId
									var symbolName = window.mqlEAsBuffer[uid + ""].symbolName

									window.mqlEAs[eaName].onTick(
										uid,
										getData(context, window.chartHandles[uid + ""], DATA_NAME.CLOSE).length,
										getAsk(context, brokerName, accountId, symbolName),
										getBid(context, brokerName, accountId, symbolName)
									)
								}
							) // registerEA

							rs()
						}) // Module["onRuntimeInitialized"]
					})
					.catch(function () {
						rj()
					})
				})
			}

			if (currDef == null) {
				if (typeof localStorage.allMqlEAs != "undefined") {
					var allMqlEAs = JSON.parse(localStorage.allMqlEAs)
					var cursor = 0
					var load = function (idx) {
						loadMql(allMqlEAs[idx])
						.then(function () {
							cursor++
							if (cursor < allMqlEAs.length) {
								load(cursor)
							}
						})
						.catch(function () {
							cursor++
							if (cursor < allMqlEAs.length) {
								load(cursor)
							}
						})
					}

					load(cursor)
				}
			} else if (typeof currDef.rm != "undefined") {
				if (typeof localStorage.allMqlEAs != "undefined") {
					var allMqlEAs = JSON.parse(localStorage.allMqlEAs)
					for (var i in allMqlEAs) {
						if (allMqlEAs[i].name == currDef.rm) {
							allMqlEAs.splice(i, 1)

							unregisterEA(currDef.rm)

							if (typeof window.mqlEAs == "undefined" || typeof window.mqlEAsBuffer == "undefined") break

							delete window.mqlEAs[currDef.rm]
							for (var j in window.mqlEAsBuffer) {
								if (window.mqlEAsBuffer[j].name == currDef.rm) {
									delete window.mqlEAsBuffer[j]
									break
								}
							}

							break
						}
					}

					localStorage.allMqlEAs = JSON.stringify(allMqlEAs)
				}
			} else {
				var oldDef = null

				var loadCurrDef = function () {
					loadMql(currDef)
					.then(function () {
						var allMqlEAs = null
						if (typeof localStorage.allMqlEAs != "undefined") {
							allMqlEAs = JSON.parse(localStorage.allMqlEAs)
						} else {
							allMqlEAs = []
						}

						for (var i in allMqlEAs) {
							if (allMqlEAs[i].name == currDef.name) {
								allMqlEAs.splice(i, 1)
								break
							}
						}

						allMqlEAs.push(currDef)

						localStorage.allMqlEAs = JSON.stringify(allMqlEAs)
					})
					.catch(function () {
						if (oldDef != null) {
							loadMql(oldDef)
							.then(function () {})
							.catch(function () {})
						}
					})
				}

				if (typeof localStorage.allMqlEAs != "undefined") {
					var allMqlEAs = JSON.parse(localStorage.allMqlEAs)
					if (typeof window.mqlEAs == "undefined" || typeof window.mqlEAs[allMqlEAs[0].name] == "undefined") {
						var cursor = 0
						var load = function (idx) {
							loadMql(allMqlEAs[idx])
							.then(function () {
								cursor++
								if (cursor < allMqlEAs.length) {
									if (allMqlEAs[cursor].name == currDef.name) {
										oldDef = allMqlEAs[cursor]
										cursor++
										if (cursor < allMqlEAs.length) {
											load(cursor)
										} else {
											loadCurrDef()
										}
									} else {
										load(cursor)
									}
								} else {
									loadCurrDef()
								}
							})
							.catch(function () {
								cursor++
								if (cursor < allMqlEAs.length) {
									if (allMqlEAs[cursor].name == currDef.name) {
										oldDef = allMqlEAs[cursor]
										cursor++
										if (cursor < allMqlEAs.length) {
											load(cursor)
										} else {
											loadCurrDef()
										}
									} else {
										load(cursor)
									}
								} else {
									loadCurrDef()
								}
							})
						}

						load(cursor)
					} else {
						for (var i in allMqlEAs) {
							if (allMqlEAs[i].name == currDef.name) {
								oldDef = allMqlEAs[i]

								unregisterEA(currDef.name)

								delete window.mqlEAs[currDef.name]
								for (var j in window.mqlEAsBuffer) {
									if (window.mqlEAsBuffer[j].name == currDef.name) {
										delete window.mqlEAsBuffer[j]

										break
									}
								}
								break
							}
						}

						loadCurrDef()
					}
				} else {
					loadCurrDef()
				}
			}
		},
		function (context) { // Deinit()
		},
		function (context) { // OnTick()
		}
	)

