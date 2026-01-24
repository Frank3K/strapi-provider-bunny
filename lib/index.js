import{errors}from"@strapi/utils";import axios from"axios";import{Buffer}from"buffer";import mime from"mime";const{ApplicationError}=errors,init=({api_key:a,storage_zone:b,pull_zone:c,hostname:d,upload_path:e,generate_upload_file_name:f})=>{if(!a||!b||!c||!d)throw new ApplicationError("BUNNY_API_KEY, BUNNY_HOSTNAME, BUNNY_STORAGE_ZONE or BUNNY_PULL_ZONE can't be null or undefined.");/**
   * Uploads a file to Bunny CDN.
   *
   * @param {Object} file - The file object to upload.
   * @param {Buffer|Stream} file.stream - The file data as a stream or buffer.
   * @param {string} file.hash - The hash of the file.
   * @param {string} file.ext - The file extension.
   * @returns {Promise<void>} A promise that resolves when the file is uploaded.
   */const g=async g=>{const h=g.stream||Buffer.from(g.buffer,"binary"),i="function"==typeof f?await f(g):`${e?`${e}/`:""}${g.hash}${g.ext}`;try{const e=await axios.put(`https://${d}/${b}/${i}`,h,{headers:{AccessKey:a,"content-type":"application/octet-stream"}});if(201!==e.data.HttpCode)throw new ApplicationError(`Error uploading to Bunny.net: ${e.data.Message}`);g.url=`https://${c}/${i}`}catch(a){throw new ApplicationError(`Error uploading to Bunny.net: ${a.message}`)}};/**
   * Downloads a file from Bunny CDN.
   *
   * @param {Object} file - The file object to download.
   * @param {string} file.hash - The hash of the file.
   * @param {string} file.ext - The file extension.
   * @returns {Promise<Object>} A promise that resolves with the downloaded file data.
   *//**
   * Deletes a file from Bunny CDN.
   *
   * @param {Object} file - The file object to delete.
   * @param {string} file.hash - The hash of the file.
   * @param {string} file.ext - The file extension.
   * @returns {Promise<void>} A promise that resolves when the file is deleted.
   */return{upload:g,download:async c=>{try{const f=e?`${e}/`:"",g=await axios.get(`https://${d}/${b}/${f}${c.hash}${c.ext}`,{headers:{AccessKey:a},responseType:"arraybuffer"// Para manejar diferentes tipos de archivos
}),h=mime.getType(c.ext);let i;return i=/^text(\/|$)/.test(h)?g.data.toString("utf8"):"application/json"===h?JSON.parse(g.data.toString("utf8")):Buffer.from(g.data),{type:h,body:i}}catch(a){throw new ApplicationError(`Error downloading from Bunny.net: ${a.message}`)}},delete:async e=>{if(e.url)try{const f=e.url.replace(`https://${c}/`,""),g=await axios.delete(`https://${d}/${b}/${f}`,{headers:{AccessKey:a}});200!==g.data.HttpCode&&console.error("Soft Error: Failed to delete file; has it already been deleted?",g.data)}catch(a){console.error("Soft Error: Failed to delete file; has it already been deleted?",a.message)}},uploadStream:g}};/**
 * Initialize Bunny CDN Storage integration.
 *
 * @param {Object} config - The configuration object for Bunny CDN.
 * @param {string} config.api_key - The API key for Bunny CDN.
 * @param {string} config.storage_zone - The storage zone name in Bunny CDN.
 * @param {string} config.pull_zone - The pull zone name in Bunny CDN.
 * @param {string} config.hostname - The region of the Bunny CDN storage.
 * @param {string?} config.upload_path - The default upload path, optional
 * @param {Function?} config.generate_upload_file_name - Function to generate upload filenames, optional
 * @returns {Object} The initialized upload, download, and delete methods.
 */export{init};