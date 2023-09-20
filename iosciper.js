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
}, e = 16, n = 16, a = 16, l = 20, r = 28, i = 32, c = 48, s = 64, h = {
  0: "kCCEncrypt",
  1: "kCCEncrypt",
  3: "kCCBoth"
}, C = {
  0: "kCCAlgorithmAES",
  1: "kCCAlgorithmDES",
  2: "kCCAlgorithm3DES",
  3: "kCCAlgorithmCAST",
  4: "kCCAlgorithmRC4",
  5: "kCCAlgorithmRC2",
  6: "kCCAlgorithmBlowfish"
}, g = {
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
}, m = {
  0: "ccNoPadding",
  1: "ccPKCS7Padding",
  12: "ccCBCCTS3"
}, d = {
  1: "kCCModeOptionCTR_LE",
  2: "kCCModeOptionCTR_BE"
}, p = {
  16: "kCCKeySizeAES128|kCCKeySizeMaxCAST",
  24: "kCCKeySizeAES192|kCCKeySize3DES",
  32: "kCCKeySizeAES256",
  8: "kCCKeySizeDES|kCCKeySizeMinBlowfish",
  5: "kCCKeySizeMinCAST",
  1: "kCCKeySizeMinRC4|kCCKeySizeMinRC2",
  512: "kCCKeySizeMaxRC4",
  128: "kCCKeySizeMaxRC2",
  56: "kCCKeySizeMaxBlowfish"
}, y = {
  0: "kCCHmacAlgSHA1",
  1: "kCCHmacAlgMD5",
  2: "kCCHmacAlgSHA256",
  3: "kCCHmacAlgSHA384",
  4: "kCCHmacAlgSHA512",
  5: "kCCHmacAlgSHA224"
}, f = {
  0: l,
  1: a,
  2: i,
  3: c,
  4: s,
  5: r
}, b = {
  1: "kCCPRFHmacAlgSHA1",
  2: "kCCPRFHmacAlgSHA224",
  3: "kCCPRFHmacAlgSHA256",
  4: "kCCPRFHmacAlgSHA384",
  5: "kCCPRFHmacAlgSHA512"
}, k = {
  2: "kCCPBKDF2"
};

    function M(t, o = 240) {
  try {
    return null == t ? "\n" : "\n" + hexdump(t, {
      length: o
    }) + "\n";
  } catch (o) {
    return o instanceof Error && console.error("print_arg error:", o.stack), t + "\n";
  }
}

    function S(t) {
  try {
    return null == t ? 0 : parseInt(t.toString());
  } catch (t) {
    return t instanceof Error && console.error("pointerToInt error:", t.stack), 0;
  }
}

    function L(t, o) {
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
          this.log = this.log.concat(o.yellow, "[+] CCAlgorithm: " + C[n[1].toInt32()], o.resetColor, "\n"),
          this.log = this.log.concat(o.yellow, "[+] CCOptions: " + g[n[2].toInt32()], o.resetColor, "\n"),
          this.log = this.log.concat(o.yellow, "[+] KeySize: " + p[n[4].toInt32()], o.resetColor, "\n"),
          this.log = this.log.concat(o.cyan, "[+] Key: \n" + M(n[3], n[4].toInt32()), o.resetColor, "\n"),
          this.log = this.log.concat(o.cyan, "[+] IV: \n" + M(n[5], 16), o.resetColor, "\n");
      let a = S(n[7]), l = Math.min(a, t.crypto.maxDataLength);
      this.log = this.log.concat("[+] Data len: ", l, "/", a, "\n"), this.log = this.log.concat("[+] Data : \n", "\n"),
          this.log = this.log.concat(M(n[6], l)), this.dataOut = n[8], this.dataOutLength = n[10];
    },
    onLeave: function(e) {
      if (!this.enable) return;
      let n = S(this.dataOutLength.readPointer()), a = Math.min(n, t.crypto.maxDataLength);
      this.log = this.log.concat(o.magenta, "[+] Data out len: ", a, "/", n, "\n"), this.log = this.log.concat("[+] Data out: \n", M(this.dataOut, a), "\n", o.resetColor), 
      t.crypto.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
      this.log = this.log.concat(o.green, "[*] EXIT CCCrypt", o.resetColor, "\n");
    }
  });
  let a = {}, l = Module.findExportByName("libSystem.B.dylib", "CCCryptorCreate");
  if (null == l) return void console.error("CCCryptorCreate func is null ");
  Interceptor.attach(l, {
    onEnter: function(t) {
      this.params = [];
      for (let o = 0; o < 7; o++) this.params.push(t[o]);
    },
    onLeave: function(t) {
      let n = {
        enable: e(this.params[1]),
        cRef: this.params[6].readPointer(),
        dataMap: [],
        dataOutMap: [],
        totalLen: 0,
        totalOutLen: 0,
        originalLen: 0,
        originalOutLen: 0,
        log: "",
        finish: !1,
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
      a[S(n.cRef)] = n, n.enable && (n.log = n.log.concat(o.green, "[*] ENTER CCCryptorCreate", o.resetColor, "\n"),
          n.log = n.log.concat(o.yellow, "[+] CCOperation: ", n.CCOperation = h[this.params[0].toInt32()], o.resetColor, "\n"),
          n.log = n.log.concat(o.yellow, "[+] CCAlgorithm: " + C[this.params[1].toInt32()], o.resetColor, "\n"),
          n.log = n.log.concat(o.cyan, "[+] Key len: ", n.CCKeySize = p[this.params[4].toInt32()], o.resetColor, "\n"),
          n.log = n.log.concat(o.cyan, "[+] Key: \n", n.Key = M(this.params[3], S(this.params[4])), o.resetColor, "\n"),
          0 != S(this.params[5]) ? n.log = n.log.concat(o.cyan, "[+] Iv:\n", n.Iv = M(this.params[5], 16), o.resetColor, "\n") : n.log = n.log.concat(o.red, "[!] Iv: null", "\n", o.resetColor));
    }
  });
  let r = Module.findExportByName("libSystem.B.dylib", "CCCryptorCreateWithMode");
  if (null == r) return void console.error("CCCryptorCreateWithMode func is null ");
  Interceptor.attach(r, {
    onEnter: function(t) {
      this.params = [];
      for (let o = 0; o < 12; o++) this.params.push(t[o]);
    },
    onLeave: function(t) {
      let n = {
        enable: e(this.params[2]),
        cRef: ptr(0),
        dataMap: [],
        dataOutMap: [],
        totalLen: 0,
        totalOutLen: 0,
        originalLen: 0,
        originalOutLen: 0,
        log: "",
        finish: !1,
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
        n.cRef = this.params[11].readPointer();
      } catch (t) {
        return void console.log("Error: read CCCryptorRef failed:", t);
      }
      if (a[S(n.cRef)] = n, !n.enable) return;
      n.log = n.log.concat(o.green, "[*] ENTER CCCryptorCreateWithMode", o.resetColor, "\n"),
          n.log = n.log.concat(o.yellow, "[+] CCOperation: ", n.CCOperation = h[this.params[0].toInt32()], o.resetColor, "\n"),
          n.log = n.log.concat(o.yellow, "[+] CCMode: ", n.CCMode = u[this.params[1].toInt32()], o.resetColor, "\n"),
          n.log = n.log.concat(o.yellow, "[+] CCAlgorithm: ", n.CCAlgorithm = C[this.params[2].toInt32()], o.resetColor, "\n"),
          n.log = n.log.concat(o.yellow, "[+] CCPadding: ", n.CCPadding = m[this.params[3].toInt32()], o.resetColor, "\n"),
          n.log = n.log.concat(o.yellow, "[+] CCModeOptions: ", n.CCModeOptions = d[this.params[10].toInt32()], o.resetColor, "\n");
      let l = this.params[8].toInt32();
      l > 0 && 0 != S(this.params[7]) && (n.log = n.log.concat(o.cyan, "[+] tweak len: ", n.TweakLen = l, o.resetColor, "\n"),
          n.log = n.log.concat(o.cyan, "[+] tweak: \n", n.Tweak = M(this.params[7], S(this.params[8])), o.resetColor, "\n")),
          n.log = n.log.concat(o.cyan, "[+] numRounds: ", n.NumRounds = this.params[9].toInt32(), o.resetColor, "\n"),
          n.log = n.log.concat(o.cyan, "[+] Key len: ", n.CCKeySize = p[this.params[6].toInt32()], o.resetColor, "\n"),
          n.log = n.log.concat(o.cyan, "[+] Key: \n", n.Key = M(this.params[5], S(this.params[6])), o.resetColor, "\n"),
          0 != S(this.params[4]) ? n.log = n.log.concat(o.cyan, "[+] Iv:\n", n.Iv = M(this.params[4], 16), o.resetColor, "\n") : n.log = n.log.concat(o.red, "[!] Iv: null", "\n", o.resetColor);
    }
  });
  let i = Module.findExportByName("libSystem.B.dylib", "CCCryptorUpdate");
  if (null == i) return void console.error("CCCryptorUpdate func is null");
  Interceptor.attach(i, {
    onEnter: function(t) {
      this.params = [];
      for (let o = 0; o < 6; o++) this.params.push(t[o]);
    },
    onLeave: function (e) {
      let n = a[S(this.params[0])];
      if (null == n) {
        n = {
          enable: t.crypto.enable,
          cRef: this.params[0],
          dataMap: [],
          dataOutMap: [],
          totalLen: 0,
          totalOutLen: 0,
          originalLen: 0,
          originalOutLen: 0,
          log: "",
          finish: !1,
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
        }, n.log = n.log.concat(o.green, "[*] ENTER CCCryptorUpdate (note: Cannot be associated with an existing CCCryptorRef, so the data encryption parameters are unknown, However, a list of encryption instances that are currently still being processed can be provided here.)", o.resetColor, "\n"),
            n.log = n.log.concat(o.blue, "[=] The list is as follows:", o.resetColor, "\n");
        for (let t in a) {
          let e = a[t];
          null == e || e.finish || (n.log = n.log.concat(o.cyan, "[+] CCCryptorRef: ", e.cRef + "(pointer)", " dump:\n", o.resetColor, "\n"),
              n.log = n.log.concat(o.yellow, "[+] : CCAlgorithm: ", e.CCAlgorithm, o.resetColor, "\n"),
              n.log = n.log.concat(o.yellow, "[+] : CCOperation: ", e.CCOperation, o.resetColor, "\n"),
              n.log = n.log.concat(o.yellow, "[+] : CCMode: ", e.CCMode, o.resetColor, "\n"),
              n.log = n.log.concat(o.yellow, "[+] : CCKeySize: ", e.CCKeySize, o.resetColor, "\n"),
              n.log = n.log.concat(o.yellow, "[+] : CCModeOptions: ", e.CCModeOptions, o.resetColor, "\n"),
              n.log = n.log.concat(o.yellow, "[+] : CCPadding: ", e.CCPadding, o.resetColor, "\n"),
              n.log = n.log.concat(o.yellow, "[+] : Key: ", e.Key, o.resetColor, "\n"), n.log = n.log.concat(o.yellow, "[+] : Iv: ", e.Iv, o.resetColor, "\n"),
          parseInt(e.TweakLen) > 0 && (n.log = n.log.concat(o.yellow, "[+] : TweakLen: ", e.TweakLen, o.resetColor, "\n"),
              n.log = n.log.concat(o.yellow, "[+] : Tweak: ", e.Tweak, o.resetColor, "\n")), n.log = n.log.concat(o.yellow, "[+] : NumRounds: ", e.NumRounds, o.resetColor, "\n"));
        }
        n.log = n.log.concat(o.blue, "[=] End of list", o.resetColor, "\n"), a[S(this.params[0])] = n;
      }
      if (!n.enable) return;
      n.originalLen += this.params[2].toInt32();
      let l = t.crypto.maxDataLength - n.totalLen, r = S(this.params[2]);
      if (r > 0 && l > 0) {
        let t = Math.min(r, l), o = Memory.alloc(t);
        Memory.copy(o, this.params[1], t), n.dataMap.push({
          data: o,
          len: t
        }), n.totalLen += t;
      }
      let i = t.crypto.maxDataLength - n.totalOutLen, c = S(this.params[5].readPointer());
      if (n.originalOutLen += c, c > 0 && i > 0) {
        let t = Math.min(c, i), o = Memory.alloc(t);
        Memory.copy(o, this.params[3], t), n.dataOutMap.push({
          data: o,
          len: t
        }), n.totalOutLen += t;
      }
    }
  });
  let c = Module.findExportByName("libSystem.B.dylib", "CCCryptorFinal");
  null != c ? Interceptor.attach(c, {
    onEnter: function(t) {
      this.params = [];
      for (let o = 0; o < 4; o++) this.params.push(t[o]);
    },
    onLeave: function(e) {
      let n = a[S(this.params[0])];
      if (null == n) return void console.error("CCCryptorFinal model is null");
      if (!n.enable) return;
      if (n.totalOutLen < t.crypto.maxDataLength) {
        let o = t.crypto.maxDataLength - n.totalOutLen, e = S(this.params[3].readPointer());
        if (n.originalOutLen += e, e > 0 && o > 0) {
          let t = Math.min(e, o), a = Memory.alloc(t);
          Memory.copy(a, this.params[1], t), n.dataOutMap.push({
            data: a,
            len: t
          }), n.totalOutLen += t;
        }
      }
      let l = Memory.alloc(n.totalLen);
      var r = 0;
      n.dataMap.forEach((function(t) {
        Memory.copy(l.add(r), t.data, t.len), r += t.len;
      }));
      let i = Memory.alloc(n.totalOutLen);
      var c = 0;
      n.dataOutMap.forEach((function(t) {
        Memory.copy(i.add(c), t.data, t.len), c += t.len;
      })), n.log = n.log.concat("[+] Data len: " + n.totalLen + "/" + n.originalLen + "\n"),
          n.log = n.log.concat("[+] Data : \n", M(l, n.totalLen), "\n"), n.log = n.log.concat(o.magenta, "[+] Data out len: " + n.totalOutLen + "/" + n.originalOutLen + "\n"),
          n.log = n.log.concat("[+] Data out: \n", M(i, n.totalOutLen), "\n", o.resetColor),
      t.crypto.printStack && (n.log = n.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
          n.log = n.log.concat(o.green, "[*] EXIT CCCryptorFinal ", o.resetColor, "\n"), n.finish = !0,
          L(n.log, t.crypto.filter);
    }
  }) : console.error("CCCryptorFinal func is null");
}

function A(e, n) {
  let a = Module.findExportByName("libSystem.B.dylib", e);
  null != a ? (Interceptor.attach(a, {
    onEnter: function(n) {
      this.log = "", this.log = this.log.concat(o.green, "[*] ENTER ", e, o.resetColor, "\n");
      let a = n[1].toInt32(), l = Math.min(a, t.hash.maxInputDataLength);
      this.log = this.log.concat("[+] Data len: ", l, "/", a, "\n"), this.log = this.log.concat("[+] Data: \n", M(n[0], l), "\n");
    },
    onLeave: function (a) {
      this.log = this.log.concat(o.magenta, "[+] Data out len: " + n, o.resetColor, "\n"),
          this.log = this.log.concat(o.magenta, "[+] Data out:\n", M(a, n), o.resetColor, "\n"),
      t.hash.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
          this.log = this.log.concat(o.green, "[*] EXIT ", e, o.resetColor, "\n"), L(this.log, t.hash.filter);
    }
  }), function() {
    let a = {}, l = Module.findExportByName("libSystem.B.dylib", e + "_Init");
    if (null == l) return void console.error(e + "_Init func is null");
    Interceptor.attach(l, {
      onEnter: function(t) {
        let n = {
          ctx: t[0],
          dataMap: [],
          totalLen: 0,
          originalLen: 0,
          log: ""
        };
        a[S(t[0])] = n, n.log = n.log.concat(o.green, "[*] ENTER " + e + "_Init\n", o.resetColor);
      }
    });
    let r = Module.findExportByName("libSystem.B.dylib", e + "_Update");
    if (null == r) return void console.error(e + "_Update func is null");
    Interceptor.attach(r, {
      onEnter: function(o) {
        let e = a[S(o[0])];
        if (null == e) return void console.error("model is null");
        let n = S(o[2]), l = t.hash.maxInputDataLength - e.totalLen;
        if (n > 0 && l > 0) {
          e.originalLen += n;
          let t = Math.min(n, l), a = Memory.alloc(t);
          Memory.copy(a, o[1], t), e.dataMap.push({
            data: a,
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
      onLeave: function (l) {
        let r = a[S(this.ctxSha)];
        if (null == r) return void console.error(e + "_Final model is null");
        if (r.totalLen <= 0) return void console.error("totalLen :", r.totalLen);
        let i = Memory.alloc(r.totalLen);
        var c = 0;
        r.dataMap.forEach((function(t) {
          Memory.copy(i.add(c), t.data, t.len), c += t.len;
        })), r.log = r.log.concat("[+] Data len: " + r.totalLen + "/" + r.originalLen + "\n"),
            r.log = r.log.concat("[+] Data :\n"), r.log = r.log.concat(M(i, r.totalLen), "\n"),
            0 !== S(this.mdSha) ? (r.log = r.log.concat(o.magenta, "[+] Data out len: " + n + "\n"),
                r.log = r.log.concat("[+] Data out:\n"), r.log = r.log.concat(M(ptr(this.mdSha), n), "\n", o.resetColor)) : r.log = r.log.concat(o.red, "[!]: Data out: null\n", o.resetColor),
        t.hash.printStack && (r.log = r.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
            r.log = r.log.concat(o.green, "[*] EXIT " + e + "_Final\n", o.resetColor), L(r.log, t.hash.filter);
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

  let n = "CCHmac", a = Module.findExportByName("libSystem.B.dylib", n);
  null != a ? (Interceptor.attach(a, {
    onEnter: function (a) {
      if (this.enable = e(a[0].toInt32()), !this.enable) return;
      this.mdLen = f[a[0].toInt32()], this.log = "", this.log = this.log.concat(o.green, "[*] ENTER ", n, "\n"),
          this.log = this.log.concat(o.yellow, "[+] Algorithm: ", y[a[0].toInt32()], "\n", o.resetColor),
          this.log = this.log.concat(o.cyan, "[+] Key len: ", a[2].toInt32(), "\n"), this.log = this.log.concat(o.cyan, "[+] Key : \n", M(a[1], a[2].toInt32()), "\n", o.resetColor);
      let l = a[4].toInt32(), r = Math.min(l, t.hmac.maxInputDataLength);
      this.log = this.log.concat("[+] Data len: ", r, "/", l, "\n"), this.log = this.log.concat("[+] Data: \n", M(a[3], r), "\n"),
          this.macOut = a[5];
    },
    onLeave: function(e) {
      this.enable && (this.log = this.log.concat(o.magenta, "[+] Data out len: " + this.mdLen, o.resetColor, "\n"),
          this.log = this.log.concat(o.magenta, "[+] Data out:\n", M(this.macOut, this.mdLen), o.resetColor, "\n"),
      t.hmac.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
          this.log = this.log.concat(o.green, "[*] EXIT ", n, o.resetColor, "\n"), L(this.log, t.hmac.filter));
    }
  }), function() {
    let a = {}, l = Module.findExportByName("libSystem.B.dylib", n + "Init");
    if (null == l) return void console.error(n + "Init func is null");
    Interceptor.attach(l, {
      onEnter: function(t) {
        let l = {
          ctx: t[0],
          dataMap: [],
          totalLen: 0,
          originalLen: 0,
          log: "",
          mdLen: f[t[1].toInt32()],
          enable: e(t[1].toInt32())
        };
        a[S(t[0])] = l, l.enable && (l.log = l.log.concat(o.green, "[*] ENTER " + n + "Init\n", o.resetColor),
            l.log = l.log.concat(o.yellow, "[+] Algorithm: " + y[t[1].toInt32()] + "\n", o.resetColor),
            l.log = l.log.concat(o.cyan, "[+] Key len: " + t[3].toInt32() + o.resetColor + "\n"),
            l.log = l.log.concat(o.cyan, "[+] Key: \n" + M(t[2], S(t[3])) + "\n", o.resetColor));
      }
    });
    let r = Module.findExportByName("libSystem.B.dylib", n + "Update");
    if (null == r) return void console.error(n + "Update func is null");
    Interceptor.attach(r, {
      onEnter: function(o) {
        let e = a[S(o[0])];
        if (null == e) return void console.error(n + "Update model is null");
        if (!e.enable) return;
        let l = S(o[2]), r = t.hmac.maxInputDataLength - e.totalLen;
        if (l > 0 && r > 0) {
          e.originalLen += l;
          let t = Math.min(l, r), n = Memory.alloc(t);
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
        let l = a[S(this.ctx)];
        if (null == l) return void console.error(n + "Final model is null");
        if (!l.enable) return;
        if (l.totalLen <= 0) return void console.error("totalLen :", l.totalLen);
        let r = Memory.alloc(l.totalLen);
        var i = 0;
        l.dataMap.forEach((function (t) {
          Memory.copy(r.add(i), t.data, t.len), i += t.len;
        })), l.log = l.log.concat("[+] Data len: " + l.totalLen + "/" + l.originalLen + "\n"),
            l.log = l.log.concat("[+] Data :\n"), l.log = l.log.concat(M(r, l.totalLen), "\n"),
            l.log = l.log.concat(o.magenta, "[+] Data out len: " + l.mdLen + "\n"), l.log = l.log.concat("[+] Data out:\n"),
            l.log = l.log.concat(M(ptr(this.mdOut), l.mdLen), "\n", o.resetColor), t.hmac.printStack && (l.log = l.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
            l.log = l.log.concat(o.green, "[*] EXIT " + n + "Final\n", o.resetColor), L(l.log, t.hmac.filter);
      }
    }) : console.error(n + "Final func is null");
  }()) : console.error(n + " func is null");
}

function B() {
  let e = Module.findExportByName("libSystem.B.dylib", "CCKeyDerivationPBKDF");
  if (null == e) return void console.error("CCKeyDerivationPBKDF func is null");
  Interceptor.attach(e, {
    onEnter: function(t) {
      this.params = [];
      for (let o = 0; o < 9; o++) this.params.push(t[o]);
    },
    onLeave: function(e) {
      var n = "";
      n = (n = (n = (n = (n = (n = (n = (n = (n = (n = n.concat(o.green, "[*] ENTER CCKeyDerivationPBKDF", o.resetColor, "\n")).concat(o.yellow, "[+] Algorithm: ", k[this.params[0].toInt32()], "\n", o.resetColor)).concat(o.yellow, "[+] PseudoRandomAlgorithm: ", b[this.params[5].toInt32()], "\n", o.resetColor)).concat(o.cyan, "[+] Rounds: ", String(S(this.params[6])), "\n", o.resetColor)).concat(o.cyan, "[+] Password len: ", this.params[2].toInt32(), "\n")).concat(o.cyan, "[+] Password : \n", M(this.params[1], this.params[2].toInt32()), "\n", o.resetColor)).concat(o.cyan, "[+] Salt len: ", this.params[4].toInt32(), "\n")).concat(o.cyan, "[+] Salt : \n", M(this.params[3], this.params[4].toInt32()), "\n", o.resetColor)).concat(o.cyan, "[+] DerivedKey len: ", this.params[8].toInt32(), "\n")).concat(o.cyan, "[+] DerivedKey : \n", M(this.params[7], this.params[8].toInt32()), "\n", o.resetColor),
      t.pbkdf.printStack && (n = n.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
          L(n = n.concat(o.green, "[*] EXIT CCKeyDerivationPBKDF", o.resetColor, "\n"), t.pbkdf.filter);
    }
  });
  let n = Module.findExportByName("libSystem.B.dylib", "CCCalibratePBKDF");
  null != n ? Interceptor.attach(n, {
    onEnter: function(t) {
      this.log = "", this.log = this.log.concat(o.green, "[*] ENTER CCCalibratePBKDF", o.resetColor, "\n"),
          this.log = this.log.concat(o.yellow, "[+] Algorithm: ", k[t[0].toInt32()], "\n", o.resetColor),
          this.log = this.log.concat(o.yellow, "[+] PseudoRandomAlgorithm: ", b[t[3].toInt32()], "\n", o.resetColor),
      this.log = this.log.concat(o.cyan, "[+] Password len: ", t[1].toInt32(), o.resetColor, "\n"), 
      this.log = this.log.concat(o.cyan, "[+] Salt len: ", t[2].toInt32(), o.resetColor, "\n"), 
      this.log = this.log.concat(o.cyan, "[+] DerivedKey len: ", t[4].toInt32(), o.resetColor, "\n"),
          this.log = this.log.concat(o.cyan, "[+] Msec : ", S(t[5]), o.resetColor, "\n");
    },
    onLeave: function(e) {
      this.log = this.log.concat(o.cyan, "[+] IterNum : \n", S(e), o.resetColor, "\n"), 
      t.pbkdf.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
      this.log = this.log.concat(o.green, "[*] EXIT CCCalibratePBKDF", o.resetColor, "\n"),
          L(this.log, t.pbkdf.filter);
    }
  }) : console.error("CCCalibratePBKDF func is null");
}

t.enable && (t.crypto.enable && E(), t.hash.enable && (t.hash.sha1 && A("CC_SHA1", 20), 
t.hash.sha224 && A("CC_SHA224", 28), t.hash.sha256 && A("CC_SHA256", 32), t.hash.sha384 && A("CC_SHA384", 48), 
t.hash.sha512 && A("CC_SHA512", 64), t.hash.md2 && A("CC_MD2", 16), t.hash.md4 && A("CC_MD4", 16), 
t.hash.md5 && A("CC_MD5", 16), t.hmac.enable && D(), t.pbkdf.enable && B()));

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDd0JBLE1BQU0sSUFBYztFQUNoQixTQUFTO0VBQ1QsZUFBZTtFQUNmLFFBQVM7SUFDTCxTQUFTO0lBQ1QsZUFBZ0I7SUFDaEIsYUFBYTtJQUNiLE1BQU07SUFDTixNQUFNO0lBQ04sU0FBTztJQUNQLE9BQU87SUFDUCxNQUFNO0lBQ04sTUFBTTtJQUNOLFdBQVc7SUFDWCxRQUFTOztFQUViLE1BQU87SUFDSCxTQUFTO0lBQ1Qsb0JBQXFCO0lBQ3JCLGFBQWE7SUFDYixNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixPQUFPO0lBQ1AsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFFBQVM7O0VBRWIsTUFBTztJQUNILFNBQVM7SUFDVCxvQkFBcUI7SUFDckIsYUFBYTtJQUNiLE9BQU87SUFDUCxNQUFNO0lBQ04sU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFFBQVM7O0VBRWIsT0FBUTtJQUNKLFNBQVM7SUFDVCxhQUFhO0lBQ2IsUUFBUzs7R0FPWCxJQUFTO0VBQ1gsWUFBYyxFQUFjLGVBQWEsU0FBVTtFQUNuRCxNQUFRLEVBQWMsZUFBYSxTQUFVO0VBQzdDLEtBQU8sRUFBYyxlQUFhLFNBQVU7RUFDNUMsUUFBVSxFQUFjLGVBQWEsU0FBVTtFQUMvQyxXQUFhLEVBQWMsZUFBYSxTQUFVO0VBQ2xELE9BQVMsRUFBYyxlQUFhLFNBQVU7RUFDOUMsU0FBVyxFQUFjLGVBQWEsU0FBVTtFQUNoRCxRQUFVLEVBQWMsZUFBYSxTQUFVO0VBQy9DLE9BQVMsRUFBYyxlQUFhLFVBQVc7RUFDL0MsS0FBTyxFQUFjLGVBQWEsVUFBVztFQUM3QyxPQUFTLEVBQWMsZUFBYSxVQUFXO0VBQy9DLFFBQVUsRUFBYyxlQUFhLFVBQVc7RUFDaEQsTUFBUSxFQUFjLGVB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QjtFQUM1QyxRQUFsQixJQUlILFlBQVksT0FBTyxHQUFpQjtJQUNoQyxTQUFRLFNBQVU7TUFDZCxLQUFLLE1BQUksSUFDVCxLQUFLLE1BQUksS0FBSyxJQUFJLE9BQU8sRUFBTyxPQUFNLDhCQUE2QixFQUFPLFlBQVc7TUFDckYsS0FBSyxNQUFJLEtBQUssSUFBSSxPQUFPLEVBQU8sUUFBTyxtQkFBa0IsRUFBaUIsRUFBSyxHQUFHLFlBQVcsTUFBSyxFQUFPO01BQ3pHLEtBQUssTUFBSSxLQUFLLElBQUksT0FBTyxFQUFPLFFBQU8sK0JBQThCLEVBQXdCLEVBQUssR0FBRyxZQUFXLE1BQUssRUFBTztNQUM1SCxLQUFLLE1BQUksS0FBSyxJQUFJLE9BQU8sRUFBTyxNQUFLLHNCQUFxQixFQUFLLEdBQUcsV0FBVSxFQUFPLFlBQVc7TUFDOUYsS0FBSyxNQUFJLEtBQUssSUFBSSxPQUFPLEVBQU8sTUFBSyxrQkFBaUIsRUFBSyxHQUFHLFdBQVUsRUFBTyxZQUFXO01BQzFGLEtBQUssTUFBSSxLQUFLLElBQUksT0FBTyxFQUFPLE1BQUssd0JBQXVCLEVBQUssR0FBRyxXQUFVLEVBQU8sWUFBVztNQUNoRyxLQUFLLE1BQUksS0FBSyxJQUFJLE9BQU8sRUFBTyxNQUFLLGVBQWMsRUFBYSxFQUFLLEtBQUksRUFBTyxZQUFXO0FBQy9GO0lBQ0EsU0FBUSxTQUFVO01BQ2QsS0FBSyxNQUFJLEtBQUssSUFBSSxPQUFPLEVBQU8sTUFBSyxvQkFBbUIsRUFBYSxJQUFPLEVBQU8sWUFBVztNQUMzRixFQUFjLE1BQU0sZUFDbkIsS0FBSyxNQUFJLEtBQUssSUFBSSxPQUFPLEVBQU8sTUFBSyxnQkFBZSxPQUFPLFVBQVUsS0FBSyxTQUFTLFdBQVcsVUFBVSxJQUFJLFlBQVksYUFBYSxLQUFLLE9BQU0sRUFBTyxZQUFXO01BRXRLLEtBQUssTUFBSSxLQUFLLElBQUksT0FBTyxFQUFPLE9BQU0sNkJBQTRCLEVBQU8sWUFBVztNQUNwRixFQUFVLEtBQUssS0FBSSxFQUFjLE1BQU07QUFDM0M7T0FyQkEsUUFBUSxNQUFNO0FBdUJ0Qjs7QUFJUSxFQUFjLFdBR2YsRUFBYyxPQUFPLFVBQ3BCLEtBRUQsRUFBYyxLQUFLLFdBQ2YsRUFBYyxLQUFLLFFBRWxCLEVBQXNCLFdBQVU7QUFFakMsRUFBYyxLQUFLLFVBRWxCLEVBQXNCLGFBQVksS0FFbkMsRUFBYyxLQUFLLFVBRWxCLEVBQXNCLGFBQVksS0FFbkMsRUFBYyxLQUFLLFVBRWxCLEVBQXNCLGFBQVk7QUFFbkMsRUFBYyxLQUFLLFVBRWxCLEVBQXNCLGFBQVksS0FFbkMsRUFBYyxLQUFLLE9BRWxCLEVBQXNCLFVBQVMsS0FFaEMsRUFBYyxLQUFLLE9BRWxCLEVBQXNCLFVBQVM7QUFFaEMsRUFBYyxLQUFLLE9BRWxCLEVBQXNCLFVBQVMsS0FFaEMsRUFBYyxLQUFLLFVBQ2xCLEtBRUQsRUFBYyxNQUFNLFVBQ25CIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIifQ==
