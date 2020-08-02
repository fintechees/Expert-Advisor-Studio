registerEA(
		"decentralized_exchange_eos_exec",
		"A decentralized exchange plugin to execute a transaction of exchanging digital assets via EOS platform(v1.0)",
		[{ // parameters
			name: "proposalName",
			value: "",
			required: false,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "proposer",
			value: "",
			required: false,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "executor",
			value: "",
			required: false,
			type: PARAMETER_TYPE.STRING,
			range: null
		}],
		function (context) { // Init()
			var proposalName = getEAParameter(context, "proposalName")
			var proposer = getEAParameter(context, "proposer")
			var executor = getEAParameter(context, "executor")

			if (proposalName == null || proposalName == "") {
				popupErrorMessage("The proposal name should not be empty.")
				return
			}
			if (proposer == null || proposer == "") {
				popupErrorMessage("The proposer should not be empty.")
				return
			}
			if (executor == null || executor == "") {
				popupErrorMessage("The executor should not be empty.")
				return
			}

			(async () => {
				try {
					const result = await window.eos_api.transact({
						actions: [{
							account: "eosio.msig",
							name: "exec",
							authorization: [{
								actor: executor,
								permission: "active"
							}],
							data: {
								proposer: proposer,
								proposal_name: proposalName,
								executer: executor
							}
						}]
					}, {
						blocksBehind: 3,
						expireSeconds: 30,
						broadcast: true,
						sign: true
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
