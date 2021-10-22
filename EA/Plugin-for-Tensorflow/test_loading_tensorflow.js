registerEA(
  "test_loading_tensorflow",
  "A test EA to load Tensorflow2.0 (v1.0)",
  [{ // parameters
    name: "url",
    value: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js",
    required: true,
    type: PARAMETER_TYPE.STRING,
    range: null
  }],
  function (context) { // Init()
    if (typeof tf == "undefined") {
      var url = getEAParameter(context, "url")

      var tags = document.getElementsByTagName("script")
      for (var i = tags.length - 1; i >= 0; i--) {
        if (tags[i] && tags[i].getAttribute("src") != null && tags[i].getAttribute("src") == url) {
          tags[i].parentNode.removeChild(tags[i])
        }
      }

      var script1 = document.createElement("script")
      document.body.appendChild(script1)
      script1.onload = function () {
      }
      script1.onerror = function () {}
      script1.async = true
      script1.src = url
    }
  },
  function (context) { // Deinit()
  },
  function (context) { // OnTick()
  }
)
