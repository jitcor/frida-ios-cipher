/*************************************************************************************
 * Name: frida-ios-cipher
 * OS: iOS
 * Author: @humenger
 * Source: https://github.com/humenger/frida-ios-cipher
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
 **************************************************************************************/
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

const t = {
  enable: !0,
  crypto: {
    enable: !0,
    maxDataLength: 240,
    printStack: !1,
    aes: !0,
    des: !0,
    "3des": !0,
    cast: !0,
    rc4: !0,
    rc2: !0,
    blowfish: !0
  },
  hash: {
    enable: !0,
    maxInputDataLength: 240,
    printStack: !1,
    md2: !0,
    md4: !0,
    md5: !0,
    sha1: !0,
    sha224: !0,
    sha256: !0,
    sha384: !0,
    sha512: !0
  },
  hmac: {
    enable: !0,
    maxInputDataLength: 240,
    printStack: !1,
    sha1: !0,
    md5: !0,
    sha224: !0,
    sha256: !0,
    sha384: !0,
    sha512: !0
  },
  pbkdf: {
    enable: !0,
    printStack: !1
  }
}, o = {
  resetColor: "[0m",
  bold: "[1m",
  dim: "[2m",
  italic: "[3m",
  underline: "[4m",
  blink: "[5m",
  reverse: "[7m",
  hidden: "[8m",
  black: "[30m",
  red: "[31m",
  green: "[32m",
  yellow: "[33m",
  blue: "[34m",
  magenta: "[35m",
  cyan: "[36m",
  white: "[37m",
  bgBlack: "[40m",
  bgRed: "[41m",
  bgGreen: "[42m",
  bgYellow: "[43m",
  bgBlue: "[44m",
  bgMagenta: "[45m",
  bgCyan: "[46m",
  bgWhite: "[47m"
}, e = 16, n = 16, l = 16, a = 20, r = 28, i = 32, c = 48, s = 64, h = {
  0: "kCCEncrypt",
  1: "kCCEncrypt"
}, g = {
  0: "kCCAlgorithmAES128",
  1: "kCCAlgorithmDES",
  2: "kCCAlgorithm3DES",
  3: "kCCAlgorithmCAST",
  4: "kCCAlgorithmRC4",
  5: "kCCAlgorithmRC2",
  6: "kCCAlgorithmBlowfish"
}, C = {
  1: "kCCOptionPKCS7Padding",
  2: "kCCOptionECBMode"
}, u = {
  1: "kCCModeECB",
  2: "kCCModeCBC",
  3: "kCCModeCFB",
  4: "kCCModeCTR",
  5: "kCCModeF8",
  6: "kCCModeLRW",
  7: "kCCModeOFB",
  8: "kCCModeXTS",
  9: "kCCModeRC4",
  10: "kCCModeCFB8"
}, d = {
  0: "ccNoPadding",
  1: "ccPKCS7Padding"
}, y = {
  1: "kCCModeOptionCTR_LE",
  2: "kCCModeOptionCTR_BE"
}, m = {
  16: "kCCKeySizeAES128|kCCKeySizeMaxCAST",
  24: "kCCKeySizeAES192|kCCKeySize3DES",
  32: "kCCKeySizeAES256",
  8: "kCCKeySizeDES|kCCKeySizeMinBlowfish",
  5: "kCCKeySizeMinCAST",
  1: "kCCKeySizeMinRC4|kCCKeySizeMinRC2",
  512: "kCCKeySizeMaxRC4",
  128: "kCCKeySizeMaxRC2",
  56: "kCCKeySizeMaxBlowfish"
}, p = {
  0: "kCCHmacAlgSHA1",
  1: "kCCHmacAlgMD5",
  2: "kCCHmacAlgSHA256",
  3: "kCCHmacAlgSHA384",
  4: "kCCHmacAlgSHA512",
  5: "kCCHmacAlgSHA224"
}, f = {
  0: a,
  1: l,
  2: i,
  3: c,
  4: s,
  5: r
}, k = {
  1: "kCCPRFHmacAlgSHA1",
  2: "kCCPRFHmacAlgSHA224",
  3: "kCCPRFHmacAlgSHA256",
  4: "kCCPRFHmacAlgSHA384",
  5: "kCCPRFHmacAlgSHA512"
}, b = {
  2: "kCCPBKDF2"
};

