
/*************************************************************************************
 * Name: frida-ios-cipher
 * OS: iOS
 * Author: @shlu
 * Source: https://github.com/xpko/frida-ios-cipher
 * Desc: Intercept all cryptography-related functions on iOS with Frida Api.
 * refs:https://opensource.apple.com/source/CommonCrypto/CommonCrypto-36064/CommonCrypto/CommonCryptor.h
 * refs:https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man3/CC_MD5.3cc.html#//apple_ref/doc/man/3cc/CC_MD5
 * refs:https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man3/CC_SHA.3cc.html#//apple_ref/doc/man/3cc/CC_SHA
 * refs:https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man3/CCCryptor.3cc.html#//apple_ref/doc/man/3cc/CCCryptor
 * refs:https://opensource.apple.com/source/CommonCrypto/CommonCrypto-55010/CommonCrypto/CommonKeyDerivation.h.auto.html
 * refs:https://www.cnblogs.com/cocoajin/p/6150203.html
 * refs:https://frida.re/docs/javascript-api/
 * refs:https://codeshare.frida.re/@xperylab/cccrypt-dump/
 * refs:https://github.com/federicodotta/Brida
 * refs:https://github.com/sensepost/objection/blob/master/agent/src/ios/crypto.ts
 * refs:https://opensource.apple.com/source/CommonCrypto/CommonCrypto-60118.200.6/lib/CommonCryptor.c.auto.html
 * refs:https://opensource.apple.com/source/CommonCrypto/CommonCrypto-60026/CommonCrypto/CommonCryptor.h.auto.html
 * refs:https://www.jianshu.com/p/8896ed432dff
 * refs:https://opensource.apple.com/source/CommonCrypto/CommonCrypto-60118.200.6/lib/
 * refs:https://blog.csdn.net/q187543/article/details/103920969
 * refs:https://github.com/ptoomey3/Keychain-Dumper/blob/master/main.m
 * refs:https://github.com/seemoo-lab/apple-continuity-tools/blob/565f2a95d8c3a958ffb430a5022a2df923eb5c1b/keychain_access/frida_scripts/hook_SecItemCopyMatching.js
 * refs:https://codeshare.frida.re/@Shapa7276/ios-keychain-update/
 * refs:https://github.com/FSecureLABS/needle/blob/master/needle/modules/storage/data/keychain_dump_frida.py
 **************************************************************************************/
//config
const CIPHER_CONFIG={
    "enable":true,//global enable
    "highlighting":true,//syntax highlighting
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
        "filter":[]
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
        "sha512":true,
        "filter":[]
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
        "filter":[]
    },
    "pbkdf":{
        "enable": true,
        "printStack": false,
        "filter": []
    },
    "keychain": {
        "enable":true,
        "maxDataLength": 240,
        "printStack":false,
        "realtimeIntercept": true,
        "filter":[]
    }
}



//common
const COLORS = {
    "resetColor": CIPHER_CONFIG.highlighting?"\x1b[0m":"",
    "bold": CIPHER_CONFIG.highlighting?"\x1b[1m":"",
    "dim": CIPHER_CONFIG.highlighting?"\x1b[2m":"",
    "italic": CIPHER_CONFIG.highlighting?"\x1b[3m":"",
    "underline": CIPHER_CONFIG.highlighting?"\x1b[4m":"",
    "blink": CIPHER_CONFIG.highlighting?"\x1b[5m":"",
    "reverse": CIPHER_CONFIG.highlighting?"\x1b[7m":"",
    "hidden": CIPHER_CONFIG.highlighting?"\x1b[8m":"",
    "black": CIPHER_CONFIG.highlighting?"\x1b[30m":"",
    "red": CIPHER_CONFIG.highlighting?"\x1b[31m":"",
    "green": CIPHER_CONFIG.highlighting?"\x1b[32m":"",
    "yellow": CIPHER_CONFIG.highlighting?"\x1b[33m":"",
    "blue": CIPHER_CONFIG.highlighting?"\x1b[34m":"",
    "magenta": CIPHER_CONFIG.highlighting?"\x1b[35m":"",
    "cyan": CIPHER_CONFIG.highlighting?"\x1b[36m":"",
    "white": CIPHER_CONFIG.highlighting?"\x1b[37m":"",
    "bgBlack": CIPHER_CONFIG.highlighting?"\x1b[40m":"",
    "bgRed": CIPHER_CONFIG.highlighting?"\x1b[41m":"",
    "bgGreen": CIPHER_CONFIG.highlighting?"\x1b[42m":"",
    "bgYellow": CIPHER_CONFIG.highlighting?"\x1b[43m":"",
    "bgBlue": CIPHER_CONFIG.highlighting?"\x1b[44m":"",
    "bgMagenta": CIPHER_CONFIG.highlighting?"\x1b[45m":"",
    "bgCyan": CIPHER_CONFIG.highlighting?"\x1b[46m":"",
    "bgWhite": CIPHER_CONFIG.highlighting?"\x1b[47m":""
};

const CC_MD2_DIGEST_LENGTH = 16
const CC_MD4_DIGEST_LENGTH = 16
const CC_MD5_DIGEST_LENGTH = 16
const CC_SHA1_DIGEST_LENGTH=20;
const CC_SHA224_DIGEST_LENGTH=28;
const CC_SHA256_DIGEST_LENGTH=32;
const CC_SHA384_DIGEST_LENGTH=48;
const CC_SHA512_DIGEST_LENGTH=64;

const CCOperation:{[key:number]:string}={
    0: "kCCEncrypt",
    1: "kCCEncrypt",
    3: "kCCBoth"//Private Cryptor direction (op)
};
const CCAlgorithm:{[key:number]:string}= {
    0: "kCCAlgorithmAES",
    1: "kCCAlgorithmDES",
    2: "kCCAlgorithm3DES",
    3: "kCCAlgorithmCAST",
    4: "kCCAlgorithmRC4",
    5: "kCCAlgorithmRC2",
    6: "kCCAlgorithmBlowfish"
};

const CCOptions:{[key:number]:string}={
    //options for block ciphers
    1:"kCCOptionPKCS7Padding",
    2:"kCCOptionECBMode"
    //stream ciphers currently have no options
};
const CCMode:{[key:number]:string}={
    1: "kCCModeECB",
    2: "kCCModeCBC",
    3: "kCCModeCFB",
    4: "kCCModeCTR",
    5: "kCCModeF8", // Unimplemented for now (not included)
    6: "kCCModeLRW", // Unimplemented for now (not included)
    7: "kCCModeOFB",
    8: "kCCModeXTS",
    9: "kCCModeRC4",
    10: "kCCModeCFB8",
    11: "kCCModeGCM",
    12: "kCCModeCCM"
}
const CCPadding:{[key:number]:string}= {
    0: "ccNoPadding",
    1: "ccPKCS7Padding",
    12: "ccCBCCTS3"//Private Paddings
}
const CCModeOptions:{[key:number]:string}={
    0x0001:"kCCModeOptionCTR_LE",
    0x0002:"kCCModeOptionCTR_BE"
}
const CCKeySize:{[key:number]:string}={
    16:"kCCKeySizeAES128|kCCKeySizeMaxCAST",
    24:"kCCKeySizeAES192|kCCKeySize3DES",
    32:"kCCKeySizeAES256",
    8:"kCCKeySizeDES|kCCKeySizeMinBlowfish",
    5:"kCCKeySizeMinCAST",
    1:"kCCKeySizeMinRC4|kCCKeySizeMinRC2",
    512:"kCCKeySizeMaxRC4",
    128:"kCCKeySizeMaxRC2",
    56:"kCCKeySizeMaxBlowfish"
}
const CCHmacAlgorithm:{[key:number]:string}={
    0:"kCCHmacAlgSHA1",
    1:"kCCHmacAlgMD5",
    2:"kCCHmacAlgSHA256",
    3:"kCCHmacAlgSHA384",
    4:"kCCHmacAlgSHA512",
    5:"kCCHmacAlgSHA224",
}
const CCHmacAlgorithmLength:{[key:number]:number}={
    0:CC_SHA1_DIGEST_LENGTH,
    1:CC_MD5_DIGEST_LENGTH,
    2:CC_SHA256_DIGEST_LENGTH,
    3:CC_SHA384_DIGEST_LENGTH,
    4:CC_SHA512_DIGEST_LENGTH,
    5:CC_SHA224_DIGEST_LENGTH,
}

const CCPseudoRandomAlgorithm:{[key:number]:string}={
    1:"kCCPRFHmacAlgSHA1",
    2:"kCCPRFHmacAlgSHA224",
    3:"kCCPRFHmacAlgSHA256",
    4:"kCCPRFHmacAlgSHA384",
    5:"kCCPRFHmacAlgSHA512",
}
const CCPBKDFAlgorithm:{[key:number]:string}={
    2:"kCCPBKDF2"
}

