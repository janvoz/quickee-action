const axios = require( 'axios' );
const FormData = require( 'form-data' );
const fs = require( 'fs' );
const {promisify} = require( 'util' );
const JSZip = require( 'jszip' );
const zipper = require( 'zip-local' );
const {all} = require( "axios" );
const path = require( "path" );
const fileSaver = require('file-saver');

async function upload ( apiKey, folderName, defaultFolderName, zipFile, url ) {
	const form = await buildForm( apiKey, folderName, defaultFolderName, zipFile );
	const headers = await getFormHeaders(form);
	console.log(form)
	console.log(headers)
	return axios.post(url, form, {headers: headers,maxContentLength: Infinity})
}

async function buildForm ( apiKey, folderName, defaultFolderName, zipFile ) {
	const form = new FormData();
	form.append( "apiKey", apiKey );
	let folderToZip = defaultFolderName;
	if ( folderName ) {
		folderToZip = folderName;
	}
	if ( zipFile ) {
		//todo check jestli existuje
		//pridani souboru do parameru a upload
		//return
		return form;
	}
	var allPaths = [];
	try {
		const stat = fs.lstatSync( folderToZip );
		if ( stat.isDirectory() ) {
			allPaths.push( ...getFilePathsRecursiveSync( folderToZip ) )
		}
	} catch ( e ) {
		console.log( e )
		console.log( "Folder " + folderToZip + " does not exists!" );
	}
	let zip = new JSZip()
	for ( let filePath of allPaths ) {
		let addPath = path.relative(folderToZip, filePath);
		let data = fs.readFileSync( filePath )
		zip.file( addPath, data )
	}
	/*
	await zip.generateNodeStream( {type: 'nodebuffer', streamFiles: false} )
	   .pipe( fs.createWriteStream( 'zipToUploadQuickee.zip' ) )
	   .on( 'finish', function () {
		   console.log( "sample.zip written." );
		   form.append("file", fs.createReadStream("zipToUploadQuickee.zip"));
	   } );

	 */

	const content = await zip.generateAsync( {type: "blob"} );
	const buffer = Buffer.from( await content.arrayBuffer() );
	await writeFile( "zipToUploadQuickee.zip", buffer )

	console.log("aaaaaaaaaaaaaa")
	//form.append("file", "zipToUploadQuickee.zip");
	form.append("file", fs.createReadStream("zipToUploadQuickee.zip"));

	//form.append("file", fs.createReadStream("xxx.zip"));
	return form
}

async function writeFile(filename, data) {
	return new Promise((resolve, reject) => {
		fs.writeFile(filename, data, (e) => {
			if (e) {
				//todo error callback?
				// if you want to continue and adjust the count
				// even if the writeFile failed
				// you don't need the reject here
				return reject(e);
			}
			console.log("saved")
			resolve();
		});
	});
}

async function getFormHeaders ( form ) {
	const getLen = promisify( form.getLength ).bind( form );
	const len = await getLen();
	return {
		...form.getHeaders(), 'Content-Length': len
	}
}

function getFilePathsRecursiveSync ( dir ) {
	var results = []
	list = fs.readdirSync( dir )
	var pending = list.length
	if ( !pending ) {
		return results
	}
	for ( let file of list ) {
		file = path.resolve( dir, file )
		let stat = fs.statSync( file )
		if ( stat && stat.isDirectory() ) {
			res = getFilePathsRecursiveSync( file )
			results = results.concat( res )
		} else {
			results.push( file )
		}
		if ( !--pending ) {
			return results
		}
	}
	return results
}

module.exports = upload;
