# Google Apps Script Sync
>Download your Google Apps Script project locally and sync with GitHub

# Getting Started

## Requirements
  * brew install npm
  * npm install -g google-apps-script-sync (not working yet)

## Setup
  You'll need to configure access to your Google Apps Script through the Google Drive SDK to use the tools provided by this script. Follow the instructions below to get up and running!

  1) Activate the Drive API in a Google Developer Project and download Client credentials.
    * Create a new project in the Google Developer Console for this tool to access your Google drive. (Using this link guides you through the process and activates the Drive API automatically.)[https://console.developers.google.com/start/api?id=drive&credential=client_key]
    * Make sure `Create a new project` is selected and click `Continue` and you'll end up on the Credentials page.
    * Since this is a new project, you'll have to configure a simple consent screen. Select `Create new Client ID -> Web Application -> Configure consent screen`
    * Select the correct address from the `Email address` dropdown and add a name of your choice to `Product Name`. All other fields are not required. Click `Continue`
    * Select `Web application -> Create Client ID.` Don't worry about the `Authorized JavaScript origins` and `Authorized redirect URIs`, the defaults are fine.
    * Download your credentials. Click `Download JSON`. Remember where this gets stored

  2) Run `node init.js /path/to/credentials.json` in Terminal, where `/path/to/credentials.json` is the path to the file you just downloaded in step (1). Follow the instructions on screen
    * You'll see a message in terminal: `Please visit the following url in your browser`. A consent screen will pop up with the project name you entered earlier.
    * After visiting that url, you'll be redirected to a blank/dummy page. Look in the url for `?code=XXXXXXX`. Copy everything after the `=` and paste it back in Terminal and hit enter.

  3) That's it! You won't be asked for the code again unless the credentials expire.