import { errors } from '@strapi/utils';
import axios from 'axios';
import { Buffer } from 'buffer';
import mime from 'mime';

const { ApplicationError } = errors;

/**
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
 */

const init = ({
  api_key,
  storage_zone,
  pull_zone,
  hostname,
  upload_path,
  generate_upload_file_name,
}) => {
  if (!api_key || !storage_zone || !pull_zone || !hostname) {
    throw new ApplicationError(
      "BUNNY_API_KEY, BUNNY_HOSTNAME, BUNNY_STORAGE_ZONE or BUNNY_PULL_ZONE can't be null or undefined.",
    );
  }

  /**
   * Uploads a file to Bunny CDN.
   *
   * @param {Object} file - The file object to upload.
   * @param {Buffer|Stream} file.stream - The file data as a stream or buffer.
   * @param {string} file.hash - The hash of the file.
   * @param {string} file.ext - The file extension.
   * @returns {Promise<void>} A promise that resolves when the file is uploaded.
   */
  const upload = async (file) => {
    const data = file.stream || Buffer.from(file.buffer, 'binary');

    const filePath =
      typeof generate_upload_file_name === 'function'
        ? await generate_upload_file_name(file)
        : `${upload_path ? `${upload_path}/` : ''}${file.hash}${file.ext}`;

    try {
      const response = await axios.put(
        `https://${hostname}/${storage_zone}/${filePath}`,
        data,
        {
          headers: {
            AccessKey: api_key,
            'content-type': 'application/octet-stream',
          },
        },
      );

      if (response.data.HttpCode !== 201) {
        throw new ApplicationError(
          `Error uploading to Bunny.net: ${response.data.Message}`,
        );
      }

      file.url = `https://${pull_zone}/${filePath}`;
    } catch (error) {
      throw new ApplicationError(
        `Error uploading to Bunny.net: ${error.message}`,
      );
    }
  };

  /**
   * Deletes a file from Bunny CDN.
   *
   * @param {Object} file - The file object to delete.
   * @param {string} file.hash - The hash of the file.
   * @param {string} file.ext - The file extension.
   * @returns {Promise<void>} A promise that resolves when the file is deleted.
   */
  const deleteFile = async (file) => {
    if (!file.url) {
      return;
    }

    try {
      const filePath = file.url.replace(`https://${pull_zone}/`, '');
      const response = await axios.delete(
        `https://${hostname}/${storage_zone}/${filePath}`,
        {
          headers: {
            AccessKey: api_key,
          },
        },
      );

      if (response.data.HttpCode !== 200) {
        console.error(
          'Soft Error: Failed to delete file; has it already been deleted?',
          response.data,
        );
      }
    } catch (error) {
      console.error(
        'Soft Error: Failed to delete file; has it already been deleted?',
        error.message,
      );
    }
  };

  return {
    upload,
    delete: deleteFile,
    uploadStream: upload,
  };
};

export { init };
