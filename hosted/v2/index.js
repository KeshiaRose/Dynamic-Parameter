let dashboard, parameter, dataSource;

$(document).ready(function() {
    tableau.extensions.initializeAsync({ 'configure': configure }).then(() => {
        console.log(tableau.extensions.settings.getAll());
        dashboard = tableau.extensions.dashboardContent.dashboard;
        let configured = tableau.extensions.settings.get('configured');
        if (configured != 'true') {
            configure();
        } else {
            findDataSource(tableau.extensions.settings.get('selDataSource'));
        }
    });
});

// Pops open the configure page
function configure() {
    const popupUrl = `${window.location.origin}/extensions/newdynparam/popup.html`
    const popupUrl = 'https://keshiarose.github.io/Dynamic-Parameter/hosted/v2/popup.html';
    let payload = "";
    tableau.extensions.ui.displayDialogAsync(popupUrl, payload, { height: 600, width: 500 }).then((closePayload) => {
        console.log("Dialog was closed.");
        console.log(closePayload);
        findDataSource();
    }).catch((error) => {
        switch (error.errorCode) {
            case tableau.ErrorCodes.DialogClosedByUser:
                console.log("Dialog was closed by user.");
                break;
            default:
                console.error(error.message);
        }
    });
}

// Gets data source based on name passed back from dialog
function findDataSource() {
    console.log('Collecting data source.');
    let wslist = [];
    dashboard.worksheets.forEach(function(worksheet) {
        worksheet.getDataSourcesAsync().then(function(datasources) {
            datasources.forEach(function(datasource) {
                dataSource = datasources.find(datasource => datasource.name === tableau.extensions.settings.get('selDataSource'))
            });
            if (wslist.indexOf(worksheet.name) == -1) {
                wslist.push(worksheet.name);
            }
            if (wslist.length == dashboard.worksheets.length) {
                console.log(dataSource);
                findParameter()
            }
        });

    });
}

function findParameter() {
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
        parameter = params.find(param => param.name === tableau.extensions.settings.get('selParam'));
        wsEvent();
    });
}

function wsEvent() {
    if (tableau.extensions.settings.get('dpRelevant') == 'true') {
        let dataSheet = dashboard.worksheets.find(ws => ws.name == tableau.extensions.settings.get('selWorksheet'));
        let unregisterHandlerFunction = dataSheet.addEventListener(tableau.TableauEventType.FilterChanged, getParamData);
    }
    getParamData();
}

// Gets the values from the selected field and populates the Dynamic Parameter
function getParamData() {
    console.log('Populating parameter.');
    let dataField = tableau.extensions.settings.get('selField');
    let rel = tableau.extensions.settings.get('dpRelevant');
    if (rel == 'false') {
        console.log('Getting all dynamic parameter values.');
        dataSource.getUnderlyingDataAsync().then(dataTable => {
            fieldIndex = dataTable.columns.find(column => column.fieldName == dataField).index;
            let list = [];
            let options = "";
            for (row of dataTable.data) {
                list.push(row[fieldIndex].value);
            };
            list = list.filter(function(item, index, inputArray) {
                return inputArray.indexOf(item) == index;
            });
            list.sort();
            for (l of list) {
                options += "<option value='" + l + "'>" + l + "</option>";
            }
            document.getElementById('dynamicparameter').innerHTML = options;
            document.getElementById('dynamicparameter').value = parameter.currentValue.value;
            // document.getElementById('dropdown').style.display = "block";
        });
    } else {
        let dataSheet = dashboard.worksheets.find(ws => ws.name == tableau.extensions.settings.get('selWorksheet'));
        dataSheet.getSummaryDataAsync().then(dataTable => {
            fieldIndex = dataTable.columns.find(column => column.fieldName == dataField).index;
            let list = [];
            let options = "";
            for (row of dataTable.data) {
                list.push(row[fieldIndex].value);
            };
            list = list.filter(function(item, index, inputArray) {
                return inputArray.indexOf(item) == index;
            });
            list.sort();
            for (l of list) {
                options += "<option value='" + l + "'>" + l + "</option>";
            }
            document.getElementById('dynamicparameter').innerHTML = options;
            document.getElementById('dynamicparameter').value = parameter.currentValue.value;
            // document.getElementById('dropdown').style.display = "block";
        });
    }
}

// Updates the parameter based on selection in Dynamic Parameter
function updateParam(arg) {
    console.log('Updating parameter.');
    parameter.changeValueAsync(arg);
    getParamData();
}