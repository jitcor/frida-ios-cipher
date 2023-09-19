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
  highlighting: !0,
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
    blowfish: !0,
    filter: []
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
    sha512: !0,
    filter: []
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
    sha512: !0,
    filter: []
  },
  pbkdf: {
    enable: !0,
    printStack: !1,
    filter: []
  }
}, o = {
  resetColor: t.highlighting ? "[0m" : "",
  bold: t.highlighting ? "[1m" : "",
  dim: t.highlighting ? "[2m" : "",
  italic: t.highlighting ? "[3m" : "",
  underline: t.highlighting ? "[4m" : "",
  blink: t.highlighting ? "[5m" : "",
  reverse: t.highlighting ? "[7m" : "",
  hidden: t.highlighting ? "[8m" : "",
  black: t.highlighting ? "[30m" : "",
  red: t.highlighting ? "[31m" : "",
  green: t.highlighting ? "[32m" : "",
  yellow: t.highlighting ? "[33m" : "",
  blue: t.highlighting ? "[34m" : "",
  magenta: t.highlighting ? "[35m" : "",
  cyan: t.highlighting ? "[36m" : "",
  white: t.highlighting ? "[37m" : "",
  bgBlack: t.highlighting ? "[40m" : "",
  bgRed: t.highlighting ? "[41m" : "",
  bgGreen: t.highlighting ? "[42m" : "",
  bgYellow: t.highlighting ? "[43m" : "",
  bgBlue: t.highlighting ? "[44m" : "",
  bgMagenta: t.highlighting ? "[45m" : "",
  bgCyan: t.highlighting ? "[46m" : "",
  bgWhite: t.highlighting ? "[47m" : ""
}, e = 16, n = 16, l = 16, a = 20, r = 28, i = 32, c = 48, s = 64, h = {
  0: "kCCEncrypt",
  1: "kCCEncrypt",
  3: "kCCBoth"
}, g = {
  0: "kCCAlgorithmAES",
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
  10: "kCCModeCFB8",
  11: "kCCModeGCM",
  12: "kCCModeCCM"
}, d = {
  0: "ccNoPadding",
  1: "ccPKCS7Padding",
  12: "ccCBCCTS3"
}, m = {
  1: "kCCModeOptionCTR_LE",
  2: "kCCModeOptionCTR_BE"
}, y = {
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

function S(t, o) {
  if (null == o || 0 == o.length) console.log(t); else {
    var e = !1;
    for (let n of o) if (null != n && 0 != n.length && (e = !0, t.indexOf(n) >= 0)) return void console.log(t);
    e || console.log(t);
  }
}

function I(t) {
  var o = "";
  const e = t.split("\n");
  for (const t of e) {
    const e = t.split("");
    e.length <= 58 ? e.splice(e.length, 0, "\n") : (e.splice(e.length, 0, "|\n"), e.splice(59, 0, "|")), 
    e.splice(0, 2), o += e.join("");
  }
  return o;
}

function E() {
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
      this.log = this.log.concat(o.yellow, "[+] KeySize: " + y[n[4].toInt32()], o.resetColor, "\n"), 
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
      n.log = n.log.concat(o.cyan, "[+] Key len: " + y[this.keyLen.toInt32()], o.resetColor, "\n"), 
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
      n.log = n.log.concat(o.yellow, "[+] CCModeOptions: " + m[this.options.toInt32()], o.resetColor, "\n");
      let a = this.tweakLen.toInt32();
      a > 0 && 0 != M(this.tweak) && (n.log = n.log.concat(o.cyan, "[+] tweak len: " + a, o.resetColor, "\n"), 
      n.log = n.log.concat(o.cyan, "[+] tweak: \n" + L(this.tweak, M(this.tweakLen)), o.resetColor, "\n")), 
      n.log = n.log.concat(o.cyan, "[+] numRounds: " + this.numRounds.toInt32(), o.resetColor, "\n"), 
      n.log = n.log.concat(o.cyan, "[+] Key len: " + y[this.keyLen.toInt32()], o.resetColor, "\n"), 
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
      n.log = n.log.concat(o.green, "[*] EXIT CCCryptorFinal ", o.resetColor, "\n"), S(n.log, t.crypto.filter);
    }
  }) : console.error("CCCryptorFinal func is null");
}

