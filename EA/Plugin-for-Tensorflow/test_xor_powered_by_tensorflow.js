registerEA(
  "test_xor_powered_by_tensorflow",
  "A test EA to train XOR by using Tensorflow2.0 (v1.0)",
  [{ // parameters
    name: "tfjs",
    value: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js",
    required: true,
    type: PARAMETER_TYPE.STRING,
    range: null
  },{
    name: "tfvisjs",
    value: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-vis",
    required: true,
    type: PARAMETER_TYPE.STRING,
    range: null
  },{
    name: "epochs",
    value: 10000,
    required: true,
    type: PARAMETER_TYPE.INTEGER,
    range: [1, 1000000]
  }],
  function (context) { // Init()
    window.epochs = getEAParameter(context, "epochs")

    if (typeof tf == "undefined") {
      var tfjs = getEAParameter(context, "tfjs")
      var tfvisjs = getEAParameter(context, "tfvisjs")

      var tags = document.getElementsByTagName("script")
      for (var i = tags.length - 1; i >= 0; i--) {
        if (tags[i] && tags[i].getAttribute("src") != null && tags[i].getAttribute("src") == tfjs && tags[i].getAttribute("src") == tfvisjs) {
          tags[i].parentNode.removeChild(tags[i])
        }
      }

      var script1 = document.createElement("script")
      document.body.appendChild(script1)
      script1.onload = function () {
        var script2 = document.createElement("script")
	      document.body.appendChild(script2)
	      script2.onload = function () {
          window.buildCnn = function () {
            return new Promise(function (resolve, reject) {
              const model = tf.sequential()

              model.add(tf.layers.inputLayer({
                inputShape: [2, 1, 1],
              }))

              model.add(tf.layers.conv2d({
                inputShape: [2, 1, 1],
                kernelSize: 1,
                filters: 2,
                strides: 1,
                use_bias: true,
                activation: "relu",
                kernelInitializer: "VarianceScaling"
              }))

              model.add(tf.layers.maxPooling2d({
                poolSize: [1, 1],
                strides: [1, 1]
              }))

              model.add(tf.layers.flatten({
              }))

              model.add(tf.layers.dense({
                units: 2,
                kernelInitializer: "VarianceScaling",
                activation: "softmax"
              }))

              return resolve(model)
            })
          }

          window.trainCnn = function (model, trainingSet) {
            printMessage("Summary: ")
            model.summary()

            return new Promise(function (resolve, reject) {
              try {
                model.compile({
                  optimizer: tf.train.adam(),
                  loss: "categoricalCrossentropy",
                  metrics: ["accuracy"]
                })

                model.fit(trainingSet.input, trainingSet.output, {
                  epochs: window.epochs,
                  shuffle: true,
                  callbacks: tfvis.show.fitCallbacks({
                    name: "Model Training", tab: "Model", styles: { height: "500px" }
                  }, ["loss", "val_loss", "acc", "val_acc"])
                }).then(function (result) {
                  printMessage("Loss after last Epoch (" + result.epoch.length + ") is: " + result.history.loss[result.epoch.length-1])
                  resolve(model)
                })
              } catch (ex) {
                reject(ex)
              }
            })
          }

          window.doCnn = function () {
            window.buildCnn().then(function (model) {
              var trainingSet = {
                input: tf.tensor4d([0, 0, 1, 1, 1, 0, 0, 1], [4, 2, 1, 1]),
                output: tf.tensor2d([0, 1, 0, 1, 1, 0, 1, 0], [4, 2])
              }

              window.trainCnn(model, trainingSet).then(function (model) {
                printMessage(model.predict(trainingSet.input))
              })
            })
          }

          window.doCnn()
        }
        script2.onerror = function () {}
	      script2.async = true
	      script2.src = tfvisjs
      }
      script1.onerror = function () {}
      script1.async = true
      script1.src = tfjs
    } else {
      window.doCnn()
    }
  },
  function (context) { // Deinit()
    delete window.epochs
  },
  function (context) { // OnTick()
  }
)
