# Google Apps Script Sync
>Download your Google Apps Script project locally and sync with GitHub

## Getting Started

### Requirements
  - brew install npm
  - npm install -g google-apps-script-sync

### Setup
**You'll need to configure access to your Google Apps Script through the Google Drive SDK to use the tools provided by this script. Follow the instructions below to get up and running!**

1. Activate the Drive API in a Google Developer Project and download Client credentials.
  - Create a new project in the Google Developer Console for this tool to access your Google drive. [Using this link guides you through the process and activates the Drive API automatically.](https://console.developers.google.com/start/api?id=drive&credential=client_key)
  - Make sure "Create a new project" is selected and click `Continue`. You'll end up on the Credentials page.
  - Since this is a new project, you'll have to configure a simple consent screen. Select `Create new Client ID -> Web Application -> Configure consent screen`
  - Select the correct address from the Email address dropdown and add a name of your choice to Product Name. All other fields are not required. Click `Continue`
  - Select `Web application -> Create Client ID.` Don't worry about the Authorized JavaScript origins and Authorized redirect URIs, the defaults are fine.
  - Download your credentials. Click `Download JSON`. We'll need this file in a minute.

2. Run `node init.js /path/to/credentials.json` in Terminal, where `/path/to/credentials.json` is the path to the file you just downloaded during the last part in step (1). Follow the instructions on screen.
  - You'll see a message in terminal: "Please visit the following url in your browser". A consent screen will pop up with the project name you entered earlier.
  - After visiting that url, you'll be redirected to a blank/dummy page. Look in the url for `?code=XXXXXXX`. Copy everything after the `=` and paste it back in Terminal and hit enter.

3. That's it! You won't be asked for the code again unless the credentials expire.

### Usage
#### Download a project
Run `gas download <fileId>`(alias: clone) in Terminal to clone down an existing Google Apps Script project.

`<fileId>` can be found buried in the url of your App Script project when editing in browser. Look for the weird string after /d/ and before /edit/. It should look something like this: "scripts.google.com/xxxx/d/**[YOUR_FILE_ID_HERE]**/edit?"

This command will create an exact copy of your project on your local file system and store it your current working directory (just like git clone). cd into it and open up in your favorite development environment. **NOTE: This command will overwrite an existing folder with the same name as your project.** If you have made changes locally, make sure to upload them before running download again or your changes will be lost.

.gs files will be converted to .js files when downloaded locally. This is normal and they will be converted back when re-uploaded.

NOTE: In addition to your project files, you'll notice a `manifest.json` file . This should not be messed with unless you know exactly what you're doing.

#### Upload a project
Run `gas upload`(alias: push) in Terminal from within your project directory to push back your Google Apps Script project. Any files deleted locally will also be deleted in Drive, and any files created locally will be added to Drive (you can only create .js and .html files, make sure any new script files are .js when created locally).

GASync can only upload projects that it has first downloaded. If you want to start a new project, you'll have to create it in the web editor, get it's ID and download it.
