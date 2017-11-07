# Dynamic Parameter Extension
This Tableau add-in allows you to add dynamic parameter capabilities to a Tableau dashboard.

# Installing the Add-In

### Download and install Tableau Desktop (with the Extensions API)

Download and install the Extensions API version of Tableau Desktop from the [Tableau Extensions API Developer Preview](https://prerelease.tableau.com) site. Under **Resources**, click **Extensions API Software Downloads**. 

### Download and install the Dynamic Parameter manifest file

Download the Dynamic Parameter [manifest file](https://keshiarose.github.io/Dynamic-Parameter/DynamicParameter.trex). To make the extension available in Tableau, you need to place the manifest file in an `Extensions` folder in the `My Tableau Repository (Beta)` folder (for example, `c:\User\Name\Documents\My Tableau Repository (Beta)\Extensions`). The extension will appear on a dashboard sheet, under **Extensions**. 

# Using the Add-In
1.	Drag in the add-in to your dashboard
2.	Select the worksheet that holds the data source you want to base your parameter on
3.	Select the data source that holds the field you want to base your parameter on
4.	Select the field you want to base your parameter on
5.	Select an already existing open input parameter for the add-in to affect

Once the parameter is set it will look something like this:
![Dynamic Parameter](https://raw.githubusercontent.com/KeshiaRose/Dynamic-Parameter/master/hosted/imgs/dp_preview.png)
- The blue filter icon toggles if the parameter is affected by filters on the worksheet or not.
    - (Note: if you use the “only relevant values” option, your field must be present on the worksheet to work)
- The red “x” clears the settings and you can start over.
