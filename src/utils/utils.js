import glob from 'glob';
import path from 'path';
import fs from 'fs';
import Constant from '../constants';
import ASCIIFolder from './ASCIIFolding'
// Write all util functions here

// Paging function to set default list
export function paging(query) {
    let pager = {
        limit: 20,
        offset: 0
    }
    if (query['getAll'] && query['getAll'].toString() === 'true') {
        return {}
    }
    let page = query['page'] ? parseInt(query['page'].toString(), 10) : Constant.instance.DEFAULT_PAGE_NUMBER;
    let limit = query['limit'] ? parseInt(query['limit'].toString(), 10) : Constant.instance.DEFAULT_LIMIT_PER_PAGE;
    pager.limit = limit;
    pager.offset = (page - 1) * limit;
    return pager;
}

export function bytesToHumanValue(n) {
    // Calculate bytes to human readable value
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    if (n == 0) {
        return "n/a";
    }
    const i = parseInt(Math.floor(Math.log(n) / Math.log(1024)));
    if (i == 0) {
        return n + " " + sizes[i];
    }
    return (n / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

export function secondToHumanValue(n) {
    let result = "";
    n = Math.ceil(n);
    let day = Math.floor(n / (24 * 60 * 60));
    if (day > 0)
        result = result + `${day} day `
    n = n - day * 24 * 60 * 60;
    let hours = Math.floor(n / (60 * 60));
    let mins = Math.floor((n - 60 * 60 * hours) / 60);
    let sec = n - 60 * 60 * hours - mins * 60;
    result = result + `${hours < 10 ? '0' + hours: hours}:${mins < 10 ? '0' + mins: mins}:${sec < 10 ? '0'+sec : sec}`;
    return result;
}

let cachedPublicKey;
let cachedPrivateKey;
export function getPrivateKey()
{
    if (cachedPrivateKey != null)
    {
        return cachedPrivateKey;
    }
    else {
        let privateKey = fs.readFileSync(Constant.instance.PRIVATE_KEY_PATH);
        cachedPrivateKey = privateKey;
        return cachedPrivateKey;
    }
}

export function getPublicKey()
{
    if (cachedPublicKey != null)
    {
        return cachedPublicKey;
    }
    else {
        let publicKey = fs.readFileSync(Constant.instance.PUBLIC_KEY_PATH);
        cachedPublicKey = publicKey;
        return cachedPublicKey;
    }
}

export function getRandomString(length)
{
    return Math.random().toString(36).substring(2, 2 + length);
}
export function buildSlug (string, separator = '-') {
    let tmp = string
    tmp = (tmp || '').toLowerCase().trim()
    tmp = ASCIIFolder.fold(tmp)
    tmp = tmp.replace(/\s/g, `${separator}`)
    tmp = tmp.replace(new RegExp(`[^0-9a-zA-Z${separator}.]+`, 'g'), '')
    tmp = tmp.replace(new RegExp(`${separator}{1,}`, 'g'), `${separator}`)
    tmp = tmp.replace(new RegExp(`${separator}{1,}$`, 'g'), '')
    tmp = tmp.replace(new RegExp(`^${separator}{1,}`, 'g'), '')
    return tmp.replace(/\.+/gm, separator)
}
