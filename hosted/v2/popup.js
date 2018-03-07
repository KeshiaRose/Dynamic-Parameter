let dashboard, dataSource, pset, dsnames, dslist, pdatatype;

$(document).ready(function() {
    tableau.extensions.initializeDialogAsync().then(function(openPayload) {
        console.log(tableau.extensions.settings.getAll());
        dashboard = tableau.extensions.dashboardContent.dashboard;
        pset = tableau.extensions.settings.get('selParam');
        populateWS();
        if (pset) {
            console.log('Parameter setting found for ' + pset + ".");
            testParamSettings();
        } else {
            console.log('No parameter setting found.');
            tableau.extensions.settings.set('configured', 'false');
            tableau.extensions.settings.set('dpRelevant', 'false');
            tableau.extensions.settings.saveAsync();
            populateParamList();
        }
        if (tableau.extensions.settings.get('configured') == 'true') {
            document.getElementById('submit').innerHTML = 'Update dynamic parameter';
        }
    });
});

// Tests if currently set Parameter exists and accepts all values
function testParamSettings() {
    console.log('Testing parameter setting for ' + pset + ".");
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
        let testParam = params.find(param => param.name === pset)
        if (testParam) {
            console.log('Parameter exists.');
            if (testParam.allowableValues.type == "all") {
                console.log('Parameter is open input.');
                pdatatype = testParam.dataType;
                document.getElementById('divparamselector').style.display = "none";
                document.getElementById('divparamselected').style.display = "flex";
                document.getElementById('parameter').innerHTML = testParam.name;
                getDS();
            } else {
                console.log('Parameter is not open input.');
                populateParamList();
            }
        } else {
            console.log('Parameter does not exist.');
            populateParamList();
        }
    });
}

// Gets list of parameters in workbook and populates dropdown
function populateParamList() {
    console.log('Populating parameter list.');
    document.getElementById('divparamselector').style.display = "flex";
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(params => {
        let options = "";
        let t = 0;
        for (p of params) {
            if (p.allowableValues.type == "all") {
                options += "<option data-type='" + p.dataType + "' value='" + p.parameterImpl._parameterInfo.name + "'>" + p.parameterImpl._parameterInfo.name + "</option>";
                t++
            }
        }
        if (t == 0) {
            document.getElementById('paramselect').innerHTML = "<option value='' disabled>No parameters found</option>";
            document.getElementById('perror').innerHTML = "Error: You must have a parameter with an open input.";
        } else {
            document.getElementById('paramselect').innerHTML = options;
            document.getElementById('parameterset').disabled = false;
        }
    });
}

// Sets the parameter to update
function setParam() {
    let pname = document.getElementById('paramselect').value;
    console.log('Setting parameter to ' + pname + '.');
    if (pname != '') {
        pdatatype = document.getElementById('paramselect').dataset.type;
        tableau.extensions.settings.set('selParam', pname);
        tableau.extensions.settings.saveAsync().then(result => {
            console.log("Set selParam = " + tableau.extensions.settings.get('selParam'));
        });
        document.getElementById('divparamselector').style.display = "none";
        document.getElementById('divparamselected').style.display = "flex";
        document.getElementById('parameter').innerHTML = pname;
        getDS();
    }
}

// Gets list of data sources in workbook
function getDS() {
    let wslist = [];
    dsnames = [];
    dslist = [];
    dashboard.worksheets.forEach(function(worksheet) {
        worksheet.getDataSourcesAsync().then(function(datasources) {
            datasources.forEach(function(datasource) {
                if (dsnames.indexOf(datasource.name) == -1) {
                    dsnames.push(datasource.name);
                    dslist.push(datasource);
                }
            });
            if (wslist.indexOf(worksheet.name) == -1) {
                wslist.push(worksheet.name);
            }
            if (wslist.length == dashboard.worksheets.length) {
                console.log(dslist);
                testDataSourceSettings();
            }
        });

    });
}

