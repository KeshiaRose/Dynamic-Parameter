
# Dynamic Parameter Extension
This extension allows you to add dynamic parameter capabilities to a Tableau dashboard.

# Installing the Extension

### Download and install Tableau Desktop (with the Extensions API)

Download and install the Extensions API version of Tableau Desktop from the [Tableau Extensions API Developer Preview](https://prerelease.tableau.com) site. Under **Resources**, click **Extensions API Software Downloads**. 

### Download and install the Dynamic Parameter manifest file

Download the Dynamic Parameter [manifest file](https://keshiarose.github.io/Dynamic-Parameter/DynamicParameter.trex). 

# Using the Extension
1.	Create an open input (All) parameter
2.	Drag in a new Extension object
3.	Find the manifest (.trex) file you downloaded above
4.	Select the worksheet that holds the data source you want to base your parameter on
5.	Select the data source that holds the field you want to base your parameter on (if only one data source present, the extension will auto select it)
6.	Select the field you want to base your parameter on
7.	Select the parameter you created above for the extension to manipulate

Once the parameter is set it will look something like this:
![Dynamic Parameter](https://raw.githubusercontent.com/KeshiaRose/Dynamic-Parameter/master/hosted/imgs/dp_preview.png)
- The blue filter icon toggles if the parameter is affected by filters on the worksheet or not.
    - (Note: if you use the “only relevant values” option, your field must be present on the worksheet to work)
- The red “x” clears the settings and you can start over.