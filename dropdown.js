var dashboard, dataSheet, dataSource, dataField, selParam;

$(document).ready(function() {
    //$("#initializeButton").click(() => {
    //document.getElementById('initializeButton').style.display = "none";
    tableau.addIn.initializeAsync().then(() => {
        // resetSettings();
        console.log(tableau.addIn.settings.getAll())
        dashboard = tableau.addIn.dashboardContent.dashboard
        let wsset = tableau.addIn.settings.get('selWorksheet');
        if (wsset) {
            testWorksheetSettings()
        } else {
            populateWorksheetList()
        }
    });
    //});
});

// Tests if currently set Worksheet is still on dashboard
function testWorksheetSettings() {
    console.log('Testing Worksheet Settings');
    let wsset = tableau.addIn.settings.get('selWorksheet');
    if (wsset) {
        ws = dashboard.worksheets.find(ws => ws.name === wsset)
        if (ws) {
            document.getElementById('showwsname').innerHTML = "Selected Worksheet: " + ws.name;
            document.getElementById('showwsname').style.display = "block";
            dataSheet = ws;
            testDataSourceSettings();
        } else {
            populateWorksheetList();
        }
    } else {
        populateWorksheetList();
    }
}

// Gets list of worksheets in the dashboard to populate list from
function populateWorksheetList() {
    console.log('Populating Worksheet List');
    document.getElementById('loading').style.display = "none";
    document.getElementById('wsselect').style.display = "inline";
    let options = "";
    let t = 0;
    for (ws of dashboard.worksheets) {
        options += "<option value='" + ws.name + "'>" + ws.name + "</option>";
        t++
    }
    if (t == 0) {
        document.getElementById('wsselector').innerHTML = "<option value='' disabled>No Worksheets Found</option>";
        document.getElementById('wserror').innerHTML = "Error: You must have a worksheet on the dashboard.";
    } else {
        document.getElementById('wsselector').innerHTML = options;
    }
}

// Sets the worksheet to use to get the Data Source
function setWorksheet() {
    console.log('Setting Worksheet');
    let wsname = document.getElementById('wsselector').value;
    if (wsname != '') {
        document.getElementById('wsselect').style.display = "none";
        document.getElementById('showwsname').innerHTML = "Selected Worksheet: " + wsname;
        document.getElementById('showwsname').style.display = "block";
        tableau.addIn.settings.set('selWorksheet', wsname);
        tableau.addIn.settings.saveAsync();
        dataSheet = dashboard.worksheets.find(sheet => sheet.name == wsname);
        populateDataSourceList();
    }
}

// Tests if currently set Data Source is still on worksheet
function testDataSourceSettings() {
    console.log('Testing Data Source Settings');
    let dsset = tableau.addIn.settings.get('selDataSource');
    if (dsset) {
        dataSheet.getDataSourcesAsync().then(data => {
            ds = data.find(ds => ds.name == dsset);
            if (ds) {
                document.getElementById('showdsname').innerHTML = "Selected Data Source: " + ds.name;
                document.getElementById('showdsname').style.display = "block";
                dataSource = ds;
                testFieldSettings();
            } else {
                populateDataSourceList();
            }
        }).catch(error => populateDataSourceList());

    } else {
        populateDataSourceList();
    }
}

// Gets list of Data Sources in the worksheet to populate list from
function populateDataSourceList() {
    console.log('Populating Data Source List');
    document.getElementById('loading').style.display = "none";
    document.getElementById('showset').style.display = "inline";
    dataSheet.getDataSourcesAsync().then(data => {
        if (data.length == 1) {
            dsname = data[0].name
            ds = data.find(ds => ds.name == dsname);
            dataSource = ds;
            tableau.addIn.settings.set('selDataSource', dsname);
            tableau.addIn.settings.saveAsync();
            document.getElementById('showdsname').innerHTML = "Selected Data Source: " + dsname;
            document.getElementById('showdsname').style.display = "block";
            populateFieldList();
        } else {
            document.getElementById('dsselect').style.display = "inline";
            let options = "";
            let t = 0;
            for (ds of data) {
                options += "<option value='" + ds.name + "'>" + ds.name + "</option>";
                t++
            }
            if (t == 0) {
                document.getElementById('dsselector').innerHTML = "<option value='' disabled>No Data Sources Found</option>";
                document.getElementById('dserror').innerHTML = "Error: You must have a data source in the worksheet.";
            } else {
                document.getElementById('dsselector').innerHTML = options;
            }
        }
    }).catch(error => document.getElementById('nods').style.display = "block");
}

