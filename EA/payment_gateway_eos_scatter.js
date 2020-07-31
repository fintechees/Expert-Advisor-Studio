registerEA(
		"payment_gateway_eos_scatter",
		"A payment gateway plugin to load the libraries of EOS and Scatter(v1.0)",
		[{ // parameters
			name: "jsonRpcUrl",
			value: "https://nodes.get-scatter.com",
			required: true,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "chainId",
			value: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
			required: true,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "scatterCore",
			value: "https://www.fintechee.com/js/eos/scatterjs-core.min.js",
			required: true,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "scatterEos",
			value: "https://www.fintechee.com/js/eos/scatterjs-plugin-eosjs2.min.js",
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
			var jsonRpcUrl = getEAParameter(context, "jsonRpcUrl")
			var chainId = getEAParameter(context, "chainId")
			var scatterCore = getEAParameter(context, "scatterCore")
			var scatterEos = getEAParameter(context, "scatterEos")
			var jsonrpc = getEAParameter(context, "jsonrpc")
			var api = getEAParameter(context, "api")

			var tags = document.getElementsByTagName("script")
			for (var i = tags.length - 1; i >= 0; i--) {
				if (tags[i] && tags[i].getAttribute("src") != null &&
					(tags[i].getAttribute("src") == scatterCore || tags[i].getAttribute("src") == scatterEos || tags[i].getAttribute("src") == jsonrpc || tags[i].getAttribute("src") == api)) {

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
						var script4 = document.createElement("script")
		        document.body.appendChild(script4)
		        script4.onload = function () {
							var parsedJsonRpcUrl = jsonRpcUrl.split("://")
							var parsedJsonRpcUrl2 = parsedJsonRpcUrl[1].split(":")
							const network = ScatterJS.Network.fromJson({
								blockchain: "eos",
								protocol: parsedJsonRpcUrl[0],
								host: parsedJsonRpcUrl2[0],
								port: parsedJsonRpcUrl2.length == 1 ? 443 : parseInt(parsedJsonRpcUrl2[1]),
								chainId: chainId
							})
							ScatterJS.plugins(new ScatterEOS())
							ScatterJS.scatter.connect("www.fintechee.com", {network}).then(function (connected) {
								if(!connected) {
									popupErrorMessage("Failed to connect to your Scatter APP.")
									return false
								}

								const scatter = ScatterJS.scatter

								window.eosjs_jsonrpc = eosjs_jsonrpc
								var eos_rpc = new eosjs_jsonrpc.JsonRpc(jsonRpcUrl)

								window.eos_api = scatter.eos(network, eosjs_api.Api, {rpc: eos_rpc});

								(async function () {
									if (scatter.identity) {
										scatter.logout()
									}

									await scatter.login()
									window.scatter = scatter

									popupMessage("Connected to Scatter successfully!")
								})()
								window.ScatterJS = null
							})
						}
		        script4.onerror = function () {}
		        script4.async = true
		        script4.src = scatterEos
					}
	        script3.onerror = function () {}
	        script3.async = true
	        script3.src = scatterCore
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
			window.scatter.logout()
			window.scatter = null
		},
		function (context) { // OnTick()
		}
	)