// Tests if currently set Data Source exists
function testDataSourceSettings() {
    console.log('Testing data source settings.');
    let dsset = tableau.extensions.settings.get('selDataSource');
    if (dsset && dsnames.indexOf(dsset) > -1) {
        console.log('Data source exists.');
        document.getElementById('divdatasourceselector').style.display = "none";
        document.getElementById('divdatasourceselected').style.display = "flex";
        document.getElementById('datasource').innerHTML = dsset;
        dataSource = dslist[dsnames.indexOf(dsset)];
        testFieldSettings();
    } else {
        console.log('Data source does not exist or was not set.');
        populateDataSourceList();
    }
}

// Selects data source or shows drop down
function populateDataSourceList() {
    console.log('Populating data source list.');
    document.getElementById('divdatasourceselector').style.display = "flex";
    if (dslist.length == 1) {
        tableau.extensions.settings.set('selDataSource', dslist[0].name);
        tableau.extensions.settings.saveAsync();
        document.getElementById('divdatasourceselector').style.display = "none";
        document.getElementById('divdatasourceselected').style.display = "flex";
        document.getElementById('datasource').innerHTML = dslist[0].name;
        dataSource = dslist[0];
        testFieldSettings();
    } else {
        let options = "";
        let t = 0;
        for (ds of dslist) {
            options += "<option value='" + ds.name + "'>" + ds.name + "</option>";
            t++
        }
        if (t == 0) {
            document.getElementById('datasourceselect').innerHTML = "<option value='' disabled>No data sources found</option>";
        } else {
            document.getElementById('datasourceselect').innerHTML = options;
            document.getElementById('datasourceselect').disabled = false;
            document.getElementById('datasourceset').disabled = false;
        }
    }

}

// Sets the Data Source to pull values from for Dynamic Parameter
function setDataSource() {
    let dsname = document.getElementById('datasourceselect').value;
    console.log('Setting data source to ' + dsname + '.');
    if (dsname != '') {
        tableau.extensions.settings.set('selDataSource', dsname);
        tableau.extensions.settings.saveAsync().then(result => {
            console.log("Set selDataSource = " + tableau.extensions.settings.get('selDataSource'));
        });
        dataSource = dslist[dsnames.indexOf(dsname)];
        console.log(dataSource);
        document.getElementById('divdatasourceselector').style.display = "none";
        document.getElementById('divdatasourceselected').style.display = "flex";
        document.getElementById('datasource').innerHTML = dsname;
        testFieldSettings();
    }
}

// Tests if currently set Field to pull domain from exists
function testFieldSettings() {
    console.log('Testing field settings.');
    let fset = tableau.extensions.settings.get('selField');
    if (fset) {
        dataSource.getUnderlyingDataAsync().then(dataTable => {
            if (dataTable.columns.find((column) => column.fieldName == fset)) {
                console.log('Field exists.');
                document.getElementById('divfieldselector').style.display = "none";
                document.getElementById('divfieldselected').style.display = "flex";
                document.getElementById('field').innerHTML = fset;
                document.getElementById('submit').disabled = false;
                testWSSettings();
            } else {
                populateFieldList();
            }
        });
    } else {
        populateFieldList();
    }
}

// Gets list of fields
function populateFieldList() {
    console.log('Populating Field List');
    document.getElementById('divfieldselector').style.display = "flex";
    dataSource.getUnderlyingDataAsync().then(columns => {
        let options = "";
        let t = 0;
        console.log(columns);
        for (f of columns.columns) {
            // if (f.dataType == pdatatype) {
            console.log(f.dataType);
            options += "<option value='" + f.fieldName + "'>" + f.fieldName + "</option>";
            t++
            // }
        }
        if (t == 0) {
            document.getElementById('fieldselect').innerHTML = "<option value='' disabled>No fields found</option>";
            //document.getElementById('ferror').innerHTML = "Error: You must have a field on the DataViz worksheet.";
        } else {
            document.getElementById('fieldselect').innerHTML = options;
            document.getElementById('fieldselect').disabled = false;
            document.getElementById('fieldset').disabled = false;
        }
    });
}

// Sets the field to pull values from for Dynamic Parameter
function setField() {
    let fname = document.getElementById('fieldselect').value;
    console.log('Setting field to ' + fname + '.');
    if (fname != '') {
        tableau.extensions.settings.set('selField', fname);
        tableau.extensions.settings.saveAsync().then(result => {
            console.log("Set selField = " + tableau.extensions.settings.get('selField'));
        });
        document.getElementById('divfieldselector').style.display = "none";
        document.getElementById('divfieldselected').style.display = "flex";
        document.getElementById('field').innerHTML = fname;
        document.getElementById('submit').disabled = false;
        testWSSettings();
    }
}

