import { promises as fsPromises } from 'fs'
import { dirname } from 'path'
import superagent from 'superagent'
import mkdirp from 'mkdirp'
import { urlToFilename, getPageLinks } from './utils.js'

/**
 * mkdirp is a callback based function but we can use promisification to get a promisifed version for this
 */
const mkdirpPromises = promisify(mkdirp)

/**
 *
 * @param {*} url of web source from which to download content
 * @param {*} filename where to store downloaded content
 * @returns a promise which resolves with value of content downloaded from url
 */
function download(url, filename) {
    console.log(`Downloading ${url}`)
    let content
    return superagent
        .get(url)
        .then((res) => {
            content = res.text
            return mkdirpPromises(dirname(filename))
        })
        .then(() => {
            fsPromises.writeFile(filename, content)
        })
        .then(() => {
            console.log(`Downloaded and saved: ${url}`)
            return content
        })
}

/**
 *
 * @param {*} currentUrl
 * @param {*} content
 * @param {*} nesting
 * @returns
 */

function spiderLinks(currentUrl, content, nesting) {
    let promise = Promise.resolve()
    if (nesting === 0) {
        return promise
    }
    const links = getPageLinks(currentUrl, content)    
    /**
     * Sequential Execution of Promises
     * above code generates a promise chain as a then will only be called once promise on which it is called resolves
     * in this case spiderLinks also returns a promise 
     */
    // for (const link of links) {
    //     promise = promise.then(() => spiderLinks(link, nesting - 1))
    // }
    // return promise

    /**
     * Parallel execution of Promises
     */

    const promises = links.map(link => spider(link, nesting - 1));
    return Promise.all(promises);
}

export function spider(url, nesting) {
    const filename = urlToFilename(url)
    return fsPromises
        .readFile(filename, 'utf8')
        .catch((err) => {
            if (err.code !== 'ENONET') {
                throw err
            }
        })
        .then((content) => spiderLinks(url, content, nesting))
}
