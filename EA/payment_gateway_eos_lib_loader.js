registerEA(
		"payment_gateway_eos_lib_loader",
		"A payment gateway plugin to load EOS libraries(v1.01)",
		[{ // parameters
			name: "privateKey",
			value: "",
			required: false,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "jsonRpcUrl",
			value: "https://nodes.get-scatter.com",
			required: true,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "jssig",
			value: "https://www.fintechee.com/js/eos/eosjs-jssig.min.js",
			required: true,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "jsonrpc",
			value: "https://www.fintechee.com/js/eos/eosjs-jsonrpc.min.js",
			required: true,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "api",
			value: "https://www.fintechee.com/js/eos/eosjs-api.min.js",
			required: true,
			type: PARAMETER_TYPE.STRING,
			range: null
		}],
		function (context) { // Init()
			var defaultPrivateKey = getEAParameter(context, "privateKey")
			var jsonRpcUrl = getEAParameter(context, "jsonRpcUrl")
			var jssig = getEAParameter(context, "jssig")
			var jsonrpc = getEAParameter(context, "jsonrpc")
			var api = getEAParameter(context, "api")

			if (defaultPrivateKey == null || defaultPrivateKey == "") {
				popupErrorMessage("The private key should not be empty.")
				return
			}

			var tags = document.getElementsByTagName("script")
			for (var i = tags.length - 1; i >= 0; i--) {
				if (tags[i] && tags[i].getAttribute("src") != null && (tags[i].getAttribute("src") == jssig || tags[i].getAttribute("src") == jsonrpc || tags[i].getAttribute("src") == api)) {
					tags[i].parentNode.removeChild(tags[i])
				}
			}

			var script1 = document.createElement("script")
	    document.body.appendChild(script1)
	    script1.onload = function () {
	      var script2 = document.createElement("script")
	      document.body.appendChild(script2)
	      script2.onload = function () {
	        var script3 = document.createElement("script")
	        document.body.appendChild(script3)
	        script3.onload = function () {
						window.eosjs_jsonrpc = eosjs_jsonrpc
						var eos_rpc = new eosjs_jsonrpc.JsonRpc(jsonRpcUrl)
					  var eos_signatureProvider = new eosjs_jssig.JsSignatureProvider([defaultPrivateKey])
					  window.eos_api = new eosjs_api.Api({rpc: eos_rpc, signatureProvider: eos_signatureProvider})
					}
	        script3.onerror = function () {}
	        script3.async = true
	        script3.src = jssig
	      }
	      script2.onerror = function () {}
	      script2.async = true
	      script2.src = jsonrpc
	    }
	    script1.onerror = function () {}
	    script1.async = true
	    script1.src = api
		},
		function (context) { // Deinit()
		},
		function (context) { // OnTick()
		}
	)
