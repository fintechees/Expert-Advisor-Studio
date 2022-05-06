registerEA(
		"plugin_for_mql",
		"mql_plugin to make MQL-based programs runnable on Fintechee(v1.02)",
		[],
		function (context) { // Init()
			if (typeof window.pluginForMql != "undefined") {
				window.pluginForMql.init()
				return
			}

			window.pluginForMql = {
				createMqlIndicator: function (definition) {
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
										var indiStrParam = getIndiParameter(context, currDefinition.parameters[i].name)
										if (indiStrParam == null) {
											indiStrParam = ""
										}
										indiObj.setParamString(uid, indiStrParam)
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
									name: currDefinition.name,
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

								for (var i in currDefinition.dataOutput) {
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
				},
				removeMqlIndicator: function (name) {
					unregisterIndicator(name)

					if (typeof window.mqlIndicators == "undefined" || typeof window.mqlIndicatorsBuffer == "undefined") return

					delete window.mqlIndicators[name]
					for (var i in window.mqlIndicatorsBuffer) {
						if (window.mqlIndicatorsBuffer[i].name == name) {
							delete window.mqlIndicatorsBuffer[i]
							break
						}
					}
				},
				loadMqlIndicator: function (definition) {
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
								var jSetIndexShift = Module.addFunction(function (uid, index, shift) {
									var obj = window.mqlIndicatorsBuffer[uid + ""]
									setIndiShift(obj.context, index, shift)
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
										return arr[arr.length - shift - 1]
									} else if (md == "teeth") {
										return arr[arr.length - shift - 1]
									} else {
										return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									setjChartID: Module.cwrap("setjChartID", null, ["number"]),
									setjChartPeriod: Module.cwrap("setjChartPeriod", null, ["number"]),
									setjChartSymbol: Module.cwrap("setjChartSymbol", null, ["number"]),
									setjPeriod: Module.cwrap("setjPeriod", null, ["number"]),
									setjSymbol: Module.cwrap("setjSymbol", null, ["number"]),
									setjiTimeInit: Module.cwrap("setjiTimeInit", null, ["number"]),
									setjiTime: Module.cwrap("setjiTime", null, ["number"]),
									setjiOpenInit: Module.cwrap("setjiOpenInit", null, ["number"]),
									setjiOpen: Module.cwrap("setjiOpen", null, ["number"]),
									setjiHighInit: Module.cwrap("setjiHighInit", null, ["number"]),
									setjiHigh: Module.cwrap("setjiHigh", null, ["number"]),
									setjiLowInit: Module.cwrap("setjiLowInit", null, ["number"]),
									setjiLow: Module.cwrap("setjiLow", null, ["number"]),
									setjiCloseInit: Module.cwrap("setjiCloseInit", null, ["number"]),
									setjiClose: Module.cwrap("setjiClose", null, ["number"]),
									setjiVolumeInit: Module.cwrap("setjiVolumeInit", null, ["number"]),
									setjiVolume: Module.cwrap("setjiVolume", null, ["number"]),
									setjiHighest: Module.cwrap("setjiHighest", null, ["number"]),
									setjiLowest: Module.cwrap("setjiLowest", null, ["number"]),
									setjiACInit: Module.cwrap("setjiACInit", null, ["number"]),
									setjiAC: Module.cwrap("setjiAC", null, ["number"]),
									setjiADXInit: Module.cwrap("setjiADXInit", null, ["number"]),
									setjiADX: Module.cwrap("setjiADX", null, ["number"]),
									setjiAlligatorInit: Module.cwrap("setjiAlligatorInit", null, ["number"]),
									setjiAlligator: Module.cwrap("setjiAlligator", null, ["number"]),
									setjiAOInit: Module.cwrap("setjiAOInit", null, ["number"]),
									setjiAO: Module.cwrap("setjiAO", null, ["number"]),
									setjiATRInit: Module.cwrap("setjiATRInit", null, ["number"]),
									setjiATR: Module.cwrap("setjiATR", null, ["number"]),
									setjiBearsPowerInit: Module.cwrap("setjiBearsPowerInit", null, ["number"]),
									setjiBearsPower: Module.cwrap("setjiBearsPower", null, ["number"]),
									setjiBandsInit: Module.cwrap("setjiBandsInit", null, ["number"]),
									setjiBands: Module.cwrap("setjiBands", null, ["number"]),
									setjiBandsOnArray: Module.cwrap("setjiBandsOnArray", null, ["number"]),
									setjiBullsPowerInit: Module.cwrap("setjiBullsPowerInit", null, ["number"]),
									setjiBullsPower: Module.cwrap("setjiBullsPower", null, ["number"]),
									setjiCCIInit: Module.cwrap("setjiCCIInit", null, ["number"]),
									setjiCCI: Module.cwrap("setjiCCI", null, ["number"]),
									setjiCCIOnArray: Module.cwrap("setjiCCIOnArray", null, ["number"]),
									setjiCustomInit: Module.cwrap("setjiCustomInit", null, ["number"]),
									setjiCustom: Module.cwrap("setjiCustom", null, ["number"]),
									setjiDeMarkerInit: Module.cwrap("setjiDeMarkerInit", null, ["number"]),
									setjiDeMarker: Module.cwrap("setjiDeMarker", null, ["number"]),
									setjiEnvelopesInit: Module.cwrap("setjiEnvelopesInit", null, ["number"]),
									setjiEnvelopes: Module.cwrap("setjiEnvelopes", null, ["number"]),
									setjiEnvelopesOnArray: Module.cwrap("setjiEnvelopesOnArray", null, ["number"]),
									setjiFractalsInit: Module.cwrap("setjiFractalsInit", null, ["number"]),
									setjiFractals: Module.cwrap("setjiFractals", null, ["number"]),
									setjiIchimokuInit: Module.cwrap("setjiIchimokuInit", null, ["number"]),
									setjiIchimoku: Module.cwrap("setjiIchimoku", null, ["number"]),
									setjiMAInit: Module.cwrap("setjiMAInit", null, ["number"]),
									setjiMA: Module.cwrap("setjiMA", null, ["number"]),
									setjiMAOnArray: Module.cwrap("setjiMAOnArray", null, ["number"]),
									setjiMACDInit: Module.cwrap("setjiMACDInit", null, ["number"]),
									setjiMACD: Module.cwrap("setjiMACD", null, ["number"]),
									setjiMomentumInit: Module.cwrap("setjiMomentumInit", null, ["number"]),
									setjiMomentum: Module.cwrap("setjiMomentum", null, ["number"]),
									setjiMomentumOnArray: Module.cwrap("setjiMomentumOnArray", null, ["number"]),
									setjiRSIInit: Module.cwrap("setjiRSIInit", null, ["number"]),
									setjiRSI: Module.cwrap("setjiRSI", null, ["number"]),
									setjiRSIOnArray: Module.cwrap("setjiRSIOnArray", null, ["number"]),
									setjiRVIInit: Module.cwrap("setjiRVIInit", null, ["number"]),
									setjiRVI: Module.cwrap("setjiRVI", null, ["number"]),
									setjiSARInit: Module.cwrap("setjiSARInit", null, ["number"]),
									setjiSAR: Module.cwrap("setjiSAR", null, ["number"]),
									setjiStochasticInit: Module.cwrap("setjiStochasticInit", null, ["number"]),
									setjiStochastic: Module.cwrap("setjiStochastic", null, ["number"]),
									setjiWPRInit: Module.cwrap("setjiWPRInit", null, ["number"]),
									setjiWPR: Module.cwrap("setjiWPR", null, ["number"]),
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

								rs(definition)
							}) // Module["onRuntimeInitialized"]
						})
						.catch(function () {
							rj()
						})
					})
				},
				saveMqlIndicator: function (definition, bAdd) {
					if (typeof localStorage.reservedZone == "undefined") {
						if (bAdd) {
							localStorage.reservedZone = JSON.stringify({allMqlIndis: [definition]})
						}
					} else {
						var reservedZone = JSON.parse(localStorage.reservedZone)
						if (typeof reservedZone.allMqlIndis == "undefined") {
							if (bAdd) {
								reservedZone.allMqlIndis = [definition]
							}
						} else {
							for (var i in reservedZone.allMqlIndis) {
								if (reservedZone.allMqlIndis[i].name == definition.name) {
									reservedZone.allMqlIndis.splice(i, 1)
									break
								}
							}
							if (bAdd) {
								reservedZone.allMqlIndis.push(definition)
							}
						}
						localStorage.reservedZone = JSON.stringify(reservedZone)
					}
				},
				createMqlEA: function (definition) {
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

							var eaObj = window.mqlEAs[eaName]
							var currDefinition = eaObj.definition

							var nByteDouble = 8
							var nByteString = 1
							var length = 1
							var buffer = null

							for (var i in currDefinition.parameters) {
								if (currDefinition.parameters[i].type == PARAMETER_TYPE.INTEGER) {
									eaObj.setParamInt(uid, getEAParameter(context, currDefinition.parameters[i].name))
								} else if (currDefinition.parameters[i].type == PARAMETER_TYPE.NUMBER) {
									eaObj.setParamDouble(uid, getEAParameter(context, currDefinition.parameters[i].name))
								} else if (currDefinition.parameters[i].type == PARAMETER_TYPE.BOOLEAN) {
									eaObj.setParamBool(uid, getEAParameter(context, currDefinition.parameters[i].name))
								} else if (currDefinition.parameters[i].type == PARAMETER_TYPE.STRING) {
									var eaStrParam = getEAParameter(context, currDefinition.parameters[i].name)
									if (eaStrParam == null) {
										eaStrParam = ""
									}
									eaObj.setParamString(uid, eaStrParam)
								}
							}

							if (typeof window.mqlEAsBuffer[uid + ""] == "undefined") {
								var account = getAccount(context, 0)
								var brokerName = getBrokerNameOfAccount(account)
								var accountId = getAccountIdOfAccount(account)
								var symbolName = getEAParameter(context, "symbol")
								var timeFrame = getEAParameter(context, "timeframe")

								window.mqlEAsBuffer[uid + ""] = {
									name: currDefinition.name,
									context: context,
									brokerName: brokerName,
									accountId: accountId,
									symbolName: symbolName,
									timeFrame: timeFrame,
									chartId: getChartHandle(context, brokerName, accountId, symbolName, timeFrame),
									symbol: getSymbolInfo(brokerName, accountId, symbolName),
									objs: (typeof localStorage.mqlObjs != "undefined" ? JSON.parse(localStorage.mqlObjs) : []),
									neuralNetworks: [],
									lock: false,
									convertTimeFrame: function () {
										if (TIME_FRAME.M1 == timeFrame) {
											return 1
										} else if (TIME_FRAME.M5 == timeFrame) {
											return 5
										} else if (TIME_FRAME.M15 == timeFrame) {
											return 15
										} else if (TIME_FRAME.M30 == timeFrame) {
											return 30
										} else if (TIME_FRAME.H1 == timeFrame) {
											return 60
										} else if (TIME_FRAME.H4 == timeFrame) {
											return 240
										} else if (TIME_FRAME.D == timeFrame) {
											return 1440
										} else if (TIME_FRAME.W == timeFrame) {
											return 10080
										} else if (TIME_FRAME.M == timeFrame) {
											return 43200
										} else {
											return 0
										}
									}
								}

								getQuotes (context, brokerName, accountId, symbolName)
							}

							eaObj.onTick(uid, 10000, 0, 0, 1.0 / window.mqlEAsBuffer[uid + ""].symbol.toFixed, Math.log10(window.mqlEAsBuffer[uid + ""].symbol.toFixed))
							eaObj.onInit(uid)
						},
						function (context) { // Deinit()
							var eaName = getEAName(context)
							var eaObj = window.mqlEAs[eaName]
							eaObj.onDeinit(context.uid, 0)
							delete window.mqlEAsBuffer[context.uid + ""]
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

							var buffObj = window.mqlEAsBuffer[uid + ""]
							buffObj.context = context
							var brokerName = buffObj.brokerName
							var accountId = buffObj.accountId
							var symbolName = buffObj.symbolName

							var tData = getData(context, buffObj.chartId, DATA_NAME.TIME)

							var ask = null
							var bid = null

							try {
								ask = getAsk(context, brokerName, accountId, symbolName)
								bid = getBid(context, brokerName, accountId, symbolName)
							} catch (e) {
								// This try-catch is used to bypass the "error throw" when you start the EA too early to call getAsk or getBid(at that time, bid or ask may be not ready yet.)
								printErrorMessage(e.message)
								return
							}

							window.mqlEAs[eaName].onTick(
								uid,
								tData.length,
								ask,
								bid,
								1.0 / buffObj.symbol.toFixed,
								Math.log10(buffObj.symbol.toFixed)
							)
						}
					) // registerEA
				},
				removeMqlEA: function (name) {
					unregisterEA(name)

					if (typeof window.mqlEAs == "undefined" || typeof window.mqlEAsBuffer == "undefined") return

					delete window.mqlEAs[name]
					for (var i in window.mqlEAsBuffer) {
						if (window.mqlEAsBuffer[i].name == name) {
							delete window.mqlEAsBuffer[i]
							break
						}
					}
				},
				loadMqlEA: function (definition) {
					return new Promise(function (rs, rj) {
						var scriptPromise = new Promise(function (resolve, reject) {
							var tags = document.getElementsByTagName("script")
							for (var i = tags.length - 1; i >= 0; i--) {
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
										return removeChart(window.mqlEAsBuffer[uid + ""].chartId)
									} else {
										return removeChart(chart_id)
									}
								}, "iii")
								var jChartID = Module.addFunction(function (uid) {
								  return window.mqlEAsBuffer[uid + ""].chartId
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
										return obj.convertTimeFrame(obj.timeFrame)
									} else {
										return obj.convertTimeFrame(getChartTimeFrame(chart_id))
									}
								}, "iii")
								var jChartSymbol = Module.addFunction(function (uid, chart_id) {
									var obj = window.mqlEAsBuffer[uid + ""]
									var symbolName = ""
									if (chart_id == 0) {
										symbolName = obj.symbolName
									} else {
										symbolName = getChartSymbolName(chart_id)
									}
									var lengthBytes = window.mqlEAs[obj.name].module.lengthBytesUTF8(symbolName) + 1
									var stringOnWasmHeap = window.mqlEAs[obj.name].module._malloc(lengthBytes)
									window.mqlEAs[obj.name].module.stringToUTF8(symbolName, stringOnWasmHeap, lengthBytes)
									return stringOnWasmHeap
								}, "iii")
								var jPeriod = Module.addFunction(function (uid) {
									var obj = window.mqlEAsBuffer[uid + ""]
									return obj.convertTimeFrame(obj.timeFrame)
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
									return getMagicNumber(obj.orderOrTrade)
								}, "ii")
								var jOrderOpenTime = Module.addFunction(function (uid) {
									var obj = window.mqlEAsBuffer[uid + ""]
									return getOrderTradeTime(obj.orderOrTrade)
								}, "ii")
								var jOrderComment = Module.addFunction(function (uid) {
									var obj = window.mqlEAsBuffer[uid + ""]
									var comment = getComment(obj.orderOrTrade)
									var lengthBytes = window.mqlEAs[obj.name].module.lengthBytesUTF8(comment) + 1
								  var stringOnWasmHeap = window.mqlEAs[obj.name].module._malloc(lengthBytes)
								  window.mqlEAs[obj.name].module.stringToUTF8(comment, stringOnWasmHeap, lengthBytes)
								  return stringOnWasmHeap
								}, "ii")
								var jOrderExpiration = Module.addFunction(function (uid) {
									var obj = window.mqlEAsBuffer[uid + ""]
									return getExpiration(obj.orderOrTrade)
								}, "ii")
								var jOrderPrint = Module.addFunction(function (uid) {
									var orderOrTrade = window.mqlEAsBuffer[uid + ""].orderOrTrade
									// todo add more information
									return printMessage(getId(orderOrTrade) + " " + getOrderTradeTime(orderOrTrade) + " " + getOrderType(orderOrTrade) + " " + getOrderTradeLots(orderOrTrade) + " " +
													getSymbolName(orderOrTrade) + " " + getOrderTradePrice(orderOrTrade) + " " + getStopLoss(orderOrTrade) + " " + getTakeProfit(orderOrTrade))
								}, "vi")
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
								var jiHighest = Module.addFunction(function (uid, chartHandle, mode, count, start) {
									var obj = window.mqlEAsBuffer[uid + ""]
									var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
									var arr = getData(obj.context, chartHandle, md)
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
									var obj = window.mqlEAsBuffer[uid + ""]
									var md = window.mqlEAs[obj.name].module.UTF8ToString(mode)
									var arr = getData(obj.context, chartHandle, md)
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
										return arr[arr.length - shift - 1]
									} else if (md == "teeth") {
										return arr[arr.length - shift - 1]
									} else {
										return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
									return arr[arr.length - shift - 1]
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
								var jIsTesting = Module.addFunction(function () {
									return isTesting() ? 1 : 0
								}, "i")
								var jMarketInfo = Module.addFunction(function (uid, symbol, type) {
									var obj = window.mqlEAsBuffer[uid + ""]
									var symbolName = window.mqlEAs[obj.name].module.UTF8ToString(symbol)
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
								var jCreateNeuralNetwork = Module.addFunction(function (uid, name, nnJson) {
									var obj = window.mqlEAsBuffer[uid + ""]
								  var nnName = window.mqlEAs[obj.name].module.UTF8ToString(name)
									var neuralNetworkJson = window.mqlEAs[obj.name].module.UTF8ToString(nnJson)
									if (nnName != "" && neuralNetworkJson != "" && typeof obj.neuralNetworks[nnName] == "undefined") {
										obj.neuralNetworks[nnName] = {
											perceptron: synaptic.Network.fromJSON(JSON.parse(neuralNetworkJson))
										}
										return 1
									} else {
										return 0
									}
								}, "iiii")
								var jActivateNeuralNetwork = Module.addFunction(function (uid, name, input, inputNum) {
									var obj = window.mqlEAsBuffer[uid + ""]
								  var nnName = window.mqlEAs[obj.name].module.UTF8ToString(name)
								  var nByteDouble = 8
								  var data = new Array(inputNum)
								  for (var i = 0; i < data.length; i++) {
								    data[i] = window.mqlEAs[obj.name].module.getValue(input + i * nByteDouble, "double")
								  }
								  if (typeof obj.neuralNetworks[nnName] != "undefined" && typeof obj.neuralNetworks[nnName].perceptron != "undefined") {
								    return obj.neuralNetworks[nnName].perceptron.activate(data)[0]
								  } else {
										return 0.5
									}
								}, "diiii")

						    window.mqlEAs[definition.name] = {
									definition: definition,
									module: Module,
									setParamInt: Module.cwrap("setParamInt", null, ["number", "number"]),
									setParamDouble: Module.cwrap("setParamDouble", null, ["number", "number"]),
									setParamBool: Module.cwrap("setParamBool", null, ["number", "number"]),
									setParamString: Module.cwrap("setParamString", null, ["number", "string"]),
									onInit: Module.cwrap("onInit", null, ["number"]),
									onDeinit: Module.cwrap("onDeinit", null, ["number", "number"]),
									onTick: Module.cwrap("onTick", null, ["number", "number", "number", "number", "number", "number"]),
									setjPrint: Module.cwrap("setjPrint", null, ["number"]),
									setjChartClose: Module.cwrap("setjChartClose", null, ["number"]),
									setjChartID: Module.cwrap("setjChartID", null, ["number"]),
									setjChartOpen: Module.cwrap("setjChartOpen", null, ["number"]),
									setjChartPeriod: Module.cwrap("setjChartPeriod", null, ["number"]),
									setjChartSymbol: Module.cwrap("setjChartSymbol", null, ["number"]),
									setjPeriod: Module.cwrap("setjPeriod", null, ["number"]),
									setjSymbol: Module.cwrap("setjSymbol", null, ["number"]),
									setjAccountBalance: Module.cwrap("setjAccountBalance", null, ["number"]),
									setjAccountCompany: Module.cwrap("setjAccountCompany", null, ["number"]),
									setjAccountCurrency: Module.cwrap("setjAccountCurrency", null, ["number"]),
									setjAccountEquity: Module.cwrap("setjAccountEquity", null, ["number"]),
									setjAccountFreeMargin: Module.cwrap("setjAccountFreeMargin", null, ["number"]),
									setjAccountMargin: Module.cwrap("setjAccountMargin", null, ["number"]),
									setjAccountProfit: Module.cwrap("setjAccountProfit", null, ["number"]),
									setjOrdersTotal: Module.cwrap("setjOrdersTotal", null, ["number"]),
									setjOrdersHistoryTotal: Module.cwrap("setjOrdersHistoryTotal", null, ["number"]),
									setjOrderSelect: Module.cwrap("setjOrderSelect", null, ["number"]),
									setjOrderOpenPrice: Module.cwrap("setjOrderOpenPrice", null, ["number"]),
									setjOrderType: Module.cwrap("setjOrderType", null, ["number"]),
									setjOrderTakeProfit: Module.cwrap("setjOrderTakeProfit", null, ["number"]),
									setjOrderStopLoss: Module.cwrap("setjOrderStopLoss", null, ["number"]),
									setjOrderLots: Module.cwrap("setjOrderLots", null, ["number"]),
									setjOrderProfit: Module.cwrap("setjOrderProfit", null, ["number"]),
									setjOrderSymbol: Module.cwrap("setjOrderSymbol", null, ["number"]),
									setjOrderTicket: Module.cwrap("setjOrderTicket", null, ["number"]),
									setjOrderMagicNumber: Module.cwrap("setjOrderMagicNumber", null, ["number"]),
									setjOrderOpenTime: Module.cwrap("setjOrderOpenTime", null, ["number"]),
									setjOrderComment: Module.cwrap("setjOrderComment", null, ["number"]),
									setjOrderExpiration: Module.cwrap("setjOrderExpiration", null, ["number"]),
									setjOrderPrint: Module.cwrap("setjOrderPrint", null, ["number"]),
									setjiTimeInit: Module.cwrap("setjiTimeInit", null, ["number"]),
									setjiTime: Module.cwrap("setjiTime", null, ["number"]),
									setjiOpenInit: Module.cwrap("setjiOpenInit", null, ["number"]),
									setjiOpen: Module.cwrap("setjiOpen", null, ["number"]),
									setjiHighInit: Module.cwrap("setjiHighInit", null, ["number"]),
									setjiHigh: Module.cwrap("setjiHigh", null, ["number"]),
									setjiLowInit: Module.cwrap("setjiLowInit", null, ["number"]),
									setjiLow: Module.cwrap("setjiLow", null, ["number"]),
									setjiCloseInit: Module.cwrap("setjiCloseInit", null, ["number"]),
									setjiClose: Module.cwrap("setjiClose", null, ["number"]),
									setjiVolumeInit: Module.cwrap("setjiVolumeInit", null, ["number"]),
									setjiVolume: Module.cwrap("setjiVolume", null, ["number"]),
									setjiHighest: Module.cwrap("setjiHighest", null, ["number"]),
									setjiLowest: Module.cwrap("setjiLowest", null, ["number"]),
									setjiACInit: Module.cwrap("setjiACInit", null, ["number"]),
									setjiAC: Module.cwrap("setjiAC", null, ["number"]),
									setjiADXInit: Module.cwrap("setjiADXInit", null, ["number"]),
									setjiADX: Module.cwrap("setjiADX", null, ["number"]),
									setjiAlligatorInit: Module.cwrap("setjiAlligatorInit", null, ["number"]),
									setjiAlligator: Module.cwrap("setjiAlligator", null, ["number"]),
									setjiAOInit: Module.cwrap("setjiAOInit", null, ["number"]),
									setjiAO: Module.cwrap("setjiAO", null, ["number"]),
									setjiATRInit: Module.cwrap("setjiATRInit", null, ["number"]),
									setjiATR: Module.cwrap("setjiATR", null, ["number"]),
									setjiBearsPowerInit: Module.cwrap("setjiBearsPowerInit", null, ["number"]),
									setjiBearsPower: Module.cwrap("setjiBearsPower", null, ["number"]),
									setjiBandsInit: Module.cwrap("setjiBandsInit", null, ["number"]),
									setjiBands: Module.cwrap("setjiBands", null, ["number"]),
									setjiBandsOnArray: Module.cwrap("setjiBandsOnArray", null, ["number"]),
									setjiBullsPowerInit: Module.cwrap("setjiBullsPowerInit", null, ["number"]),
									setjiBullsPower: Module.cwrap("setjiBullsPower", null, ["number"]),
									setjiCCIInit: Module.cwrap("setjiCCIInit", null, ["number"]),
									setjiCCI: Module.cwrap("setjiCCI", null, ["number"]),
									setjiCCIOnArray: Module.cwrap("setjiCCIOnArray", null, ["number"]),
									setjiCustomInit: Module.cwrap("setjiCustomInit", null, ["number"]),
									setjiCustom: Module.cwrap("setjiCustom", null, ["number"]),
									setjiDeMarkerInit: Module.cwrap("setjiDeMarkerInit", null, ["number"]),
									setjiDeMarker: Module.cwrap("setjiDeMarker", null, ["number"]),
									setjiEnvelopesInit: Module.cwrap("setjiEnvelopesInit", null, ["number"]),
									setjiEnvelopes: Module.cwrap("setjiEnvelopes", null, ["number"]),
									setjiEnvelopesOnArray: Module.cwrap("setjiEnvelopesOnArray", null, ["number"]),
									setjiFractalsInit: Module.cwrap("setjiFractalsInit", null, ["number"]),
									setjiFractals: Module.cwrap("setjiFractals", null, ["number"]),
									setjiIchimokuInit: Module.cwrap("setjiIchimokuInit", null, ["number"]),
									setjiIchimoku: Module.cwrap("setjiIchimoku", null, ["number"]),
									setjiMAInit: Module.cwrap("setjiMAInit", null, ["number"]),
									setjiMA: Module.cwrap("setjiMA", null, ["number"]),
									setjiMAOnArray: Module.cwrap("setjiMAOnArray", null, ["number"]),
									setjiMACDInit: Module.cwrap("setjiMACDInit", null, ["number"]),
									setjiMACD: Module.cwrap("setjiMACD", null, ["number"]),
									setjiMomentumInit: Module.cwrap("setjiMomentumInit", null, ["number"]),
									setjiMomentum: Module.cwrap("setjiMomentum", null, ["number"]),
									setjiMomentumOnArray: Module.cwrap("setjiMomentumOnArray", null, ["number"]),
									setjiRSIInit: Module.cwrap("setjiRSIInit", null, ["number"]),
									setjiRSI: Module.cwrap("setjiRSI", null, ["number"]),
									setjiRSIOnArray: Module.cwrap("setjiRSIOnArray", null, ["number"]),
									setjiRVIInit: Module.cwrap("setjiRVIInit", null, ["number"]),
									setjiRVI: Module.cwrap("setjiRVI", null, ["number"]),
									setjiSARInit: Module.cwrap("setjiSARInit", null, ["number"]),
									setjiSAR: Module.cwrap("setjiSAR", null, ["number"]),
									setjiStochasticInit: Module.cwrap("setjiStochasticInit", null, ["number"]),
									setjiStochastic: Module.cwrap("setjiStochastic", null, ["number"]),
									setjiWPRInit: Module.cwrap("setjiWPRInit", null, ["number"]),
									setjiWPR: Module.cwrap("setjiWPR", null, ["number"]),
									setjARROW_CHECKCreate: Module.cwrap("setjARROW_CHECKCreate", null, ["number"]),
									setjARROW_CHECKDelete: Module.cwrap("setjARROW_CHECKDelete", null, ["number"]),
									setjIsTesting: Module.cwrap("setjIsTesting", null, ["number"]),
									setjMarketInfo: Module.cwrap("setjMarketInfo", null, ["number"]),
									setjCreateNeuralNetwork: Module.cwrap("setjCreateNeuralNetwork", null, ["number"]),
									setjActivateNeuralNetwork: Module.cwrap("setjActivateNeuralNetwork", null, ["number"])
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
								window.mqlEAs[definition.name].setjOrderComment(jOrderComment)
								window.mqlEAs[definition.name].setjOrderExpiration(jOrderExpiration)
								window.mqlEAs[definition.name].setjOrderPrint(jOrderPrint)
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
								window.mqlEAs[definition.name].setjiHighest(jiHighest)
								window.mqlEAs[definition.name].setjiLowest(jiLowest)
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
								window.mqlEAs[definition.name].setjIsTesting(jIsTesting)
								window.mqlEAs[definition.name].setjMarketInfo(jMarketInfo)
								window.mqlEAs[definition.name].setjCreateNeuralNetwork(jCreateNeuralNetwork)
								window.mqlEAs[definition.name].setjActivateNeuralNetwork(jActivateNeuralNetwork)

								rs(definition)
							}) // Module["onRuntimeInitialized"]
						})
						.catch(function () {
							rj()
						})
					})
				},
				saveMqlEA: function (definition, bAdd) {
					if (typeof localStorage.reservedZone == "undefined") {
						if (bAdd) {
							localStorage.reservedZone = JSON.stringify({allMqlEAs: [definition]})
						}
					} else {
						var reservedZone = JSON.parse(localStorage.reservedZone)
						if (typeof reservedZone.allMqlEAs == "undefined") {
							if (bAdd) {
								reservedZone.allMqlEAs = [definition]
							}
						} else {
							for (var i in reservedZone.allMqlEAs) {
								if (reservedZone.allMqlEAs[i].name == definition.name) {
									reservedZone.allMqlEAs.splice(i, 1)
									break
								}
							}
							if (bAdd) {
								reservedZone.allMqlEAs.push(definition)
							}
						}
						localStorage.reservedZone = JSON.stringify(reservedZone)
					}
				},
				removeScript: function (url) {
					var tags = document.getElementsByTagName("script")
					for (var i = tags.length - 1; i >= 0; i--) {
						if (tags[i] && tags[i].getAttribute("src") != null && tags[i].getAttribute("src") == url) {
							tags[i].parentNode.removeChild(tags[i])
							break
						}
					}
				},
				loadMqlPrograms: function () {
					var mqlPrograms = []

					if (typeof localStorage.reservedZone != "undefined") {
						var reservedZone = JSON.parse(localStorage.reservedZone)

						if (typeof reservedZone.allMqlIndis != "undefined") {
							var mqlIndicatorsLoaded = (typeof window.mqlIndicators != "undefined" ? true : false)
							var allMqlIndis = reservedZone.allMqlIndis

							for (var i in allMqlIndis) {
								var mqlIndi = allMqlIndis[i]
								mqlPrograms.push({
									name: mqlIndi.name,
									description: mqlIndi.description,
									type: "Indicator",
									loaded: ((mqlIndicatorsLoaded && typeof window.mqlIndicators[mqlIndi.name] != "undefined") ? true : false)
								})
							}
						}

						if (typeof reservedZone.allMqlEAs != "undefined") {
							var mqlEAsLoaded = (typeof window.mqlEAs != "undefined" ? true : false)
							var allMqlEAs = reservedZone.allMqlEAs

							for (var i in allMqlEAs) {
								var mqlEA = allMqlEAs[i]
								mqlPrograms.push({
									name: mqlEA.name,
									description: mqlEA.description,
									type: "EA",
									loaded: ((mqlEAsLoaded && typeof window.mqlEAs[mqlEA.name] != "undefined") ? true : false)
								})
							}
						}
					}

					return mqlPrograms
				},
				showMqlPrograms: function (mqlPrograms) {
					$("#mql_based_programs_list").DataTable().clear().draw()

					for (var i in mqlPrograms) {
						var mqlProgram = mqlPrograms[i]

						var row = $("#mql_based_programs_list").DataTable().row.add([
							mqlProgram.name,
							mqlProgram.description,
							mqlProgram.type,
							mqlProgram.loaded ? "Loaded" : ""
						]).draw(false)
					}
	      },
				showAddedMqlProgram: function (mqlProgram, type) {
					$("#mql_based_programs_list").DataTable().row.add([
						mqlProgram.name,
						mqlProgram.description,
						type,
						"Loaded"
					]).draw(false)
				},
				showMqlProgramNewState: function (name, type, state) {
					var data = $("#mql_based_programs_list").DataTable().rows().data()
					var rowId = -1
					for (var i in data) {
						if (data[i][0] == name && data[i][2] == type) {
							rowId = parseInt(i)
							break
						}
					}

					if (rowId != -1) {
						$("#mql_based_programs_list").dataTable().fnUpdate(state, rowId, 3, false, false)
					}
				},
				removeMqlProgram: function (name, type) {
					var data = $("#mql_based_programs_list").DataTable().rows().data()
					var rowId = -1
					for (var i in data) {
						if (data[i][0] == name && data[i][2] == type) {
							rowId = parseInt(i)
							break
						}
					}

					if (rowId != -1) {
						$("#mql_based_programs_list").dataTable().fnDeleteRow(rowId)
					}
				},
				getSelected: function () {
					var selected = []
					var mqlPrograms = $("#mql_based_programs_list").DataTable().rows(".selected").data().toArray()
					for (var i in mqlPrograms) {
						selected.push({
							name: mqlPrograms[i][0],
							type: mqlPrograms[i][2]
						})
					}
					return selected
				},
				loadSelected: function (selected) {
					var allMqlIndis = []
					var allMqlEAs = []

					if (typeof localStorage.reservedZone != "undefined") {
						var reservedZone = JSON.parse(localStorage.reservedZone)
						if (typeof reservedZone.allMqlIndis != "undefined") {
							allMqlIndis = reservedZone.allMqlIndis
						}
						if (typeof reservedZone.allMqlEAs != "undefined") {
							allMqlEAs = reservedZone.allMqlEAs
						}
					} else {
						return
					}

					var that = this

					for (var i in selected) {
						var sel = selected[i]
						if (sel.type == "Indicator") {
							for (var j in allMqlIndis) {
								var mqlIndi = allMqlIndis[j]
								if (sel.name == mqlIndi.name) {
									this.loadMqlIndicator(mqlIndi)
									.then(function (definition) {
										that.showMqlProgramNewState(definition.name, "Indicator", "Loaded")
									})
									.catch(function () {})
								}
							}
						} else if (sel.type == "EA") {
							for (var j in allMqlEAs) {
								var mqlEA = allMqlEAs[j]
								if (sel.name == mqlEA.name) {
									this.loadMqlEA(mqlEA)
									.then(function (definition) {
										that.showMqlProgramNewState(definition.name, "EA", "Loaded")
									})
									.catch(function () {})
								}
							}
						}
					}
				},
				removeSelected: function (selected) {
					var allMqlIndis = []
					var allMqlEAs = []

					if (typeof localStorage.reservedZone != "undefined") {
						var reservedZone = JSON.parse(localStorage.reservedZone)
						if (typeof reservedZone.allMqlIndis != "undefined") {
							allMqlIndis = reservedZone.allMqlIndis
						}
						if (typeof reservedZone.allMqlEAs != "undefined") {
							allMqlEAs = reservedZone.allMqlEAs
						}
					} else {
						return
					}

					var that = this

					for (var i in selected) {
						var sel = selected[i]
						if (sel.type == "Indicator") {
							for (var j in allMqlIndis) {
								var mqlIndi = allMqlIndis[j]
								if (sel.name == mqlIndi.name) {
									that.removeMqlIndicator(mqlIndi.name)
									that.removeMqlProgram(mqlIndi.name, "Indicator")
									that.saveMqlIndicator(mqlIndi, false)
									that.removeScript(mqlIndi.url)
								}
							}
						} else if (sel.type == "EA") {
							for (var j in allMqlEAs) {
								var mqlEA = allMqlEAs[j]
								if (sel.name == mqlEA.name) {
									that.removeMqlEA(mqlEA.name)
									that.removeMqlProgram(mqlEA.name, "EA")
									that.saveMqlEA(mqlEA, false)
									that.removeScript(mqlEA.url)
								}
							}
						}
					}
				},
				init: function () {
					var that = this

					if (typeof $("#mql_based_programs_dashboard").html() == "undefined") {
		        var panel = '<div class="ui form modal" id="mql_based_programs_dashboard">' +
		          '<div class="content">' +
								'<div class="row">' +
									'<div class="ui fluid action input">' +
										'<input type="text" id="mqlIndiDefinition" placeholder="Indicator Definition">' +
										'<button id="add_mql_indicator" class="ui button" style="width:130px">Add Indicator</button>' +
									'</div>' +
								'</div>' +
								'<div class="row" style="margin-top:2px">' +
									'<div class="ui fluid action input">' +
										'<input type="text" id="mqlEADefinition" placeholder="EA Definition">' +
										'<button id="add_mql_ea" class="ui button" style="width:130px">Add EA</button>' +
									'</div>' +
								'</div>' +
		            '<div class="description">' +
		              '<table id="mql_based_programs_list" class="cell-border" cellspacing="0">' +
		        			'</table>' +
		            '</div>' +
		          '</div>' +
		          '<div class="actions">' +
		            '<div class="ui button" id="load_mql_programs">Load</div>' +
								'<div class="ui button" id="remove_mql_programs">Remove</div>' +
								'<div class="ui button" id="close_mql_dashboard">Close</div>' +
		          '</div>' +
		        '</div>'

						$("#reserved_zone").append(panel)

						$("#add_mql_indicator").on("click", function () {
							var def = $("#mqlIndiDefinition").val().trim()

							if (def != "") {
								try {
									that.loadMqlIndicator(JSON.parse(def))
									.then(function (definition) {
										that.createMqlIndicator(definition)
										that.showAddedMqlProgram(definition, "Indicator")
										that.saveMqlIndicator(definition, true)
									})
									.catch(function () {})
								} catch (e) {
									popupErrorMessage(e.message)
									printErrorMessage(e.message)
								}
							}
						})

						$("#add_mql_ea").on("click", function () {
							var def = $("#mqlEADefinition").val().trim()

							if (def != "") {
								try {
									that.loadMqlEA(JSON.parse(def))
									.then(function (definition) {
										that.createMqlEA(definition)
										that.showAddedMqlProgram(definition, "EA")
										that.saveMqlEA(definition, true)
									})
									.catch(function () {})
								} catch (e) {
									popupErrorMessage(e.message)
									printErrorMessage(e.message)
								}
							}
						})

						$("#load_mql_programs").on("click", function () {
							that.loadSelected(that.getSelected())
						})

						$("#remove_mql_programs").on("click", function () {
							that.removeSelected(that.getSelected())
						})

						$("#close_mql_dashboard").on("click", function () {
							$("#mql_based_programs_dashboard").modal("hide")
						})
		      }

		      if (!$.fn.dataTable.isDataTable("#mql_based_programs_list")) {
		  			$("#mql_based_programs_list").DataTable({
		  				data: [],
		  				columns: [
		  					{title: "Name"},
		  					{title: "Description"},
		            {title: "Type"},
								{title: "State"}
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
		            {width: "20%", targets: 0, className: "dt-body-left"},
		            {width: "50%", targets: 1, className: "dt-body-left"},
		            {width: "15%", targets: 2, className: "dt-body-left"},
								{width: "15%", targets: 2, className: "dt-body-left"},
		            {targets: [0, 1, 2, 3], className: "dt-head-left"}
		          ]
		  			})

						$("#mql_based_programs_list tbody").on("click", "tr", function () {
							$(this).toggleClass("selected")
						})
		  		}

					this.showMqlPrograms(this.loadMqlPrograms())

					$("#mql_based_programs_dashboard").modal({autofocus:false}).modal("show")
				}
			}

			window.pluginForMql.init()
		},
		function (context) { // Deinit()
		},
		function (context) { // OnTick()
		}
	)