function toggleWS() {
    if (document.getElementById('relcheck').checked == true) {
        document.getElementById('relselect').style.display = "inline";
    } else {
        document.getElementById('relselect').style.display = "none";
    }
}

// Tests if currently set Worksheet to pull filters from exists
function testWSSettings() {
    console.log('Testing worksheet settings.');
    let wsset = tableau.extensions.settings.get('selWorksheet');
    if (wsset) {
        if (dashboard.worksheets.find(ws => ws.name == wsset)) {
            console.log('Worksheet exists.');
            document.getElementById('divwsselector').style.display = "none";
            document.getElementById('divwsselected').style.display = "flex";
            document.getElementById('worksheet').innerHTML = wsset;
        }
    }
}

function populateWS() {
    console.log(tableau.extensions.dashboardContent.dashboard.worksheets)
    let options = "";
    let t = 0;
    for (ws of tableau.extensions.dashboardContent.dashboard.worksheets) {
        options += "<option value='" + ws.name + "'>" + ws.name + "</option>";
        t++
    }
    if (t == 0) {
        document.getElementById('wsselect').innerHTML = "<option value='' disabled>No fields found</option>";
    } else {
        document.getElementById('wsselect').innerHTML = options;
    }
}

function setWS() {
    let wsname = document.getElementById('wsselect').value;
    console.log('Setting worksheet to ' + wsname + '.');
    if (wsname != '') {
        tableau.extensions.settings.set('selWorksheet', wsname);
        tableau.extensions.settings.set('dpRelevant', 'true');
        tableau.extensions.settings.saveAsync().then(result => {
            console.log("Set selWorksheet = " + tableau.extensions.settings.get('selWorksheet'));
            console.log("Set dpRelevant = " + tableau.extensions.settings.get('dpRelevant'));
        });
        document.getElementById('divwsselector').style.display = "none";
        document.getElementById('divwsselected').style.display = "flex";
        document.getElementById('worksheet').innerHTML = wsname;
    }
}

function clearWS() {
    tableau.extensions.settings.set('dpRelevant', 'false');
    tableau.extensions.settings.erase('selWorksheet');
    tableau.extensions.settings.saveAsync().then(result => {
        console.log("Set dpRelevant = " + tableau.extensions.settings.get('dpRelevant'));
        console.log("Erased selWorksheet");
    });
    document.getElementById('divwsselector').style.display = "flex";
    document.getElementById('divwsselected').style.display = "none";
}

function submit() {
    tableau.extensions.settings.set('configured', 'true');
    tableau.extensions.settings.saveAsync().then(result => {
        tableau.extensions.ui.closeDialog(dataSource.name);
    });
}

function clearSettings() {
    console.log("Clearing settings.");
    tableau.extensions.settings.erase('selWorksheet');
    tableau.extensions.settings.erase('selDataSource');
    tableau.extensions.settings.erase('selField');
    tableau.extensions.settings.erase('selParam');
    tableau.extensions.settings.set('configured', 'false');
    tableau.extensions.settings.set('dpRelevant', 'false');
    tableau.extensions.settings.saveAsync();
    document.getElementById('divparamselector').style.display = "flex";
    document.getElementById('divparamselected').style.display = "none";
    document.getElementById('divdatasourceselector').style.display = "flex";
    document.getElementById('divdatasourceselected').style.display = "none";
    document.getElementById('divfieldselector').style.display = "flex";
    document.getElementById('divfieldselected').style.display = "none";
    document.getElementById('divwsselector').style.display = "flex";
    document.getElementById('divwsselected').style.display = "none";
    document.getElementById('perror').style.display = "none";
    document.getElementById('submit').disabled = true;
    document.getElementById('fieldselect').disabled = true;
    document.getElementById('fieldset').disabled = true;
    document.getElementById('datasourceselect').disabled = true;
    document.getElementById('datasourceset').disabled = true;
    console.log(tableau.extensions.settings.getAll());
    populateParamList();
}
