registerEA(
"import_export_model",
"An EA to import a model from files to localStorage or export a model from localStorage to files(v1.0)",
[{
	name: "tfModelName",
	value: "testcnn",
	required: true,
	type: "String",
	range: null,
	step: null
}, {
	name: "import",
	value: true, // If true, then this EA imports the specific model from files to localStorage. If false, then this EA exports the specific model from localStorage to files.
	required: true,
	type: "Boolean",
	range: null,
	step: null
}],
function (context) { // Init()
    if (typeof window.tf == "undefined") {
      printErrorMessage("Please run the plugin to load Tensorflow first.")
      return
    }

    var tfModelName = getEAParameter(context, "tfModelName")
    var bImport = getEAParameter(context, "import")

    context.cnn = {
      initDashboard: function () {
        if (typeof $("#import_cnn_model").html() == "undefined") {
          var panel = '<div class="ui form modal" id="import_cnn_model">' +
            '<div class="content">' +
							'<div class="row">' +
								'No worries. The model files will not be uploaded to anywhere. It will be just imported to the LocalStorage of your browser.' +
							'</div>' +
              '<div class="row">' +
								'<div class="ui middle aligned center aligned">' +
									'<div class="ui fluid segment" style="height:100px">' +
										'<input style="width:0.1px;height:0.1px;opacity:0;overflow:hidden;position:absolute;z-index:-1" type="file" id="jsonFile"><label for="jsonFile" class="ui huge green left floated button">JSON File</label>' +
										'<input style="width:0.1px;height:0.1px;opacity:0;overflow:hidden;position:absolute;z-index:-1" type="file" id="weightsFile"><label for="weightsFile" class="ui huge green left floated button">Weights File</label>' +
										'<button id="btnImportModel" class="ui huge right floated button">Import</button>' +
									'</div>' +
								'</div>' +
              '</div>' +
            '</div>' +
          '</div>'

          $("#reserved_zone").append(panel)

          var that = this

          $("#btnImportModel").on("click", function () {
						context.cnn.importModel()
          })
				}

				$("#import_cnn_model").modal({autofocus:false}).modal("show")
      },
			importModel: function () {
				var jsonFile = document.getElementById("jsonFile")
				var weightsFile = document.getElementById("weightsFile")

				if (jsonFile.files.length == 0 || weightsFile.files[0] == 0) {
					setTimeout(function () {
						context.cnn.importModel()
					}, 1000)
				} else {
					$("#import_cnn_model").modal("hide")

					window.loadCnn(tfModelName, true, jsonFile.files[0], weightsFile.files[0])
					.then(function (tfModel) {
						window.saveCnn(tfModel, tfModelName, false)
						popupMessage("Successfully imported the CNN model.")
					})
					.catch(function (e) {
						popupErrorMessage("Failed to import the CNN model.")
					})
				}
			}
    }

    if (bImport) {
      context.cnn.initDashboard()
    } else {
      window.loadCnn(tfModelName)
      .then(function (tfModel) {
        window.saveCnn(tfModel, tfModelName, true)
				popupMessage("Successfully exported the CNN model.")
      })
      .catch(function (e) {
        popupErrorMessage("Failed to load the CNN model.")
      })
    }
  },
function (context) { // Deinit()
},
function (context) { // OnTick()
},
function (context) { // OnTransaction()
}
)