function A(e, n) {
  let l = Module.findExportByName("libSystem.B.dylib", e);
  null != l ? (Interceptor.attach(l, {
    onEnter: function(n) {
      this.log = "", this.log = this.log.concat(o.green, "[*] ENTER ", e, o.resetColor, "\n");
      let l = n[1].toInt32(), a = Math.min(l, t.hash.maxInputDataLength);
      this.log = this.log.concat("[+] Data len: ", a, "/", l, "\n"), this.log = this.log.concat("[+] Data: \n", L(n[0], a), "\n");
    },
    onLeave: function(l) {
      this.log = this.log.concat(o.magenta, "[+] Data out len: " + n, o.resetColor, "\n"), 
      this.log = this.log.concat(o.magenta, "[+] Data out:\n", L(l, n), o.resetColor, "\n"), 
      t.hash.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
      this.log = this.log.concat(o.green, "[*] EXIT ", e, o.resetColor, "\n"), S(this.log, t.hash.filter);
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
        r.log = r.log.concat(o.green, "[*] EXIT " + e + "_Final\n", o.resetColor), S(r.log, t.hash.filter);
      }
    }) : console.error(e + "_Final func is null");
  }()) : console.error(e + " func is null");
}

function D() {
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
      this.log = this.log.concat("[+] Data len: ", r, "/", a, "\n"), this.log = this.log.concat("[+] Data: \n", L(l[3], r), "\n"), 
      this.macOut = l[5];
    },
    onLeave: function(e) {
      this.enable && (this.log = this.log.concat(o.magenta, "[+] Data out len: " + this.mdLen, o.resetColor, "\n"), 
      this.log = this.log.concat(o.magenta, "[+] Data out:\n", L(e, this.mdLen), o.resetColor, "\n"), 
      t.hmac.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
      this.log = this.log.concat(o.green, "[*] EXIT ", n, o.resetColor, "\n"), S(this.log, t.hmac.filter));
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
        a.log = a.log.concat(o.green, "[*] EXIT " + n + "Final\n", o.resetColor), S(a.log, t.hmac.filter);
      }
    }) : console.error(n + "Final func is null");
  }()) : console.error(n + " func is null");
}

function B() {
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
      S(this.log, t.pbkdf.filter);
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
      S(this.log, t.pbkdf.filter);
    }
  }) : console.error("CCCalibratePBKDF func is null");
}

t.enable && (t.crypto.enable && E(), t.hash.enable && (t.hash.sha1 && A("CC_SHA1", 20), 
t.hash.sha224 && A("CC_SHA224", 28), t.hash.sha256 && A("CC_SHA256", 32), t.hash.sha384 && A("CC_SHA384", 48), 
t.hash.sha512 && A("CC_SHA512", 64), t.hash.md2 && A("CC_MD2", 16), t.hash.md4 && A("CC_MD4", 16), 
t.hash.md5 && A("CC_MD5", 16), t.hmac.enable && D(), t.pbkdf.enable && B()));

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDd0JBLE1BQU0sSUFBYztFQUNoQixTQUFTO0VBQ1QsZUFBZTtFQUNmLFFBQVM7SUFDTCxTQUFTO0lBQ1QsZUFBZ0I7SUFDaEIsYUFBYTtJQUNiLE1BQU07SUFDTixNQUFNO0lBQ04sU0FBTztJQUNQLE9BQU87SUFDUCxNQUFNO0lBQ04sTUFBTTtJQUNOLFdBQVc7SUFDWCxRQUFTOztFQUViLE1BQU87SUFDSCxTQUFTO0lBQ1Qsb0JBQXFCO0lBQ3JCLGFBQWE7SUFDYixNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixPQUFPO0lBQ1AsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFFBQVM7O0VBRWIsTUFBTztJQUNILFNBQVM7SUFDVCxvQkFBcUI7SUFDckIsYUFBYTtJQUNiLE9BQU87SUFDUCxNQUFNO0lBQ04sU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFFBQVM7O0VBRWIsT0FBUTtJQUNKLFNBQVM7SUFDVCxhQUFhO0lBQ2IsUUFBUzs7R0FPWCxJQUFTO0VBQ1gsWUFBYyxFQUFjLGVBQWEsU0FBVTtFQUNuRCxNQUFRLEVBQWMsZUFBYSxTQUFVO0VBQzdDLEtBQU8sRUFBYyxlQUFhLFNBQVU7RUFDNUMsUUFBVSxFQUFjLGVBQWEsU0FBVTtFQUMvQyxXQUFhLEVBQWMsZUFBYSxTQUFVO0VBQ2xELE9BQVMsRUFBYyxlQUFhLFNBQVU7RUFDOUMsU0FBVyxFQUFjLGVBQWEsU0FBVTtFQUNoRCxRQUFVLEVBQWMsZUFBYSxTQUFVO0VBQy9DLE9BQVMsRUFBYyxlQUFhLFVBQVc7RUFDL0MsS0FBTyxFQUFjLGVBQWEsVUFBVztFQUM3QyxPQUFTLEVBQWMsZUFBYSxVQUFXO0VBQy9DLFFBQVUsRUFBYyxlQUFhLFVBQVc7RUFDaEQsTUFBUSxFQUFjLGVB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
