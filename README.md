# Frida-iOS-Cipher
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/Humenger/frida-ios-cipher/.github%2Fworkflows%2Fbuild.yml)
## Introduction
Intercept all cryptography-related functions on iOS with Frida Api.
## Support Algorithm
* [x] `AES`
* [x] `DES`,`3DES`
* [x] `CAST`(What it's?)
* [x] `RC2`,`RC4`
* [x] `Blowfish`
* [x] `SHA1`,`SHA224`,`SHA256`,`SHA384`,`SHA512`
* [x] `MD2`,`MD4`,`MD5`
* [x] `HMAC`
* [x] `PBKDF`
## Config
```js
const CIPHER_CONFIG={
    "enable":true,//global enable
    "crypto":{
        "enable":true,//crypto enable
        "maxDataLength":240,//Maximum length of single data printout
        "printStack":false,
        "aes":true,
        "des":true,
        "3des":true,
        "cast":true,
        "rc4":true,
        "rc2":true,
        "blowfish":true,
    },
    "hash":{
        "enable":true,//hash enable
        "maxInputDataLength":240,
        "printStack":false,
        "md2":true,
        "md4":true,
        "md5":true,
        "sha1":true,
        "sha224":true,
        "sha256":true,
        "sha384":true,
        "sha512":true
    },
    "hmac":{
        "enable":true,//hmac enable
        "maxInputDataLength":240,
        "printStack":false,
        "sha1":true,
        "md5":true,
        "sha224":true,
        "sha256":true,
        "sha384":true,
        "sha512":true,
    },
    "pbkdf":{
        "enable":true,
        "printStack":false,
    }
}

```
## Build
```bash
npm install 
npm run build
```
