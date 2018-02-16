var dashboard, dataSheet, dataSource, dataField, selParam;

$(document).ready(function() {
    //$("#initializeButton").click(() => {
    //document.getElementById('initializeButton').style.display = "none";
    tableau.extensions.initializeAsync().then(() => {
        // resetSettings();
        console.log(tableau.extensions.settings.getAll())
        dashboard = tableau.extensions.dashboardContent.dashboard
        let wsset = tableau.extensions.settings.get('selWorksheet');
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
    let wsset = tableau.extensions.settings.get('selWorksheet');
    if (wsset) {
        ws = dashboard.worksheets.find(ws => ws.name === wsset)
        if (ws) {
            document.getElementById('showwsname').innerHTML = "Selected worksheet: " + ws.name;
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
    document.getElementById('reset').style.display = "block";
    document.getElementById('wsselect').style.display = "block";
    let options = "";
    let t = 0;
    for (ws of dashboard.worksheets) {
        options += "<option value='" + ws.name + "'>" + ws.name + "</option>";
        t++
    }
    if (t == 0) {
        document.getElementById('wsselector').innerHTML = "<option value='' disabled>No worksheets found</option>";
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
        document.getElementById('showwsname').innerHTML = "Selected worksheet: " + wsname;
        document.getElementById('showwsname').style.display = "block";
        tableau.extensions.settings.set('selWorksheet', wsname);
        tableau.extensions.settings.saveAsync();
        dataSheet = dashboard.worksheets.find(sheet => sheet.name == wsname);
        populateDataSourceList();
    }
}

// Tests if currently set Data Source is still on worksheet
function testDataSourceSettings() {
    console.log('Testing Data Source Settings');
    let dsset = tableau.extensions.settings.get('selDataSource');
    if (dsset) {
        dataSheet.getDataSourcesAsync().then(data => {
            ds = data.find(ds => ds.name == dsset);
            if (ds) {
                document.getElementById('showdsname').innerHTML = "Selected data source: " + ds.name;
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
    document.getElementById('reset').style.display = "block";
    document.getElementById('showset').style.display = "block";
    dataSheet.getDataSourcesAsync().then(data => {
        if (data.length == 1) {
            dsname = data[0].name
            ds = data.find(ds => ds.name == dsname);
            dataSource = ds;
            tableau.extensions.settings.set('selDataSource', dsname);
            tableau.extensions.settings.saveAsync();
            document.getElementById('showdsname').innerHTML = "Only one data source found: " + dsname;
            document.getElementById('showdsname').style.display = "block";
            populateFieldList();
        } else {
            document.getElementById('dsselect').style.display = "block";
            let options = "";
            let t = 0;
            for (ds of data) {
                options += "<option value='" + ds.name + "'>" + ds.name + "</option>";
                t++
            }
            if (t == 0) {
                document.getElementById('dsselector').innerHTML = "<option value='' disabled>No data sources found</option>";
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
            tableau.extensions.settings.set('selDataSource', dsname);
            tableau.extensions.settings.saveAsync();
            dataSource = ds;
            document.getElementById('showdsname').innerHTML = "Selected data source: " + dsname;
            document.getElementById('showdsname').style.display = "block";
            document.getElementById('dsselect').style.display = "none";
            populateFieldList();
        });
    }
}

// Tests if currently set Field to pull domain from exists
function testFieldSettings() {
    console.log('Testing Field Settings');
    let fset = tableau.extensions.settings.get('selField');
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
    document.getElementById('reset').style.display = "block";
    document.getElementById('showset').style.display = "block";
    document.getElementById('fselect').style.display = "block";
    dataSource.getUnderlyingDataAsync().then(columns => {
        let options = "";
        let t = 0;
        for (f of columns.columns) {
            options += "<option value='" + f.fieldName + "'>" + f.fieldName + "</option>";
            t++
        }
        if (t == 0) {
            document.getElementById('fselector').innerHTML = "<option value='' disabled>No fields found</option>";
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
        tableau.extensions.settings.set('selField', fname);
        tableau.extensions.settings.saveAsync();
        document.getElementById('showfname').innerHTML = "Selected field: " + fname;
        document.getElementById('showfname').style.display = "block";
        document.getElementById('fselect').style.display = "none";
        dataField = fname;
        populateParamList();
    }

}

// Tests if currently set Parameter exists and accepts all values
function testParamSettings() {
    console.log('Testing Parameter Settings');
    let pset = tableau.extensions.settings.get('selParam');
    if (pset) {
        tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
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
    document.getElementById('reset').style.display = "block";
    document.getElementById('showset').style.display = "block";
    document.getElementById('pselect').style.display = "block";
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
        let options = "";
        let t = 0;
        for (p of params) {
            if (p.allowableValues.type == "all") {
                options += "<option value='" + p.parameterImpl._parameterInfo.name + "'>" + p.parameterImpl._parameterInfo.name + "</option>";
                t++
            }
        }
        if (t == 0) {
            document.getElementById('pselector').innerHTML = "<option value='' disabled>No parameters found</option>";
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
        tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
            selParam = params.find(param => param.name === pname);
            tableau.extensions.settings.set('selParam', pname);
            tableau.extensions.settings.set('dpRelevant', 'false');
            tableau.extensions.settings.saveAsync();
            document.getElementById('pselect').style.display = "none";
            document.getElementById('showset').style.display = "none";
            document.getElementById('reset').style.display = "none";
            getParamData();
        });
    }
}

// Gets the values from the selected field and populates the Dynamic Parameter
function getParamData() {
    console.log('Getting Parameter Data');
    let rel = tableau.extensions.settings.get('dpRelevant');
    if (rel == 'false') {
        console.log('Getting All Values');
        document.getElementById('relimg').src = "imgs/all.png";
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
            document.getElementById('dropdown').style.display = "block";
        });
    } else {
        console.log('Getting Only Relevant Values');
        document.getElementById('relimg').src = "imgs/relevant.png";
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
            document.getElementById('dropdown').style.display = "block";
        });
    }
}

// Updates the parameter based on selection in Dynamic Parameter
function updateParam(arg) {
    console.log('Updating Parameter');
    selParam.changeValueAsync(arg);
    let rel = tableau.extensions.settings.get('dpRelevant');
    if (rel == 'true') {
        getParamData();
    }
}

// Resets all settings
function resetSettings() {
    console.log('Reseting Settings');
    tableau.extensions.settings.erase('selWorksheet');
    tableau.extensions.settings.erase('selDataSource');
    tableau.extensions.settings.erase('selField');
    tableau.extensions.settings.erase('selParameter');
    tableau.extensions.settings.erase('dpRelevant');
    document.getElementById('dropdown').style.display = "none";
    tableau.extensions.settings.saveAsync().then(result => {
        // Reload extension
        document.getElementById('showwsname').style.display = "none";
        document.getElementById('showdsname').style.display = "none";
        document.getElementById('showfname').style.display = "none";
        document.getElementById('wsselect').style.display = "none";
        document.getElementById('dsselect').style.display = "none";
        document.getElementById('nods').style.display = "none";
        document.getElementById('fselect').style.display = "none";
        document.getElementById('pselect').style.display = "none";
        document.getElementById('dropdown').style.display = "none";
        populateWorksheetList();
    });
}

// Toggles if Dynamic Parameter is affected by filters or not
function updateRelevant() {
    current = tableau.extensions.settings.get('dpRelevant');
    if (current == 'false') {
        tableau.extensions.settings.set('dpRelevant', 'true');
        tableau.extensions.settings.saveAsync();
        document.getElementById('relimg').src = "imgs/relevant.png";
        console.log('Switched to Only Relevant Values');
    } else {
        tableau.extensions.settings.set('dpRelevant', 'false');
        tableau.extensions.settings.saveAsync();
        document.getElementById('relimg').src = "imgs/all.png";
        console.log('Switched to All Values');
    }
    getParamData();
}