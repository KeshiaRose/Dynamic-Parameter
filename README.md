# Dynamic Parameter Extension
This extension allows you to add dynamic parameter capabilities to a Tableau dashboard.

# Installing the Extension

Download and install the Extensions API version of Tableau Desktop from the [Tableau Extensions API Developer Preview](https://prerelease.tableau.com) site. Under **Resources**, click **Extensions API Software Downloads**. 

Current version: 18.0322.2000

Download the Dynamic Parameter [manifest file](https://keshiarose.github.io/Dynamic-Parameter/DynamicParameter.trex). 

# Using the Extension
1.	Create an open input (All) parameter with a data type matching the field you want to use to populate it
2.	Drag in a new Extension object to your dashboard
3.	Find the manifest (.trex) file you downloaded above
4.	Select the parameter you created above for the extension to manipulate
5.	Select the data source that holds the field you want to base your parameter on (if only one data source present, the extension will auto select it)
6.	Select the field you want to base your parameter on
7.	Optional: If you want your parameter to only contain relevant values, check the box and select the worksheet that has the filters you want to affect the dynamic parameter
8.	Click 'Add dynamic parameter'