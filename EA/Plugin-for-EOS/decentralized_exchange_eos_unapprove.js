registerEA(
		"decentralized_exchange_eos_unapprove",
		"A decentralized exchange plugin to unapprove a proposal for exchanging digital assets via EOS platform(v1.0)",
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
			name: "actor",
			value: "",
			required: false,
			type: PARAMETER_TYPE.STRING,
			range: null
		}],
		function (context) { // Init()
			var proposalName = getEAParameter(context, "proposalName")
			var proposer = getEAParameter(context, "proposer")
			var actor = getEAParameter(context, "actor")

			if (proposalName == null || proposalName == "") {
				popupErrorMessage("The proposal name should not be empty.")
				return
			}
			if (proposer == null || proposer == "") {
				popupErrorMessage("The proposer should not be empty.")
				return
			}
			if (actor == null || actor == "") {
				popupErrorMessage("The actor should not be empty.")
				return
			}

			(async () => {
				try {
					const result = await window.eos_api.transact({
						actions: [{
							account: "eosio.msig",
							name: "unapprove",
							authorization: [{
								actor: actor,
								permission: "active"
							}],
							data: {
								proposer: proposer,
								proposal_name: proposalName,
								level: {
									actor: actor,
									permission: "active",
								}
							}
						}]
					}, {
						blocksBehind: 3,
						expireSeconds: 30,
						broadcast: true,
						sign: true
					})

					popupMessage("Unapproved!\n\n" + JSON.stringify(result, null, 2))
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
