/*************************************************************************************
 * Name: frida-ios-cipher
 * OS: iOS
 * Author: @jitcor
 * Source: https://github.com/jitcor/frida-ios-cipher
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
}, n = 16, e = 16, a = 16, l = 20, r = 28, i = 32, c = 48, s = 64, h = {
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
    return o instanceof Error && console.warn("print_arg error:", o.stack), t + "\n";
  }
}

    function S(t) {
  try {
    return null == t ? 0 : parseInt(t.toString());
  } catch (t) {
    return t instanceof Error && console.warn("pointerToInt error:", t.stack), 0;
  }
}

    function L(t, o) {
  if (null == o || 0 == o.length) console.log(t); else {
    var n = !1;
    for (let e of o) if (null != e && 0 != e.length && (n = !0, t.indexOf(e) >= 0)) return void console.log(t);
    n || console.log(t);
  }
}

function I(t) {
  var o = "";
  const n = t.split("\n");
  for (const t of n) {
    const n = t.split("");
    n.length <= 58 ? n.splice(n.length, 0, "\n") : (n.splice(n.length, 0, "|\n"), n.splice(59, 0, "|")),
        n.splice(0, 2), o += n.join("");
  }
  return o;
}

function E() {
  function n(o) {
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

  let e = Module.findExportByName("libSystem.B.dylib", "CCCrypt");
  if (null == e) return void console.warn("CCCrypt func is null");
  Interceptor.attach(e, {
    onEnter: function (e) {
      if (this.enable = n(e[1].toInt32()), !this.enable) return;
      this.log = "", this.log = this.log.concat(o.green, "[*] ENTER CCCrypt", o.resetColor),
          this.log = this.log.concat(o.yellow, "[+] CCOperation: " + h[e[0].toInt32()], o.resetColor, "\n"),
          this.log = this.log.concat(o.yellow, "[+] CCAlgorithm: " + C[e[1].toInt32()], o.resetColor, "\n"),
          this.log = this.log.concat(o.yellow, "[+] CCOptions: " + g[e[2].toInt32()], o.resetColor, "\n"),
          this.log = this.log.concat(o.yellow, "[+] KeySize: " + p[e[4].toInt32()], o.resetColor, "\n"),
          this.log = this.log.concat(o.cyan, "[+] Key: \n" + M(e[3], e[4].toInt32()), o.resetColor, "\n"),
          this.log = this.log.concat(o.cyan, "[+] IV: \n" + M(e[5], 16), o.resetColor, "\n");
      let a = S(e[7]), l = Math.min(a, t.crypto.maxDataLength);
      this.log = this.log.concat("[+] Data len: ", l, "/", a, "\n"), this.log = this.log.concat("[+] Data : \n", "\n"),
          this.log = this.log.concat(M(e[6], l)), this.dataOut = e[8], this.dataOutLength = e[10];
    },
    onLeave: function (n) {
      if (!this.enable) return;
      let e = S(this.dataOutLength.readPointer()), a = Math.min(e, t.crypto.maxDataLength);
      this.log = this.log.concat(o.magenta, "[+] Data out len: ", a, "/", e, "\n"), this.log = this.log.concat("[+] Data out: \n", M(this.dataOut, a), "\n", o.resetColor), 
      t.crypto.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
          this.log = this.log.concat(o.green, "[*] EXIT CCCrypt", o.resetColor, "\n"), L(this.log, t.crypto.filter);
    }
  });
  let a = {}, l = Module.findExportByName("libSystem.B.dylib", "CCCryptorCreate");
  if (null == l) return void console.warn("CCCryptorCreate func is null ");
  Interceptor.attach(l, {
    onEnter: function(t) {
      this.params = [];
      for (let o = 0; o < 7; o++) this.params.push(t[o]);
    },
    onLeave: function(t) {
      let e = {
        enable: n(this.params[1]),
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
      a[S(e.cRef)] = e, e.enable && (e.log = e.log.concat(o.green, "[*] ENTER CCCryptorCreate", o.resetColor, "\n"),
          e.log = e.log.concat(o.yellow, "[+] CCOperation: ", e.CCOperation = h[this.params[0].toInt32()], o.resetColor, "\n"),
          e.log = e.log.concat(o.yellow, "[+] CCAlgorithm: " + C[this.params[1].toInt32()], o.resetColor, "\n"),
          e.log = e.log.concat(o.cyan, "[+] Key len: ", e.CCKeySize = p[this.params[4].toInt32()], o.resetColor, "\n"),
          e.log = e.log.concat(o.cyan, "[+] Key: \n", e.Key = M(this.params[3], S(this.params[4])), o.resetColor, "\n"),
          0 != S(this.params[5]) ? e.log = e.log.concat(o.cyan, "[+] Iv:\n", e.Iv = M(this.params[5], 16), o.resetColor, "\n") : e.log = e.log.concat(o.red, "[!] Iv: null", "\n", o.resetColor));
    }
  });
  let r = Module.findExportByName("libSystem.B.dylib", "CCCryptorCreateWithMode");
  if (null == r) return void console.warn("CCCryptorCreateWithMode func is null ");
  Interceptor.attach(r, {
    onEnter: function(t) {
      this.params = [];
      for (let o = 0; o < 12; o++) this.params.push(t[o]);
    },
    onLeave: function(t) {
      let e = {
        enable: n(this.params[2]),
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
        e.cRef = this.params[11].readPointer();
      } catch (t) {
        return void console.log("Error: read CCCryptorRef failed:", t);
      }
      if (a[S(e.cRef)] = e, !e.enable) return;
      e.log = e.log.concat(o.green, "[*] ENTER CCCryptorCreateWithMode", o.resetColor, "\n"),
          e.log = e.log.concat(o.yellow, "[+] CCOperation: ", e.CCOperation = h[this.params[0].toInt32()], o.resetColor, "\n"),
          e.log = e.log.concat(o.yellow, "[+] CCMode: ", e.CCMode = u[this.params[1].toInt32()], o.resetColor, "\n"),
          e.log = e.log.concat(o.yellow, "[+] CCAlgorithm: ", e.CCAlgorithm = C[this.params[2].toInt32()], o.resetColor, "\n"),
          e.log = e.log.concat(o.yellow, "[+] CCPadding: ", e.CCPadding = m[this.params[3].toInt32()], o.resetColor, "\n"),
          e.log = e.log.concat(o.yellow, "[+] CCModeOptions: ", e.CCModeOptions = d[this.params[10].toInt32()], o.resetColor, "\n");
      let l = this.params[8].toInt32();
      l > 0 && 0 != S(this.params[7]) && (e.log = e.log.concat(o.cyan, "[+] tweak len: ", e.TweakLen = l, o.resetColor, "\n"),
          e.log = e.log.concat(o.cyan, "[+] tweak: \n", e.Tweak = M(this.params[7], S(this.params[8])), o.resetColor, "\n")),
          e.log = e.log.concat(o.cyan, "[+] numRounds: ", e.NumRounds = this.params[9].toInt32(), o.resetColor, "\n"),
          e.log = e.log.concat(o.cyan, "[+] Key len: ", e.CCKeySize = p[this.params[6].toInt32()], o.resetColor, "\n"),
          e.log = e.log.concat(o.cyan, "[+] Key: \n", e.Key = M(this.params[5], S(this.params[6])), o.resetColor, "\n"),
          0 != S(this.params[4]) ? e.log = e.log.concat(o.cyan, "[+] Iv:\n", e.Iv = M(this.params[4], 16), o.resetColor, "\n") : e.log = e.log.concat(o.red, "[!] Iv: null", "\n", o.resetColor);
    }
  });
  let i = Module.findExportByName("libSystem.B.dylib", "CCCryptorUpdate");
  if (null == i) return void console.warn("CCCryptorUpdate func is null");
  Interceptor.attach(i, {
    onEnter: function(t) {
      this.params = [];
      for (let o = 0; o < 6; o++) this.params.push(t[o]);
    },
    onLeave: function (n) {
      let e = a[S(this.params[0])];
      if (null == e) {
        e = {
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
        }, e.log = e.log.concat(o.green, "[*] ENTER CCCryptorUpdate (note: Cannot be associated with an existing CCCryptorRef, so the data encryption parameters are unknown, However, a list of encryption instances that are currently still being processed can be provided here.)", o.resetColor, "\n"),
            e.log = e.log.concat(o.blue, "[=] The list is as follows:", o.resetColor, "\n");
        for (let t in a) {
          let n = a[t];
          null == n || n.finish || (e.log = e.log.concat(o.cyan, "[+] CCCryptorRef: ", n.cRef + "(pointer)", " dump:\n", o.resetColor, "\n"),
              e.log = e.log.concat(o.yellow, "[+] : CCAlgorithm: ", n.CCAlgorithm, o.resetColor, "\n"),
              e.log = e.log.concat(o.yellow, "[+] : CCOperation: ", n.CCOperation, o.resetColor, "\n"),
              e.log = e.log.concat(o.yellow, "[+] : CCMode: ", n.CCMode, o.resetColor, "\n"),
              e.log = e.log.concat(o.yellow, "[+] : CCKeySize: ", n.CCKeySize, o.resetColor, "\n"),
              e.log = e.log.concat(o.yellow, "[+] : CCModeOptions: ", n.CCModeOptions, o.resetColor, "\n"),
              e.log = e.log.concat(o.yellow, "[+] : CCPadding: ", n.CCPadding, o.resetColor, "\n"),
              e.log = e.log.concat(o.yellow, "[+] : Key: ", n.Key, o.resetColor, "\n"), e.log = e.log.concat(o.yellow, "[+] : Iv: ", n.Iv, o.resetColor, "\n"),
          parseInt(n.TweakLen) > 0 && (e.log = e.log.concat(o.yellow, "[+] : TweakLen: ", n.TweakLen, o.resetColor, "\n"),
              e.log = e.log.concat(o.yellow, "[+] : Tweak: ", n.Tweak, o.resetColor, "\n")), e.log = e.log.concat(o.yellow, "[+] : NumRounds: ", n.NumRounds, o.resetColor, "\n"));
        }
        e.log = e.log.concat(o.blue, "[=] End of list", o.resetColor, "\n"), a[S(this.params[0])] = e;
      }
      if (!e.enable) return;
      e.originalLen += this.params[2].toInt32();
      let l = t.crypto.maxDataLength - e.totalLen, r = S(this.params[2]);
      if (r > 0 && l > 0) {
        let t = Math.min(r, l), o = Memory.alloc(t);
        Memory.copy(o, this.params[1], t), e.dataMap.push({
          data: o,
          len: t
        }), e.totalLen += t;
      }
      let i = t.crypto.maxDataLength - e.totalOutLen, c = S(this.params[5].readPointer());
      if (e.originalOutLen += c, c > 0 && i > 0) {
        let t = Math.min(c, i), o = Memory.alloc(t);
        Memory.copy(o, this.params[3], t), e.dataOutMap.push({
          data: o,
          len: t
        }), e.totalOutLen += t;
      }
    }
  });
  let c = Module.findExportByName("libSystem.B.dylib", "CCCryptorFinal");
  null != c ? Interceptor.attach(c, {
    onEnter: function(t) {
      this.params = [];
      for (let o = 0; o < 4; o++) this.params.push(t[o]);
    },
    onLeave: function (n) {
      let e = a[S(this.params[0])];
      if (null == e) return void console.warn("CCCryptorFinal model is null");
      if (!e.enable) return;
      if (e.totalOutLen < t.crypto.maxDataLength) {
        let o = t.crypto.maxDataLength - e.totalOutLen, n = S(this.params[3].readPointer());
        if (e.originalOutLen += n, n > 0 && o > 0) {
          let t = Math.min(n, o), a = Memory.alloc(t);
          Memory.copy(a, this.params[1], t), e.dataOutMap.push({
            data: a,
            len: t
          }), e.totalOutLen += t;
        }
      }
      let l = Memory.alloc(e.totalLen);
      var r = 0;
      e.dataMap.forEach((function (t) {
        Memory.copy(l.add(r), t.data, t.len), r += t.len;
      }));
      let i = Memory.alloc(e.totalOutLen);
      var c = 0;
      e.dataOutMap.forEach((function (t) {
        Memory.copy(i.add(c), t.data, t.len), c += t.len;
      })), e.log = e.log.concat("[+] Data len: " + e.totalLen + "/" + e.originalLen + "\n"),
          e.log = e.log.concat("[+] Data : \n", M(l, e.totalLen), "\n"), e.log = e.log.concat(o.magenta, "[+] Data out len: " + e.totalOutLen + "/" + e.originalOutLen + "\n"),
          e.log = e.log.concat("[+] Data out: \n", M(i, e.totalOutLen), "\n", o.resetColor),
      t.crypto.printStack && (e.log = e.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
          e.log = e.log.concat(o.green, "[*] EXIT CCCryptorFinal ", o.resetColor, "\n"), e.finish = !0,
          L(e.log, t.crypto.filter);
    }
  }) : console.warn("CCCryptorFinal func is null");
}

    function w(n, e) {
      let a = Module.findExportByName("libSystem.B.dylib", n);
  null != a ? (Interceptor.attach(a, {
    onEnter: function (e) {
      this.log = "", this.log = this.log.concat(o.green, "[*] ENTER ", n, o.resetColor, "\n");
      let a = e[1].toInt32(), l = Math.min(a, t.hash.maxInputDataLength);
      this.log = this.log.concat("[+] Data len: ", l, "/", a, "\n"), this.log = this.log.concat("[+] Data: \n", M(e[0], l), "\n");
    },
    onLeave: function (a) {
      this.log = this.log.concat(o.magenta, "[+] Data out len: " + e, o.resetColor, "\n"),
          this.log = this.log.concat(o.magenta, "[+] Data out:\n", M(a, e), o.resetColor, "\n"),
      t.hash.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
          this.log = this.log.concat(o.green, "[*] EXIT ", n, o.resetColor, "\n"), L(this.log, t.hash.filter);
    }
  }), function() {
    let a = {}, l = Module.findExportByName("libSystem.B.dylib", n + "_Init");
    if (null == l) return void console.warn(n + "_Init func is null");
    Interceptor.attach(l, {
      onEnter: function(t) {
        let e = {
          ctx: t[0],
          dataMap: [],
          totalLen: 0,
          originalLen: 0,
          log: ""
        };
        a[S(t[0])] = e, e.log = e.log.concat(o.green, "[*] ENTER " + n + "_Init\n", o.resetColor);
      }
    });
    let r = Module.findExportByName("libSystem.B.dylib", n + "_Update");
    if (null == r) return void console.warn(n + "_Update func is null");
    Interceptor.attach(r, {
      onEnter: function(o) {
        let n = a[S(o[0])];
        if (null == n) return void console.warn("model is null");
        let e = S(o[2]), l = t.hash.maxInputDataLength - n.totalLen;
        if (e > 0 && l > 0) {
          n.originalLen += e;
          let t = Math.min(e, l), a = Memory.alloc(t);
          Memory.copy(a, o[1], t), n.dataMap.push({
            data: a,
            len: t
          }), n.totalLen += t;
        }
      }
    });
    let i = Module.findExportByName("libSystem.B.dylib", n + "_Final");
    null != i ? Interceptor.attach(i, {
      onEnter: function(t) {
        this.mdSha = t[0], this.ctxSha = t[1];
      },
      onLeave: function (l) {
        let r = a[S(this.ctxSha)];
        if (null == r) return void console.warn(n + "_Final model is null");
        if (r.totalLen <= 0) return void console.warn("totalLen :", r.totalLen);
        let i = Memory.alloc(r.totalLen);
        var c = 0;
        r.dataMap.forEach((function(t) {
          Memory.copy(i.add(c), t.data, t.len), c += t.len;
        })), r.log = r.log.concat("[+] Data len: " + r.totalLen + "/" + r.originalLen + "\n"),
            r.log = r.log.concat("[+] Data :\n"), r.log = r.log.concat(M(i, r.totalLen), "\n"),
            0 !== S(this.mdSha) ? (r.log = r.log.concat(o.magenta, "[+] Data out len: " + e + "\n"),
                r.log = r.log.concat("[+] Data out:\n"), r.log = r.log.concat(M(ptr(this.mdSha), e), "\n", o.resetColor)) : r.log = r.log.concat(o.red, "[!]: Data out: null\n", o.resetColor),
        t.hash.printStack && (r.log = r.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
            r.log = r.log.concat(o.green, "[*] EXIT " + n + "_Final\n", o.resetColor), L(r.log, t.hash.filter);
      }
    }) : console.warn(n + "_Final func is null");
  }()) : console.warn(n + " func is null");
}

    function A() {
      function n(o) {
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

      let e = "CCHmac", a = Module.findExportByName("libSystem.B.dylib", e);
  null != a ? (Interceptor.attach(a, {
    onEnter: function (a) {
      if (this.enable = n(a[0].toInt32()), !this.enable) return;
      this.mdLen = f[a[0].toInt32()], this.log = "", this.log = this.log.concat(o.green, "[*] ENTER ", e, "\n"),
          this.log = this.log.concat(o.yellow, "[+] Algorithm: ", y[a[0].toInt32()], "\n", o.resetColor),
          this.log = this.log.concat(o.cyan, "[+] Key len: ", a[2].toInt32(), "\n"), this.log = this.log.concat(o.cyan, "[+] Key : \n", M(a[1], a[2].toInt32()), "\n", o.resetColor);
      let l = a[4].toInt32(), r = Math.min(l, t.hmac.maxInputDataLength);
      this.log = this.log.concat("[+] Data len: ", r, "/", l, "\n"), this.log = this.log.concat("[+] Data: \n", M(a[3], r), "\n"),
          this.macOut = a[5];
    },
    onLeave: function (n) {
      this.enable && (this.log = this.log.concat(o.magenta, "[+] Data out len: " + this.mdLen, o.resetColor, "\n"),
          this.log = this.log.concat(o.magenta, "[+] Data out:\n", M(this.macOut, this.mdLen), o.resetColor, "\n"),
      t.hmac.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
          this.log = this.log.concat(o.green, "[*] EXIT ", e, o.resetColor, "\n"), L(this.log, t.hmac.filter));
    }
  }), function() {
    let a = {}, l = Module.findExportByName("libSystem.B.dylib", e + "Init");
    if (null == l) return void console.warn(e + "Init func is null");
    Interceptor.attach(l, {
      onEnter: function(t) {
        let l = {
          ctx: t[0],
          dataMap: [],
          totalLen: 0,
          originalLen: 0,
          log: "",
          mdLen: f[t[1].toInt32()],
          enable: n(t[1].toInt32())
        };
        a[S(t[0])] = l, l.enable && (l.log = l.log.concat(o.green, "[*] ENTER " + e + "Init\n", o.resetColor),
            l.log = l.log.concat(o.yellow, "[+] Algorithm: " + y[t[1].toInt32()] + "\n", o.resetColor),
            l.log = l.log.concat(o.cyan, "[+] Key len: " + t[3].toInt32() + o.resetColor + "\n"),
            l.log = l.log.concat(o.cyan, "[+] Key: \n" + M(t[2], S(t[3])) + "\n", o.resetColor));
      }
    });
    let r = Module.findExportByName("libSystem.B.dylib", e + "Update");
    if (null == r) return void console.warn(e + "Update func is null");
    Interceptor.attach(r, {
      onEnter: function(o) {
        let n = a[S(o[0])];
        if (null == n) return void console.warn(e + "Update model is null");
        if (!n.enable) return;
        let l = S(o[2]), r = t.hmac.maxInputDataLength - n.totalLen;
        if (l > 0 && r > 0) {
          n.originalLen += l;
          let t = Math.min(l, r), e = Memory.alloc(t);
          Memory.copy(e, o[1], t), n.dataMap.push({
            data: e,
            len: t
          }), n.totalLen += t;
        }
      }
    });
    let i = Module.findExportByName("libSystem.B.dylib", e + "Final");
    null != i ? Interceptor.attach(i, {
      onEnter: function(t) {
        this.mdOut = t[1], this.ctx = t[0];
      },
      onLeave: function (n) {
        let l = a[S(this.ctx)];
        if (null == l) return void console.warn(e + "Final model is null");
        if (!l.enable) return;
        if (l.totalLen <= 0) return void console.warn("totalLen :", l.totalLen);
        let r = Memory.alloc(l.totalLen);
        var i = 0;
        l.dataMap.forEach((function (t) {
          Memory.copy(r.add(i), t.data, t.len), i += t.len;
        })), l.log = l.log.concat("[+] Data len: " + l.totalLen + "/" + l.originalLen + "\n"),
            l.log = l.log.concat("[+] Data :\n"), l.log = l.log.concat(M(r, l.totalLen), "\n"),
            l.log = l.log.concat(o.magenta, "[+] Data out len: " + l.mdLen + "\n"), l.log = l.log.concat("[+] Data out:\n"),
            l.log = l.log.concat(M(ptr(this.mdOut), l.mdLen), "\n", o.resetColor), t.hmac.printStack && (l.log = l.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
            l.log = l.log.concat(o.green, "[*] EXIT " + e + "Final\n", o.resetColor), L(l.log, t.hmac.filter);
      }
    }) : console.warn(e + "Final func is null");
  }()) : console.warn(e + " func is null");
}

    function D() {
      let n = Module.findExportByName("libSystem.B.dylib", "CCKeyDerivationPBKDF");
      if (null == n) return void console.warn("CCKeyDerivationPBKDF func is null");
      Interceptor.attach(n, {
    onEnter: function(t) {
      this.params = [];
      for (let o = 0; o < 9; o++) this.params.push(t[o]);
    },
        onLeave: function (n) {
          var e = "";
          e = (e = (e = (e = (e = (e = (e = (e = (e = (e = e.concat(o.green, "[*] ENTER CCKeyDerivationPBKDF", o.resetColor, "\n")).concat(o.yellow, "[+] Algorithm: ", k[this.params[0].toInt32()], "\n", o.resetColor)).concat(o.yellow, "[+] PseudoRandomAlgorithm: ", b[this.params[5].toInt32()], "\n", o.resetColor)).concat(o.cyan, "[+] Rounds: ", String(S(this.params[6])), "\n", o.resetColor)).concat(o.cyan, "[+] Password len: ", this.params[2].toInt32(), "\n")).concat(o.cyan, "[+] Password : \n", M(this.params[1], this.params[2].toInt32()), "\n", o.resetColor)).concat(o.cyan, "[+] Salt len: ", this.params[4].toInt32(), "\n")).concat(o.cyan, "[+] Salt : \n", M(this.params[3], this.params[4].toInt32()), "\n", o.resetColor)).concat(o.cyan, "[+] DerivedKey len: ", this.params[8].toInt32(), "\n")).concat(o.cyan, "[+] DerivedKey : \n", M(this.params[7], this.params[8].toInt32()), "\n", o.resetColor),
          t.pbkdf.printStack && (e = e.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
              L(e = e.concat(o.green, "[*] EXIT CCKeyDerivationPBKDF", o.resetColor, "\n"), t.pbkdf.filter);
    }
  });
      let e = Module.findExportByName("libSystem.B.dylib", "CCCalibratePBKDF");
      null != e ? Interceptor.attach(e, {
    onEnter: function(t) {
      this.log = "", this.log = this.log.concat(o.green, "[*] ENTER CCCalibratePBKDF", o.resetColor, "\n"),
          this.log = this.log.concat(o.yellow, "[+] Algorithm: ", k[t[0].toInt32()], "\n", o.resetColor),
          this.log = this.log.concat(o.yellow, "[+] PseudoRandomAlgorithm: ", b[t[3].toInt32()], "\n", o.resetColor),
      this.log = this.log.concat(o.cyan, "[+] Password len: ", t[1].toInt32(), o.resetColor, "\n"), 
      this.log = this.log.concat(o.cyan, "[+] Salt len: ", t[2].toInt32(), o.resetColor, "\n"),
          this.log = this.log.concat(o.cyan, "[+] DerivedKey len: ", t[4].toInt32(), o.resetColor, "\n"),
          this.log = this.log.concat(o.cyan, "[+] Msec : ", S(t[5]), o.resetColor, "\n");
    },
        onLeave: function (n) {
          this.log = this.log.concat(o.cyan, "[+] IterNum : \n", S(n), o.resetColor, "\n"),
      t.pbkdf.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
              this.log = this.log.concat(o.green, "[*] EXIT CCCalibratePBKDF", o.resetColor, "\n"),
              L(this.log, t.pbkdf.filter);
    }
      }) : console.warn("CCCalibratePBKDF func is null");
}

    t.enable && (t.crypto.enable && E(), t.hash.enable && (t.hash.sha1 && w("CC_SHA1", 20),
    t.hash.sha224 && w("CC_SHA224", 28), t.hash.sha256 && w("CC_SHA256", 32), t.hash.sha384 && w("CC_SHA384", 48),
    t.hash.sha512 && w("CC_SHA512", 64), t.hash.md2 && w("CC_MD2", 16), t.hash.md4 && w("CC_MD4", 16),
    t.hash.md5 && w("CC_MD5", 16), t.hmac.enable && A(), t.pbkdf.enable && D()));

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDd0JBLE1BQU0sSUFBYztFQUNoQixTQUFTO0VBQ1QsZUFBZTtFQUNmLFFBQVM7SUFDTCxTQUFTO0lBQ1QsZUFBZ0I7SUFDaEIsYUFBYTtJQUNiLE1BQU07SUFDTixNQUFNO0lBQ04sU0FBTztJQUNQLE9BQU87SUFDUCxNQUFNO0lBQ04sTUFBTTtJQUNOLFdBQVc7SUFDWCxRQUFTOztFQUViLE1BQU87SUFDSCxTQUFTO0lBQ1Qsb0JBQXFCO0lBQ3JCLGFBQWE7SUFDYixNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixPQUFPO0lBQ1AsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFFBQVM7O0VBRWIsTUFBTztJQUNILFNBQVM7SUFDVCxvQkFBcUI7SUFDckIsYUFBYTtJQUNiLE9BQU87SUFDUCxNQUFNO0lBQ04sU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFFBQVM7O0VBRWIsT0FBUTtJQUNKLFNBQVM7SUFDVCxhQUFhO0lBQ2IsUUFBUzs7R0FPWCxJQUFTO0VBQ1gsWUFBYyxFQUFjLGVBQWEsU0FBVTtFQUNuRCxNQUFRLEVBQWMsZUFBYSxTQUFVO0VBQzdDLEtBQU8sRUFBYyxlQUFhLFNBQVU7RUFDNUMsUUFBVSxFQUFjLGVBQWEsU0FBVTtFQUMvQyxXQUFhLEVBQWMsZUFBYSxTQUFVO0VBQ2xELE9BQVMsRUFBYyxlQUFhLFNBQVU7RUFDOUMsU0FBVyxFQUFjLGVBQWEsU0FBVTtFQUNoRCxRQUFVLEVBQWMsZUFBYSxTQUFVO0VBQy9DLE9BQVMsRUFBYyxlQUFhLFVBQVc7RUFDL0MsS0FBTyxFQUFjLGVBQWEsVUFBVztFQUM3QyxPQUFTLEVBQWMsZUFBYSxVQUFXO0VBQy9DLFFBQVUsRUFBYyxlQUFhLFVBQVc7RUFDaEQsTUFBUSxFQUFjLGVB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TTtBQUN2Qzs7RUFLSixJQUFJLElBQWlCLE9BQU8saUJBQWlCLHFCQUFvQjtFQUM1QyxRQUFsQixJQUlILFlBQVksT0FBTyxHQUFpQjtJQUNoQyxTQUFRLFNBQVU7TUFDZCxLQUFLLE1BQUksSUFDVCxLQUFLLE1BQUksS0FBSyxJQUFJLE9BQU8sRUFBTyxPQUFNLDhCQUE2QixFQUFPLFlBQVc7TUFDckYsS0FBSyxNQUFJLEtBQUssSUFBSSxPQUFPLEVBQU8sUUFBTyxtQkFBa0IsRUFBaUIsRUFBSyxHQUFHLFlBQVcsTUFBSyxFQUFPO01BQ3pHLEtBQUssTUFBSSxLQUFLLElBQUksT0FBTyxFQUFPLFFBQU8sK0JBQThCLEVBQXdCLEVBQUssR0FBRyxZQUFXLE1BQUssRUFBTztNQUM1SCxLQUFLLE1BQUksS0FBSyxJQUFJLE9BQU8sRUFBTyxNQUFLLHNCQUFxQixFQUFLLEdBQUcsV0FBVSxFQUFPLFlBQVc7TUFDOUYsS0FBSyxNQUFJLEtBQUssSUFBSSxPQUFPLEVBQU8sTUFBSyxrQkFBaUIsRUFBSyxHQUFHLFdBQVUsRUFBTyxZQUFXO01BQzFGLEtBQUssTUFBSSxLQUFLLElBQUksT0FBTyxFQUFPLE1BQUssd0JBQXVCLEVBQUssR0FBRyxXQUFVLEVBQU8sWUFBVztNQUNoRyxLQUFLLE1BQUksS0FBSyxJQUFJLE9BQU8sRUFBTyxNQUFLLGVBQWMsRUFBYSxFQUFLLEtBQUksRUFBTyxZQUFXO0FBQy9GO0lBQ0EsU0FBUSxTQUFVO01BQ2QsS0FBSyxNQUFJLEtBQUssSUFBSSxPQUFPLEVBQU8sTUFBSyxvQkFBbUIsRUFBYSxJQUFPLEVBQU8sWUFBVztNQUMzRixFQUFjLE1BQU0sZUFDbkIsS0FBSyxNQUFJLEtBQUssSUFBSSxPQUFPLEVBQU8sTUFBSyxnQkFBZSxPQUFPLFVBQVUsS0FBSyxTQUFTLFdBQVcsVUFBVSxJQUFJLFlBQVksYUFBYSxLQUFLLE9BQU0sRUFBTyxZQUFXO01BRXRLLEtBQUssTUFBSSxLQUFLLElBQUksT0FBTyxFQUFPLE9BQU0sNkJBQTRCLEVBQU8sWUFBVztNQUNwRixFQUFVLEtBQUssS0FBSSxFQUFjLE1BQU07QUFDM0M7T0FyQkEsUUFBUSxLQUFLO0FBdUJyQjs7QUFJUSxFQUFjLFdBR2YsRUFBYyxPQUFPLFVBQ3BCLEtBRUQsRUFBYyxLQUFLLFdBQ2YsRUFBYyxLQUFLLFFBRWxCLEVBQXNCLFdBQVU7QUFFakMsRUFBYyxLQUFLLFVBRWxCLEVBQXNCLGFBQVksS0FFbkMsRUFBYyxLQUFLLFVBRWxCLEVBQXNCLGFBQVksS0FFbkMsRUFBYyxLQUFLLFVBRWxCLEVBQXNCLGFBQVk7QUFFbkMsRUFBYyxLQUFLLFVBRWxCLEVBQXNCLGFBQVksS0FFbkMsRUFBYyxLQUFLLE9BRWxCLEVBQXNCLFVBQVMsS0FFaEMsRUFBYyxLQUFLLE9BRWxCLEVBQXNCLFVBQVM7QUFFaEMsRUFBYyxLQUFLLE9BRWxCLEVBQXNCLFVBQVMsS0FFaEMsRUFBYyxLQUFLLFVBQ2xCLEtBRUQsRUFBYyxNQUFNLFVBQ25CIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIifQ==