// @ts-ignore
function print_arg(addr, len = 240, indent = null) {
    var result = "";
    try {
        if (!addr || addr.toInt32() === 0 || addr.isNull()) return "\n";
        result = "\n" + (hexdump(addr, {length: len})) + "\n";
    } catch (e) {
        if(e instanceof Error){
            console.warn("print_arg error:", e.stack);
        }
        result = addr + "\n";
    }
    if (indent != null) {
        result = result.split('\n')
            .map(line => indent + line)
            .join('\n');
    }
    return result;
}
function pointerToInt(ptr:NativePointer){
    try {
        if (!ptr || ptr.toInt32() === 0 || ptr.isNull()) return 0;
        return parseInt(ptr.toString());
    }catch (e){
        if(e instanceof Error){
            console.warn("pointerToInt error:", e.stack);
        }
        return 0;
    }
}

function filterLog(msg:string,filter:string[]){
    if(filter==null||filter.length==0){
        console.log(msg);
    }else {
        var hasFilter=false;
        for (let value of filter) {
            if(value==null||value.length==0)continue;
            hasFilter=true;
            if(msg.indexOf(value)>=0){
                console.log(msg);
                return;
            }
        }
        if(!hasFilter){
            console.log(msg);
        }
    }

}

function isSpawned() {
    return Process.enumerateThreads().length === 1;
}
function fixHexDump(hex:string){
    // @ts-ignore
    var ret="";
    const lines = hex.split("\n");
    for (const line of lines) {
        const parts = line.split("");
        if(parts.length<=58){
            parts.splice(parts.length,0,'\n');
        }else {
            parts.splice(parts.length,0,'|\n');
            parts.splice(59,0,'|');
        }
        parts.splice(0,2);
        ret+=parts.join("");
    }
    return ret;
}


//crypto
interface CCCryptorModel{
    enable:boolean,
    cRef:NativePointer,
    dataMap:{
        data:NativePointer,
        len:number
    }[],
    dataOutMap:{
        data:NativePointer,
        len:number,
    }[],
    totalLen:number,
    totalOutLen:number,
    originalLen:number,
    originalOutLen:number,
    log: string,
    finish: boolean

