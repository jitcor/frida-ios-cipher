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
## Instructions for use
* You can customize the functions you want to intercept printing by turning them on (they are all turned on by default).
* Print data limit (default maximum 240 bytes for a single piece of data, where there is no limit for key, hash and digest results)
* and stack information (off by default)
* Doesn't differentiate between OC or Swift, the api calls for encryption are the same for both languages
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
> Because printing the stack may lead to program execution exceptions, printStack is off by default, and you can turn it on by yourself if you need to.
## Build
```bash
npm install 
npm run build
```
## Replenishment
Of course there are a couple of functions that don't do interceptions, as shown below:
```c
CCCryptorStatus
     CCCryptorCreateFromData(CCOperation op, CCAlgorithm alg,
         CCOptions options, const void *key, size_t keyLength, const void *iv,
         const void *data, size_t dataLength, CCCryptorRef *cryptorRef,
         size_t *dataUsed);
```
* This function also calls CCCryptorCreate internally, so it doesn't do interceptions
* Similarly CCCryptorCreateFromDataWithMode
* There are also a couple of CCDigest functions that are too cold to be added later if encountered
* There are also a couple of random functions as well as UUIDs, which seem to be strictly within the scope of cryptography, to which I'll add later on
* As for asymmetric encryption, I can't seem to find an official implementation at the moment