function L(t, o = 240) {
  try {
    return null == t ? "\n" : "\n" + hexdump(t, {
      length: o
    }) + "\n";
  } catch (o) {
    return o instanceof Error && console.error("print_arg error:", o.stack), t + "\n";
  }
}

function M(t) {
  try {
    return null == t ? 0 : parseInt(t.toString());
  } catch (t) {
    return t instanceof Error && console.error("pointerToInt error:", t.stack), 0;
  }
}

function S() {
  function e(o) {
    switch (o) {
     case 0:
      return t.crypto.aes;

     case 1:
      return t.crypto.des;

     case 2:
      return t.crypto["3des"];

     case 3:
      return t.crypto.cast;

     case 4:
      return t.crypto.rc4;

     case 5:
      return t.crypto.rc2;

     case 6:
      return t.crypto.blowfish;

     default:
      return !0;
    }
  }
  let n = Module.findExportByName("libSystem.B.dylib", "CCCrypt");
  if (null == n) return void console.error("CCCrypt func is null");
  Interceptor.attach(n, {
    onEnter: function(n) {
      if (this.enable = e(n[1].toInt32()), !this.enable) return;
      this.log = "", this.log = this.log.concat(o.green, "[*] ENTER CCCrypt", o.resetColor), 
      this.log = this.log.concat(o.yellow, "[+] CCOperation: " + h[n[0].toInt32()], o.resetColor, "\n"), 
      this.log = this.log.concat(o.yellow, "[+] CCAlgorithm: " + g[n[1].toInt32()], o.resetColor, "\n"), 
      this.log = this.log.concat(o.yellow, "[+] CCOptions: " + C[n[2].toInt32()], o.resetColor, "\n"), 
      this.log = this.log.concat(o.yellow, "[+] KeySize: " + m[n[4].toInt32()], o.resetColor, "\n"), 
      this.log = this.log.concat(o.cyan, "[+] Key: \n" + L(n[3], n[4].toInt32()), o.resetColor, "\n"), 
      this.log = this.log.concat(o.cyan, "[+] IV: \n" + L(n[5], 16), o.resetColor, "\n");
      let l = M(n[7]), a = Math.min(l, t.crypto.maxDataLength);
      this.log = this.log.concat("[+] Data len: ", a, "/", l, "\n"), this.log = this.log.concat("[+] Data : \n", "\n"), 
      this.log = this.log.concat(L(n[6], a)), this.dataOut = n[8], this.dataOutLength = n[10];
    },
    onLeave: function(e) {
      if (!this.enable) return;
      let n = M(this.dataOutLength.readPointer()), l = Math.min(n, t.crypto.maxDataLength);
      this.log = this.log.concat(o.magenta, "[+] Data out len: ", l, "/", n, "\n"), this.log = this.log.concat("[+] Data out: \n", L(this.dataOut, l), "\n", o.resetColor), 
      t.crypto.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
      this.log = this.log.concat(o.green, "[*] EXIT CCCrypt", o.resetColor, "\n");
    }
  });
  let l = {}, a = Module.findExportByName("libSystem.B.dylib", "CCCryptorCreate");
  if (null == a) return void console.error("CCCryptorCreate func is null ");
  Interceptor.attach(a, {
    onEnter: function(t) {
      this.cRefPtr = t[6], this.operation = t[0], this.algorithm = t[1], this.options = t[2], 
      this.key = t[3], this.keyLen = t[4], this.iv = t[5];
    },
    onLeave: function(t) {
      let n = {
        enable: e(this.algorithm),
        cRef: this.cRefPtr.readPointer(),
        dataMap: [],
        dataOutMap: [],
        totalLen: 0,
        totalOutLen: 0,
        originalLen: 0,
        originalOutLen: 0,
        log: ""
      };
      l[M(n.cRef)] = n, n.enable && (n.log = n.log.concat(o.green, "[*] ENTER CCCryptorCreate", o.resetColor, "\n"), 
      n.log = n.log.concat(o.yellow, "[+] CCOperation: " + h[this.operation.toInt32()], o.resetColor, "\n"), 
      n.log = n.log.concat(o.yellow, "[+] CCAlgorithm: " + g[this.algorithm.toInt32()], o.resetColor, "\n"), 
      n.log = n.log.concat(o.yellow, "[+] CCOptions: " + C[this.options.toInt32()], o.resetColor, "\n"), 
      n.log = n.log.concat(o.cyan, "[+] Key len: " + m[this.keyLen.toInt32()], o.resetColor, "\n"), 
      n.log = n.log.concat(o.cyan, "[+] Key: \n" + L(this.key, M(this.keyLen)), o.resetColor, "\n"), 
      0 != M(this.iv) ? n.log = n.log.concat(o.cyan, "[+] Iv:\n" + L(this.iv, 16), o.resetColor, "\n") : n.log = n.log.concat(o.red, "[!] Iv: null", "\n", o.resetColor));
    }
  });
  let r = Module.findExportByName("libSystem.B.dylib", "CCCryptorCreateWithMode");
  if (null == r) return void console.error("CCCryptorCreateWithMode func is null ");
  Interceptor.attach(r, {
    onEnter: function(t) {
      this.cRefPtr = t[11], this.operation = t[0], this.mode = t[1], this.algorithm = t[2], 
      this.padding = t[3], this.iv = t[4], this.key = t[5], this.keyLen = t[6], this.tweak = t[7], 
      this.tweakLen = t[8], this.numRounds = t[9], this.options = t[10];
    },
    onLeave: function(t) {
      let n = {
        enable: e(this.algorithm),
        cRef: this.cRefPtr.readPointer(),
        dataMap: [],
        dataOutMap: [],
        totalLen: 0,
        totalOutLen: 0,
        originalLen: 0,
        originalOutLen: 0,
        log: ""
      };
      if (l[M(n.cRef)] = n, !n.enable) return;
      n.log = n.log.concat(o.green, "[*] ENTER CCCryptorCreateWithMode", o.resetColor, "\n"), 
      n.log = n.log.concat(o.yellow, "[+] CCOperation: " + h[this.operation.toInt32()], o.resetColor, "\n"), 
      n.log = n.log.concat(o.yellow, "[+] CCMode: " + u[this.mode.toInt32()], o.resetColor, "\n"), 
      n.log = n.log.concat(o.yellow, "[+] CCAlgorithm: " + g[this.algorithm.toInt32()], o.resetColor, "\n"), 
      n.log = n.log.concat(o.yellow, "[+] CCPadding: " + d[this.padding.toInt32()], o.resetColor, "\n"), 
      n.log = n.log.concat(o.yellow, "[+] CCModeOptions: " + y[this.options.toInt32()], o.resetColor, "\n");
      let a = this.tweakLen.toInt32();
      a > 0 && 0 != M(this.tweak) && (n.log = n.log.concat(o.cyan, "[+] tweak len: " + a, o.resetColor, "\n"), 
      n.log = n.log.concat(o.cyan, "[+] tweak: \n" + L(this.tweak, M(this.tweakLen)), o.resetColor, "\n")), 
      n.log = n.log.concat(o.cyan, "[+] numRounds: " + this.numRounds.toInt32(), o.resetColor, "\n"), 
      n.log = n.log.concat(o.cyan, "[+] Key len: " + m[this.keyLen.toInt32()], o.resetColor, "\n"), 
      n.log = n.log.concat(o.cyan, "[+] Key: \n" + L(this.key, M(this.keyLen)), o.resetColor, "\n"), 
      0 != M(this.iv) ? n.log = n.log.concat(o.cyan, "[+] Iv:\n" + L(this.iv, 16), o.resetColor, "\n") : n.log = n.log.concat(o.red, "[!] Iv: null", "\n", o.resetColor);
    }
  });
  let i = Module.findExportByName("libSystem.B.dylib", "CCCryptorUpdate");
  if (null == i) return void console.error("CCCryptorUpdate func is null");
  Interceptor.attach(i, {
    onEnter: function(t) {
      this.outLen = t[5], this.out = t[3], this.cRef = t[0], this.dataLen = t[2], this.data = t[1];
    },
    onLeave: function(o) {
      let e = l[M(this.cRef)];
      if (null == e) return void console.error("CCCryptorUpdate model is null");
      if (!e.enable) return;
      e.originalLen += this.dataLen.toInt32();
      let n = t.crypto.maxDataLength - e.totalLen, a = M(this.dataLen);
      if (a > 0 && n > 0) {
        let t = Math.min(a, n), o = Memory.alloc(t);
        Memory.copy(o, this.data, t), e.dataMap.push({
          data: o,
          len: t
        }), e.totalLen += t;
      }
      let r = t.crypto.maxDataLength - e.totalOutLen, i = M(this.outLen.readPointer());
      if (e.originalOutLen += i, i > 0 && r > 0) {
        let t = Math.min(i, r), o = Memory.alloc(t);
        Memory.copy(o, this.out, t), e.dataOutMap.push({
          data: o,
          len: t
        }), e.totalOutLen += t;
      }
    }
  });
  let c = Module.findExportByName("libSystem.B.dylib", "CCCryptorFinal");
  null != c ? Interceptor.attach(c, {
    onEnter: function(t) {
      this.cRef = t[0], this.dataOut = t[1], this.dataOutLen = t[3];
    },
    onLeave: function(e) {
      let n = l[M(this.cRef)];
      if (null == n) return void console.error("CCCryptorFinal model is null");
      if (!n.enable) return;
      if (n.totalOutLen < t.crypto.maxDataLength) {
        let o = t.crypto.maxDataLength - n.totalOutLen, e = M(this.dataOutLen.readPointer());
        if (n.originalOutLen += e, e > 0 && o > 0) {
          let t = Math.min(e, o), l = Memory.alloc(t);
          Memory.copy(l, this.dataOut, t), n.dataOutMap.push({
            data: l,
            len: t
          }), n.totalOutLen += t;
        }
      }
      let a = Memory.alloc(n.totalLen);
      var r = 0;
      n.dataMap.forEach((function(t) {
        Memory.copy(a.add(r), t.data, t.len), r += t.len;
      }));
      let i = Memory.alloc(n.totalOutLen);
      var c = 0;
      n.dataOutMap.forEach((function(t) {
        Memory.copy(i.add(c), t.data, t.len), c += t.len;
      })), n.log = n.log.concat("[+] Data len: " + n.totalLen + "/" + n.originalLen + "\n"), 
      n.log = n.log.concat("[+] Data : \n", L(a, n.totalLen), "\n"), n.log = n.log.concat(o.magenta, "[+] Data out len: " + n.totalOutLen + "/" + n.originalOutLen + "\n"), 
      n.log = n.log.concat("[+] Data out: \n", L(i, n.totalOutLen), "\n", o.resetColor), 
      t.crypto.printStack && (n.log = n.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
      n.log = n.log.concat(o.green, "[*] EXIT CCCryptorFinal ", o.resetColor, "\n"), console.log(n.log);
    }
  }) : console.error("CCCryptorFinal func is null");
}

function I(e, n) {
  let l = Module.findExportByName("libSystem.B.dylib", e);
  null != l ? (Interceptor.attach(l, {
    onEnter: function(n) {
      this.log = "", this.log = this.log.concat(o.green, "[*] ENTER ", e, o.resetColor, "\n");
      let l = n[1].toInt32(), a = Math.min(l, t.hash.maxInputDataLength);
      this.log = this.log.concat("[+] Data len:", a, "/", l, "\n"), this.log = this.log.concat("[+] Data: \n", L(n[0], a), "\n");
    },
    onLeave: function(l) {
      this.log = this.log.concat(o.magenta, "[+] Data out len: " + n, o.resetColor, "\n"), 
      this.log = this.log.concat(o.magenta, "[+] Data out:\n", L(l, n), o.resetColor, "\n"), 
      t.hash.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
      this.log = this.log.concat(o.green, "[*] EXIT", e, o.resetColor, "\n"), console.log(this.log);
    }
  }), function() {
    let l = {}, a = Module.findExportByName("libSystem.B.dylib", e + "_Init");
    if (null == a) return void console.error(e + "_Init func is null");
    Interceptor.attach(a, {
      onEnter: function(t) {
        let n = {
          ctx: t[0],
          dataMap: [],
          totalLen: 0,
          originalLen: 0,
          log: ""
        };
        l[M(t[0])] = n, n.log = n.log.concat(o.green, "[*] ENTER " + e + "_Init\n", o.resetColor);
      }
    });
    let r = Module.findExportByName("libSystem.B.dylib", e + "_Update");
    if (null == r) return void console.error(e + "_Update func is null");
    Interceptor.attach(r, {
      onEnter: function(o) {
        let e = l[M(o[0])];
        if (null == e) return void console.error("model is null");
        let n = M(o[2]), a = t.hash.maxInputDataLength - e.totalLen;
        if (n > 0 && a > 0) {
          e.originalLen += n;
          let t = Math.min(n, a), l = Memory.alloc(t);
          Memory.copy(l, o[1], t), e.dataMap.push({
            data: l,
            len: t
          }), e.totalLen += t;
        }
      }
    });
    let i = Module.findExportByName("libSystem.B.dylib", e + "_Final");
    null != i ? Interceptor.attach(i, {
      onEnter: function(t) {
        this.mdSha = t[0], this.ctxSha = t[1];
      },
      onLeave: function(a) {
        let r = l[M(this.ctxSha)];
        if (null == r) return void console.error(e + "_Final model is null");
        if (r.totalLen <= 0) return void console.error("totalLen :", r.totalLen);
        let i = Memory.alloc(r.totalLen);
        var c = 0;
        r.dataMap.forEach((function(t) {
          Memory.copy(i.add(c), t.data, t.len), c += t.len;
        })), r.log = r.log.concat("[+] Data len: " + r.totalLen + "/" + r.originalLen + "\n"), 
        r.log = r.log.concat("[+] Data :\n"), r.log = r.log.concat(L(i, r.totalLen), "\n"), 
        0 !== M(this.mdSha) ? (r.log = r.log.concat(o.magenta, "[+] Data out len: " + n + "\n"), 
        r.log = r.log.concat("[+] Data out:\n"), r.log = r.log.concat(L(ptr(this.mdSha), n), "\n", o.resetColor)) : r.log = r.log.concat(o.red, "[!]: Data out: null\n", o.resetColor), 
        t.hash.printStack && (r.log = r.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
        r.log = r.log.concat(o.green, "[*] EXIT " + e + "_Final\n", o.resetColor), console.log(r.log);
      }
    }) : console.error(e + "_Final func is null");
  }()) : console.error(e + " func is null");
}

function E() {
  function e(o) {
    switch (o) {
     case 0:
      return t.hmac.sha1;

     case 1:
      return t.hmac.md5;

     case 2:
      return t.hmac.sha256;

     case 3:
      return t.hmac.sha384;

     case 4:
      return t.hmac.sha512;

     case 5:
      return t.hmac.sha224;

     default:
      return !0;
    }
  }
  let n = "CCHmac", l = Module.findExportByName("libSystem.B.dylib", n);
  null != l ? (Interceptor.attach(l, {
    onEnter: function(l) {
      if (this.enable = e(l[0].toInt32()), !this.enable) return;
      this.mdLen = f[l[0].toInt32()], this.log = "", this.log = this.log.concat(o.green, "[*] ENTER ", n, "\n"), 
      this.log = this.log.concat(o.yellow, "[+] Algorithm: ", p[l[0].toInt32()], "\n", o.resetColor), 
      this.log = this.log.concat(o.cyan, "[+] Key len: ", l[2].toInt32(), "\n"), this.log = this.log.concat(o.cyan, "[+] Key : \n", L(l[1], l[2].toInt32()), "\n", o.resetColor);
      let a = l[4].toInt32(), r = Math.min(a, t.hmac.maxInputDataLength);
      this.log = this.log.concat("[+] Data len:", r, "/", a, "\n"), this.log = this.log.concat("[+] Data: \n", L(l[3], r), "\n"), 
      this.macOut = l[5];
    },
    onLeave: function(e) {
      this.enable && (this.log = this.log.concat(o.magenta, "[+] Data out len: " + this.mdLen, o.resetColor, "\n"), 
      this.log = this.log.concat(o.magenta, "[+] Data out:\n", L(e, this.mdLen), o.resetColor, "\n"), 
      t.hmac.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
      this.log = this.log.concat(o.green, "[*] EXIT", n, o.resetColor, "\n"), console.log(this.log));
    }
  }), function() {
    let l = {}, a = Module.findExportByName("libSystem.B.dylib", n + "Init");
    if (null == a) return void console.error(n + "Init func is null");
    Interceptor.attach(a, {
      onEnter: function(t) {
        let a = {
          ctx: t[0],
          dataMap: [],
          totalLen: 0,
          originalLen: 0,
          log: "",
          mdLen: f[t[1].toInt32()],
          enable: e(t[1].toInt32())
        };
        l[M(t[0])] = a, a.enable && (a.log = a.log.concat(o.green, "[*] ENTER " + n + "Init\n", o.resetColor), 
        a.log = a.log.concat(o.yellow, "[+] Algorithm: " + p[t[1].toInt32()] + "\n", o.resetColor), 
        a.log = a.log.concat(o.cyan, "[+] Key len: " + t[3].toInt32() + o.resetColor + "\n"), 
        a.log = a.log.concat(o.cyan, "[+] Key: \n" + L(t[2], M(t[3])) + "\n", o.resetColor));
      }
    });
    let r = Module.findExportByName("libSystem.B.dylib", n + "Update");
    if (null == r) return void console.error(n + "Update func is null");
    Interceptor.attach(r, {
      onEnter: function(o) {
        let e = l[M(o[0])];
        if (null == e) return void console.error(n + "Update model is null");
        if (!e.enable) return;
        let a = M(o[2]), r = t.hmac.maxInputDataLength - e.totalLen;
        if (a > 0 && r > 0) {
          e.originalLen += a;
          let t = Math.min(a, r), n = Memory.alloc(t);
          Memory.copy(n, o[1], t), e.dataMap.push({
            data: n,
            len: t
          }), e.totalLen += t;
        }
      }
    });
    let i = Module.findExportByName("libSystem.B.dylib", n + "Final");
    null != i ? Interceptor.attach(i, {
      onEnter: function(t) {
        this.mdOut = t[1], this.ctx = t[0];
      },
      onLeave: function(e) {
        let a = l[M(this.ctx)];
        if (null == a) return void console.error(n + "Final model is null");
        if (!a.enable) return;
        if (a.totalLen <= 0) return void console.error("totalLen :", a.totalLen);
        let r = Memory.alloc(a.totalLen);
        var i = 0;
        a.dataMap.forEach((function(t) {
          Memory.copy(r.add(i), t.data, t.len), i += t.len;
        })), a.log = a.log.concat("[+] Data len: " + a.totalLen + "/" + a.originalLen + "\n"), 
        a.log = a.log.concat("[+] Data :\n"), a.log = a.log.concat(L(r, a.totalLen), "\n"), 
        a.log = a.log.concat(o.magenta, "[+] Data out len: " + a.mdLen + "\n"), a.log = a.log.concat("[+] Data out:\n"), 
        a.log = a.log.concat(L(ptr(this.mdOut), a.mdLen), "\n", o.resetColor), t.hmac.printStack && (a.log = a.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
        a.log = a.log.concat(o.green, "[*] EXIT " + n + "Final\n", o.resetColor), console.log(a.log);
      }
    }) : console.error(n + "Final func is null");
  }()) : console.error(n + " func is null");
}

function A() {
  let e = Module.findExportByName("libSystem.B.dylib", "CCKeyDerivationPBKDF");
  if (null == e) return void console.error("CCKeyDerivationPBKDF func is null");
  Interceptor.attach(e, {
    onEnter: function(t) {
      this.derivedKey = t[7], this.derivedKeyLen = t[8], this.log = "", this.log = this.log.concat(o.green, "[*] ENTER CCKeyDerivationPBKDF", o.resetColor, "\n"), 
      this.log = this.log.concat(o.yellow, "[+] Algorithm: ", b[t[0].toInt32()], "\n", o.resetColor), 
      this.log = this.log.concat(o.yellow, "[+] PseudoRandomAlgorithm: ", k[t[5].toInt32()], "\n", o.resetColor), 
      this.log = this.log.concat(o.cyan, "[+] Rounds: ", M(t[6]), "\n", o.resetColor), 
      this.log = this.log.concat(o.cyan, "[+] Password len: ", t[2].toInt32(), "\n"), 
      this.log = this.log.concat(o.cyan, "[+] Password : \n", L(t[1], t[2].toInt32()), "\n", o.resetColor), 
      this.log = this.log.concat(o.cyan, "[+] Salt len: ", t[4].toInt32(), "\n"), this.log = this.log.concat(o.cyan, "[+] Salt : \n", L(t[3], t[4].toInt32()), "\n", o.resetColor), 
      this.log = this.log.concat(o.cyan, "[+] DerivedKey len: ", t[8].toInt32(), "\n");
    },
    onLeave: function(e) {
      this.log = this.log.concat(o.cyan, "[+] DerivedKey : \n", L(this.derivedKey, this.derivedKey.toInt32()), "\n", o.resetColor), 
      t.pbkdf.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
      this.log = this.log.concat(o.green, "[*] EXIT CCKeyDerivationPBKDF", o.resetColor, "\n"), 
      console.log(this.log);
    }
  });
  let n = Module.findExportByName("libSystem.B.dylib", "CCCalibratePBKDF");
  null != n ? Interceptor.attach(n, {
    onEnter: function(t) {
      this.log = "", this.log = this.log.concat(o.green, "[*] ENTER CCCalibratePBKDF", o.resetColor, "\n"), 
      this.log = this.log.concat(o.yellow, "[+] Algorithm: ", b[t[0].toInt32()], "\n", o.resetColor), 
      this.log = this.log.concat(o.yellow, "[+] PseudoRandomAlgorithm: ", k[t[3].toInt32()], "\n", o.resetColor), 
      this.log = this.log.concat(o.cyan, "[+] Password len: ", t[1].toInt32(), o.resetColor, "\n"), 
      this.log = this.log.concat(o.cyan, "[+] Salt len: ", t[2].toInt32(), o.resetColor, "\n"), 
      this.log = this.log.concat(o.cyan, "[+] DerivedKey len: ", t[4].toInt32(), o.resetColor, "\n"), 
      this.log = this.log.concat(o.cyan, "[+] Msec : ", M(t[5]), o.resetColor, "\n");
    },
    onLeave: function(e) {
      this.log = this.log.concat(o.cyan, "[+] IterNum : \n", M(e), o.resetColor, "\n"), 
      t.pbkdf.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
      this.log = this.log.concat(o.green, "[*] EXIT CCCalibratePBKDF", o.resetColor, "\n"), 
      console.log(this.log);
    }
  }) : console.error("CCCalibratePBKDF func is null");
}

t.enable && (t.crypto.enable && S(), t.hash.enable && (t.hash.sha1 && I("CC_SHA1", 20), 
t.hash.sha224 && I("CC_SHA224", 28), t.hash.sha256 && I("CC_SHA256", 32), t.hash.sha384 && I("CC_SHA384", 48), 
t.hash.sha512 && I("CC_SHA512", 64), t.hash.md2 && I("CC_MD2", 16), t.hash.md4 && I("CC_MD4", 16), 
t.hash.md5 && I("CC_MD5", 16), t.hmac.enable && E(), t.pbkdf.enable && A()));

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDd0JBLE1BQU0sSUFBYztFQUNoQixTQUFTO0VBQ1QsUUFBUztJQUNMLFNBQVM7SUFDVCxlQUFnQjtJQUNoQixhQUFhO0lBQ2IsTUFBTTtJQUNOLE1BQU07SUFDTixTQUFPO0lBQ1AsT0FBTztJQUNQLE1BQU07SUFDTixNQUFNO0lBQ04sV0FBVzs7RUFFZixNQUFPO0lBQ0gsU0FBUztJQUNULG9CQUFxQjtJQUNyQixhQUFhO0lBQ2IsTUFBTTtJQUNOLE1BQU07SUFDTixNQUFNO0lBQ04sT0FBTztJQUNQLFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7O0VBRWIsTUFBTztJQUNILFNBQVM7SUFDVCxvQkFBcUI7SUFDckIsYUFBYTtJQUNiLE9BQU87SUFDUCxNQUFNO0lBQ04sU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUzs7RUFFYixPQUFRO0lBQ0osU0FBUztJQUNULGFBQWE7O0dBT2YsSUFBUztFQUNYLFlBQWM7RUFDZCxNQUFRO0VBQ1IsS0FBTztFQUNQLFFBQVU7RUFDVixXQUFhO0VBQ2IsT0FBUztFQUNULFNBQVc7RUFDWCxRQUFVO0VBQ1YsT0FBUztFQUNULEtBQU87RUFDUCxPQUFTO0VBQ1QsUUFBVTtFQUNWLE1BQVE7RUFDUixTQUFXO0VBQ1gsTUFBUTtFQUNSLE9BQVM7RUFDVCxTQUFXO0VBQ1gsT0FBUztFQUNULFNBQVc7RUFDWCxVQUFZO0VBQ1osUUFBVTtFQUNWLFdBQWE7RUFDYixRQUFVO0VBQ1YsU0FBVztHQUdULElBQXVCLElBQ3ZCLElBQXVCLElBQ3ZCLElBQXVCLElBQ3ZCLElBQXNCLElBQ3RCLElBQXdCLElBQ3hCLElBQXdCLElBQ3hCLElBQXdCLElBQ3hCLElBQXdCLElBRXhCLElBQWtDO0VBQ3BDLEdBQUU7RUFDRixHQUFFO0dBRUEsSUFBa0M7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SSxPQUFPLEVBQU8sT0FBTSw2QkFBNEIsRUFBTyxZQUFXO01BQ3BGLFFBQVEsSUFBSSxLQUFLO0FBQ3JCO09BckJBLFFBQVEsTUFBTTtBQXVCdEI7O0FBSVEsRUFBYyxXQUdmLEVBQWMsT0FBTyxVQUNwQixLQUVELEVBQWMsS0FBSyxXQUNmLEVBQWMsS0FBSyxRQUVsQixFQUFzQixXQUFVO0FBRWpDLEVBQWMsS0FBSyxVQUVsQixFQUFzQixhQUFZLEtBRW5DLEVBQWMsS0FBSyxVQUVsQixFQUFzQixhQUFZLEtBRW5DLEVBQWMsS0FBSyxVQUVsQixFQUFzQixhQUFZO0FBRW5DLEVBQWMsS0FBSyxVQUVsQixFQUFzQixhQUFZLEtBRW5DLEVBQWMsS0FBSyxPQUVsQixFQUFzQixVQUFTLEtBRWhDLEVBQWMsS0FBSyxPQUVsQixFQUFzQixVQUFTO0FBRWhDLEVBQWMsS0FBSyxPQUVsQixFQUFzQixVQUFTLEtBRWhDLEVBQWMsS0FBSyxVQUNsQixLQUVELEVBQWMsTUFBTSxVQUNuQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIn0=
