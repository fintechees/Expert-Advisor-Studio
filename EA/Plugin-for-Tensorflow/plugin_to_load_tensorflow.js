registerEA(
	  "plugin_to_load_tensorflow",
	  "A plugin to load Tensorflow(v1.13)",
	  [{ // parameters
	    name: "tfjs",
	    value: "https://www.fintechee.com/js/tf/tf.min.js",
	    required: false,
	    type: PARAMETER_TYPE.STRING,
	    range: null
	  },{
	    name: "tfvisjs",
	    value: "https://www.fintechee.com/js/tf/tfjs-vis.js",
	    required: false,
	    type: PARAMETER_TYPE.STRING,
	    range: null
	  },{
			name: "tidyInterval",
			value: 100,
			required: false,
			type: PARAMETER_TYPE.INTEGER,
	    range: [1, 10000]
		}],
	  function (context) { // Init()
	    if (typeof tf == "undefined") {
	      var tfjs = getEAParameter(context, "tfjs")
	      var tfvisjs = getEAParameter(context, "tfvisjs")

	      var tags = document.getElementsByTagName("script")
	      for (var i = tags.length - 1; i >= 0; i--) {
	        if (tags[i] && tags[i].getAttribute("src") != null && (tags[i].getAttribute("src") == tfjs || tags[i].getAttribute("src") == tfvisjs)) {
	          tags[i].parentNode.removeChild(tags[i])
	        }
	      }

	      var script1 = document.createElement("script")
	      document.body.appendChild(script1)
	      script1.onload = function () {
	        var script2 = document.createElement("script")
		      document.body.appendChild(script2)
		      script2.onload = function () {
						// Deprecated. It will be retained for compatibility with existing source codes.
	          window.buildCnn = function (featuresNum, kernelSize, filters, strides) {
	            return new Promise(function (resolve, reject) {
	              var tfModel = window.tf.sequential()

	              tfModel.add(window.tf.layers.conv1d({
	                inputShape: [featuresNum, 1],
	                kernelSize: kernelSize,
	                filters: filters,
	                strides: strides,
	                use_bias: true,
	                activation: "relu",
	                kernelInitializer: "VarianceScaling"
	              }))

	              tfModel.add(window.tf.layers.flatten({
	              }))

	              tfModel.add(window.tf.layers.dense({
	                units: 2,
	                kernelInitializer: "VarianceScaling",
	                activation: "softmax"
	              }))

	              return resolve(tfModel)
	            })
	          }

						// substitution for buildCnn
						window.buildExtraCnn = function (featuresNum, kernelSize, filters, strides, units) {
	            return new Promise(function (resolve, reject) {
	              var tfModel = window.tf.sequential()

	              tfModel.add(window.tf.layers.conv1d({
	                inputShape: [featuresNum, 1],
	                kernelSize: kernelSize,
	                filters: filters,
	                strides: strides,
	                use_bias: true,
	                activation: "relu",
	                kernelInitializer: "VarianceScaling"
	              }))

	              tfModel.add(window.tf.layers.flatten({
	              }))

	              tfModel.add(window.tf.layers.dense({
	                units: units,
	                kernelInitializer: "VarianceScaling",
	                activation: "softmax"
	              }))

	              return resolve(tfModel)
	            })
	          }

	          window.trainCnn = function (tfModel, trainingSet, epochs, batchSize, bMonitor) {
	            if (bMonitor) {
	              printMessage("Summary: ")
	              tfModel.summary()
	            }

	            return new Promise(function (resolve, reject) {
	              try {
	                tfModel.compile({
	                  optimizer: window.tf.train.adam(),
	                  loss: "categoricalCrossentropy",
	                  metrics: ["accuracy"]
	                })

	                if (bMonitor) {
	                  tfModel.fit(trainingSet.input, trainingSet.output, {
	                    batchSize: batchSize,
	                    epochs: epochs,
	                    shuffle: true,
	                    callbacks: tfvis.show.fitCallbacks({
	                      name: "Model Training", tab: "Model", styles: { height: "500px" }
	                    }, ["loss", "val_loss", "acc", "val_acc"])
	                  }).then(function (result) {
											if (typeof result.history.loss != "undefined") {
												printMessage("Loss after last Epoch (" + result.epoch.length + ") is: " + result.history.loss[result.epoch.length-1])
											}
	                    resolve()
	                  })

	                  $("#tfjs-visor-container").show()
	                } else {
	                  tfModel.fit(trainingSet.input, trainingSet.output, {
	                    batchSize: batchSize,
	                    epochs: epochs,
	                    shuffle: true
	                  }).then(function (result) {
											if (typeof result.history.loss != "undefined") {
	                    	printMessage("Loss after last Epoch (" + result.epoch.length + ") is: " + result.history.loss[result.epoch.length-1])
											}
	                    resolve()
	                  })
	                }
	              } catch (ex) {
	                reject(ex)
	              }
	            })
	          }

						window.checkIfCnnExisted = function (tfModelName) {
							return new Promise(function (resolve, reject) {
								(async () => {
									try {
										var models = await tf.io.listModels()

										var key = `localstorage://${tfModelName}`
										if (models[key]) {
											resolve({res:true})
										} else {
											resolve({res:false})
										}
									} catch (e) {
										reject(e.message)
									}
								})()
							})
						}

						window.saveCnn = function (tfModel, tfModelName, bNotLocal) {
							return new Promise(function (resolve, reject) {
								(async () => {
									try {
										if (typeof bNotLocal == "undefined" || (typeof bNotLocal == "boolean" && !bNotLocal)) {
											await tfModel.save("localstorage://" + tfModelName)
										} else {
											await tfModel.save("downloads://" + tfModelName)
										}
										resolve()
									} catch (e) {
										reject(e.message)
									}
								})()
							})
						}

						window.loadCnn = function (tfModelName, bNotLocal, jsonFile, weightsFile) {
							return new Promise(function (resolve, reject) {
								(async () => {
									try {
										var tfModel = null
										if (typeof bNotLocal == "undefined" || (typeof bNotLocal == "boolean" && !bNotLocal)) {
											tfModel = await window.tf.loadLayersModel("localstorage://" + tfModelName)
										} else {
											tfModel = await window.tf.loadLayersModel(window.tf.io.browserFiles([jsonFile, weightsFile]))
										}
										resolve(tfModel)
									} catch (e) {
										reject(e.message)
									}
								})()
							})
						}

						window.loadRemoteCnn = function (jsonUrl) {
							return new Promise(function (resolve, reject) {
								(async () => {
									try {
										var tfModel = await window.tf.loadLayersModel(jsonUrl)

										resolve(tfModel)
									} catch (e) {
										reject(e.message)
									}
								})()
							})
						}

						// Deprecated. It will be retained for compatibility with existing source codes.
						window.runCnn = function (tfModel, input, inputNum) {
							return window.tf.tidy(function () {
								try {
									return tfModel.predict(window.tf.tensor3d(input, [1, inputNum, 1])).arraySync()[0][0]
								} catch (e) {
									return -1
								}
							})
						}

						// substitution for runCnn
						window.getArgMaxOfCnn = function (tfModel, input, inputNum) {
							return window.tf.tidy(function () {
								try {
									var arr = tfModel.predict(window.tf.tensor3d(input, [1, inputNum, 1])).arraySync()[0]
									return arr.indexOf(Math.max(...arr))
								} catch (e) {
									return -1
								}
							})
						}

						window.removeCnn = function (tfModelName) {
							try {
								window.tf.io.removeModel("localstorage://" + tfModelName)
							} catch (e) {
							}
						};

						(async function () {
							await window.tf.ready()
							if (window.tf.getBackend() == "webgl") {
								window.tf.tensor(0).dataSync()

								try {
									window.tf.env().registerFlag("WEBGL_DELETE_TEXTURE_THRESHOLD", () => 128 * 1024 * 1024, (val) => {
									})
								} catch (e) {
									window.tf.env().set("WEBGL_DELETE_TEXTURE_THRESHOLD", 128 * 1024 * 1024)
								}
							}
						})()

	          popupMessage("Tensorflow has been loaded successfully!")
	        }
	        script2.onerror = function () {
	          popupErrorMessage("Failed to load Tensorflow! Please run this plugin again.")
	        }
		      script2.async = true
		      script2.src = tfvisjs
	      }
	      script1.onerror = function () {
	        popupErrorMessage("Failed to load Tensorflow! Please run this plugin again.")
	      }
	      script1.async = true
	      script1.src = tfjs
	    }
	  },
	  function (context) { // Deinit()
	  },
	  function (context) { // OnTick()
	  }
	)
