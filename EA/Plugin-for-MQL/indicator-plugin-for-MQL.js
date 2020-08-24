	registerEA(
		"mql_indicator_loader_plugin",
		"mql_plugin to make MQL-based indicators runnable on Fintechee(v1.06)",
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
					var tags = document.getElementsByTagName("script")
					for (var i = tags.length - 1; i >= 0; i--) {
						if (tags[i] && tags[i].getAttribute("src") != null && tags[i].getAttribute("src") == definition.url) {
							tags[i].parentNode.removeChild(tags[i])
							break
						}
					}

					var scriptPromise = new Promise(function (resolve, reject) {
					  var script = document.createElement("script")
					  document.body.appendChild(script)
					  script.onload = resolve
					  script.onerror = reject
					  script.async = true
					  script.src = definition.url
					})

					scriptPromise.then(function () {
						IndiPlugIn().then(function (Module) {
							if (typeof window.mqlIndicators == "undefined") {
								window.mqlIndicators = []
								window.mqlIndicatorsBuffer = []
								window.mqlIndiUID = 0
							}

							var jPrint = Module.addFunction(function (uid, s) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								printMessage(window.mqlIndicators[obj.name].module.UTF8ToString(s))
							}, "vii")
							var jSetIndexShift = Module.addFunction(function (uid, name, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(name)
								setIndiShift(obj.context, md, shift)
							}, "viii")
							var jChartID = Module.addFunction(function (uid) {
							  return window.mqlIndicatorsBuffer[uid + ""].chartId
							}, "ii")
							var jChartPeriod = Module.addFunction(function (uid, chart_id) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								if (chart_id == 0) {
									return obj.convertTimeFrame(obj.timeFrame)
								} else {
									return obj.convertTimeFrame(getChartTimeFrame(chart_id))
								}
							}, "iii")
							var jChartSymbol = Module.addFunction(function (uid, chart_id) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = ""
								if (chart_id == 0) {
									symbolName = obj.symbolName
								} else {
									symbolName = getChartSymbolName(chart_id)
								}
								var lengthBytes = window.mqlIndicators[obj.name].module.lengthBytesUTF8(symbolName) + 1
							  var stringOnWasmHeap = window.mqlIndicators[obj.name].module._malloc(lengthBytes)
							  window.mqlIndicators[obj.name].module.stringToUTF8(symbolName, stringOnWasmHeap, lengthBytes)
							  return stringOnWasmHeap
							}, "iii")
							var jPeriod = Module.addFunction(function (uid) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								return obj.convertTimeFrame(obj.timeFrame)
							}, "ii")
							var jSymbol = Module.addFunction(function (uid) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = obj.symbolName
								var lengthBytes = window.mqlIndicators[obj.name].module.lengthBytesUTF8(symbolName) + 1
							  var stringOnWasmHeap = window.mqlIndicators[obj.name].module._malloc(lengthBytes)
							  window.mqlIndicators[obj.name].module.stringToUTF8(symbolName, stringOnWasmHeap, lengthBytes)
							  return stringOnWasmHeap
							}, "ii")
							var jiTimeInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandleFromIndi(obj.context, symbolName, timeFrm)
							}, "iiii")
							var jiTime = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, chartHandle, "Time")
								return arr[arr.length - shift - 1]
							}, "iiii")
							var jiOpenInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandleFromIndi(obj.context, symbolName, timeFrm)
							}, "iiii")
							var jiOpen = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, chartHandle, "Open")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiHighInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandleFromIndi(obj.context, symbolName, timeFrm)
							}, "iiii")
							var jiHigh = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, chartHandle, "High")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiLowInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandleFromIndi(obj.context, symbolName, timeFrm)
							}, "iiii")
							var jiLow = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, chartHandle, "Low")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiCloseInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandleFromIndi(obj.context, symbolName, timeFrm)
							}, "iiii")
							var jiClose = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, chartHandle, "Close")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiVolumeInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandleFromIndi(obj.context, symbolName, timeFrm)
							}, "iiii")
							var jiVolume = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, chartHandle, "Volume")
								return arr[arr.length - shift - 1]
							}, "iiii")
							var jiHighest = Module.addFunction(function (uid, chartHandle, mode, count, start) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								var highest = -Number.MAX_VALUE
								var idx = -1
								for (var i = start; i < start + count && i >= 0 && i < arr.length; i++) {
									if (arr[arr.length - i - 1] > highest) {
										highest = arr[arr.length - i - 1]
										idx = i
									}
								}
								return idx
							}, "iiiiii")
							var jiLowest = Module.addFunction(function (uid, chartHandle, mode, count, start) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								var lowest = Number.MAX_VALUE
								var idx = -1
								for (var i = start; i < start + count && i >= 0 && i < arr.length; i++) {
									if (arr[arr.length - i - 1] < lowest) {
										lowest = arr[arr.length - i - 1]
										idx = i
									}
								}
								return idx
							}, "iiiiii")
							var jiACInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "ac", [])
							}, "iiii")
							var jiAC = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arrUp = getDataFromIndi(obj.context, indiHandle, "up")
								var arrDown = getDataFromIndi(obj.context, indiHandle, "down")
								return arrUp[arrUp.length - shift - 1] > 0 ? arrUp[arrUp.length - shift - 1] : arrDown[arrDown.length - shift - 1]
							}, "diii")
							var jiADXInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "adx_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiADX = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiAlligatorInit = Module.addFunction(function (uid, symbol, timeframe, jaw_period, jaw_shift, teeth_period, teeth_shift, lips_period, lips_shift, ma_method, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								var method = window.mqlIndicators[obj.name].module.UTF8ToString(ma_method)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "alligator_for_mql", [{
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								if (md == "jaws") {
									return arr[arr.length - jaw_shift - shift - 1]
								} else if (md == "teeth") {
									return arr[arr.length - teeth_shift - shift - 1]
								} else {
									return arr[arr.length - lips_shift - shift - 1]
								}
							}, "diiiiiii")
							var jiAOInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "ao", [])
							}, "iiii")
							var jiAO = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arrUp = getDataFromIndi(obj.context, indiHandle, "up")
								var arrDown = getDataFromIndi(obj.context, indiHandle, "down")
								return arrUp[arrUp.length - shift - 1] > 0 ? arrUp[arrUp.length - shift - 1] : arrDown[arrDown.length - shift - 1]
							}, "diii")
							var jiATRInit = Module.addFunction(function (uid, symbol, timeframe, period) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "atr", [{
									name: "period",
									value: period
								}])
							}, "iiiii")
							var jiATR = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "atr")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiBearsPowerInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "bears_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiBearsPower = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "bears")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiBandsInit = Module.addFunction(function (uid, symbol, timeframe, period, deviation, bands_shift, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "bands_for_mql", [{
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - bands_shift - shift - 1]
							}, "diiiii")
							var jiBandsOnArray = Module.addFunction(function (uid, array, total, period, deviation, bands_shift, mode, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlIndicators[obj.name].module.getValue(array + i * nByteDouble, "double")
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
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataOnArray(dataOutput, md)
								return arr[arr.length - bands_shift - shift - 1]
							}, "diiiidiii")
							var jiBullsPowerInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "bulls_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiBullsPower = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "bulls")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiCCIInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "cci_for_mql", [{
							    name: "period",
							    value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiCCI = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "cci")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiCCIOnArray = Module.addFunction(function (uid, array, total, period, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlIndicators[obj.name].module.getValue(array + i * nByteDouble, "double")
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var indiName = window.mqlIndicators[obj.name].module.UTF8ToString(name)
								if (typeof window.mqlIndicators == "undefined" || typeof window.mqlIndicators[indiName] == "undefined") {
									throw new Error("Please start MQL indicator loader plugin and load the specific indicator(" + indiName + ").")
								}
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								var params = window.mqlIndicators[obj.name].module.UTF8ToString(paramString).split("|||")
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
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, indiName, parameters)
							}, "iiiiii")
							var jiCustom = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiDeMarkerInit = Module.addFunction(function (uid, symbol, timeframe, period) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "demarker", [{
									name: "period",
									value: period
								}])
							}, "iiiii")
							var jiDeMarker = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "demarker")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiEnvelopesInit = Module.addFunction(function (uid, symbol, timeframe, ma_period, ma_method, ma_shift, applied_price, deviation) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								var method = window.mqlIndicators[obj.name].module.UTF8ToString(ma_method)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "envelopes_for_mql", [{
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - ma_shift - shift - 1]
							}, "diiiii")
							var jiEnvelopesOnArray = Module.addFunction(function (uid, array, total, ma_period, ma_method, ma_shift, deviation, mode, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var method = window.mqlIndicators[obj.name].module.UTF8ToString(ma_method)
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlIndicators[obj.name].module.getValue(array + i * nByteDouble, "double")
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
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataOnArray(dataOutput, md)
								return arr[arr.length - ma_shift - shift - 1]
							}, "diiiiiidii")
							var jiFractalsInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "fractals", [])
							}, "iiii")
							var jiFractals = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiIchimokuInit = Module.addFunction(function (uid, symbol, timeframe, tenkan_sen, kijun_sen, senkou_span_b) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "ichimoku", [{
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - ichimoku_shift - shift - 1]
							}, "diiiii")
							var jiMAInit = Module.addFunction(function (uid, symbol, timeframe, ma_period, ma_shift, ma_method, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
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
									return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "ema_for_mql", params)
								} else if (ma_method == 2) {
									return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "smma_for_mql", params)
								} else if (ma_method == 3) {
									return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "lwma_for_mql", params)
								} else {
									return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "sma_for_mql", params)
								}
							}, "iiiiiiii")
							var jiMA = Module.addFunction(function (uid, indiHandle, ma_shift, ma_method, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var method = window.mqlIndicators[obj.name].module.UTF8ToString(ma_method)
								var arr = getDataFromIndi(obj.context, indiHandle, method)
								return arr[arr.length - ma_shift - shift - 1]
							}, "diiiii")
							var jiMAOnArray = Module.addFunction(function (uid, array, total, ma_period, ma_shift, ma_method, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var method = window.mqlIndicators[obj.name].module.UTF8ToString(ma_method)
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlIndicators[obj.name].module.getValue(array + i * nByteDouble, "double")
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "macd_for_mql", [{
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiMomentumInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "momentum_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiMomentum = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "momentum")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiMomentumOnArray = Module.addFunction(function (uid, array, total, period, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlIndicators[obj.name].module.getValue(array + i * nByteDouble, "double")
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "rsi_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiRSI = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "rsi")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiRSIOnArray = Module.addFunction(function (uid, array, total, period, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlIndicators[obj.name].module.getValue(array + i * nByteDouble, "double")
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "rvi", [{
									name: "period",
									value: period
								}])
							}, "iiiii")
							var jiRVI = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiSARInit = Module.addFunction(function (uid, symbol, timeframe, step, maximum) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "sar", [{
									name: "acceleration",
									value: step,
								},{
									name: "afMax",
									value: maximum,
								}])
							}, "iiiidd")
							var jiSAR = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "sar")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiStochasticInit = Module.addFunction(function (uid, symbol, timeframe, Kperiod, Dperiod, slowing, ma_method) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								var method = window.mqlIndicators[obj.name].module.UTF8ToString(ma_method)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "stochastic", [{
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiWPRInit = Module.addFunction(function (uid, symbol, timeframe, period) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "wpr", [{
									name: "period",
									value: period
								}])
							}, "iiiii")
							var jiWPR = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "wpr")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jMarketInfo = Module.addFunction(function (uid, symbol, type) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var symbolObj = null
								if (symbolName == "") {
									symbolObj = obj.symbol
								} else {
									symbolObj = getSymbolInfo(obj.brokerName, obj.accountId, symbolName)
								}
								if (type == 11) {
									return 1.0 / symbolObj.toFixed
								} else if (type == 12) {
									return Math.log10(symbolObj.toFixed)
								} else if (type == 18) {
									return symbolObj.swapLong
								} else if (type == 19) {
									return symbolObj.swapShort
								} else if (type == 22) {
									return symbolObj.tradable
								} else if (type == 23) {
									return symbolObj.lotsMinLimit
								} else if (type == 24) {
									return symbolObj.lotsStep
								} else if (type == 25) {
									return symbolObj.lotsLimit
								}
								printErrorMessage("Not supported the specific market information currently!")
								return -1
							}, "diii")

					    window.mqlIndicators[definition.name] = {
								definition: definition,
								module: Module,
								setParamInt: Module.cwrap("setParamInt", null, ["number", "number"]),
								setParamDouble: Module.cwrap("setParamDouble", null, ["number", "number"]),
								setParamBool: Module.cwrap("setParamBool", null, ["number", "number"]),
								setParamString: Module.cwrap("setParamString", null, ["number", "string"]),
								setDataInput: Module.cwrap("setDataInput", null, ["number", "number", "number"]),
								setDataOutput: Module.cwrap("setDataOutput", null, ["number", "number", "number"]),
								onCalc: Module.cwrap("onCalc", null, ["number", "number", "number", "number", "number", "number"]),
								setjPrint: Module.cwrap("setjPrint", null, ["number"]),
								setjSetIndexShift: Module.cwrap("setjSetIndexShift", null, ["number"]),
								setjChartID: Module.cwrap('setjChartID', null, ['number']),
								setjChartPeriod: Module.cwrap('setjChartPeriod', null, ['number']),
								setjChartSymbol: Module.cwrap('setjChartSymbol', null, ['number']),
								setjPeriod: Module.cwrap('setjPeriod', null, ['number']),
								setjSymbol: Module.cwrap('setjSymbol', null, ['number']),
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
								setjiHighest: Module.cwrap('setjiHighest', null, ['number']),
								setjiLowest: Module.cwrap('setjiLowest', null, ['number']),
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
								setjMarketInfo: Module.cwrap("setjMarketInfo", null, ["number"])
							}

							window.mqlIndicators[definition.name].setjPrint(jPrint)
							window.mqlIndicators[definition.name].setjSetIndexShift(jSetIndexShift)
							window.mqlIndicators[definition.name].setjChartID(jChartID)
							window.mqlIndicators[definition.name].setjChartPeriod(jChartPeriod)
							window.mqlIndicators[definition.name].setjChartSymbol(jChartSymbol)
							window.mqlIndicators[definition.name].setjPeriod(jPeriod)
							window.mqlIndicators[definition.name].setjSymbol(jSymbol)
							window.mqlIndicators[definition.name].setjiTimeInit(jiTimeInit)
							window.mqlIndicators[definition.name].setjiTime(jiTime)
							window.mqlIndicators[definition.name].setjiOpenInit(jiOpenInit)
							window.mqlIndicators[definition.name].setjiOpen(jiOpen)
							window.mqlIndicators[definition.name].setjiHighInit(jiHighInit)
							window.mqlIndicators[definition.name].setjiHigh(jiHigh)
							window.mqlIndicators[definition.name].setjiLowInit(jiLowInit)
							window.mqlIndicators[definition.name].setjiLow(jiLow)
							window.mqlIndicators[definition.name].setjiCloseInit(jiCloseInit)
							window.mqlIndicators[definition.name].setjiClose(jiClose)
							window.mqlIndicators[definition.name].setjiVolumeInit(jiVolumeInit)
							window.mqlIndicators[definition.name].setjiVolume(jiVolume)
							window.mqlIndicators[definition.name].setjiHighest(jiHighest)
							window.mqlIndicators[definition.name].setjiLowest(jiLowest)
							window.mqlIndicators[definition.name].setjiACInit(jiACInit)
							window.mqlIndicators[definition.name].setjiAC(jiAC)
							window.mqlIndicators[definition.name].setjiADXInit(jiADXInit)
							window.mqlIndicators[definition.name].setjiADX(jiADX)
							window.mqlIndicators[definition.name].setjiAlligatorInit(jiAlligatorInit)
							window.mqlIndicators[definition.name].setjiAlligator(jiAlligator)
							window.mqlIndicators[definition.name].setjiAOInit(jiAOInit)
							window.mqlIndicators[definition.name].setjiAO(jiAO)
							window.mqlIndicators[definition.name].setjiATRInit(jiATRInit)
							window.mqlIndicators[definition.name].setjiATR(jiATR)
							window.mqlIndicators[definition.name].setjiBearsPowerInit(jiBearsPowerInit)
							window.mqlIndicators[definition.name].setjiBearsPower(jiBearsPower)
							window.mqlIndicators[definition.name].setjiBandsInit(jiBandsInit)
							window.mqlIndicators[definition.name].setjiBands(jiBands)
							window.mqlIndicators[definition.name].setjiBandsOnArray(jiBandsOnArray)
							window.mqlIndicators[definition.name].setjiBullsPowerInit(jiBullsPowerInit)
							window.mqlIndicators[definition.name].setjiBullsPower(jiBullsPower)
							window.mqlIndicators[definition.name].setjiCCIInit(jiCCIInit)
							window.mqlIndicators[definition.name].setjiCCI(jiCCI)
							window.mqlIndicators[definition.name].setjiCCIOnArray(jiCCIOnArray)
							window.mqlIndicators[definition.name].setjiCustomInit(jiCustomInit)
							window.mqlIndicators[definition.name].setjiCustom(jiCustom)
							window.mqlIndicators[definition.name].setjiDeMarkerInit(jiDeMarkerInit)
							window.mqlIndicators[definition.name].setjiDeMarker(jiDeMarker)
							window.mqlIndicators[definition.name].setjiEnvelopesInit(jiEnvelopesInit)
							window.mqlIndicators[definition.name].setjiEnvelopes(jiEnvelopes)
							window.mqlIndicators[definition.name].setjiEnvelopesOnArray(jiEnvelopesOnArray)
							window.mqlIndicators[definition.name].setjiFractalsInit(jiFractalsInit)
							window.mqlIndicators[definition.name].setjiFractals(jiFractals)
							window.mqlIndicators[definition.name].setjiIchimokuInit(jiIchimokuInit)
							window.mqlIndicators[definition.name].setjiIchimoku(jiIchimoku)
							window.mqlIndicators[definition.name].setjiMAInit(jiMAInit)
							window.mqlIndicators[definition.name].setjiMA(jiMA)
							window.mqlIndicators[definition.name].setjiMAOnArray(jiMAOnArray)
							window.mqlIndicators[definition.name].setjiMACDInit(jiMACDInit)
							window.mqlIndicators[definition.name].setjiMACD(jiMACD)
							window.mqlIndicators[definition.name].setjiMomentumInit(jiMomentumInit)
							window.mqlIndicators[definition.name].setjiMomentum(jiMomentum)
							window.mqlIndicators[definition.name].setjiMomentumOnArray(jiMomentumOnArray)
							window.mqlIndicators[definition.name].setjiRSIInit(jiRSIInit)
							window.mqlIndicators[definition.name].setjiRSI(jiRSI)
							window.mqlIndicators[definition.name].setjiRSIOnArray(jiRSIOnArray)
							window.mqlIndicators[definition.name].setjiRVIInit(jiRVIInit)
							window.mqlIndicators[definition.name].setjiRVI(jiRVI)
							window.mqlIndicators[definition.name].setjiSARInit(jiSARInit)
							window.mqlIndicators[definition.name].setjiSAR(jiSAR)
							window.mqlIndicators[definition.name].setjiStochasticInit(jiStochasticInit)
							window.mqlIndicators[definition.name].setjiStochastic(jiStochastic)
							window.mqlIndicators[definition.name].setjiWPRInit(jiWPRInit)
							window.mqlIndicators[definition.name].setjiWPR(jiWPR)
							window.mqlIndicators[definition.name].setjMarketInfo(jMarketInfo)

							var monitorMemory = function () {
								for (var i in window.mqlIndicatorsBuffer) {
									var obj = window.mqlIndicatorsBuffer[i]
									var module = window.mqlIndicators[obj.name].module

									if (obj.time == obj.mTime) {
										for (var j in obj.dataInput) {
											module._free(obj.dataInput[j])
										}
										for (var j in obj.dataOutput) {
											module._free(obj.dataOutput[j])
										}
										delete window.mqlIndicatorsBuffer[i]
									} else {
										obj.mTime = obj.time
									}
								}
								setTimeout(monitorMemory, 30000)
							}
							setTimeout(monitorMemory, 30000)

							importBuiltInIndicator(
								definition.name,
								definition.description,
								function (context) {
									var indiName = getIndiName(context)
									if (typeof window.mqlIndicators == "undefined" || typeof window.mqlIndicators[indiName] == "undefined") {
										return
									}

									var indiObj = window.mqlIndicators[indiName]

									var uid = null
									if (typeof context.uid == "undefined") {
										uid = window.mqlIndiUID++
										context.uid = uid
									} else {
										uid = context.uid
									}
									var calculatedLength = 0
									if (typeof window.mqlIndicatorsBuffer[uid + ""] != "undefined") {
										calculatedLength = getCalculatedLength(context)
									}

									var currDefinition = indiObj.definition

									var nByteDouble = 8
									var nByteString = 1
									var length = 1
									var buffer = null

									if (calculatedLength == 0) {
										for (var i in currDefinition.parameters) {
											if (currDefinition.parameters[i].type == PARAMETER_TYPE.INTEGER) {
												indiObj.setParamInt(uid, getIndiParameter(context, currDefinition.parameters[i].name))
											} else if (currDefinition.parameters[i].type == PARAMETER_TYPE.NUMBER) {
												indiObj.setParamDouble(uid, getIndiParameter(context, currDefinition.parameters[i].name))
											} else if (currDefinition.parameters[i].type == PARAMETER_TYPE.BOOLEAN) {
												indiObj.setParamBool(uid, getIndiParameter(context, currDefinition.parameters[i].name))
											} else if (currDefinition.parameters[i].type == PARAMETER_TYPE.STRING) {
												indiObj.setParamString(uid, getIndiParameter(context, currDefinition.parameters[i].name))
											}
										}
									}

									var dataLen = getDataInput(context, 0).length
									var buffLen = dataLen * 2
									var ratesTotal = dataLen
									var prevCalc = calculatedLength

									var buffObj = null

									if (typeof window.mqlIndicatorsBuffer[uid + ""] == "undefined") {
										var brokerName = getBrokerNameByContext(context)
										var accountId = getAccountIdByContext(context)
										var symbolName = getChartSymbolNameByContext(context)
										var timeFrame = getChartTimeFrameByContext(context)

										window.mqlIndicatorsBuffer[uid + ""] = {
											name: definition.name,
											context: context,
											brokerName: brokerName,
											accountId: accountId,
											symbolName: symbolName,
											timeFrame: timeFrame,
											chartId: getChartHandleByContext(context),
											symbol: getSymbolInfo(brokerName, accountId, symbolName),
											bufferLen: buffLen,
											dataInput: [],
											dataOutput: [],
											time: new Date().getTime(),
											mTime: 0
										}

										buffObj = window.mqlIndicatorsBuffer[uid + ""]

										for (var i in currDefinition.dataInput) {
											var dataInput = getDataInput(context, currDefinition.dataInput[i].index)

											buffer = indiObj.module._malloc(buffLen * nByteDouble)

											for (var j = 0; j < dataInput.length; j++) {
												indiObj.module.setValue(buffer + j * nByteDouble, dataInput[j], "double")
											}

											indiObj.setDataInput(uid, buffLen, buffer)
											buffObj.dataInput.push(buffer)
										}

										for (var i in currDefinition.dataOutput) {
											buffer = indiObj.module._malloc(buffLen * nByteDouble)

											indiObj.setDataOutput(uid, buffLen, buffer)
											buffObj.dataOutput.push(buffer)
										}

										indiObj.onCalc(uid, ratesTotal, prevCalc, 10000, 1.0 / buffObj.symbol.toFixed, Math.log10(buffObj.symbol.toFixed))

										for (var i in currDefinition.dataOutput) {
											var dataOutputMql = buffObj.dataOutput[i]
											var dataOutput = getDataOutput(context, currDefinition.dataOutput[i].name)

											for (var j = 0; j < dataOutput.length; j++) {
												dataOutput[j] = indiObj.module.getValue(dataOutputMql + j * nByteDouble, "double")
											}
										}
									} else if (dataLen == window.mqlIndicatorsBuffer[uid + ""].bufferLen) {
										buffObj = window.mqlIndicatorsBuffer[uid + ""]

										buffObj.time = new Date().getTime()
										buffObj.bufferLen = buffLen

										for (var i in currDefinition.dataInput) {
											var dataInput = getDataInput(context, currDefinition.dataInput[i].index)

											buffer = indiObj.module._malloc(buffLen * nByteDouble)

											for (var j = 0; j < dataInput.length; j++) {
												indiObj.module.setValue(buffer + j * nByteDouble, dataInput[j], "double")
											}

											indiObj.setDataInput(uid, buffLen, buffer)
											indiObj.module._free(buffObj.dataInput[i])
											buffObj.dataInput.push(buffer)
										}

										for (var i in definition.dataOutput) {
											buffer = indiObj.module._malloc(buffLen * nByteDouble)

											for (var j = 0; j < dataOutput.length; j++) {
												indiObj.module.setValue(buffer + j * nByteDouble, dataOutput[j], "double")
											}

											indiObj.setDataOutput(uid, buffLen, buffer)
											indiObj.module._free(buffObj.dataOutput[i])
											buffObj.dataOutput.push(buffer)
										}

										var cData = getDataFromIndi(context, buffObj.chartId, DATA_NAME.CLOSE)
										indiObj.onCalc(uid, ratesTotal, prevCalc, cData.length, 1.0 / buffObj.symbol.toFixed, Math.log10(buffObj.symbol.toFixed))

										for (var i in currDefinition.dataOutput) {
											var dataOutputMql = buffObj.dataOutput[i]
											var dataOutput = getDataOutput(context, currDefinition.dataOutput[i].name)

											dataOutput[dataOutput.length - 1] = indiObj.module.getValue(dataOutputMql + (dataOutput.length - 1) * nByteDouble, "double")
										}
									} else {
										buffObj = window.mqlIndicatorsBuffer[uid + ""]

										buffObj.time = new Date().getTime()

										for (var i in currDefinition.dataInput) {
											var dataInputMql = buffObj.dataInput[i]
											var dataInput = getDataInput(context, currDefinition.dataInput[i].index)

											indiObj.module.setValue(dataInputMql + (dataInput.length - 1) * nByteDouble, dataInput[dataInput.length - 1], "double")
										}

										var cData = getDataFromIndi(context, buffObj.chartId, DATA_NAME.CLOSE)
										indiObj.onCalc(uid, ratesTotal, prevCalc, cData.length, 1.0 / buffObj.symbol.toFixed, Math.log10(buffObj.symbol.toFixed))

										for (var i in currDefinition.dataOutput) {
											var dataOutputMql = buffObj.dataOutput[i]
											var dataOutput = getDataOutput(context, currDefinition.dataOutput[i].name)

											dataOutput[dataOutput.length - 1] = indiObj.module.getValue(dataOutputMql + (dataOutput.length - 1) * nByteDouble, "double")
										}
									}

									for (var i in currDefinition.parameters) {
										if (currDefinition.parameters[i].name == "shift") {
											var shift = getIndiParameter(context, "shift")
											if (shift != null && calculatedLength == 0) {
												for (var j in currDefinition.dataOutput) {
													setIndiShift(context, currDefinition.dataOutput[j].name, shift)
												}
											}

											break
		"mql_indicator_loader_plugin",
		"mql_plugin to make MQL-based indicators runnable on Fintechee(v1.07)",
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
					var tags = document.getElementsByTagName("script")
					for (var i = tags.length - 1; i >= 0; i--) {
						if (tags[i] && tags[i].getAttribute("src") != null && tags[i].getAttribute("src") == definition.url) {
							tags[i].parentNode.removeChild(tags[i])
							break
						}
					}

					var scriptPromise = new Promise(function (resolve, reject) {
					  var script = document.createElement("script")
					  document.body.appendChild(script)
					  script.onload = resolve
					  script.onerror = reject
					  script.async = true
					  script.src = definition.url
					})

					scriptPromise.then(function () {
						IndiPlugIn().then(function (Module) {
							if (typeof window.mqlIndicators == "undefined") {
								window.mqlIndicators = []
								window.mqlIndicatorsBuffer = []
								window.mqlIndiUID = 0
							}

							var jPrint = Module.addFunction(function (uid, s) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								printMessage(window.mqlIndicators[obj.name].module.UTF8ToString(s))
							}, "vii")
							var jSetIndexShift = Module.addFunction(function (uid, name, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(name)
								setIndiShift(obj.context, md, shift)
							}, "viii")
							var jChartID = Module.addFunction(function (uid) {
							  return window.mqlIndicatorsBuffer[uid + ""].chartId
							}, "ii")
							var jChartPeriod = Module.addFunction(function (uid, chart_id) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								if (chart_id == 0) {
									return obj.convertTimeFrame(obj.timeFrame)
								} else {
									return obj.convertTimeFrame(getChartTimeFrame(chart_id))
								}
							}, "iii")
							var jChartSymbol = Module.addFunction(function (uid, chart_id) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = ""
								if (chart_id == 0) {
									symbolName = obj.symbolName
								} else {
									symbolName = getChartSymbolName(chart_id)
								}
								var lengthBytes = window.mqlIndicators[obj.name].module.lengthBytesUTF8(symbolName) + 1
							  var stringOnWasmHeap = window.mqlIndicators[obj.name].module._malloc(lengthBytes)
							  window.mqlIndicators[obj.name].module.stringToUTF8(symbolName, stringOnWasmHeap, lengthBytes)
							  return stringOnWasmHeap
							}, "iii")
							var jPeriod = Module.addFunction(function (uid) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								return obj.convertTimeFrame(obj.timeFrame)
							}, "ii")
							var jSymbol = Module.addFunction(function (uid) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = obj.symbolName
								var lengthBytes = window.mqlIndicators[obj.name].module.lengthBytesUTF8(symbolName) + 1
							  var stringOnWasmHeap = window.mqlIndicators[obj.name].module._malloc(lengthBytes)
							  window.mqlIndicators[obj.name].module.stringToUTF8(symbolName, stringOnWasmHeap, lengthBytes)
							  return stringOnWasmHeap
							}, "ii")
							var jiTimeInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandleFromIndi(obj.context, symbolName, timeFrm)
							}, "iiii")
							var jiTime = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, chartHandle, "Time")
								return arr[arr.length - shift - 1]
							}, "iiii")
							var jiOpenInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandleFromIndi(obj.context, symbolName, timeFrm)
							}, "iiii")
							var jiOpen = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, chartHandle, "Open")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiHighInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandleFromIndi(obj.context, symbolName, timeFrm)
							}, "iiii")
							var jiHigh = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, chartHandle, "High")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiLowInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandleFromIndi(obj.context, symbolName, timeFrm)
							}, "iiii")
							var jiLow = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, chartHandle, "Low")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiCloseInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandleFromIndi(obj.context, symbolName, timeFrm)
							}, "iiii")
							var jiClose = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, chartHandle, "Close")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiVolumeInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getChartHandleFromIndi(obj.context, symbolName, timeFrm)
							}, "iiii")
							var jiVolume = Module.addFunction(function (uid, chartHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, chartHandle, "Volume")
								return arr[arr.length - shift - 1]
							}, "iiii")
							var jiHighest = Module.addFunction(function (uid, chartHandle, mode, count, start) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, chartHandle, md)
								var highest = -Number.MAX_VALUE
								var idx = -1
								for (var i = start; i < start + count && i >= 0 && i < arr.length; i++) {
									if (arr[arr.length - i - 1] > highest) {
										highest = arr[arr.length - i - 1]
										idx = i
									}
								}
								return idx
							}, "iiiiii")
							var jiLowest = Module.addFunction(function (uid, chartHandle, mode, count, start) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, chartHandle, md)
								var lowest = Number.MAX_VALUE
								var idx = -1
								for (var i = start; i < start + count && i >= 0 && i < arr.length; i++) {
									if (arr[arr.length - i - 1] < lowest) {
										lowest = arr[arr.length - i - 1]
										idx = i
									}
								}
								return idx
							}, "iiiiii")
							var jiACInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "ac", [])
							}, "iiii")
							var jiAC = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arrUp = getDataFromIndi(obj.context, indiHandle, "up")
								var arrDown = getDataFromIndi(obj.context, indiHandle, "down")
								return arrUp[arrUp.length - shift - 1] > 0 ? arrUp[arrUp.length - shift - 1] : arrDown[arrDown.length - shift - 1]
							}, "diii")
							var jiADXInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "adx_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiADX = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiAlligatorInit = Module.addFunction(function (uid, symbol, timeframe, jaw_period, jaw_shift, teeth_period, teeth_shift, lips_period, lips_shift, ma_method, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								var method = window.mqlIndicators[obj.name].module.UTF8ToString(ma_method)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "alligator_for_mql", [{
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								if (md == "jaws") {
									return arr[arr.length - jaw_shift - shift - 1]
								} else if (md == "teeth") {
									return arr[arr.length - teeth_shift - shift - 1]
								} else {
									return arr[arr.length - lips_shift - shift - 1]
								}
							}, "diiiiiii")
							var jiAOInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "ao", [])
							}, "iiii")
							var jiAO = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arrUp = getDataFromIndi(obj.context, indiHandle, "up")
								var arrDown = getDataFromIndi(obj.context, indiHandle, "down")
								return arrUp[arrUp.length - shift - 1] > 0 ? arrUp[arrUp.length - shift - 1] : arrDown[arrDown.length - shift - 1]
							}, "diii")
							var jiATRInit = Module.addFunction(function (uid, symbol, timeframe, period) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "atr", [{
									name: "period",
									value: period
								}])
							}, "iiiii")
							var jiATR = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "atr")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiBearsPowerInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "bears_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiBearsPower = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "bears")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiBandsInit = Module.addFunction(function (uid, symbol, timeframe, period, deviation, bands_shift, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "bands_for_mql", [{
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - bands_shift - shift - 1]
							}, "diiiii")
							var jiBandsOnArray = Module.addFunction(function (uid, array, total, period, deviation, bands_shift, mode, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlIndicators[obj.name].module.getValue(array + i * nByteDouble, "double")
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
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataOnArray(dataOutput, md)
								return arr[arr.length - bands_shift - shift - 1]
							}, "diiiidiii")
							var jiBullsPowerInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "bulls_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiBullsPower = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "bulls")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiCCIInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "cci_for_mql", [{
							    name: "period",
							    value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiCCI = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "cci")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiCCIOnArray = Module.addFunction(function (uid, array, total, period, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlIndicators[obj.name].module.getValue(array + i * nByteDouble, "double")
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var indiName = window.mqlIndicators[obj.name].module.UTF8ToString(name)
								if (typeof window.mqlIndicators == "undefined" || typeof window.mqlIndicators[indiName] == "undefined") {
									throw new Error("Please start MQL indicator loader plugin and load the specific indicator(" + indiName + ").")
								}
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								var params = window.mqlIndicators[obj.name].module.UTF8ToString(paramString).split("|||")
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
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, indiName, parameters)
							}, "iiiiii")
							var jiCustom = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiDeMarkerInit = Module.addFunction(function (uid, symbol, timeframe, period) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "demarker", [{
									name: "period",
									value: period
								}])
							}, "iiiii")
							var jiDeMarker = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "demarker")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiEnvelopesInit = Module.addFunction(function (uid, symbol, timeframe, ma_period, ma_method, ma_shift, applied_price, deviation) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								var method = window.mqlIndicators[obj.name].module.UTF8ToString(ma_method)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "envelopes_for_mql", [{
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - ma_shift - shift - 1]
							}, "diiiii")
							var jiEnvelopesOnArray = Module.addFunction(function (uid, array, total, ma_period, ma_method, ma_shift, deviation, mode, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var method = window.mqlIndicators[obj.name].module.UTF8ToString(ma_method)
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlIndicators[obj.name].module.getValue(array + i * nByteDouble, "double")
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
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataOnArray(dataOutput, md)
								return arr[arr.length - ma_shift - shift - 1]
							}, "diiiiiidii")
							var jiFractalsInit = Module.addFunction(function (uid, symbol, timeframe) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "fractals", [])
							}, "iiii")
							var jiFractals = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiIchimokuInit = Module.addFunction(function (uid, symbol, timeframe, tenkan_sen, kijun_sen, senkou_span_b) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "ichimoku", [{
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - ichimoku_shift - shift - 1]
							}, "diiiii")
							var jiMAInit = Module.addFunction(function (uid, symbol, timeframe, ma_period, ma_shift, ma_method, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
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
									return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "ema_for_mql", params)
								} else if (ma_method == 2) {
									return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "smma_for_mql", params)
								} else if (ma_method == 3) {
									return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "lwma_for_mql", params)
								} else {
									return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "sma_for_mql", params)
								}
							}, "iiiiiiii")
							var jiMA = Module.addFunction(function (uid, indiHandle, ma_shift, ma_method, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var method = window.mqlIndicators[obj.name].module.UTF8ToString(ma_method)
								var arr = getDataFromIndi(obj.context, indiHandle, method)
								return arr[arr.length - ma_shift - shift - 1]
							}, "diiiii")
							var jiMAOnArray = Module.addFunction(function (uid, array, total, ma_period, ma_shift, ma_method, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var method = window.mqlIndicators[obj.name].module.UTF8ToString(ma_method)
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlIndicators[obj.name].module.getValue(array + i * nByteDouble, "double")
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "macd_for_mql", [{
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiMomentumInit = Module.addFunction(function (uid, symbol, timeframe, period, applied_price) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "momentum_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiMomentum = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "momentum")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiMomentumOnArray = Module.addFunction(function (uid, array, total, period, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlIndicators[obj.name].module.getValue(array + i * nByteDouble, "double")
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "rsi_for_mql", [{
									name: "period",
									value: period
								},{
									name: "appliedPrice",
									value: applied_price
								}])
							}, "iiiiii")
							var jiRSI = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "rsi")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiRSIOnArray = Module.addFunction(function (uid, array, total, period, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var nByteDouble = 8
								var data = new Array(total)
								for (var i = 0; i < data.length; i++) {
									data[i] = window.mqlIndicators[obj.name].module.getValue(array + i * nByteDouble, "double")
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "rvi", [{
									name: "period",
									value: period
								}])
							}, "iiiii")
							var jiRVI = Module.addFunction(function (uid, indiHandle, mode, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiSARInit = Module.addFunction(function (uid, symbol, timeframe, step, maximum) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "sar", [{
									name: "acceleration",
									value: step,
								},{
									name: "afMax",
									value: maximum,
								}])
							}, "iiiidd")
							var jiSAR = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "sar")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jiStochasticInit = Module.addFunction(function (uid, symbol, timeframe, Kperiod, Dperiod, slowing, ma_method) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								var method = window.mqlIndicators[obj.name].module.UTF8ToString(ma_method)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "stochastic", [{
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
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var md = window.mqlIndicators[obj.name].module.UTF8ToString(mode)
								var arr = getDataFromIndi(obj.context, indiHandle, md)
								return arr[arr.length - shift - 1]
							}, "diiii")
							var jiWPRInit = Module.addFunction(function (uid, symbol, timeframe, period) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var timeFrm = window.mqlIndicators[obj.name].module.UTF8ToString(timeframe)
								symbolName = symbolName == "" ? obj.symbolName : symbolName
								timeFrm = timeFrm == "0" ? obj.timeFrame : timeFrm
								return getIndicatorHandleFromIndi(obj.context, symbolName, timeFrm, "wpr", [{
									name: "period",
									value: period
								}])
							}, "iiiii")
							var jiWPR = Module.addFunction(function (uid, indiHandle, shift) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var arr = getDataFromIndi(obj.context, indiHandle, "wpr")
								return arr[arr.length - shift - 1]
							}, "diii")
							var jMarketInfo = Module.addFunction(function (uid, symbol, type) {
								var obj = window.mqlIndicatorsBuffer[uid + ""]
								var symbolName = window.mqlIndicators[obj.name].module.UTF8ToString(symbol)
								var symbolObj = null
								if (symbolName == "") {
									symbolObj = obj.symbol
								} else {
									symbolObj = getSymbolInfo(obj.brokerName, obj.accountId, symbolName)
								}
								if (type == 11) {
									return 1.0 / symbolObj.toFixed
								} else if (type == 12) {
									return Math.log10(symbolObj.toFixed)
								} else if (type == 18) {
									return symbolObj.swapLong
								} else if (type == 19) {
									return symbolObj.swapShort
								} else if (type == 22) {
									return symbolObj.tradable
								} else if (type == 23) {
									return symbolObj.lotsMinLimit
								} else if (type == 24) {
									return symbolObj.lotsStep
								} else if (type == 25) {
									return symbolObj.lotsLimit
								}
								printErrorMessage("Not supported the specific market information currently!")
								return -1
							}, "diii")

					    window.mqlIndicators[definition.name] = {
								definition: definition,
								module: Module,
								setParamInt: Module.cwrap("setParamInt", null, ["number", "number"]),
								setParamDouble: Module.cwrap("setParamDouble", null, ["number", "number"]),
								setParamBool: Module.cwrap("setParamBool", null, ["number", "number"]),
								setParamString: Module.cwrap("setParamString", null, ["number", "string"]),
								setDataInput: Module.cwrap("setDataInput", null, ["number", "number", "number"]),
								setDataOutput: Module.cwrap("setDataOutput", null, ["number", "number", "number"]),
								onCalc: Module.cwrap("onCalc", null, ["number", "number", "number", "number", "number", "number"]),
								setjPrint: Module.cwrap("setjPrint", null, ["number"]),
								setjSetIndexShift: Module.cwrap("setjSetIndexShift", null, ["number"]),
								setjChartID: Module.cwrap('setjChartID', null, ['number']),
								setjChartPeriod: Module.cwrap('setjChartPeriod', null, ['number']),
								setjChartSymbol: Module.cwrap('setjChartSymbol', null, ['number']),
								setjPeriod: Module.cwrap('setjPeriod', null, ['number']),
								setjSymbol: Module.cwrap('setjSymbol', null, ['number']),
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
								setjiHighest: Module.cwrap('setjiHighest', null, ['number']),
								setjiLowest: Module.cwrap('setjiLowest', null, ['number']),
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
								setjMarketInfo: Module.cwrap("setjMarketInfo", null, ["number"])
							}

							window.mqlIndicators[definition.name].setjPrint(jPrint)
							window.mqlIndicators[definition.name].setjSetIndexShift(jSetIndexShift)
							window.mqlIndicators[definition.name].setjChartID(jChartID)
							window.mqlIndicators[definition.name].setjChartPeriod(jChartPeriod)
							window.mqlIndicators[definition.name].setjChartSymbol(jChartSymbol)
							window.mqlIndicators[definition.name].setjPeriod(jPeriod)
							window.mqlIndicators[definition.name].setjSymbol(jSymbol)
							window.mqlIndicators[definition.name].setjiTimeInit(jiTimeInit)
							window.mqlIndicators[definition.name].setjiTime(jiTime)
							window.mqlIndicators[definition.name].setjiOpenInit(jiOpenInit)
							window.mqlIndicators[definition.name].setjiOpen(jiOpen)
							window.mqlIndicators[definition.name].setjiHighInit(jiHighInit)
							window.mqlIndicators[definition.name].setjiHigh(jiHigh)
							window.mqlIndicators[definition.name].setjiLowInit(jiLowInit)
							window.mqlIndicators[definition.name].setjiLow(jiLow)
							window.mqlIndicators[definition.name].setjiCloseInit(jiCloseInit)
							window.mqlIndicators[definition.name].setjiClose(jiClose)
							window.mqlIndicators[definition.name].setjiVolumeInit(jiVolumeInit)
							window.mqlIndicators[definition.name].setjiVolume(jiVolume)
							window.mqlIndicators[definition.name].setjiHighest(jiHighest)
							window.mqlIndicators[definition.name].setjiLowest(jiLowest)
							window.mqlIndicators[definition.name].setjiACInit(jiACInit)
							window.mqlIndicators[definition.name].setjiAC(jiAC)
							window.mqlIndicators[definition.name].setjiADXInit(jiADXInit)
							window.mqlIndicators[definition.name].setjiADX(jiADX)
							window.mqlIndicators[definition.name].setjiAlligatorInit(jiAlligatorInit)
							window.mqlIndicators[definition.name].setjiAlligator(jiAlligator)
							window.mqlIndicators[definition.name].setjiAOInit(jiAOInit)
							window.mqlIndicators[definition.name].setjiAO(jiAO)
							window.mqlIndicators[definition.name].setjiATRInit(jiATRInit)
							window.mqlIndicators[definition.name].setjiATR(jiATR)
							window.mqlIndicators[definition.name].setjiBearsPowerInit(jiBearsPowerInit)
							window.mqlIndicators[definition.name].setjiBearsPower(jiBearsPower)
							window.mqlIndicators[definition.name].setjiBandsInit(jiBandsInit)
							window.mqlIndicators[definition.name].setjiBands(jiBands)
							window.mqlIndicators[definition.name].setjiBandsOnArray(jiBandsOnArray)
							window.mqlIndicators[definition.name].setjiBullsPowerInit(jiBullsPowerInit)
							window.mqlIndicators[definition.name].setjiBullsPower(jiBullsPower)
							window.mqlIndicators[definition.name].setjiCCIInit(jiCCIInit)
							window.mqlIndicators[definition.name].setjiCCI(jiCCI)
							window.mqlIndicators[definition.name].setjiCCIOnArray(jiCCIOnArray)
							window.mqlIndicators[definition.name].setjiCustomInit(jiCustomInit)
							window.mqlIndicators[definition.name].setjiCustom(jiCustom)
							window.mqlIndicators[definition.name].setjiDeMarkerInit(jiDeMarkerInit)
							window.mqlIndicators[definition.name].setjiDeMarker(jiDeMarker)
							window.mqlIndicators[definition.name].setjiEnvelopesInit(jiEnvelopesInit)
							window.mqlIndicators[definition.name].setjiEnvelopes(jiEnvelopes)
							window.mqlIndicators[definition.name].setjiEnvelopesOnArray(jiEnvelopesOnArray)
							window.mqlIndicators[definition.name].setjiFractalsInit(jiFractalsInit)
							window.mqlIndicators[definition.name].setjiFractals(jiFractals)
							window.mqlIndicators[definition.name].setjiIchimokuInit(jiIchimokuInit)
							window.mqlIndicators[definition.name].setjiIchimoku(jiIchimoku)
							window.mqlIndicators[definition.name].setjiMAInit(jiMAInit)
							window.mqlIndicators[definition.name].setjiMA(jiMA)
							window.mqlIndicators[definition.name].setjiMAOnArray(jiMAOnArray)
							window.mqlIndicators[definition.name].setjiMACDInit(jiMACDInit)
							window.mqlIndicators[definition.name].setjiMACD(jiMACD)
							window.mqlIndicators[definition.name].setjiMomentumInit(jiMomentumInit)
							window.mqlIndicators[definition.name].setjiMomentum(jiMomentum)
							window.mqlIndicators[definition.name].setjiMomentumOnArray(jiMomentumOnArray)
							window.mqlIndicators[definition.name].setjiRSIInit(jiRSIInit)
							window.mqlIndicators[definition.name].setjiRSI(jiRSI)
							window.mqlIndicators[definition.name].setjiRSIOnArray(jiRSIOnArray)
							window.mqlIndicators[definition.name].setjiRVIInit(jiRVIInit)
							window.mqlIndicators[definition.name].setjiRVI(jiRVI)
							window.mqlIndicators[definition.name].setjiSARInit(jiSARInit)
							window.mqlIndicators[definition.name].setjiSAR(jiSAR)
							window.mqlIndicators[definition.name].setjiStochasticInit(jiStochasticInit)
							window.mqlIndicators[definition.name].setjiStochastic(jiStochastic)
							window.mqlIndicators[definition.name].setjiWPRInit(jiWPRInit)
							window.mqlIndicators[definition.name].setjiWPR(jiWPR)
							window.mqlIndicators[definition.name].setjMarketInfo(jMarketInfo)

							var monitorMemory = function () {
								for (var i in window.mqlIndicatorsBuffer) {
									var obj = window.mqlIndicatorsBuffer[i]
									var module = window.mqlIndicators[obj.name].module

									if (obj.time == obj.mTime) {
										for (var j in obj.dataInput) {
											module._free(obj.dataInput[j])
										}
										for (var j in obj.dataOutput) {
											module._free(obj.dataOutput[j])
										}
										delete window.mqlIndicatorsBuffer[i]
									} else {
										obj.mTime = obj.time
									}
								}
								setTimeout(monitorMemory, 30000)
							}
							setTimeout(monitorMemory, 30000)

							importBuiltInIndicator(
								definition.name,
								definition.description,
								function (context) {
									var indiName = getIndiName(context)
									if (typeof window.mqlIndicators == "undefined" || typeof window.mqlIndicators[indiName] == "undefined") {
										return
									}

									var indiObj = window.mqlIndicators[indiName]

									var uid = null
									if (typeof context.uid == "undefined") {
										uid = window.mqlIndiUID++
										context.uid = uid
									} else {
										uid = context.uid
									}
									var calculatedLength = 0
									if (typeof window.mqlIndicatorsBuffer[uid + ""] != "undefined") {
										calculatedLength = getCalculatedLength(context)
									}

									var currDefinition = indiObj.definition

									var nByteDouble = 8
									var nByteString = 1
									var length = 1
									var buffer = null

									if (calculatedLength == 0) {
										for (var i in currDefinition.parameters) {
											if (currDefinition.parameters[i].type == PARAMETER_TYPE.INTEGER) {
												indiObj.setParamInt(uid, getIndiParameter(context, currDefinition.parameters[i].name))
											} else if (currDefinition.parameters[i].type == PARAMETER_TYPE.NUMBER) {
												indiObj.setParamDouble(uid, getIndiParameter(context, currDefinition.parameters[i].name))
											} else if (currDefinition.parameters[i].type == PARAMETER_TYPE.BOOLEAN) {
												indiObj.setParamBool(uid, getIndiParameter(context, currDefinition.parameters[i].name))
											} else if (currDefinition.parameters[i].type == PARAMETER_TYPE.STRING) {
												indiObj.setParamString(uid, getIndiParameter(context, currDefinition.parameters[i].name))
											}
										}
									}

									var dataLen = getDataInput(context, 0).length
									var buffLen = dataLen * 2
									var ratesTotal = dataLen
									var prevCalc = calculatedLength

									var buffObj = null

									if (typeof window.mqlIndicatorsBuffer[uid + ""] == "undefined") {
										var brokerName = getBrokerNameByContext(context)
										var accountId = getAccountIdByContext(context)
										var symbolName = getChartSymbolNameByContext(context)
										var timeFrame = getChartTimeFrameByContext(context)

										window.mqlIndicatorsBuffer[uid + ""] = {
											name: definition.name,
											context: context,
											brokerName: brokerName,
											accountId: accountId,
											symbolName: symbolName,
											timeFrame: timeFrame,
											chartId: getChartHandleByContext(context),
											symbol: getSymbolInfo(brokerName, accountId, symbolName),
											bufferLen: buffLen,
											dataInput: [],
											dataOutput: [],
											time: new Date().getTime(),
											mTime: 0
										}

										buffObj = window.mqlIndicatorsBuffer[uid + ""]

										for (var i in currDefinition.dataInput) {
											var dataInput = getDataInput(context, currDefinition.dataInput[i].index)

											buffer = indiObj.module._malloc(buffLen * nByteDouble)

											for (var j = 0; j < dataInput.length; j++) {
												indiObj.module.setValue(buffer + j * nByteDouble, dataInput[j], "double")
											}

											indiObj.setDataInput(uid, buffLen, buffer)
											buffObj.dataInput.push(buffer)
										}

										for (var i in currDefinition.dataOutput) {
											buffer = indiObj.module._malloc(buffLen * nByteDouble)

											indiObj.setDataOutput(uid, buffLen, buffer)
											buffObj.dataOutput.push(buffer)
										}

										indiObj.onCalc(uid, ratesTotal, prevCalc, 10000, 1.0 / buffObj.symbol.toFixed, Math.log10(buffObj.symbol.toFixed))

										for (var i in currDefinition.dataOutput) {
											var dataOutputMql = buffObj.dataOutput[i]
											var dataOutput = getDataOutput(context, currDefinition.dataOutput[i].name)

											for (var j = 0; j < dataOutput.length; j++) {
												dataOutput[j] = indiObj.module.getValue(dataOutputMql + j * nByteDouble, "double")
											}
										}
									} else if (dataLen == window.mqlIndicatorsBuffer[uid + ""].bufferLen) {
										buffObj = window.mqlIndicatorsBuffer[uid + ""]

										buffObj.time = new Date().getTime()
										buffObj.bufferLen = buffLen

										for (var i in currDefinition.dataInput) {
											var dataInput = getDataInput(context, currDefinition.dataInput[i].index)

											buffer = indiObj.module._malloc(buffLen * nByteDouble)

											for (var j = 0; j < dataInput.length; j++) {
												indiObj.module.setValue(buffer + j * nByteDouble, dataInput[j], "double")
											}

											indiObj.setDataInput(uid, buffLen, buffer)
											indiObj.module._free(buffObj.dataInput[i])
											buffObj.dataInput.push(buffer)
										}

										for (var i in definition.dataOutput) {
											buffer = indiObj.module._malloc(buffLen * nByteDouble)

											for (var j = 0; j < dataOutput.length; j++) {
												indiObj.module.setValue(buffer + j * nByteDouble, dataOutput[j], "double")
											}

											indiObj.setDataOutput(uid, buffLen, buffer)
											indiObj.module._free(buffObj.dataOutput[i])
											buffObj.dataOutput.push(buffer)
										}

										var cData = getDataFromIndi(context, buffObj.chartId, DATA_NAME.CLOSE)
										indiObj.onCalc(uid, ratesTotal, prevCalc, cData.length, 1.0 / buffObj.symbol.toFixed, Math.log10(buffObj.symbol.toFixed))

										for (var i in currDefinition.dataOutput) {
											var dataOutputMql = buffObj.dataOutput[i]
											var dataOutput = getDataOutput(context, currDefinition.dataOutput[i].name)

											dataOutput[dataOutput.length - 1] = indiObj.module.getValue(dataOutputMql + (dataOutput.length - 1) * nByteDouble, "double")
										}
									} else {
										buffObj = window.mqlIndicatorsBuffer[uid + ""]

										buffObj.time = new Date().getTime()

										for (var i in currDefinition.dataInput) {
											var dataInputMql = buffObj.dataInput[i]
											var dataInput = getDataInput(context, currDefinition.dataInput[i].index)

											indiObj.module.setValue(dataInputMql + (dataInput.length - 1) * nByteDouble, dataInput[dataInput.length - 1], "double")
										}

										var cData = getDataFromIndi(context, buffObj.chartId, DATA_NAME.CLOSE)
										indiObj.onCalc(uid, ratesTotal, prevCalc, cData.length, 1.0 / buffObj.symbol.toFixed, Math.log10(buffObj.symbol.toFixed))

										for (var i in currDefinition.dataOutput) {
											var dataOutputMql = buffObj.dataOutput[i]
											var dataOutput = getDataOutput(context, currDefinition.dataOutput[i].name)

											dataOutput[dataOutput.length - 1] = indiObj.module.getValue(dataOutputMql + (dataOutput.length - 1) * nByteDouble, "double")
										}
									}

									for (var i in currDefinition.parameters) {
										if (currDefinition.parameters[i].name == "shift") {
											var shift = getIndiParameter(context, "shift")
											if (shift != null && calculatedLength == 0) {
												for (var j in currDefinition.dataOutput) {
													setIndiShift(context, currDefinition.dataOutput[j].name, shift)
												}
											}

											break
										}
									}
								},
								definition.parameters,
								definition.dataInput,
								definition.dataOutput,
								definition.whereToRender
							) // registerIndicator

							rs()
						}) // Module["onRuntimeInitialized"]
					})
					.catch(function () {
						rj()
					})
				})
			}

			if (currDef == null) {
				if (typeof localStorage.allMqlIndis != "undefined") {
					var allMqlIndis = JSON.parse(localStorage.allMqlIndis)
					var cursor = 0
					var load = function (idx) {
						loadMql(allMqlIndis[idx])
						.then(function () {
							cursor++
							if (cursor < allMqlIndis.length) {
								load(cursor)
							}
						})
						.catch(function () {
							cursor++
							if (cursor < allMqlIndis.length) {
								load(cursor)
							}
						})
					}

					load(cursor)
				}
			} else if (typeof currDef.rm != "undefined") {
				if (typeof localStorage.allMqlIndis != "undefined") {
					var allMqlIndis = JSON.parse(localStorage.allMqlIndis)
					for (var i in allMqlIndis) {
						if (allMqlIndis[i].name == currDef.rm) {
							allMqlIndis.splice(i, 1)

							unregisterIndicator(currDef.rm)

							if (typeof window.mqlIndicators == "undefined" || window.mqlIndicatorsBuffer == "undefined") break

							delete window.mqlIndicators[currDef.rm]
							for (var j in window.mqlIndicatorsBuffer) {
								if (window.mqlIndicatorsBuffer[j].name == currDef.rm) {
									for (var k in window.mqlIndicatorsBuffer[j].dataInput) {
										window.mqlIndicators[definition.name].module._free(window.mqlIndicatorsBuffer[j].dataInput[k])
									}
									for (var k in window.mqlIndicatorsBuffer[j].dataOutput) {
										window.mqlIndicators[definition.name].module._free(window.mqlIndicatorsBuffer[j].dataOutput[k])
									}
									delete window.mqlIndicatorsBuffer[j]
								}
							}
							break
						}
					}

					localStorage.allMqlIndis = JSON.stringify(allMqlIndis)
				}
			} else {
				var oldDef = null

				var loadCurrDef = function () {
					loadMql(currDef)
					.then(function () {
						var allMqlIndis = null
						if (typeof localStorage.allMqlIndis != "undefined") {
							allMqlIndis = JSON.parse(localStorage.allMqlIndis)
						} else {
							allMqlIndis = []
						}

						for (var i in allMqlIndis) {
							if (allMqlIndis[i].name == currDef.name) {
								allMqlIndis.splice(i, 1)
								break
							}
						}

						allMqlIndis.push(currDef)

						localStorage.allMqlIndis = JSON.stringify(allMqlIndis)
					})
					.catch(function () {
						if (oldDef != null) {
							loadMql(oldDef)
							.then(function () {})
							.catch(function () {})
						}
					})
				}

				if (typeof localStorage.allMqlIndis != "undefined") {
					var allMqlIndis = JSON.parse(localStorage.allMqlIndis)
					if (typeof window.mqlIndicators == "undefined" || typeof window.mqlIndicators[allMqlIndis[0].name] == "undefined") {
						var cursor = 0
						var load = function (idx) {
							loadMql(allMqlIndis[idx])
							.then(function () {
								cursor++
								if (cursor < allMqlIndis.length) {
									if (allMqlIndis[cursor].name == currDef.name) {
										oldDef = allMqlIndis[cursor]
										cursor++
										if (cursor < allMqlIndis.length) {
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
								if (cursor < allMqlIndis.length) {
									if (allMqlIndis[cursor].name == currDef.name) {
										oldDef = allMqlIndis[cursor]
										cursor++
										if (cursor < allMqlIndis.length) {
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
						for (var i in allMqlIndis) {
							if (allMqlIndis[i].name == currDef.name) {
								oldDef = allMqlIndis[i]

								unregisterIndicator(currDef.name)

								delete window.mqlIndicators[currDef.name]
								for (var j in window.mqlIndicatorsBuffer) {
									if (window.mqlIndicatorsBuffer[j].name == currDef.name) {
										for (var k in window.mqlIndicatorsBuffer[j].dataInput) {
											window.mqlIndicators[definition.name].module._free(window.mqlIndicatorsBuffer[j].dataInput[k])
										}
										for (var k in window.mqlIndicatorsBuffer[j].dataOutput) {
											window.mqlIndicators[definition.name].module._free(window.mqlIndicatorsBuffer[j].dataOutput[k])
										}
										delete window.mqlIndicatorsBuffer[j]
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