// Sets the Data Source to pull values from for Dynamic Parameter
function setDataSource() {
    console.log('Setting Data Source');
    let dsname = document.getElementById('dsselector').value;
    if (dsname != '') {
        dataSheet.getDataSourcesAsync().then(data => {
            ds = data.find(ds => ds.name == dsname);
            tableau.addIn.settings.set('selDataSource', dsname);
            tableau.addIn.settings.saveAsync();
            dataSource = ds;
            document.getElementById('showdsname').innerHTML = "Selected Data Source: " + dsname;
            document.getElementById('showdsname').style.display = "block";
            document.getElementById('dsselect').style.display = "none";
            populateFieldList();
        });
    }
}

// Tests if currently set Field to pull domain from exists
function testFieldSettings() {
    console.log('Testing Field Settings');
    let fset = tableau.addIn.settings.get('selField');
    if (fset) {
        dataSource.getUnderlyingDataAsync().then(dataTable => {
            if (dataTable.columns.find((column) => column.fieldName == fset)) {
                dataField = fset;
                testParamSettings()
            } else {
                populateFieldList();
            }
        });
    } else {
        populateFieldList();
    }
}

// Gets list of fields found on DataViz worksheet and populates dropdown - this will change once we get access to domain from data source
function populateFieldList() {
    console.log('Populating Field List');
    document.getElementById('loading').style.display = "none";
    document.getElementById('showset').style.display = "inline";
    document.getElementById('fselect').style.display = "inline";
    dataSource.getUnderlyingDataAsync().then(columns => {
        let options = "";
        let t = 0;
        for (f of columns.columns) {
            options += "<option value='" + f.fieldName + "'>" + f.fieldName + "</option>";
            t++
        }
        if (t == 0) {
            document.getElementById('fselector').innerHTML = "<option value='' disabled>No Fields Found</option>";
            document.getElementById('ferror').innerHTML = "Error: You must have a field on the DataViz worksheet.";
        } else {
            document.getElementById('fselector').innerHTML = options;
        }
    });
}

// Sets the field to pull values from for Dynamic Parameter
function setField() {
    console.log('Setting Field');
    let fname = document.getElementById('fselector').value;
    if (fname != '') {
        tableau.addIn.settings.set('selField', fname);
        tableau.addIn.settings.saveAsync();
        document.getElementById('showfname').innerHTML = "Selected Field: " + fname;
        document.getElementById('showfname').style.display = "block";
        document.getElementById('fselect').style.display = "none";
        dataField = fname;
        populateParamList();
    }

}

// Tests if currently set Parameter exists and accepts all values
function testParamSettings() {
    console.log('Testing Parameter Settings');
    let pset = tableau.addIn.settings.get('selParam');
    if (pset) {
        tableau.addIn.dashboardContent.dashboard.getParametersAsync().then(params => {
            let testParam = params.find(param => param.name === pset)
            if (testParam) {
                if (testParam.allowableValues.type == "all") {
                    selParam = testParam;
                    document.getElementById('showset').style.display = "none";
                    getParamData();
                } else {
                    populateParamList();
                }
            } else {
                populateParamList();
            }
        });
    } else {
        populateParamList();
    }
}

