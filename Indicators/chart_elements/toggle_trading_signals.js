	registerIndicator("toggle_trading_signals", "Toggle the display of the trading signals(v1.03)", function (context) {
	},[{
		name: "opacityPendingOrder",
		value: 0,
		required: true,
		type: PARAMETER_TYPE.NUMBER,
		range: [0, 1.0]
	},{
		name: "opacityOpenTrade",
		value: 0,
		required: true,
		type: PARAMETER_TYPE.NUMBER,
		range: [0, 1.0]
	},{
		name: "opacityHistoryTrade",
		value: 0,
		required: true,
		type: PARAMETER_TYPE.NUMBER,
		range: [0, 1.0]
	},{
		name: "isGlobal",
		value: false,
		required: true,
		type: PARAMETER_TYPE.BOOLEAN,
		range: null
	}],
	[{
		name: DATA_NAME.TIME,
		index: 0
	}],
	[{
		name: "toggle_trading_signals",
		visible: false
	}],
	WHERE_TO_RENDER.CHART_WINDOW,
	function (context) { // Init()
		var opacityPendingOrder = getIndiParameter(context, "opacityPendingOrder")
		var opacityPendingOrder2 = opacityPendingOrder > 0 ? 1 : 0;
		var opacityOpenTrade = getIndiParameter(context, "opacityOpenTrade")
		var opacityOpenTrade2 = opacityOpenTrade > 0 ? 1 : 0;
		var opacityHistoryTrade = getIndiParameter(context, "opacityHistoryTrade")
		var opacityHistoryTrade2 = opacityHistoryTrade > 0 ? 1 : 0;
		var isGlobal = getIndiParameter(context, "isGlobal")

		var chartHandle = getChartHandleByContext(context)
		var canvas = isGlobal ? d3 : d3.select("#cc_k_c_d_" + chartHandle)

		canvas.selectAll(".cc_k_c_p_o_l").style("opacity", opacityPendingOrder2)
		canvas.selectAll(".cc_k_c_p_o_t_l").style("opacity", opacityPendingOrder2)
		canvas.selectAll(".cc_k_c_p_o_s_l").style("opacity", opacityPendingOrder2)
		canvas.selectAll(".cc_k_c_p_o_b").style("opacity", opacityPendingOrder)
		canvas.selectAll(".cc_k_c_p_o_t").style("opacity", opacityPendingOrder2)
		canvas.selectAll(".cc_k_c_o_t_t_l").style("opacity", opacityOpenTrade2)
		canvas.selectAll(".cc_k_c_o_t_s_l").style("opacity", opacityOpenTrade2)
		canvas.selectAll(".cc_k_c_o_t_b").style("opacity", opacityOpenTrade)
		canvas.selectAll(".cc_k_c_o_t_t").style("opacity", opacityOpenTrade2)
		canvas.selectAll(".cc_k_c_h_t_o_b").style("opacity", opacityHistoryTrade)
		canvas.selectAll(".cc_k_c_h_t_c_b").style("opacity", opacityHistoryTrade)
		canvas.selectAll(".cc_k_c_h_t_o_t").style("opacity", opacityHistoryTrade2)
		canvas.selectAll(".cc_k_c_h_t_c_t").style("opacity", opacityHistoryTrade2)
		canvas.selectAll(".cc_k_c_h_t_l").style("opacity", opacityHistoryTrade2)
	},
	function (context) { // Deinit()
		var opacity = 0.5
		var chartHandle = getChartHandleByContext(context)
		var isGlobal = getIndiParameter(context, "isGlobal")
		var canvas = isGlobal ? d3 : d3.select("#cc_k_c_d_" + chartHandle)

		canvas.selectAll(".cc_k_c_p_o_l").style("opacity", 1)
		canvas.selectAll(".cc_k_c_p_o_t_l").style("opacity", 1)
		canvas.selectAll(".cc_k_c_p_o_s_l").style("opacity", 1)
		canvas.selectAll(".cc_k_c_p_o_b").style("opacity", opacity)
		canvas.selectAll(".cc_k_c_p_o_t").style("opacity", 1)
		canvas.selectAll(".cc_k_c_o_t_t_l").style("opacity", 1)
		canvas.selectAll(".cc_k_c_o_t_s_l").style("opacity", 1)
		canvas.selectAll(".cc_k_c_o_t_b").style("opacity", opacity)
		canvas.selectAll(".cc_k_c_o_t_t").style("opacity", 1)
		canvas.selectAll(".cc_k_c_h_t_o_b").style("opacity", opacity)
		canvas.selectAll(".cc_k_c_h_t_c_b").style("opacity", opacity)
		canvas.selectAll(".cc_k_c_h_t_o_t").style("opacity", 1)
		canvas.selectAll(".cc_k_c_h_t_c_t").style("opacity", 1)
		canvas.selectAll(".cc_k_c_h_t_l").style("opacity", 1)
	})
