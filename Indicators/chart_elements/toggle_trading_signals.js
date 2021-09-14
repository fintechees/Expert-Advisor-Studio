	registerIndicator("toggle_trading_signals", "Toggle the display of the trading signals(v1.0)", function (context) {
	},[{
		name: "opacity",
		value: 0,
		required: true,
		type: PARAMETER_TYPE.NUMBER,
		range: [0, 1.0]
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
		var opacity = getIndiParameter(context, "opacity")
		var opacity2 = opacity > 0 ? 1 : 0;

		d3.selectAll(".cc_k_c_p_o_l").style("opacity", opacity2)
		d3.selectAll(".cc_k_c_p_o_t_l").style("opacity", opacity2)
		d3.selectAll(".cc_k_c_p_o_s_l").style("opacity", opacity2)
		d3.selectAll(".cc_k_c_p_o_b").style("opacity", opacity)
		d3.selectAll(".cc_k_c_p_o_t").style("opacity", opacity2)
		d3.selectAll(".cc_k_c_o_t_t_l").style("opacity", opacity2)
		d3.selectAll(".cc_k_c_o_t_s_l").style("opacity", opacity2)
		d3.selectAll(".cc_k_c_o_t_b").style("opacity", opacity)
		d3.selectAll(".cc_k_c_o_t_t").style("opacity", opacity2)
		d3.selectAll(".cc_k_c_h_t_o_b").style("opacity", opacity)
		d3.selectAll(".cc_k_c_h_t_c_b").style("opacity", opacity)
		d3.selectAll(".cc_k_c_h_t_o_t").style("opacity", opacity2)
		d3.selectAll(".cc_k_c_h_t_c_t").style("opacity", opacity2)
		d3.selectAll(".cc_k_c_h_t_l").style("opacity", opacity2)
	},
	function (context) { // Deinit()
		var opacity = 0.5

		d3.selectAll(".cc_k_c_p_o_l").style("opacity", 1)
		d3.selectAll(".cc_k_c_p_o_t_l").style("opacity", 1)
		d3.selectAll(".cc_k_c_p_o_s_l").style("opacity", 1)
		d3.selectAll(".cc_k_c_p_o_b").style("opacity", opacity)
		d3.selectAll(".cc_k_c_p_o_t").style("opacity", 1)
		d3.selectAll(".cc_k_c_o_t_t_l").style("opacity", 1)
		d3.selectAll(".cc_k_c_o_t_s_l").style("opacity", 1)
		d3.selectAll(".cc_k_c_o_t_b").style("opacity", opacity)
		d3.selectAll(".cc_k_c_o_t_t").style("opacity", 1)
		d3.selectAll(".cc_k_c_h_t_o_b").style("opacity", opacity)
		d3.selectAll(".cc_k_c_h_t_c_b").style("opacity", opacity)
		d3.selectAll(".cc_k_c_h_t_o_t").style("opacity", 1)
		d3.selectAll(".cc_k_c_h_t_c_t").style("opacity", 1)
		d3.selectAll(".cc_k_c_h_t_l").style("opacity", 1)
	})