// Gets list of parameters in workbook and populates dropdown
function populateParamList() {
    console.log('Populating Parameter List');
    document.getElementById('loading').style.display = "none";
    document.getElementById('showset').style.display = "inline";
    document.getElementById('pselect').style.display = "inline";
    tableau.addIn.dashboardContent.dashboard.getParametersAsync().then(params => {
        let options = "";
        let t = 0;
        for (p of params) {
            if (p.allowableValues.type == "all") {
                options += "<option value='" + p.parameterImpl._parameterInfo.name + "'>" + p.parameterImpl._parameterInfo.name + "</option>";
                t++
            }
        }
        if (t == 0) {
            document.getElementById('pselector').innerHTML = "<option value='' disabled>No Parameters Found</option>";
            document.getElementById('perror').innerHTML = "Error: You must have a parameter with an open input.";
        } else {
            document.getElementById('pselector').innerHTML = options;
        }
    });
}

// Sets the parameter to update
function setParam() {
    console.log('Setting Parameter');
    let pname = document.getElementById('pselector').value;
    if (pname != '') {
        tableau.addIn.dashboardContent.dashboard.getParametersAsync().then(params => {
            selParam = params.find(param => param.name === pname);
            tableau.addIn.settings.set('selParam', pname);
            tableau.addIn.settings.set('dpRelevant', 'false');
            tableau.addIn.settings.saveAsync();
            document.getElementById('pselect').style.display = "none";
            document.getElementById('showset').style.display = "none";
            getParamData();
        });
    }
}

// Gets the values from the selected field and populates the Dynamic Parameter
function getParamData() {
    console.log('Getting Parameter Data');
    let rel = tableau.addIn.settings.get('dpRelevant');
    if (rel == 'false') {
        console.log('Getting All Values');
        document.getElementById('relimg').src = "all.png";
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
            document.getElementById('loading').style.display = "none";
            document.getElementById('dynamicparameter').innerHTML = options;
            document.getElementById('dynamicparameter').value = selParam.currentValue.value;
            document.getElementById('dropdown').style.display = "inline";
        });
    } else {
        console.log('Getting Only Relevant Values');
        document.getElementById('relimg').src = "relevant.png";
        dataSheet.getSummaryDataAsync().then(dataTable => {
            let fieldIndex = dataTable.columns.find((column) => column.fieldName == dataField).index;
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
            document.getElementById('loading').style.display = "none";
            document.getElementById('dynamicparameter').innerHTML = options;
            document.getElementById('dynamicparameter').value = selParam.currentValue.value;
            document.getElementById('dropdown').style.display = "inline";
        });
    }
}

// Updates the parameter based on selection in Dynamic Parameter
function updateParam(arg) {
    console.log('Updating Parameter');
    selParam.changeValueAsync(arg);
    let rel = tableau.addIn.settings.get('dpRelevant');
    if (rel == 'true') {
        getParamData();
    }
}

// Resets all settings
function resetSettings() {
    console.log('Reseting Settings');
    tableau.addIn.settings.erase('selWorksheet');
    tableau.addIn.settings.erase('selDataSource');
    tableau.addIn.settings.erase('selField');
    tableau.addIn.settings.erase('selParameter');
    tableau.addIn.settings.erase('dpRelevant');
    document.getElementById('dropdown').style.display = "none";
    tableau.addIn.settings.saveAsync().then(result => {
        populateWorksheetList();
    });
}

// Toggles if Dynamic Parameter is affected by filters or not
function updateRelevant() {
    current = tableau.addIn.settings.get('dpRelevant');
    if (current == 'false') {
        tableau.addIn.settings.set('dpRelevant', 'true');
        tableau.addIn.settings.saveAsync();
        document.getElementById('relimg').src = "relevant.png";
        console.log('Switched to Only Relevant Values');
    } else {
        tableau.addIn.settings.set('dpRelevant', 'false');
        tableau.addIn.settings.saveAsync();
        document.getElementById('relimg').src = "all.png";
        console.log('Switched to All Values');
    }
    getParamData();
}