    CCOperation: string,
    CCMode: string,
    CCAlgorithm: string,
    CCKeySize: string,
    Key: string,
    Iv: string,
    CCPadding: string,
    CCModeOptions: string,
    TweakLen: string,
    Tweak: string,
    NumRounds: string
}
function commonCryptoInterceptor() {
    function checkCryptoAlgorithmEnable(algorithm: number) {
        switch (algorithm){
            case 0:
                return CIPHER_CONFIG.crypto.aes;
            case 1:
                return CIPHER_CONFIG.crypto.des;
            case 2:
                return CIPHER_CONFIG.crypto["3des"];
            case 3:
                return CIPHER_CONFIG.crypto.cast;
            case 4:
                return CIPHER_CONFIG.crypto.rc4;
            case 5:
                return CIPHER_CONFIG.crypto.rc2;
            case 6:
                return CIPHER_CONFIG.crypto.blowfish;
            default:
                return true;
        }
    }
    //CCCryptorStatus CCCrypt(
    // 	CCOperation op,			/* kCCEncrypt, etc. */
    // 	CCAlgorithm alg,		/* kCCAlgorithmAES128, etc. */
    // 	CCOptions options,		/* kCCOptionPKCS7Padding, etc. */
    // 	const void *key,
    // 	size_t keyLength,
    // 	const void *iv,			/* optional initialization vector */
    // 	const void *dataIn,		/* optional per op and alg */
    // 	size_t dataInLength,
    // 	void *dataOut,			/* data RETURNED here */
    // 	size_t dataOutAvailable,
    // 	size_t *dataOutMoved);
    let func=Module.findExportByName("libSystem.B.dylib","CCCrypt");
    if(func==null){
        console.warn("CCCrypt func is null");
        return;
    }
    Interceptor.attach(func,
        {
            onEnter: function(args) {
                this.enable=checkCryptoAlgorithmEnable(args[1].toInt32());
                if(!this.enable)return;
                this.log="";
                this.log=this.log.concat(COLORS.green,"[*] ENTER CCCrypt",COLORS.resetColor);
                this.log=this.log.concat(COLORS.yellow,"[+] CCOperation: " + CCOperation[args[0].toInt32()],COLORS.resetColor,"\n");
                this.log=this.log.concat(COLORS.yellow,"[+] CCAlgorithm: " + CCAlgorithm[args[1].toInt32()],COLORS.resetColor,"\n");
                this.log=this.log.concat(COLORS.yellow,"[+] CCOptions: " + CCOptions[args[2].toInt32()],COLORS.resetColor,"\n");
                this.log=this.log.concat(COLORS.yellow,"[+] KeySize: " + CCKeySize[args[4].toInt32()],COLORS.resetColor,"\n");
                this.log=this.log.concat(COLORS.cyan,"[+] Key: \n" + print_arg(args[3],args[4].toInt32()),COLORS.resetColor,"\n");
                this.log=this.log.concat(COLORS.cyan,"[+] IV: \n" + print_arg(args[5],16),COLORS.resetColor,"\n");
                let dataInLength = pointerToInt(args[7]);
                let printLength=Math.min(dataInLength,CIPHER_CONFIG.crypto.maxDataLength);
                this.log=this.log.concat("[+] Data len: ",printLength,"/",dataInLength,"\n");
                this.log=this.log.concat("[+] Data : \n","\n");
                this.log=this.log.concat(print_arg(args[6],printLength));
                this.dataOut = args[8];
                this.dataOutLength = args[10];

            },

            onLeave: function(retval) {
                if(!this.enable)return;
                let dataOutLen=pointerToInt(this.dataOutLength.readPointer());
                let printOutLen=Math.min(dataOutLen,CIPHER_CONFIG.crypto.maxDataLength);
                this.log=this.log.concat(COLORS.magenta,"[+] Data out len: ",printOutLen,"/",dataOutLen,"\n");
                this.log=this.log.concat("[+] Data out: \n",print_arg(this.dataOut,printOutLen),"\n",COLORS.resetColor);
                if(CIPHER_CONFIG.crypto.printStack) {
                    this.log = this.log.concat(COLORS.blue,"[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"),COLORS.resetColor, "\n");
                }
                this.log=this.log.concat(COLORS.green,"[*] EXIT CCCrypt",COLORS.resetColor,"\n");
                filterLog(this.log, CIPHER_CONFIG.crypto.filter);
            }

        });
    let cRefCache:{[key:number]:CCCryptorModel}={};
    //CCCryptorStatus CCCryptorCreate(CCOperation op, CCAlgorithm alg, CCOptions options, const void *key, size_t keyLength, const void *iv,CCCryptorRef *cryptorRef);
    let CCCryptorCreate=Module.findExportByName("libSystem.B.dylib","CCCryptorCreate");
    if(CCCryptorCreate==null){
        console.warn("CCCryptorCreate func is null ")
        return;
    }
    Interceptor.attach(CCCryptorCreate,
        {
            onEnter: function(args) {
                this.params = [];
                for (let i = 0; i < 7; i++) {
                    this.params.push(args[i]);
                }
            },
            onLeave:function (reval) {
                let model: CCCryptorModel = {
                    enable: checkCryptoAlgorithmEnable(this.params[1]),
                    cRef: this.params[6].readPointer(),
                    dataMap: [],
                    dataOutMap: [],
                    totalLen: 0,
                    totalOutLen: 0,
                    originalLen: 0,
                    originalOutLen: 0,
                    log: "",
                    finish: false,
                    CCAlgorithm: "",
                    CCOperation: "",
                    CCMode: "",
                    CCKeySize: "",
                    CCModeOptions: "",
                    CCPadding: "",
                    Key: "",
                    Iv: "null",
                    Tweak: "",
                    TweakLen: "",
                    NumRounds: ""
                };
                cRefCache[pointerToInt(model.cRef)]=model;
                if(!model.enable)return;
                model.log=model.log.concat(COLORS.green,"[*] ENTER CCCryptorCreate",COLORS.resetColor,"\n");
                model.log = model.log.concat(COLORS.yellow, "[+] CCOperation: ", model.CCOperation = CCOperation[this.params[0].toInt32()], COLORS.resetColor, "\n");
                model.log = model.log.concat(COLORS.yellow, "[+] CCAlgorithm: " + CCAlgorithm[this.params[1].toInt32()], COLORS.resetColor, "\n");
                // model.log=model.log.concat(COLORS.yellow,"[+] CCOptions: " + CCOptions[this.options.toInt32()],COLORS.resetColor,"\n");
                model.log = model.log.concat(COLORS.cyan, "[+] Key len: ", model.CCKeySize = CCKeySize[this.params[4].toInt32()], COLORS.resetColor, "\n");
                model.log = model.log.concat(COLORS.cyan, "[+] Key: \n", model.Key = print_arg(this.params[3], pointerToInt(this.params[4])), COLORS.resetColor, "\n");
                if (pointerToInt(this.params[5]) != 0) {
                    model.log = model.log.concat(COLORS.cyan, "[+] Iv:\n", model.Iv = print_arg(this.params[5], 16), COLORS.resetColor, "\n");
                }else {
                    model.log=model.log.concat(COLORS.red,"[!] Iv: null","\n",COLORS.resetColor);
                }
            }
        });
    //CCCryptorStatus CCCryptorCreateWithMode(
    //     CCOperation 	op,				/* kCCEncrypt, kCCEncrypt */
    //     CCMode			mode,
    //     CCAlgorithm		alg,
    //     CCPadding		padding,
    //     const void 		*iv,			/* optional initialization vector */
    //     const void 		*key,			/* raw key material */
    //     size_t 			keyLength,
    //     const void 		*tweak,			/* raw tweak material */  //for mode: XTS
    //     size_t 			tweakLength,
    //     int				numRounds,		/* 0 == default */
    //     CCModeOptions 	options,
    //     CCCryptorRef	*cryptorRef)	/* RETURNED */
    let CCCryptorCreateWithMode=Module.findExportByName("libSystem.B.dylib","CCCryptorCreateWithMode");
    if(CCCryptorCreateWithMode==null){
        console.warn("CCCryptorCreateWithMode func is null ")
        return;
    }
    Interceptor.attach(CCCryptorCreateWithMode,
        {
            onEnter: function(args) {
                this.params = [];
                for (let i = 0; i < 12; i++) {
                    this.params.push(args[i]);
                }
            },
            onLeave:function (reval) {
                let model: CCCryptorModel = {
                    enable: checkCryptoAlgorithmEnable(this.params[2]),
                    cRef: ptr(0),
                    dataMap: [],
                    dataOutMap: [],
                    totalLen: 0,
                    totalOutLen: 0,
                    originalLen: 0,
                    originalOutLen: 0,
                    log: "",
                    finish: false,
                    CCAlgorithm: "",
                    CCOperation: "",
                    CCMode: "",
                    CCKeySize: "",
                    CCModeOptions: "",
                    CCPadding: "",
                    Key: "",
                    Iv: "null",
                    Tweak: "",
                    TweakLen: "",
                    NumRounds: ""
                };
                try {
                    model.cRef = this.params[11].readPointer();
                } catch (e) {
                    console.log("Error: read CCCryptorRef failed:", e);
                    return;
                }
                cRefCache[pointerToInt(model.cRef)]=model;
                if(!model.enable)return;
                model.log=model.log.concat(COLORS.green,"[*] ENTER CCCryptorCreateWithMode",COLORS.resetColor,"\n");
                model.log = model.log.concat(COLORS.yellow, "[+] CCOperation: ", model.CCOperation = CCOperation[this.params[0].toInt32()], COLORS.resetColor, "\n");
                model.log = model.log.concat(COLORS.yellow, "[+] CCMode: ", model.CCMode = CCMode[this.params[1].toInt32()], COLORS.resetColor, "\n");
                model.log = model.log.concat(COLORS.yellow, "[+] CCAlgorithm: ", model.CCAlgorithm = CCAlgorithm[this.params[2].toInt32()], COLORS.resetColor, "\n");
                model.log = model.log.concat(COLORS.yellow, "[+] CCPadding: ", model.CCPadding = CCPadding[this.params[3].toInt32()], COLORS.resetColor, "\n");
                model.log = model.log.concat(COLORS.yellow, "[+] CCModeOptions: ", model.CCModeOptions = CCModeOptions[this.params[10].toInt32()], COLORS.resetColor, "\n");
                let tweakLen = this.params[8].toInt32();
                if (tweakLen > 0 && pointerToInt(this.params[7]) != 0) {
                    model.log = model.log.concat(COLORS.cyan, "[+] tweak len: ", model.TweakLen = tweakLen, COLORS.resetColor, "\n");
                    model.log = model.log.concat(COLORS.cyan, "[+] tweak: \n", model.Tweak = print_arg(this.params[7], pointerToInt(this.params[8])), COLORS.resetColor, "\n");
                }
                model.log = model.log.concat(COLORS.cyan, "[+] numRounds: ", model.NumRounds = this.params[9].toInt32(), COLORS.resetColor, "\n");
                model.log = model.log.concat(COLORS.cyan, "[+] Key len: ", model.CCKeySize = CCKeySize[this.params[6].toInt32()], COLORS.resetColor, "\n");
                model.log = model.log.concat(COLORS.cyan, "[+] Key: \n", model.Key = print_arg(this.params[5], pointerToInt(this.params[6])), COLORS.resetColor, "\n");
                if (pointerToInt(this.params[4]) != 0) {
                    model.log = model.log.concat(COLORS.cyan, "[+] Iv:\n", model.Iv = print_arg(this.params[4], 16), COLORS.resetColor, "\n");
                }else {
                    model.log=model.log.concat(COLORS.red,"[!] Iv: null","\n",COLORS.resetColor);
                }
            }
        });

    //CCCryptorStatus CCCryptorUpdate(CCCryptorRef cryptorRef, const void *dataIn,size_t dataInLength, void *dataOut, size_t dataOutAvailable,size_t *dataOutMoved);
    let CCCryptorUpdate=Module.findExportByName("libSystem.B.dylib","CCCryptorUpdate");
    if(CCCryptorUpdate==null){
        console.warn("CCCryptorUpdate func is null");
        return;
    }
    Interceptor.attach(CCCryptorUpdate,
        {
            onEnter: function(args) {
                this.params = [];
                for (let i = 0; i < 6; i++) {
                    this.params.push(args[i]);
                }
            },

            onLeave: function(retval) {
                let model: CCCryptorModel = cRefCache[pointerToInt(this.params[0])];
                if(model==null){
                    model = {
                        enable: CIPHER_CONFIG.crypto.enable,
                        cRef: this.params[0],
                        dataMap: [],
                        dataOutMap: [],
                        totalLen: 0,
                        totalOutLen: 0,
                        originalLen: 0,
                        originalOutLen: 0,
                        log: "",
                        finish: false,
                        CCAlgorithm: "",
                        CCOperation: "",
                        CCMode: "",
                        CCKeySize: "",
                        CCModeOptions: "",
                        CCPadding: "",
                        Key: "",
                        Iv: "",
                        Tweak: "",
                        TweakLen: "",
                        NumRounds: ""
                    };
                    model.log = model.log.concat(COLORS.green, "[*] ENTER CCCryptorUpdate (note: Cannot be associated with an existing CCCryptorRef, so the data encryption parameters are unknown, However, a list of encryption instances that are currently still being processed can be provided here.)", COLORS.resetColor, "\n");
                    model.log = model.log.concat(COLORS.blue, "[=] The list is as follows:", COLORS.resetColor, "\n");
                    for (let cRefCacheKey in cRefCache) {
                        let value = cRefCache[cRefCacheKey];
                        if (value != null && !value.finish) {
                            model.log = model.log.concat(COLORS.cyan, "[+] CCCryptorRef: ", "" + value.cRef + "(pointer)", " dump:\n", COLORS.resetColor, "\n");
                            model.log = model.log.concat(COLORS.yellow, "[+] : CCAlgorithm: ", value.CCAlgorithm, COLORS.resetColor, "\n");
                            model.log = model.log.concat(COLORS.yellow, "[+] : CCOperation: ", value.CCOperation, COLORS.resetColor, "\n");
                            model.log = model.log.concat(COLORS.yellow, "[+] : CCMode: ", value.CCMode, COLORS.resetColor, "\n");
                            model.log = model.log.concat(COLORS.yellow, "[+] : CCKeySize: ", value.CCKeySize, COLORS.resetColor, "\n");
                            model.log = model.log.concat(COLORS.yellow, "[+] : CCModeOptions: ", value.CCModeOptions, COLORS.resetColor, "\n");
                            model.log = model.log.concat(COLORS.yellow, "[+] : CCPadding: ", value.CCPadding, COLORS.resetColor, "\n");
                            model.log = model.log.concat(COLORS.yellow, "[+] : Key: ", value.Key, COLORS.resetColor, "\n");
                            model.log = model.log.concat(COLORS.yellow, "[+] : Iv: ", value.Iv, COLORS.resetColor, "\n");
                            if (parseInt(value.TweakLen) > 0) {
                                model.log = model.log.concat(COLORS.yellow, "[+] : TweakLen: ", value.TweakLen, COLORS.resetColor, "\n");
                                model.log = model.log.concat(COLORS.yellow, "[+] : Tweak: ", value.Tweak, COLORS.resetColor, "\n");
                            }
                            model.log = model.log.concat(COLORS.yellow, "[+] : NumRounds: ", value.NumRounds, COLORS.resetColor, "\n");
                        }
                    }
                    model.log = model.log.concat(COLORS.blue, "[=] End of list", COLORS.resetColor, "\n");
                    cRefCache[pointerToInt(this.params[0])] = model;
                }
                if(!model.enable)return;
                model.originalLen += this.params[2].toInt32();
                let remainingSpace = CIPHER_CONFIG.crypto.maxDataLength - model.totalLen;
                let dataLen = pointerToInt(this.params[2]);
                if(dataLen>0&&remainingSpace>0){
                    let copyLength = Math.min(dataLen, remainingSpace);
                    let tmpData=Memory.alloc(copyLength);
                    Memory.copy(tmpData, this.params[1], copyLength);
                    model.dataMap.push({data:tmpData,len:copyLength})
                    model.totalLen+=copyLength;
                }
                let outRemainingSpace = CIPHER_CONFIG.crypto.maxDataLength - model.totalOutLen;
                let outLen = pointerToInt(this.params[5].readPointer());
                model.originalOutLen+=outLen;
                if(outLen>0&&outRemainingSpace>0){
                    let copyLength = Math.min(outLen, outRemainingSpace);
                    let tmpDataOut=Memory.alloc(copyLength);
                    Memory.copy(tmpDataOut, this.params[3], copyLength);
                    model.dataOutMap.push({data:tmpDataOut,len:copyLength});
                    model.totalOutLen+=copyLength;
                }
            }

        });
    //CCCryptorStatus CCCryptorFinal(CCCryptorRef cryptorRef, void *dataOut,size_t dataOutAvailable, size_t *dataOutMoved);
    let CCCryptorFinal=Module.findExportByName("libSystem.B.dylib","CCCryptorFinal");
    if(CCCryptorFinal==null){
        console.warn("CCCryptorFinal func is null");
        return;
    }
    Interceptor.attach(CCCryptorFinal,
        {
            onEnter: function(args) {
                this.params = [];
                for (let i = 0; i < 4; i++) {
                    this.params.push(args[i]);
                }
            },
            onLeave: function(retval) {
                let model: CCCryptorModel = cRefCache[pointerToInt(this.params[0])];
                if(model==null){
                    console.warn("CCCryptorFinal model is null");
                    return;
                }
                if(!model.enable)return;

                if(model.totalOutLen<CIPHER_CONFIG.crypto.maxDataLength){
                    let outRemainingSpace = CIPHER_CONFIG.crypto.maxDataLength - model.totalOutLen;
                    let outLen = pointerToInt(this.params[3].readPointer());
                    model.originalOutLen+=outLen;
                    if(outLen>0&&outRemainingSpace>0){
                        let copyLength=Math.min(outLen,outRemainingSpace);
                        let tmpDataOut=Memory.alloc(copyLength);
                        Memory.copy(tmpDataOut, this.params[1], copyLength);
                        model.dataOutMap.push({data:tmpDataOut,len:copyLength});
                        model.totalOutLen+=copyLength;
                    }
                }
                let totalData=Memory.alloc(model.totalLen);
                var offset=0;
                model.dataMap.forEach(function (value){
                    Memory.copy(totalData.add(offset),value.data,value.len)
                    offset+=value.len;
                });
                let totalOutData=Memory.alloc(model.totalOutLen);
                var offsetOut=0;
                model.dataOutMap.forEach(function (value){
                    Memory.copy(totalOutData.add(offsetOut),value.data,value.len)
                    offsetOut+=value.len;
                });
                model.log=model.log.concat("[+] Data len: "+model.totalLen+"/"+model.originalLen+"\n");
                model.log=model.log.concat("[+] Data : \n",print_arg(totalData,model.totalLen),"\n");
                model.log=model.log.concat(COLORS.magenta,"[+] Data out len: "+model.totalOutLen+"/"+model.originalOutLen+"\n");
                model.log=model.log.concat("[+] Data out: \n",print_arg(totalOutData,model.totalOutLen),"\n",COLORS.resetColor);
                if(CIPHER_CONFIG.crypto.printStack){
                    model.log=model.log.concat(COLORS.blue,"[+] stack:\n",Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"),COLORS.resetColor,"\n");
                }
                model.log=model.log.concat(COLORS.green,"[*] EXIT CCCryptorFinal ",COLORS.resetColor,"\n");
                model.finish = true;
                filterLog(model.log,CIPHER_CONFIG.crypto.filter);
            }

        });

}


