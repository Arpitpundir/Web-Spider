import {promises as fsPromises} from 'fs';
import {dirname} from path;
import superagent from 'superagent';
import mkdirp from 'mkdirp';
import {urlToFilename, getPageLinks} from './utils.js';

/**
 * mkdirp is a callback based function but we can use promisification to get a promisifed version for this
 */
const mkdirpPromises = promisify(mkdirp);

function download(url, filename){
    console.log(`Downloading ${url}`);
    let content;
    return superagent.get(url).then(res => {
        content = res.text;
        return mkdirpPromises(dirname(filename));
    }).then(() => {
        fsPromises.writeFile(filename, content);
    }).then(() => {
        console.log(`Downloaded and saved: ${url}`);
        return content;
    })
}