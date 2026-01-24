# @nexide/strapi-provider-bunny

Bunny.net Upload Provider for Strapi V5.

## Installation

```bash
npm install @nexide/strapi-provider-bunny
```

or

```bash
yarn add @nexide/strapi-provider-bunny
```

## Configurations

See the [using a provider](https://strapi.io/documentation/developer-docs/latest/development/plugins/upload.html#using-a-provider) documentation for information on installing and using a provider. And see the [environment variables](https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#environment-variables) for setting and using environment variables in your configs.

**Example**

`./config/plugins.js`

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: '@nexide/strapi-provider-bunny',
      providerOptions: {
        api_key: env('BUNNY_API_KEY'),
        storage_zone: env('BUNNY_STORAGE_ZONE'),
        pull_zone: env('BUNNY_PULL_ZONE'),
        hostname: env('BUNNY_HOSTNAME'),
        upload_path: env('BUNNY_UPLOAD_PATH'),
      },
    },
  },
  // ...
});
```

`.env`

```
BUNNY_API_KEY: Storage Password (Inside FTP & API Access).
BUNNY_STORAGE_ZONE: Storage Zone name.
BUNNY_HOSTNAME: Hostname value (Inside FTP & API Access). eg: ny.storage.bunnycdn.com
BUNNY_PULL_ZONE: Pull Zone URL.
BUNNY_UPLOAD_PATH: Upload path, optional.  Should be in the form 'path/subdir' without leading and trailing slashes.
```

Enter Pull Zone URL without trailing slash – `<pull-zone-name>.b-cdn.net`.\
Optionally add Storage Endpoint Url without trailing slash ([read more](https://docs.bunny.net/reference/storage-api#storage-endpoints))

### Optional configuration

#### generate_upload_file_name

Function that is executed to generate the name of the uploaded file. This method can give more control over the file name and can for example be used to include a custom hashing function or dynamic path.

When no function is provided, ``${upload_path ? `${upload_path}/` : ''}${file.hash}${file.ext}`` is used.

Example:

```ts
  generate_upload_file_name: async (file: File) => {
    const hash = await ...; // Some hashing function, for example MD-5
    const extension = file.ext.toLowerCase().substring(1);
    return `${extension}/${slugify(path.parse(file.name).name)}-${hash}.${extension}`;
  },
```

### Security Middleware Configuration

Due to the default settings in the Strapi Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library. You should replace `strapi::security` string with the object bellow instead as explained in the [middleware configuration](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order) documentation.

`./config/middlewares.js`

```js
module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            `https://${process.env.BUNNY_PULL_ZONE}`,
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            `https://${process.env.BUNNY_PULL_ZONE}`,
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  //  ...
];
```