//hash
interface CCHashModel{
    ctx:NativePointer,
    dataMap:{
        data:NativePointer,
        len:number }[],
    totalLen:number,
    originalLen:number,
    log:string
}

function commonHashInterceptor(name:string, length:number){
    let hash=Module.findExportByName("libSystem.B.dylib",name);
    if(hash==null){
        console.warn(name + " func is null");
        return;
    }
    Interceptor.attach(hash,{
        onEnter:function (args){
            this.log="";
            this.log=this.log.concat(COLORS.green,"[*] ENTER ",name,COLORS.resetColor,"\n");
            let dataLen=args[1].toInt32();
            let printLen=Math.min(dataLen,CIPHER_CONFIG.hash.maxInputDataLength);
            this.log=this.log.concat("[+] Data len: ",printLen,"/",dataLen,"\n");
            this.log=this.log.concat("[+] Data: \n",print_arg(args[0],printLen),"\n")

        },
        onLeave:function (reval){
            this.log=this.log.concat(COLORS.magenta,"[+] Data out len: "+length,COLORS.resetColor,"\n");
            this.log=this.log.concat(COLORS.magenta,"[+] Data out:\n",print_arg(reval,length),COLORS.resetColor,"\n");
            if(CIPHER_CONFIG.hash.printStack){
                this.log=this.log.concat(COLORS.blue,"[+] stack:\n",Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"),COLORS.resetColor,"\n");
            }
            this.log=this.log.concat(COLORS.green,"[*] EXIT ",name,COLORS.resetColor,"\n");
            filterLog(this.log,CIPHER_CONFIG.hash.filter);
        }
    });
    (function (){
        let ctxCache :{[key:number]:CCHashModel}={}
        //CC_SHA1_Init(CC_SHA1_CTX *c);
        let init=Module.findExportByName("libSystem.B.dylib",name+"_Init");
        if (init==null){
            console.warn(name + "_Init func is null")
            return;
        }
        Interceptor.attach(init,
            {
                onEnter: function(args) {
                    let model={ctx:args[0],dataMap:[],totalLen:0,originalLen:0,log:""};
                    ctxCache[pointerToInt(args[0])]=model;
                    model.log=model.log.concat(COLORS.green,"[*] ENTER "+name+"_Init\n",COLORS.resetColor);
                }
            });

        //CC_SHA1_Update(CC_SHA1_CTX *c, const void *data, CC_LONG len);
        let update=Module.findExportByName("libSystem.B.dylib",name+"_Update");
        if(update==null){
            console.warn(name + "_Update func is null");
            return;
        }
        Interceptor.attach(update,
            {
                onEnter: function(args) {
                    let model=ctxCache[pointerToInt(args[0])];
                    if(model==null){
                        console.warn("model is null");
                        return;
                    }
                    let len=pointerToInt(args[2]);
                    let remainingSpace=CIPHER_CONFIG.hash.maxInputDataLength-model.totalLen;
                    if(len>0&&remainingSpace>0){
                        model.originalLen+=len;
                        let copyLen=Math.min(len,remainingSpace);
                        let tmpData=Memory.alloc(copyLen);
                        Memory.copy(tmpData,args[1],copyLen);
                        model.dataMap.push({data:tmpData,len:copyLen});
                        model.totalLen+=copyLen;
                    }

                }
            });

        //CC_SHA1_Final(unsigned char *md, CC_SHA1_CTX *c);
        let final=Module.findExportByName("libSystem.B.dylib",name+"_Final");
        if(final==null){
            console.warn(name + "_Final func is null");
            return;
        }
        Interceptor.attach(final,
            {
                onEnter: function(args) {
                    this.mdSha = args[0];
                    this.ctxSha = args[1];
                },
                onLeave: function(retval) {
                    let model=ctxCache[pointerToInt(this.ctxSha)];
                    if(model==null){
                        console.warn(name + "_Final model is null");
                        return;
                    }
                    if(model.totalLen<=0){
                        console.warn("totalLen :", model.totalLen);
                        return;
                    }
                    let totalData=Memory.alloc(model.totalLen);
                    var offset=0;
                    model.dataMap.forEach(function (value){
                        Memory.copy(totalData.add(offset),value.data,value.len)
                        offset+=value.len;
                    });
                    model.log=model.log.concat("[+] Data len: "+model.totalLen+"/"+model.originalLen+"\n");
                    model.log=model.log.concat("[+] Data :\n");
                    model.log=model.log.concat(print_arg(totalData,model.totalLen),"\n");

                    if(pointerToInt(this.mdSha) !== 0) {
                        model.log=model.log.concat(COLORS.magenta,"[+] Data out len: "+length+"\n");
                        model.log=model.log.concat("[+] Data out:\n");
                        model.log=model.log.concat(print_arg(ptr(this.mdSha),length),"\n",COLORS.resetColor);
                    } else {
                        model.log=model.log.concat(COLORS.red,"[!]: Data out: null\n",COLORS.resetColor);
                    }
                    if(CIPHER_CONFIG.hash.printStack){
                        model.log=model.log.concat(COLORS.blue,"[+] stack:\n",Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"),COLORS.resetColor,"\n");
                    }
                    model.log=model.log.concat(COLORS.green,"[*] EXIT "+name+"_Final"+"\n",COLORS.resetColor);

                    filterLog(model.log,CIPHER_CONFIG.hash.filter);
                }
            });
    })();
}

//hmac

interface CCHMacModel extends CCHashModel{
    mdLen:number,
    enable:boolean,
}
function commonHMACInterceptor(){
    function checkHMACAlgorithmEnable(algorithm: number) {
        switch (algorithm){
            case 0:
                return CIPHER_CONFIG.hmac.sha1;
            case 1:
                return CIPHER_CONFIG.hmac.md5;
            case 2:
                return CIPHER_CONFIG.hmac.sha256;
            case 3:
                return CIPHER_CONFIG.hmac.sha384;
            case 4:
                return CIPHER_CONFIG.hmac.sha512;
            case 5:
                return CIPHER_CONFIG.hmac.sha224;
            default:
                return true;
        }
    }
    let name="CCHmac";
    //void CCHmac(CCHmacAlgorithm algorithm, const void *key, size_t keyLength,const void *data, size_t dataLength, void *macOut);
    let hmac=Module.findExportByName("libSystem.B.dylib",name);
    if(hmac==null){
        console.warn(name + " func is null");
        return;
    }
    Interceptor.attach(hmac,{
        onEnter:function (args){
            this.enable=checkHMACAlgorithmEnable(args[0].toInt32());
            if(!this.enable)return;
            this.mdLen=CCHmacAlgorithmLength[args[0].toInt32()];
            this.log="";
            this.log=this.log.concat(COLORS.green,"[*] ENTER ",name,"\n");
            this.log=this.log.concat(COLORS.yellow,"[+] Algorithm: ",CCHmacAlgorithm[args[0].toInt32()],"\n",COLORS.resetColor);
            this.log=this.log.concat(COLORS.cyan,"[+] Key len: ",args[2].toInt32(),"\n");
            this.log=this.log.concat(COLORS.cyan,"[+] Key : \n",print_arg(args[1],args[2].toInt32()),"\n",COLORS.resetColor);

            let dataLen=args[4].toInt32();
            let printLen=Math.min(dataLen,CIPHER_CONFIG.hmac.maxInputDataLength);
            this.log=this.log.concat("[+] Data len: ",printLen,"/",dataLen,"\n");
            this.log=this.log.concat("[+] Data: \n",print_arg(args[3],printLen),"\n")
            this.macOut=args[5];
        },
        onLeave:function (reval){
            if(!this.enable)return;
            this.log=this.log.concat(COLORS.magenta,"[+] Data out len: "+this.mdLen,COLORS.resetColor,"\n");
            this.log = this.log.concat(COLORS.magenta, "[+] Data out:\n", print_arg(this.macOut, this.mdLen), COLORS.resetColor, "\n");
            if(CIPHER_CONFIG.hmac.printStack){
                this.log=this.log.concat(COLORS.blue,"[+] stack:\n",Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"),COLORS.resetColor,"\n");
            }
            this.log=this.log.concat(COLORS.green,"[*] EXIT ",name,COLORS.resetColor,"\n");
            filterLog(this.log,CIPHER_CONFIG.hmac.filter);
        }
    });
    (function (){
        let ctxCache :{[key:number]:CCHMacModel}={}
        //void
        //      CCHmacInit(CCHmacContext *ctx, CCHmacAlgorithm algorithm,
        //          const void *key, size_t keyLength);
        let init=Module.findExportByName("libSystem.B.dylib",name+"Init");
        if(init==null){
            console.warn(name + "Init func is null");
            return;
        }
        Interceptor.attach(init,
            {
                onEnter: function(args) {
                    let model={ctx:args[0],dataMap:[],totalLen:0,originalLen:0,log:"",mdLen:CCHmacAlgorithmLength[args[1].toInt32()],enable:checkHMACAlgorithmEnable(args[1].toInt32())};
                    ctxCache[pointerToInt(args[0])]=model;
                    if(!model.enable)return;
                    model.log=model.log.concat(COLORS.green,"[*] ENTER "+name+"Init\n",COLORS.resetColor);
                    model.log=model.log.concat(COLORS.yellow,"[+] Algorithm: "+CCHmacAlgorithm[args[1].toInt32()]+"\n",COLORS.resetColor);
                    model.log=model.log.concat(COLORS.cyan,"[+] Key len: "+args[3].toInt32()+COLORS.resetColor+"\n");
                    model.log=model.log.concat(COLORS.cyan,"[+] Key: \n"+print_arg(args[2],pointerToInt(args[3]))+"\n",COLORS.resetColor);
                }
            });

        //void
        //      CCHmacUpdate(CCHmacContext *ctx, const void *data, size_t dataLength);
        let update=Module.findExportByName("libSystem.B.dylib",name+"Update");
        if(update==null){
            console.warn(name + "Update func is null");
            return;
        }
        Interceptor.attach(update,
            {
                onEnter: function(args) {
                    let model=ctxCache[pointerToInt(args[0])];
                    if(model==null){
                        console.warn(name + "Update model is null");
                        return;
                    }
                    if(!model.enable)return;
                    let len=pointerToInt(args[2]);
                    let remainingSpace=CIPHER_CONFIG.hmac.maxInputDataLength-model.totalLen;
                    if(len>0&&remainingSpace>0){
                        model.originalLen+=len;
                        let copyLen=Math.min(len,remainingSpace);
                        let tmpData=Memory.alloc(copyLen);
                        Memory.copy(tmpData,args[1],copyLen);
                        model.dataMap.push({data:tmpData,len:copyLen});
                        model.totalLen+=copyLen;
                    }

                }
            });

        //void
        //      CCHmacFinal(CCHmacContext *ctx, void *macOut);
        let final=Module.findExportByName("libSystem.B.dylib",name+"Final");
        if(final==null){
            console.warn(name + "Final func is null");
            return;
        }
        Interceptor.attach(final,
            {
                onEnter: function(args) {
                    this.mdOut = args[1];
                    this.ctx = args[0];
                },
                onLeave: function(retval) {
                    let model=ctxCache[pointerToInt(this.ctx)];
                    if(model==null){
                        console.warn(name + "Final model is null");
                        return;
                    }
                    if(!model.enable)return;
                    if(model.totalLen<=0){
                        console.warn("totalLen :", model.totalLen);
                        return;
                    }
                    let totalData=Memory.alloc(model.totalLen);
                    var offset=0;
                    model.dataMap.forEach(function (value){
                        Memory.copy(totalData.add(offset),value.data,value.len)
                        offset+=value.len;
                    });
                    model.log=model.log.concat("[+] Data len: "+model.totalLen+"/"+model.originalLen+"\n");
                    model.log=model.log.concat("[+] Data :\n");
                    model.log=model.log.concat(print_arg(totalData,model.totalLen),"\n");

                    model.log=model.log.concat(COLORS.magenta,"[+] Data out len: "+model.mdLen+"\n");
                    model.log=model.log.concat("[+] Data out:\n");
                    model.log=model.log.concat(print_arg(ptr(this.mdOut),model.mdLen),"\n",COLORS.resetColor);
                    if(CIPHER_CONFIG.hmac.printStack){
                        model.log=model.log.concat(COLORS.blue,"[+] stack:\n",Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"),COLORS.resetColor,"\n");
                    }
                    model.log=model.log.concat(COLORS.green,"[*] EXIT "+name+"Final"+"\n",COLORS.resetColor);

                    filterLog(model.log,CIPHER_CONFIG.hmac.filter);
                }
            });
    })();
}

//pbkdf
function commonPBKDFInterceptor(){
    //int
    // CCKeyDerivationPBKDF( CCPBKDFAlgorithm algorithm, const char *password, size_t passwordLen,
    //                       const uint8_t *salt, size_t saltLen,
    //                       CCPseudoRandomAlgorithm prf, uint rounds,
    //                       uint8_t *derivedKey, size_t derivedKeyLen)
    let CCKeyDerivationPBKDF=Module.findExportByName("libSystem.B.dylib","CCKeyDerivationPBKDF");
    if(CCKeyDerivationPBKDF==null){
        console.warn("CCKeyDerivationPBKDF func is null");
        return;
    }
    Interceptor.attach(CCKeyDerivationPBKDF,{
        onEnter:function (args){
            this.params = [];
            for (let i = 0; i < 9; i++) {
                this.params.push(args[i]);
            }
        },
        onLeave:function (reval){
            var log = "";
            log = log.concat(COLORS.green, "[*] ENTER CCKeyDerivationPBKDF", COLORS.resetColor, "\n");
            log = log.concat(COLORS.yellow, "[+] Algorithm: ", CCPBKDFAlgorithm[this.params[0].toInt32()], "\n", COLORS.resetColor);
            log = log.concat(COLORS.yellow, "[+] PseudoRandomAlgorithm: ", CCPseudoRandomAlgorithm[this.params[5].toInt32()], "\n", COLORS.resetColor);
            log = log.concat(COLORS.cyan, "[+] Rounds: ", String(pointerToInt(this.params[6])), "\n", COLORS.resetColor);
            log = log.concat(COLORS.cyan, "[+] Password len: ", this.params[2].toInt32(), "\n");
            log = log.concat(COLORS.cyan, "[+] Password : \n", print_arg(this.params[1], this.params[2].toInt32()), "\n", COLORS.resetColor);
            log = log.concat(COLORS.cyan, "[+] Salt len: ", this.params[4].toInt32(), "\n");
            log = log.concat(COLORS.cyan, "[+] Salt : \n", print_arg(this.params[3], this.params[4].toInt32()), "\n", COLORS.resetColor);
            log = log.concat(COLORS.cyan, "[+] DerivedKey len: ", this.params[8].toInt32(), "\n");
            log = log.concat(COLORS.cyan, "[+] DerivedKey : \n", print_arg(this.params[7], this.params[8].toInt32()), "\n", COLORS.resetColor);
            if(CIPHER_CONFIG.pbkdf.printStack){
                log = log.concat(COLORS.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), COLORS.resetColor, "\n");
            }
            log = log.concat(COLORS.green, "[*] EXIT CCKeyDerivationPBKDF", COLORS.resetColor, "\n");
            filterLog(log, CIPHER_CONFIG.pbkdf.filter);
        }
    });
    //uint
    // CCCalibratePBKDF(CCPBKDFAlgorithm algorithm, size_t passwordLen, size_t saltLen,
    //                  CCPseudoRandomAlgorithm prf, size_t derivedKeyLen, uint32_t msec)
    let CCCalibratePBKDF=Module.findExportByName("libSystem.B.dylib","CCCalibratePBKDF");
    if(CCCalibratePBKDF==null){
        console.warn("CCCalibratePBKDF func is null");
        return;
    }
    Interceptor.attach(CCCalibratePBKDF,{
        onEnter:function (args){
            this.log="";
            this.log=this.log.concat(COLORS.green,"[*] ENTER CCCalibratePBKDF",COLORS.resetColor,"\n");
            this.log=this.log.concat(COLORS.yellow,"[+] Algorithm: ",CCPBKDFAlgorithm[args[0].toInt32()],"\n",COLORS.resetColor);
            this.log=this.log.concat(COLORS.yellow,"[+] PseudoRandomAlgorithm: ",CCPseudoRandomAlgorithm[args[3].toInt32()],"\n",COLORS.resetColor);
            this.log=this.log.concat(COLORS.cyan,"[+] Password len: ",args[1].toInt32(),COLORS.resetColor,"\n");
            this.log=this.log.concat(COLORS.cyan,"[+] Salt len: ",args[2].toInt32(),COLORS.resetColor,"\n");
            this.log=this.log.concat(COLORS.cyan,"[+] DerivedKey len: ",args[4].toInt32(),COLORS.resetColor,"\n");
            this.log=this.log.concat(COLORS.cyan,"[+] Msec : ",pointerToInt(args[5]),COLORS.resetColor,"\n");
        },
        onLeave:function (reval){
            this.log=this.log.concat(COLORS.cyan,"[+] IterNum : \n",pointerToInt(reval),COLORS.resetColor,"\n");
            if(CIPHER_CONFIG.pbkdf.printStack){
                this.log=this.log.concat(COLORS.blue,"[+] stack:\n",Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"),COLORS.resetColor,"\n");
            }
            this.log=this.log.concat(COLORS.green,"[*] EXIT CCCalibratePBKDF",COLORS.resetColor,"\n");
            filterLog(this.log,CIPHER_CONFIG.pbkdf.filter);
        }
    });
}


//keychain
function commonKeychainInterceptor() {

    var ISA_MASK = ptr('0x0000000ffffffff8');
    var ISA_MAGIC_MASK = ptr('0x000003f000000001');
    var ISA_MAGIC_VALUE = ptr('0x000001a000000001');


    // @ts-ignore
    function isObjC(p) {
        var klass = getObjCClassPtr(p);
        return !klass.isNull();
    }

    // @ts-ignore
    function getObjCClassPtr(p) {
        /*
         * Loosely based on:
         * https://blog.timac.org/2016/1124-testing-if-an-arbitrary-pointer-is-a-valid-objective-c-object/
         */

        if (!isReadable(p)) {
            return NULL;
        }
        var isa = p.readPointer();
        var classP = isa;
        if (classP.and(ISA_MAGIC_MASK).equals(ISA_MAGIC_VALUE)) {
            classP = isa.and(ISA_MASK);
        }
        if (isReadable(classP)) {
            return classP;
        }
        return NULL;
    }

    // @ts-ignore
    function isReadable(p) {
        try {
            p.readU8();
            return true;
        } catch (e) {
            return false;
        }
    }


    /*******************************************************
     * 0. 通用工具函数
     *******************************************************/

    /**
     * 从导出符号中获取 C 函数或者常量指针
     * type = "f" => function, type = "d" => data
     * ret/args 仅函数类型需要，常量不需要
     */
    //@ts-ignore
    function getExportFunction(type, name, ret, args) {
        var nptr = Module.findExportByName(null, name);
        if (nptr === null) {
            console.warn("[-] Cannot find export:", name);
            return null;
        }
        if (type === "f") {
            // @ts-ignore
            var funclet = new NativeFunction(nptr, ret, args);
            if (!funclet) {
                console.warn("[-] parse error for function:", name);
                return null;
            }
            return funclet;
        } else if (type === "d") {
            var datalet = nptr.readPointer();
            if (!datalet) {
                console.warn("[-] parse error for data:", name);
                return null;
            }
            return datalet;
        }
    }

    /**
     * 依据 NSData 首字节 / 是否全可见 ASCII，做简单类型检测
     * - JSON: 首字节是 '{' or '['
     * - ASCII: 每字节都在 0x20~0x7E
     * - 否则 => Binary
     */
    // @ts-ignore
    function detectDataType(nsDataObj) {
        if (!nsDataObj || nsDataObj.isNull()) return "Empty";
        var length = nsDataObj.length();
        if (length === 0) return "Empty";

        var ptrBytes = nsDataObj.bytes();
        var rawBytes = ptrBytes.readByteArray(length);
        var u8Arr = new Uint8Array(rawBytes);

        // 1) JSON
        if (u8Arr[0] === 0x7B || u8Arr[0] === 0x5B) {
            // '{'=0x7B, '['=0x5B
            return "Possible JSON";
        }

        // 2) 检查是否全为可见 ASCII
        var allAscii = true;
        for (var i = 0; i < u8Arr.length; i++) {
            if (u8Arr[i] < 0x20 || u8Arr[i] > 0x7E) {
                allAscii = false;
                break;
            }
        }
        if (allAscii) return "Possible ASCII";

        // 3) 否则就是二进制
        return "Binary";
    }

    /**
     * 将 NSData 以 hexdump(16字节一行)格式打印
     */


    /*******************************************************
     * 1. 打印 Keychain Item (NSDictionary / NSData / NSArray)
     *******************************************************/

    /**
     * 当我们在“静态枚举”或“动态结果”里拿到的对象可能是：
     * - NSArray(里面每个元素是 NSDictionary)
     * - NSDictionary(里面可能有 v_Data / kSecValueData 字段)
     * - NSData(直接就是 __NSCFData)
     * - 甚至其他类型
     *
     * 我们做一个统一的入口来处理。
     */
    //@ts-ignore
    function dumpKeychainObject(objHandle, indent = "") {
        var log = "";
        if (!objHandle || objHandle.toInt32() === 0 || objHandle.isNull() || !isObjC(objHandle)) return log;

        var obj = new ObjC.Object(objHandle);

        // 1) NSArray
        if (obj.isKindOfClass_(ObjC.classes.NSArray)) {
            log = log.concat(indent, COLORS.green, "[*] ENTER dump NSArray", COLORS.resetColor, "\n")
            for (var i = 0; i < obj.count(); i++) {
                var subItem = obj.objectAtIndex_(i);
                // 可能是 dict / data / etc.
                log = log.concat(indent, "[+] object: \n", dumpKeychainObject(subItem.handle, "    " + indent), "\n")
            }
            log = log.concat(indent, COLORS.green, "[*] EXIT dump NSArray", COLORS.resetColor, "\n")
        }
        // 2) NSDictionary
        else if (obj.isKindOfClass_(ObjC.classes.NSDictionary)) {
            log = log.concat(indent, COLORS.green, "[*] ENTER dump NSDictionary", COLORS.resetColor, "\n")
            // 我们遍历 key => value
            var allKeys = obj.allKeys();
            for (var i = 0; i < allKeys.count(); i++) {
                var key = allKeys.objectAtIndex_(i);
                var val = obj.objectForKey_(key);
                var kStr = key.toString();
                // 如果是 data 字段，就 hexdump
                // 常见的是 v_Data, kSecValueData, v_DataEncrypted
                if (val.$className === "NSConcreteData") {
                    // var type = detectDataType(val);
                    // console.log("    " + kStr + " [Detected: " + type + "] => hexdump:");
                    // dumpNSData(val);
                    log = log.concat(indent, "[+] ", kStr, ": \n", dumpKeychainObject(val.handle, "    " + indent), "\n")
                } else {
                    // 如果是其他对象(NSArray/NSDictionary/NSString/NSNumber/...)
                    // 递归 or 直接 toString
                    if (val.isKindOfClass_(ObjC.classes.NSArray) ||
                        val.isKindOfClass_(ObjC.classes.NSDictionary) ||
                        val.isKindOfClass_(ObjC.classes.NSData)) {
                        // 递归再打印
                        if (kStr.indexOf("v_Data") == 0) {
                            log = log.concat(indent, COLORS.yellow, "[+] ", kStr, ": \n", dumpKeychainObject(val.handle, "    " + indent), COLORS.resetColor, "\n")
                        } else {
                            log = log.concat(indent, "[+] ", kStr, ": \n", dumpKeychainObject(val.handle, "    " + indent), "\n")
                        }

                    } else {
                        if (kStr.indexOf("acct") == 0 || kStr.indexOf("svce") == 0 || kStr.indexOf("agrp") == 0) {
                            log = log.concat(indent, COLORS.cyan, "[+] ", `${kStr}: ${val}`, COLORS.resetColor, "\n")
                        } else {
                            // @ts-ignore
                            log = log.concat(indent, "[+] ", `${kStr}: ${val}`, "\n")
                        }
                    }
                }
            }
            log = log.concat(indent, COLORS.green, "[*] EXIT dump NSDictionary", COLORS.resetColor, "\n")
        }
        // 3) NSData
        else if (obj.isKindOfClass_(ObjC.classes.NSData)) {
            if (!obj || obj.isNull() || obj.length() == 0) {
                log = log.concat(indent, "[-] NSData.Len: 0", "\n")
                log = log.concat(indent, "[-] NSData: null", "\n")
            } else {
                var length = obj.length();
                var ptrBytes = obj.bytes();
                let minLen = Math.min(CIPHER_CONFIG.keychain.maxDataLength, length);
                log = log.concat(indent, "[+] NSData.Len: ", String(minLen), "/", length, "", "\n")
                // @ts-ignore
                log = log.concat(indent, "[+] NSData: \n", print_arg(ptrBytes, minLen, indent), "\n")
            }
        }
        // 4) 其他类型
        else {
            log = log.concat(indent, "[-] ", obj.$className, ": \n", obj.toString(), "\n")
        }
        return log;
    }

    /*******************************************************
     * 2. 静态枚举 Keychain
     *******************************************************/
    function dumpKeychain() {

        var NSMutableDictionary = ObjC.classes.NSMutableDictionary;

        // @ts-ignore
        var kCFBooleanTrue = new ObjC.Object(getExportFunction("d", "kCFBooleanTrue"));
        // @ts-ignore
        var kSecReturnAttributes = new ObjC.Object(getExportFunction("d", "kSecReturnAttributes"));
        // @ts-ignore
        var kSecReturnData = new ObjC.Object(getExportFunction("d", "kSecReturnData"));
        // @ts-ignore
        var kSecReturnRef = new ObjC.Object(getExportFunction("d", "kSecReturnRef"));
        // @ts-ignore
        var kSecMatchLimitAll = ObjC.Object(getExportFunction("d", "kSecMatchLimitAll"));
        // @ts-ignore
        var kSecMatchLimit = ObjC.Object(getExportFunction("d", "kSecMatchLimit"));
        // @ts-ignore
        var kSecClassGenericPassword = ObjC.Object(getExportFunction("d", "kSecClassGenericPassword"));
        // @ts-ignore
        var kSecClassInternetPassword = ObjC.Object(getExportFunction("d", "kSecClassInternetPassword"));
        // @ts-ignore
        var kSecClassCertificate = ObjC.Object(getExportFunction("d", "kSecClassCertificate"));
        // @ts-ignore
        var kSecClassKey = ObjC.Object(getExportFunction("d", "kSecClassKey"));
        // @ts-ignore
        var kSecClassIdentity = ObjC.Object(getExportFunction("d", "kSecClassIdentity"));
        // @ts-ignore
        var kSecClass = ObjC.Object(getExportFunction("d", "kSecClass"));

        //ref: https://github.com/seemoo-lab/apple-continuity-tools/blob/565f2a95d8c3a958ffb430a5022a2df923eb5c1b/keychain_access/frida_scripts/hook_SecItemCopyMatching.js
        // @ts-ignore
        var kSecAttrAccessibleAfterFirstUnlock = ObjC.Object(getExportFunction("d", "kSecAttrAccessibleAfterFirstUnlock"));
        // @ts-ignore
        var kSecAttrAccessibleWhenUnlocked = ObjC.Object(getExportFunction("d", "kSecAttrAccessibleWhenUnlocked"));
        // @ts-ignore
        var kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly = ObjC.Object(getExportFunction("d", "kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly"));
        // @ts-ignore
        var kSecAttrAccessibleAlwaysThisDeviceOnly = ObjC.Object(getExportFunction("d", "kSecAttrAccessibleAlwaysThisDeviceOnly"));
        // @ts-ignore
        var kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly = ObjC.Object(getExportFunction("d", "kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly"));
        // @ts-ignore
        var kSecAttrAccessibleWhenUnlockedThisDeviceOnly = ObjC.Object(getExportFunction("d", "kSecAttrAccessibleWhenUnlockedThisDeviceOnly"));
        // @ts-ignore
        var kSecAttrAccessibleAlways = ObjC.Object(getExportFunction("d", "kSecAttrAccessibleAlways"));


        // @ts-ignore
        var SecItemCopyMatching = getExportFunction("f", "SecItemCopyMatching", "int", ["pointer", "pointer"]);

        var classes = [
            kSecClassGenericPassword,
            kSecClassInternetPassword,
            kSecClassCertificate,
            kSecClassKey,
            kSecClassIdentity
        ];

        // 逐个枚举
        var query = NSMutableDictionary.alloc().init();
        var log = "";
        log = log.concat(COLORS.green, "[*] ENTER dump keychain", COLORS.resetColor, "\n")
        var indent = "";
        classes.forEach(function (secItemClass) {
            indent = "    ";
            log = log.concat(indent, COLORS.green, "[*] ENTER dump item", COLORS.resetColor, "\n")
            query.removeAllObjects();
            query.setObject_forKey_(kCFBooleanTrue, kSecReturnAttributes);
            query.setObject_forKey_(kCFBooleanTrue, kSecReturnData);
            query.setObject_forKey_(kCFBooleanTrue, kSecReturnRef);
            query.setObject_forKey_(kSecMatchLimitAll, kSecMatchLimit);
            query.setObject_forKey_(secItemClass, kSecClass);

            var resultPtr = Memory.alloc(Process.pointerSize);
            resultPtr.writePointer(NULL);

            // @ts-ignore
            var status = SecItemCopyMatching(query.handle, resultPtr);
            // errSecSuccess = 0
            log = log.concat(indent, COLORS.resetColor, "[+] status: ", status, COLORS.resetColor, "\n")
            if (status === 0) {
                var outPtr = resultPtr.readPointer();
                log = log.concat(indent, COLORS.resetColor, "[+] object: \n", dumpKeychainObject(outPtr, "   " + indent), COLORS.resetColor, "\n")
            } else {
                // 没有数据时不会返回0
                // console.log("[*] No items for", secItemClass.toString(), " => status =", status);
                log = log.concat(indent, COLORS.resetColor, "[-] object: null", COLORS.resetColor, "\n")
            }
            log = log.concat(indent, COLORS.green, "[*] EXIT dump item", COLORS.resetColor, "\n")
        });
        log = log.concat(COLORS.green, "\n[*] EXIT dump keychain", COLORS.resetColor, "\n")
        filterLog(log, CIPHER_CONFIG.keychain.filter);
    }

    /*******************************************************
     * 3. 动态 Hook Keychain API
     *******************************************************/
    function keychainInterceptor() {

        // 3.1 Hook SecItemAdd
        var SecItemAddPtr = Module.findExportByName(null, "SecItemAdd");
        if (SecItemAddPtr) {
            Interceptor.attach(SecItemAddPtr, {
                onEnter: function (args) {
                    this.log = "";
                    this.log = this.log.concat(COLORS.green, "[*] ENTER SecItemAdd", COLORS.resetColor, "\n");
                    this.attrsPtr = args[0];
                    this.resultPtr = args[1];
                    this.log = this.log.concat("[+] attrs: \n", dumpKeychainObject(this.attrsPtr, "    "), "\n");
                },
                onLeave: function (retval) {
                    this.log = this.log.concat("[+] status: ", retval.toInt32(), "\n");
                    if (this.resultPtr.toInt32() !== 0) {
                        var outCF = this.resultPtr.readPointer();
                        if (isObjC(outCF)) {
                            this.log = this.log.concat("[+] result: \n", dumpKeychainObject(this.resultPtr, "    "), "\n");
                        } else {
                            this.log = this.log.concat("[-] result: null", "\n");
                        }
                    } else {
                        this.log = this.log.concat("[-] result: null", "\n");
                    }
                    if (CIPHER_CONFIG.keychain.printStack) {
                        this.log = this.log.concat(COLORS.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), COLORS.resetColor, "\n");
                    }
                    this.log = this.log.concat(COLORS.green, "[*] EXIT SecItemAdd", COLORS.resetColor, "\n");
                    filterLog(this.log, CIPHER_CONFIG.keychain.filter);
                }
            });
        }

        // 3.2 Hook SecItemCopyMatching
        var SecItemCopyMatchingPtr = Module.findExportByName(null, "SecItemCopyMatching");
        if (SecItemCopyMatchingPtr) {
            Interceptor.attach(SecItemCopyMatchingPtr, {
                onEnter: function (args) {
                    this.log = "";
                    this.log = this.log.concat(COLORS.green, "[*] ENTER SecItemCopyMatching", COLORS.resetColor, "\n");
                    this.queryPtr = args[0];
                    this.resultPtr = args[1];
                    this.log = this.log.concat("[+] query: \n", dumpKeychainObject(this.queryPtr, "    "), "\n");
                },
                onLeave: function (retval) {
                    let status = retval.toInt32();
                    this.log = this.log.concat("[+] status: ", status, "\n");
                    if (this.resultPtr.toInt32() !== 0) {
                        let resultObj = this.resultPtr.readPointer();
                        if (isObjC(resultObj)) {
                            this.log = this.log.concat("[+] result: \n", dumpKeychainObject(resultObj, "    "), "\n");
                        } else {
                            this.log = this.log.concat("[-] result: null", "\n");
                        }
                    } else {
                        this.log = this.log.concat("[-] result: null", "\n");
                    }
                    if (CIPHER_CONFIG.keychain.printStack) {
                        this.log = this.log.concat(COLORS.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), COLORS.resetColor, "\n");
                    }
                    this.log = this.log.concat(COLORS.green, "[*] EXIT SecItemCopyMatching", COLORS.resetColor, "\n");
                    filterLog(this.log, CIPHER_CONFIG.keychain.filter);
                }
            });
        }

        // 3.3 Hook SecItemUpdate
        var SecItemUpdatePtr = Module.findExportByName(null, "SecItemUpdate");
        if (SecItemUpdatePtr) {
            Interceptor.attach(SecItemUpdatePtr, {
                onEnter: function (args) {
                    this.log = "";
                    this.log = this.log.concat(COLORS.green, "[*] ENTER SecItemUpdate", COLORS.resetColor, "\n");
                    this.queryPtr = args[0];
                    this.attrsPtr = args[1];
                    this.log = this.log.concat("[+] query: \n", dumpKeychainObject(this.queryPtr, "    "), "\n");
                    this.log = this.log.concat("[+] attributesToUpdate: \n", dumpKeychainObject(this.attrsPtr, "    "), "\n");
                },
                onLeave: function (retval) {
                    let status = retval.toInt32();
                    this.log = this.log.concat("[+] status: ", status, "\n");
                    if (CIPHER_CONFIG.keychain.printStack) {
                        this.log = this.log.concat(COLORS.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), COLORS.resetColor, "\n");
                    }
                    this.log = this.log.concat(COLORS.green, "[*] EXIT SecItemUpdate", COLORS.resetColor, "\n");
                    filterLog(this.log, CIPHER_CONFIG.keychain.filter);
                }
            });
        }

        // 3.4 Hook SecItemDelete
        var SecItemDeletePtr = Module.findExportByName(null, "SecItemDelete");
        if (SecItemDeletePtr) {
            Interceptor.attach(SecItemDeletePtr, {
                onEnter: function (args) {
                    this.log = "";
                    this.log = this.log.concat(COLORS.green, "[*] ENTER SecItemDelete", COLORS.resetColor, "\n");
                    this.queryPtr = args[0];
                    this.log = this.log.concat("[+] query: \n", dumpKeychainObject(this.queryPtr, "    "), "\n");
                },
                onLeave: function (retval) {
                    this.log = this.log.concat("[+] status: ", retval.toInt32(), "\n");
                    if (CIPHER_CONFIG.keychain.printStack) {
                        this.log = this.log.concat(COLORS.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), COLORS.resetColor, "\n");
                    }
                    this.log = this.log.concat(COLORS.green, "[*] EXIT SecItemDelete", COLORS.resetColor, "\n");
                    filterLog(this.log, CIPHER_CONFIG.keychain.filter);
                }
            });
        }
    }

    if (isSpawned()) {
        let intervalId = setInterval(function () {
            clearInterval(intervalId);
            dumpKeychain();
        }, 5000);

    } else {
        dumpKeychain();
    }
    if (CIPHER_CONFIG.keychain.realtimeIntercept) {
        keychainInterceptor();
    }
}
//start
(function (){
    if (!ObjC.available) {
        console.log("Only supports iOS!!");
        return;
    }
    if(!CIPHER_CONFIG.enable){
        return
    }
    if(CIPHER_CONFIG.crypto.enable){
        commonCryptoInterceptor();
    }
    if(CIPHER_CONFIG.hash.enable){
        if(CIPHER_CONFIG.hash.sha1){
            //extern unsigned char *CC_SHA1(const void *data, CC_LONG len, unsigned char *md)
            commonHashInterceptor("CC_SHA1",20);
        }
        if(CIPHER_CONFIG.hash.sha224){
            //extern unsigned char *CC_SHA224(const void *data, CC_LONG len, unsigned char *md);
            commonHashInterceptor("CC_SHA224",28);
        }
        if(CIPHER_CONFIG.hash.sha256){
            //extern unsigned char *CC_SHA256(const void *data, CC_LONG len, unsigned char *md);
            commonHashInterceptor("CC_SHA256",32);
        }
        if(CIPHER_CONFIG.hash.sha384){
            //extern unsigned char *CC_SHA384(const void *data, CC_LONG len, unsigned char *md);
            commonHashInterceptor("CC_SHA384",48);
        }
        if(CIPHER_CONFIG.hash.sha512){
            //extern unsigned char *CC_SHA512(const void *data, CC_LONG len, unsigned char *md);
            commonHashInterceptor("CC_SHA512",64);
        }
        if(CIPHER_CONFIG.hash.md2){
            //extern unsigned char *CC_MD2(const void *data, CC_LONG len, unsigned char *md);
            commonHashInterceptor("CC_MD2",16);
        }
        if(CIPHER_CONFIG.hash.md4){
            //extern unsigned char *CC_MD4(const void *data, CC_LONG len, unsigned char *md);
            commonHashInterceptor("CC_MD4",16);
        }
        if(CIPHER_CONFIG.hash.md5){
            //extern unsigned char *CC_MD5(const void *data, CC_LONG len, unsigned char *md);
            commonHashInterceptor("CC_MD5",16);
        }
    }
    if (CIPHER_CONFIG.hmac.enable) {
        commonHMACInterceptor();
    }
    if (CIPHER_CONFIG.pbkdf.enable) {
        commonPBKDFInterceptor();
    }
    if (CIPHER_CONFIG.keychain.enable) {
        commonKeychainInterceptor();
    }
})();















