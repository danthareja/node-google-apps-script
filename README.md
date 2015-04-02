# GAPS (Google APps Script)
>The easiest way to download/upload any _existing_ Google Apps Script projects.

## Requirements
  - [node v0.12.x](https://nodejs.org/download/)
  - `npm install -g node-google-apps-script`
    
## Setup
**You'll need to configure access to your Google Apps Script through the Google Drive SDK to use the tools provided by this script. Follow the instructions below to get up and running!**

1. Activate the Drive API in a Google Developer Project and download Client credentials.
  - Create a new project in the Google Developer Console for this tool to access your Google drive. [Using this link guides you through the process and activates the Drive API automatically.](https://console.developers.google.com/start/api?id=drive&credential=client_key)
  - Make sure "Create a new project" is selected and click `Continue`. You'll end up on the Credentials page.
  - Since this is a new project, you'll have to configure a simple consent screen. Select `Create new Client ID -> Web Application -> Configure consent screen`
  - Select the correct address from the Email address dropdown and add a name of your choice to Product Name. All other fields are not required. Click `Continue`
  - Select `Web application -> Create Client ID.` Don't worry about the Authorized JavaScript origins and Authorized redirect URIs, the defaults are fine.
  - Download your credentials. Click `Download JSON`. We'll need this file in a minute.

2. Run `gaps init /path/to/credentials.json` in Terminal, where `/path/to/credentials.json` is the path to the file you just downloaded during the last part in step (1). Follow the instructions on screen.
  - You'll see a message in terminal: "Please visit the following url in your browser". A consent screen will pop up with the project name you entered earlier.
  - After visiting that url, you'll be redirected to a blank/dummy page. Look in the url for `?code=XXXXXXX`. Copy everything after the `=` and paste it back in Terminal and hit enter.

3. That's it! _You won't be asked for the code again unless the credentials expire._

## Usage
### Download a project
Run `gaps download <fileId>`(alias: clone) in Terminal to clone down an existing Google Apps Script project.

`<fileId>` can be found buried in the url of your App Script project when editing in browser. Look for the weird string after /d/ and before /edit/. It should look something like this: "scripts.google.com/xxxx/d/**[YOUR_FILE_ID_HERE]**/edit?"

This command will create an exact copy of your project on your local file system and store it your _current working directory_ (just like git clone). cd into it and open up in your favorite development environment! **This command will overwrite an existing folder with the same name as your project.**

You'll notice that `.gs` files will be converted to `.js` files when downloaded locally. This is normal and they will be converted back when re-uploaded. In addition to your project files, you'll also notice a `.manifest.json` file. Don't mess with this file and add it to `.gitignore` if you're uploading your project to GitHub.

#### Important Limitations
[Due to limitations in Google's API](https://developers.google.com/apps-script/import-export#limitations) GAPS will only works for projects that are "standalone", and not "container bound" to a specific document. Your project is container bound if it can _only_ be accessed via "Tools > Script Editor" in a specific Google Apps document (e.g. Sheets, Docs, Forms). If you see your script in your main Drive folder, it's a standalone and GAPS will totally work with it. [Learn more about container bound projects here.](https://developers.google.com/apps-script/guides/bound)

### Upload a project
Run `gaps upload`(alias: push) in Terminal from __the root of your project's directory_ to push it back up Google Drive.

Any files deleted locally will also be deleted in Drive, and any files created locally will be added to Drive. Google Apps Script only supports .js and .html files right now. Make sure any new script files are .js (not .gs) when created locally.

### Version control
The inspiration for this project came from Google's lack of version control. By having a local copy of your script, you can easily turn it into a git repo and manage it with GitHub.

**Best practice:** add .manifest.json to .gitignore. There is no need to push it to GitHub as the manifest is only needed locally for gaps to work correctly.

## Development
If you catch a bug or have a question, please let me know! Submit an issue or pull request and I'll happy to address it. I'm also thinking about extending this to a version control system.

If you want to develop (always welcome), clone down the repo and have at it! You can run `npm link` from the root directory of the repo to symlink to your local copy. You'll have to uninstall the production version first `npm uninstall -g node-google-apps-script`
