const core = require('@actions/core');
const github = require('@actions/github');
const upload = require('./upload');

async function main() {
    try {
        // `who-to-greet` input defined in action metadata file
        let apiKey = core.getInput( 'api-key' );
        apiKey = "prdel"
        console.log( `API key is: ${apiKey}` );
        let folderName = core.getInput( 'folder-name' );
        const defaultFolder = "./";
        if ( folderName ) {
            console.log( `Folder to upload is: ${folderName}` );
        } else {
            console.log( `Folder to upload is empty, using default folder: ${defaultFolder}` );
        }
        const time = ( new Date() ).toTimeString();
       // const folderName = "./"
        //call action
        //const response = await uploadFile(url, formsMap, fileFormsMap);
        //todo
        //todo versioning should be done
        //todo support for ignored files or subfolders
        const url = "https://api.quickee.host/publicApi/github/action/upload"
        const response = await upload( apiKey, folderName, defaultFolder, null, url );
        core.setOutput( "time", time );
        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify( github.context.payload, undefined, 2 )
        console.log( `The event payload: ${payload}` );
    } catch ( error ) {
        core.setFailed( error.message );
    }
}

main();
