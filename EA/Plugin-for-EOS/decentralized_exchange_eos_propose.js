registerEA(
		"decentralized_exchange_eos_propose",
		"A decentralized exchange plugin to propose for exchanging digital assets via EOS platform(v1.01)",
		[{ // parameters
			name: "proposalName",
			value: "",
			required: false,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "asset",
			value: "eosio.token",
			required: true,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "proposer",
			value: "",
			required: false,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "exchange",
			value: "",
			required: false,
			type: PARAMETER_TYPE.STRING,
			range: null
		}, {
			name: "escrow",
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
			var proposalName = getEAParameter(context, "proposalName")
			var asset = getEAParameter(context, "asset")
			var proposer = getEAParameter(context, "proposer")
			var exchange = getEAParameter(context, "exchange")
			var escrow = getEAParameter(context, "escrow")
			var amount = getEAParameter(context, "amount")
			var currency = getEAParameter(context, "currency")
			var memo = getEAParameter(context, "memo")

			if (proposalName == null || proposalName == "") {
				popupErrorMessage("The proposal name should not be empty.")
				return
			}
			if (proposer == null || proposer == "") {
				popupErrorMessage("The proposer should not be empty.")
				return
			}
			if (exchange == null || exchange == "") {
				popupErrorMessage("The exchange should not be empty.")
				return
			}
			if (escrow == null || escrow == "") {
				popupErrorMessage("The escrow account should not be empty.")
				return
			}
			if (amount <= 0) {
				popupErrorMessage("The amount should be greater than zero.")
				return
			}
			if (memo == null) {
				memo = ""
			}

			const actions = [{
				account: asset,
				name: "transfer",
				authorization: [{
					actor: escrow,
					permission: "active",
				}],
				data: {
					from: escrow,
					to: exchange,
					quantity: Math.floor(amount) + ".0000 " + currency,
					memo: memo
				}
			}];

			(async () => {
				try {
				  const serialized_actions = await window.eos_api.serializeActions(actions)

					const proposeInput = {
						proposer: proposer,
						proposal_name: proposalName,
						// We make the threshold be 1(not 2) to simplify the process, because multi-sig requires that all approvers are online, which is not that realistic.
						requested: [{
							actor: exchange,
							permission: "active"
						}],
						trx: {
							expiration: new Date(new Date().getTime() + 3600000).toISOString().slice(0,19),
							ref_block_num: 0,
							ref_block_prefix: 0,
							max_net_usage_words: 0,
							max_cpu_usage_ms: 0,
							delay_sec: 0,
							context_free_actions: [],
							actions: serialized_actions,
							transaction_extensions: []
						}
					}

					const result = await window.eos_api.transact({
						actions: [{
							account: "eosio.msig",
							name: "propose",
							authorization: [{
								actor: proposer,
								permission: "active"
							}],
							data: proposeInput
						}]
					}, {
						blocksBehind: 3,
						expireSeconds: 30,
						broadcast: true,
						sign: true
					})

					popupMessage("Proposed!\n\n" + JSON.stringify(result, null, 2))
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
