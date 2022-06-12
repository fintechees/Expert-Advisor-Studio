registerEA(
	"sample_training_cnn_model",
	"An EA sample to train neuron model(v1.02)",
	[{
		name: "version",
		value: 1,
		required: true,
		type: PARAMETER_TYPE.NUMBER,
		range: [0, 100],
		step: null
	}, {
		name: "symbolName",
		value: "EUR/USD",
		required: true,
		type: PARAMETER_TYPE.STRING,
		range: null,
		step: null
	}, {
		name: "timeFrame",
		value: "H1",
		required: true,
		type: PARAMETER_TYPE.STRING,
		range: null,
		step: null
	}, {
		name: "inputNum",
		value: 10,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100],
		step: null
	}, {
		name: "hiddenNum",
		value: 20,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100],
		step: null
	}, {
		name: "predictNum",
		value: 10,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100],
		step: null
	}, {
		name: "iterations",
		value: 10000,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 1000000],
		step: null
	}, {
		name: "batchSize",
		value: 512,
		required: true,
		type: PARAMETER_TYPE.INTEGER,
		range: [1, 100000],
		step: null
	}, {
		name: "bContinue",
		value: false,
		required: true,
		type: PARAMETER_TYPE.BOOLEAN,
		range: null,
		step: null
	}, {
		name: "bTest",
		value: false,
		required: true,
		type: PARAMETER_TYPE.BOOLEAN,
		range: null,
		step: null
	}, {
		name: "bMem",
		value: false,
		required: true,
		type: PARAMETER_TYPE.BOOLEAN,
		range: null,
		step: null
	}, {
		name: "bMonitor",
		value: false,
		required: true,
		type: PARAMETER_TYPE.BOOLEAN,
		range: null,
		step: null
	}],
	function (context) { // Init()
	    if (typeof window.tf == "undefined") {
	      printErrorMessage("Please run the plugin to load Tensorflow first.")
	      return
	    }

	    var version = getEAParameter(context, "version")
			var symbolName = getEAParameter(context, "symbolName")
	    var timeFrame = getEAParameter(context, "timeFrame")
	    var iterations = getEAParameter(context, "iterations")
	    var inputNum = getEAParameter(context, "inputNum")
	    var hiddenNum = getEAParameter(context, "hiddenNum")
	    var predictNum = getEAParameter(context, "predictNum")
	    var bContinue = getEAParameter(context, "bContinue")
			var bTest = getEAParameter(context, "bTest")
	    var bMem = getEAParameter(context, "bMem")
	    var bMonitor = getEAParameter(context, "bMonitor")
	    var batchSize = getEAParameter(context, "batchSize")
			var tfModelName = "Fintechee " + symbolName.replace("/", "") + "-" + timeFrame + "-" + inputNum + "-" + hiddenNum + "-" + predictNum + "-" + version

	    context.buildMyCnn = function () {
	      window.buildCnn(inputNum, inputNum, hiddenNum, inputNum).then(function (tfModel) {
	        context.tfModel = tfModel
	      })
	    }

			context.runMyCnn = function (input) {
	      return window.runCnn(this.tfModel, input, inputNum)
	    }

	    context.trainMyCnn = function () {
	      printMessage("Start training!")

	      window.trainCnn(this.tfModel, window.tensorSet, iterations, batchSize, bMonitor).then(function () {
	        printMessage("Training is done!");

					window.saveCnn(context.tfModel, tfModelName)

	        var longCnt = 0
	        var shortCnt = 0
	        var longWinCnt = 0
	        var shortWinCnt = 0
	        var levelCnt = []
	        var levelWinCnt = []
	        var levelProfit = []
	        var levelLoss = []
	        var longProfit = 0
	        var shortProfit = 0
	        var longLoss = 0
	        var shortLoss = 0

	        for (var i = 0; i < window.tensorSet.lsCount; i++) {
	          var input = []

	          for (var j = 0; j < inputNum; j++) {
	            input.push(window.tensorSet.trainingSetI[i * inputNum + j])
	          }

	          var output = window.tensorSet.trainingSetO[i * 2]

	          var profit = window.tensorSet.trainingSetP[i]

	          var result = context.runMyCnn(input)
	          var resWin = (result == -1 ? false : ((result >= 0.5 ? 1 : 0) == output ? true : false))

	          var idx = Math.floor(Math.floor(result * 100) / Math.floor(100 / 10)) * Math.floor(100 / 10)

	          if (typeof levelCnt[idx] == "undefined") {
	            levelCnt[idx] = 0
	            levelWinCnt[idx] = 0
	            levelProfit[idx] = 0
	            levelLoss[idx] = 0
	          }

	          levelCnt[idx]++

	          if (resWin) {
	            if (output == 1) {
	              longCnt++
	              longWinCnt++
	              longProfit += profit
	            } else {
	              shortCnt++
	              shortWinCnt++
	              shortProfit += profit
							}
	            levelWinCnt[idx]++
	            levelProfit[idx] += profit
	          } else {
	            if (output == 1) {
	              shortCnt++
	              shortLoss += profit
	            } else {
	              longCnt++
	              longLoss += profit
	            }
	            levelLoss[idx] += profit
	          }
	        }

	        printMessage(tfModelName)

	        printMessage("Long: " + longCnt + ", " + (longWinCnt / window.tensorSet.lsCount) + ", " + longProfit + ", " + longLoss + ", " + ((longProfit - longLoss) / longCnt))
	        printMessage("Short: " + shortCnt + ", " + (shortWinCnt / window.tensorSet.lsCount) + ", " + shortProfit + ", " + shortLoss + ", " + ((shortProfit - shortLoss) / shortCnt))

	        for (var i in levelCnt) {
	          printMessage(i + ", " + levelCnt[i] + ", " + (levelWinCnt[i] / levelCnt[i]) + ", " + levelProfit[i] + ", " + levelLoss[i] + ", " + ((levelProfit[i] - levelLoss[i]) / levelCnt[i]))
	        }

	        $("#tfjs-visor-container").hide()
	      })
	    }

	    context.testMyCnn = function () {
	      printMessage("Start testing!")

	      var longCnt = 0
	      var shortCnt = 0
	      var longWinCnt = 0
	      var shortWinCnt = 0
	      var levelCnt = []
	      var levelWinCnt = []
	      var levelProfit = []
	      var levelLoss = []
	      var longProfit = 0
	      var shortProfit = 0
	      var longLoss = 0
	      var shortLoss = 0

	      for (var i = 0; i < window.tensorSet.testLsCount; i++) {
	        var input = []

	        for (var j = 0; j < inputNum; j++) {
	          input.push(window.tensorSet.testSetI[i * inputNum + j])
	        }

	        var output = window.tensorSet.testSetO[i * 2]

	        var profit = window.tensorSet.testSetP[i]

					var result = this.runMyCnn(input)
					var resWin = (result == -1 ? false : ((result >= 0.5 ? 1 : 0) == output ? true : false))

	        var idx = Math.floor(Math.floor(result * 100) / Math.floor(100 / 10)) * Math.floor(100 / 10)

	        if (typeof levelCnt[idx] == "undefined") {
	          levelCnt[idx] = 0
	          levelWinCnt[idx] = 0
	          levelProfit[idx] = 0
	          levelLoss[idx] = 0
	        }

	        levelCnt[idx]++

	        if (resWin) {
	          if (output == 1) {
	            longCnt++
	            longWinCnt++
	            longProfit += profit
	          } else {
	            shortCnt++
	            shortWinCnt++
	            shortProfit += profit
	          }
	          levelWinCnt[idx]++
	          levelProfit[idx] += profit
	        } else {
	          if (output == 1) {
	            shortCnt++
	            shortLoss += profit
	          } else {
	            longCnt++
	            longLoss += profit
	          }
	          levelLoss[idx] += profit
	        }
	      }

	      printMessage(tfModelName)

	      printMessage("Long: " + longCnt + ", " + (longWinCnt / window.tensorSet.testLsCount) + ", " + longProfit + ", " + longLoss + ", " + ((longProfit - longLoss) / longCnt))
	      printMessage("Short: " + shortCnt + ", " + (shortWinCnt / window.tensorSet.testLsCount) + ", " + shortProfit + ", " + shortLoss + ", " + ((shortProfit - shortLoss) / shortCnt))

	      for (var i in levelCnt) {
	        printMessage(i + ", " + levelCnt[i] + ", " + (levelWinCnt[i] / levelCnt[i]) + ", " + levelProfit[i] + ", " + levelLoss[i] + ", " + ((levelProfit[i] - levelLoss[i]) / levelCnt[i]))
	      }

	      printMessage("Testing is done!")
	    }

			if (bContinue) {
        try {
					window.loadCnn(tfModelName)
					.then(function (tfModel) {
						context.tfModel = tfModel

						if (typeof window.tensorSet != "undefined") {
	            if (bMem) {
	              if (bTest) {
	                setTimeout(function () {context.testMyCnn()}, 5000)
	              } else {
	                setTimeout(function () {context.trainMyCnn()}, 5000)
	              }
	            }
	          }
					})
        } catch (e) {
          popupErrorMessage("Failed to load CNN model.")
        }
	    } else {
	      context.buildMyCnn()
	    }

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
	  },
	function (context) { // Deinit()
	    if (typeof window.tf == "undefined") {
	      printErrorMessage("Please run the plugin to load Tensorflow first.")
	      return
	    }

	    var bMem = getEAParameter(context, "bMem")
	    if (bMem && typeof window.tensorSet != "undefined") {
	      return
	    }

	    var version = getEAParameter(context, "version")
	    var inputNum = getEAParameter(context, "inputNum")
	    var predictNum = getEAParameter(context, "predictNum")
			var bTest = getEAParameter(context, "bTest")
			var arrOpen = getData(context, context.chartHandle, DATA_NAME.OPEN)
	    var arrMain = getData(context, context.indiHandleMacd, "main")

	    if (200 >= arrMain.length) throw new Error("No enough data.")

	    var trainingSetI = []
	    var trainingSetO = []
	    var trainingSetP = []
			var longCount = 0
			var shortCount = 0

			for (var i = 26 + inputNum; i < arrMain.length - predictNum - 1; i++) {
        var input = []
        var highVal = 0
        var lowVal = 9999999999

        for (var j = inputNum - 1; j >= 0; j--) {
          if (arrMain[i - j] > highVal) {
            highVal = arrMain[i - j]
          }
          if (arrMain[i - j] < lowVal) {
            lowVal = arrMain[i - j]
          }
        }

        var height = highVal - lowVal
        if (height <= 0) {
          continue
        }

        for (var j = inputNum - 1; j >= 0; j--) {
          input.push((arrMain[i - j] - lowVal) / height)
        }

        trainingSetI = trainingSetI.concat(input)

        if (arrOpen[i + 1 + predictNum] - arrOpen[i + 1] >= 0) {
          trainingSetO = trainingSetO.concat([1, 0])
          longCount++
          trainingSetP.push(arrOpen[i + 1 + predictNum] - arrOpen[i + 1])
        } else {
          trainingSetO = trainingSetO.concat([0, 1])
          shortCount++
          trainingSetP.push(arrOpen[i + 1] - arrOpen[i + 1 + predictNum])
        }
      }

	    var lsCount = longCount + shortCount

	    if (!bTest) {
	      var tensorSet = {
	        lsCount: lsCount,
	        trainingSetI: trainingSetI,
	        trainingSetO: trainingSetO,
	        trainingSetP: trainingSetP,
	        input: window.tf.tensor3d(trainingSetI, [lsCount, inputNum, 1]),
	        output: window.tf.tensor2d(trainingSetO, [lsCount, 2]),
	      }

	      if (typeof window.tensorSet == "undefined") {
	        tensorSet.testLsCount = lsCount
	        tensorSet.testSetI = trainingSetI
	        tensorSet.testSetO = trainingSetO
	        tensorSet.testSetP = trainingSetP
	        tensorSet.testInput = window.tf.tensor3d(trainingSetI, [lsCount, inputNum, 1])
	        tensorSet.testOutput = window.tf.tensor2d(trainingSetO, [lsCount, 2])
	      } else {
	        tensorSet.testLsCount = window.tensorSet.testLsCount
	        tensorSet.testSetI = window.tensorSet.testSetI
	        tensorSet.testSetO = window.tensorSet.testSetO
	        tensorSet.testSetP = window.tensorSet.testSetP
	        tensorSet.testInput = window.tensorSet.testInput
	        tensorSet.testOutput = window.tensorSet.testOutput
	      }

	      window.tensorSet = tensorSet

	      context.trainMyCnn()
	    } else {
	      var tensorSet = {
	        testLsCount: lsCount,
	        testSetI: trainingSetI,
	        testSetO: trainingSetO,
	        testSetP: trainingSetP,
	        testInput: window.tf.tensor3d(trainingSetI, [lsCount, inputNum, 1]),
	        testOutput: window.tf.tensor2d(trainingSetO, [lsCount, 2])
	      }

	      if (typeof window.tensorSet == "undefined") {
	        tensorSet.lsCount = lsCount
	        tensorSet.trainingSetI = trainingSetI
	        tensorSet.trainingSetO = trainingSetO
	        tensorSet.trainingSetP = trainingSetP
	        tensorSet.input = window.tf.tensor3d(trainingSetI, [lsCount, inputNum, 1])
	        tensorSet.output = window.tf.tensor2d(trainingSetO, [lsCount, 2])
	      } else {
	        tensorSet.lsCount = window.tensorSet.lsCount
	        tensorSet.trainingSetI = window.tensorSet.trainingSetI
	        tensorSet.trainingSetO = window.tensorSet.trainingSetO
	        tensorSet.trainingSetP = window.tensorSet.trainingSetP
	        tensorSet.input = window.tensorSet.input
	        tensorSet.output = window.tensorSet.output
	      }

	      window.tensorSet = tensorSet

	      context.testMyCnn()
	    }

	    printMessage("Training Set or Testing Set: " + longCount + ", " + shortCount)
	  },
	function (context) { // OnTick()
	},
	function (context) { // OnTransaction()
	}
	)
