registerEA(
		"sample_training_neuron_model",
		"A test EA to train neuron model(v1.03)",
		[{ // parameters
			name: "period",
			value: 20,
			required: true,
			type: PARAMETER_TYPE.INTEGER,
			range: [1, 100]
		},{
			name: "inputNum",
			value: 20,
			required: true,
			type: PARAMETER_TYPE.INTEGER,
			range: [1, 100]
		},{
			name: "hiddenNum",
			value: 50,
			required: true,
			type: PARAMETER_TYPE.INTEGER,
			range: [1, 100]
		},{
			name: "diffPrice",
			value: 0.0001,
			required: true,
			type: PARAMETER_TYPE.NUMBER,
			range: [0, 10]
		}],
		function (context) { // Init()
			var account = getAccount(context, 0)
			var brokerName = getBrokerNameOfAccount(account)
			var accountId = getAccountIdOfAccount(account)
			var symbolName = "EUR/USD"

			context.chartHandle = getChartHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1)
			var period = getEAParameter(context, "period")
			context.indiHandle = getIndicatorHandle(context, brokerName, accountId, symbolName, TIME_FRAME.M1, "rsi", [{
				name: "period",
				value: period
			}])
		},
		function (context) { // Deinit()
			var period = getEAParameter(context, "period")
			var inputNum = getEAParameter(context, "inputNum")
			var hiddenNum = getEAParameter(context, "hiddenNum")
			var arrOpen = getData(context, context.chartHandle, DATA_NAME.OPEN)
			var arrClose = getData(context, context.chartHandle, DATA_NAME.CLOSE)
			var arrRsi = getData(context, context.indiHandle, "rsi")

			if (arrRsi.length <= period + 1) return
			if (inputNum + period - 1 > arrRsi.length) throw new Error("No enough data.")

			// extend the prototype chain
			Perceptron.prototype = new synaptic.Network()
			Perceptron.prototype.constructor = Perceptron

			var myPerceptron = new Perceptron(inputNum, hiddenNum, 1)
			var myTrainer = new synaptic.Trainer(myPerceptron)

			var diffPrice = getEAParameter(context, "diffPrice")
			var trainingSet = []
			var longCount = 0
			var shortCount = 0

			for (var i = period - 1; i < arrRsi.length - inputNum; i++) {
				if (arrClose[i * inputNum + inputNum] - arrOpen[i * inputNum + inputNum] > diffPrice) {
					var input = []

					for (var j = 0; j < inputNum; j++) {
						input.push(arrRsi[i * inputNum + j] / 100)
					}

					trainingSet.push({
						input: input,
						output: [0]
					})

					longCount++
				} else if (arrOpen[i * inputNum + inputNum] - arrClose[i * inputNum + inputNum] > diffPrice) {
					var input = []

					for (var j = 0; j < inputNum; j++) {
						input.push(arrRsi[i * inputNum + j] / 100)
					}

					trainingSet.push({
						input: input,
						output: [1]
					})

					shortCount++
				}
			}

			myTrainer.train(trainingSet)

			// We use localstorage.reservedZone to store the neural network.
			// Please don't change the name "reservedZone" or your data stored in this zone will be removed while the version is updated.
			if (typeof localStorage.reservedZone == "undefined") {
				localStorage.reservedZone = JSON.stringify({sample_training_neuron_model: myPerceptron.toJSON()})
			} else {
				var reservedZone = JSON.parse(localStorage.reservedZone)
				reservedZone.sample_training_neuron_model = myPerceptron.toJSON()
				localStorage.reservedZone = JSON.stringify(reservedZone)
			}

			printMessage(longCount + ", " + shortCount)
			printMessage(JSON.stringify(trainingSet))
			printMessage(JSON.stringify(myPerceptron.toJSON()))
		},
		function (context) { // OnTick()
		}
	)
