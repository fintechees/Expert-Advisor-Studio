registerEA(
		"payment_gateway_eos",
		"A payment gateway plugin to make you fund(deposit or withdraw) via EOS platform(v1.01)",
		[{ // parameters
			name: "from",
			value: "",
			required: false,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "to",
			value: "",
			required: false,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "amount",
			value: 0,
			required: true,
			type: PARAMETER_TYPE.INTEGER,
			range: [0, null]
		}, {
			name: "currency",
			value: "SYS",
			required: true,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "memo",
			value: "",
			required: false,
			type: PARAMETER_TYPE.STRING,
			range: null
		}],
		function (context) { // Init()
			var from = getEAParameter(context, "from")
			var to = getEAParameter(context, "to")
			var amount = getEAParameter(context, "amount")
			var currency = getEAParameter(context, "currency")
			var memo = getEAParameter(context, "memo")

			if (from == null || from == "") {
				popupErrorMessage("The sender should not be empty.")
				return
			}
			if (to == null || to == "") {
				popupErrorMessage("The receiver should not be empty.")
				return
			}
			if (amount <= 0) {
				popupErrorMessage("The amount should be greater than zero.")
				return
			}
			if (memo == null) {
				memo = ""
			}

	    (async () => {
	      try {
	        const result = await window.eos_api.transact({
	          actions: [{
	              account: from,
	              name: "transfer",
	              authorization: [{
	                  actor: from,
	                  permission: "active",
	              }],
	              data: {
	                  from: from,
	                  to: to,
	                  quantity: Math.floor(amount) + ".0000 " + currency,
	                  memo: memo,
	              },
	          }]
	        }, {
	          blocksBehind: 3,
	          expireSeconds: 30,
	        })

	        popupMessage("Transaction pushed!\n\n" + JSON.stringify(result, null, 2))
	      } catch (e) {
					popupErrorMessage("Caught exception: " + e)

	        if (e instanceof window.eosjs_jsonrpc.RpcError) {
						popupErrorMessage(JSON.stringify(e.json, null, 2))
					}
	      }
	    })()
		},
		function (context) { // Deinit()
		},
		function (context) { // OnTick()
		}
	)
