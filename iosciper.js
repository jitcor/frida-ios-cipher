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
  },
  keychain: {
    enable: !0,
    maxDataLength: 240,
    printStack: !1,
    realtimeIntercept: !0,
    filter: []
  }
}, e = {
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
}, o = 16, n = 16, a = 16, l = 20, r = 28, i = 32, c = 48, s = 64, h = {
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

    function S(t, e = 240, o = null) {
      var n = "";
  try {
    if (!t || 0 === t.toInt32() || t.isNull()) return "\n";
    n = "\n" + hexdump(t, {
      length: e
    }) + "\n";
  } catch (e) {
    e instanceof Error && console.warn("print_arg error:", e.stack), n = t + "\n";
  }
      return null != o && (n = n.split("\n").map((t => o + t)).join("\n")), n;
}

    function I(t) {
  try {
    return !t || 0 === t.toInt32() || t.isNull() ? 0 : parseInt(t.toString());
  } catch (t) {
    return t instanceof Error && console.warn("pointerToInt error:", t.stack), 0;
  }
}

    function E(t, e) {
      if (null == e || 0 == e.length) console.log(t); else {
        var o = !1;
        for (let n of e) if (null != n && 0 != n.length && (o = !0, t.indexOf(n) >= 0)) return void console.log(t);
        o || console.log(t);
      }
    }

    function O() {
      return 1 === Process.enumerateThreads().length;
}

    function A(t) {
      var e = "";
      const o = t.split("\n");
      for (const t of o) {
        const o = t.split("");
        o.length <= 58 ? o.splice(o.length, 0, "\n") : (o.splice(o.length, 0, "|\n"), o.splice(59, 0, "|")),
            o.splice(0, 2), e += o.join("");
  }
      return e;
}

    function M() {
      function o(e) {
        switch (e) {
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
      if (null == n) return void console.warn("CCCrypt func is null");
      Interceptor.attach(n, {
        onEnter: function (n) {
          if (this.enable = o(n[1].toInt32()), !this.enable) return;
          this.log = "", this.log = this.log.concat(e.green, "[*] ENTER CCCrypt", e.resetColor),
              this.log = this.log.concat(e.yellow, "[+] CCOperation: " + h[n[0].toInt32()], e.resetColor, "\n"),
              this.log = this.log.concat(e.yellow, "[+] CCAlgorithm: " + g[n[1].toInt32()], e.resetColor, "\n"),
              this.log = this.log.concat(e.yellow, "[+] CCOptions: " + C[n[2].toInt32()], e.resetColor, "\n"),
              this.log = this.log.concat(e.yellow, "[+] KeySize: " + p[n[4].toInt32()], e.resetColor, "\n"),
              this.log = this.log.concat(e.cyan, "[+] Key: \n" + S(n[3], n[4].toInt32()), e.resetColor, "\n"),
              this.log = this.log.concat(e.cyan, "[+] IV: \n" + S(n[5], 16), e.resetColor, "\n");
          let a = I(n[7]), l = Math.min(a, t.crypto.maxDataLength);
          this.log = this.log.concat("[+] Data len: ", l, "/", a, "\n"), this.log = this.log.concat("[+] Data : \n", "\n"),
              this.log = this.log.concat(S(n[6], l)), this.dataOut = n[8], this.dataOutLength = n[10];
    },
        onLeave: function (o) {
      if (!this.enable) return;
          let n = I(this.dataOutLength.readPointer()), a = Math.min(n, t.crypto.maxDataLength);
          this.log = this.log.concat(e.magenta, "[+] Data out len: ", a, "/", n, "\n"), this.log = this.log.concat("[+] Data out: \n", S(this.dataOut, a), "\n", e.resetColor),
          t.crypto.printStack && (this.log = this.log.concat(e.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), e.resetColor, "\n")),
              this.log = this.log.concat(e.green, "[*] EXIT CCCrypt", e.resetColor, "\n"), E(this.log, t.crypto.filter);
    }
  });
  let a = {}, l = Module.findExportByName("libSystem.B.dylib", "CCCryptorCreate");
  if (null == l) return void console.warn("CCCryptorCreate func is null ");
  Interceptor.attach(l, {
    onEnter: function(t) {
      this.params = [];
      for (let e = 0; e < 7; e++) this.params.push(t[e]);
    },
    onLeave: function(t) {
      let n = {
        enable: o(this.params[1]),
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
      a[I(n.cRef)] = n, n.enable && (n.log = n.log.concat(e.green, "[*] ENTER CCCryptorCreate", e.resetColor, "\n"),
          n.log = n.log.concat(e.yellow, "[+] CCOperation: ", n.CCOperation = h[this.params[0].toInt32()], e.resetColor, "\n"),
          n.log = n.log.concat(e.yellow, "[+] CCAlgorithm: " + g[this.params[1].toInt32()], e.resetColor, "\n"),
          n.log = n.log.concat(e.cyan, "[+] Key len: ", n.CCKeySize = p[this.params[4].toInt32()], e.resetColor, "\n"),
          n.log = n.log.concat(e.cyan, "[+] Key: \n", n.Key = S(this.params[3], I(this.params[4])), e.resetColor, "\n"),
          0 != I(this.params[5]) ? n.log = n.log.concat(e.cyan, "[+] Iv:\n", n.Iv = S(this.params[5], 16), e.resetColor, "\n") : n.log = n.log.concat(e.red, "[!] Iv: null", "\n", e.resetColor));
    }
  });
  let r = Module.findExportByName("libSystem.B.dylib", "CCCryptorCreateWithMode");
  if (null == r) return void console.warn("CCCryptorCreateWithMode func is null ");
  Interceptor.attach(r, {
    onEnter: function(t) {
      this.params = [];
      for (let e = 0; e < 12; e++) this.params.push(t[e]);
    },
    onLeave: function(t) {
      let n = {
        enable: o(this.params[2]),
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
      if (a[I(n.cRef)] = n, !n.enable) return;
      n.log = n.log.concat(e.green, "[*] ENTER CCCryptorCreateWithMode", e.resetColor, "\n"),
          n.log = n.log.concat(e.yellow, "[+] CCOperation: ", n.CCOperation = h[this.params[0].toInt32()], e.resetColor, "\n"),
          n.log = n.log.concat(e.yellow, "[+] CCMode: ", n.CCMode = u[this.params[1].toInt32()], e.resetColor, "\n"),
          n.log = n.log.concat(e.yellow, "[+] CCAlgorithm: ", n.CCAlgorithm = g[this.params[2].toInt32()], e.resetColor, "\n"),
          n.log = n.log.concat(e.yellow, "[+] CCPadding: ", n.CCPadding = d[this.params[3].toInt32()], e.resetColor, "\n"),
          n.log = n.log.concat(e.yellow, "[+] CCModeOptions: ", n.CCModeOptions = m[this.params[10].toInt32()], e.resetColor, "\n");
      let l = this.params[8].toInt32();
      l > 0 && 0 != I(this.params[7]) && (n.log = n.log.concat(e.cyan, "[+] tweak len: ", n.TweakLen = l, e.resetColor, "\n"),
          n.log = n.log.concat(e.cyan, "[+] tweak: \n", n.Tweak = S(this.params[7], I(this.params[8])), e.resetColor, "\n")),
          n.log = n.log.concat(e.cyan, "[+] numRounds: ", n.NumRounds = this.params[9].toInt32(), e.resetColor, "\n"),
          n.log = n.log.concat(e.cyan, "[+] Key len: ", n.CCKeySize = p[this.params[6].toInt32()], e.resetColor, "\n"),
          n.log = n.log.concat(e.cyan, "[+] Key: \n", n.Key = S(this.params[5], I(this.params[6])), e.resetColor, "\n"),
          0 != I(this.params[4]) ? n.log = n.log.concat(e.cyan, "[+] Iv:\n", n.Iv = S(this.params[4], 16), e.resetColor, "\n") : n.log = n.log.concat(e.red, "[!] Iv: null", "\n", e.resetColor);
    }
  });
  let i = Module.findExportByName("libSystem.B.dylib", "CCCryptorUpdate");
  if (null == i) return void console.warn("CCCryptorUpdate func is null");
  Interceptor.attach(i, {
    onEnter: function(t) {
      this.params = [];
      for (let e = 0; e < 6; e++) this.params.push(t[e]);
    },
    onLeave: function (o) {
      let n = a[I(this.params[0])];
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
        }, n.log = n.log.concat(e.green, "[*] ENTER CCCryptorUpdate (note: Cannot be associated with an existing CCCryptorRef, so the data encryption parameters are unknown, However, a list of encryption instances that are currently still being processed can be provided here.)", e.resetColor, "\n"),
            n.log = n.log.concat(e.blue, "[=] The list is as follows:", e.resetColor, "\n");
        for (let t in a) {
          let o = a[t];
          null == o || o.finish || (n.log = n.log.concat(e.cyan, "[+] CCCryptorRef: ", o.cRef + "(pointer)", " dump:\n", e.resetColor, "\n"),
              n.log = n.log.concat(e.yellow, "[+] : CCAlgorithm: ", o.CCAlgorithm, e.resetColor, "\n"),
              n.log = n.log.concat(e.yellow, "[+] : CCOperation: ", o.CCOperation, e.resetColor, "\n"),
              n.log = n.log.concat(e.yellow, "[+] : CCMode: ", o.CCMode, e.resetColor, "\n"),
              n.log = n.log.concat(e.yellow, "[+] : CCKeySize: ", o.CCKeySize, e.resetColor, "\n"),
              n.log = n.log.concat(e.yellow, "[+] : CCModeOptions: ", o.CCModeOptions, e.resetColor, "\n"),
              n.log = n.log.concat(e.yellow, "[+] : CCPadding: ", o.CCPadding, e.resetColor, "\n"),
              n.log = n.log.concat(e.yellow, "[+] : Key: ", o.Key, e.resetColor, "\n"), n.log = n.log.concat(e.yellow, "[+] : Iv: ", o.Iv, e.resetColor, "\n"),
          parseInt(o.TweakLen) > 0 && (n.log = n.log.concat(e.yellow, "[+] : TweakLen: ", o.TweakLen, e.resetColor, "\n"),
              n.log = n.log.concat(e.yellow, "[+] : Tweak: ", o.Tweak, e.resetColor, "\n")), n.log = n.log.concat(e.yellow, "[+] : NumRounds: ", o.NumRounds, e.resetColor, "\n"));
        }
        n.log = n.log.concat(e.blue, "[=] End of list", e.resetColor, "\n"), a[I(this.params[0])] = n;
      }
      if (!n.enable) return;
      n.originalLen += this.params[2].toInt32();
      let l = t.crypto.maxDataLength - n.totalLen, r = I(this.params[2]);
      if (r > 0 && l > 0) {
        let t = Math.min(r, l), e = Memory.alloc(t);
        Memory.copy(e, this.params[1], t), n.dataMap.push({
          data: e,
          len: t
        }), n.totalLen += t;
      }
      let i = t.crypto.maxDataLength - n.totalOutLen, c = I(this.params[5].readPointer());
      if (n.originalOutLen += c, c > 0 && i > 0) {
        let t = Math.min(c, i), e = Memory.alloc(t);
        Memory.copy(e, this.params[3], t), n.dataOutMap.push({
          data: e,
          len: t
        }), n.totalOutLen += t;
      }
    }
  });
  let c = Module.findExportByName("libSystem.B.dylib", "CCCryptorFinal");
  null != c ? Interceptor.attach(c, {
    onEnter: function(t) {
      this.params = [];
      for (let e = 0; e < 4; e++) this.params.push(t[e]);
    },
    onLeave: function (o) {
      let n = a[I(this.params[0])];
      if (null == n) return void console.warn("CCCryptorFinal model is null");
      if (!n.enable) return;
      if (n.totalOutLen < t.crypto.maxDataLength) {
        let e = t.crypto.maxDataLength - n.totalOutLen, o = I(this.params[3].readPointer());
        if (n.originalOutLen += o, o > 0 && e > 0) {
          let t = Math.min(o, e), a = Memory.alloc(t);
          Memory.copy(a, this.params[1], t), n.dataOutMap.push({
            data: a,
            len: t
          }), n.totalOutLen += t;
        }
      }
      let l = Memory.alloc(n.totalLen);
      var r = 0;
      n.dataMap.forEach((function (t) {
        Memory.copy(l.add(r), t.data, t.len), r += t.len;
      }));
      let i = Memory.alloc(n.totalOutLen);
      var c = 0;
      n.dataOutMap.forEach((function (t) {
        Memory.copy(i.add(c), t.data, t.len), c += t.len;
      })), n.log = n.log.concat("[+] Data len: " + n.totalLen + "/" + n.originalLen + "\n"),
          n.log = n.log.concat("[+] Data : \n", S(l, n.totalLen), "\n"), n.log = n.log.concat(e.magenta, "[+] Data out len: " + n.totalOutLen + "/" + n.originalOutLen + "\n"),
          n.log = n.log.concat("[+] Data out: \n", S(i, n.totalOutLen), "\n", e.resetColor),
      t.crypto.printStack && (n.log = n.log.concat(e.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), e.resetColor, "\n")),
          n.log = n.log.concat(e.green, "[*] EXIT CCCryptorFinal ", e.resetColor, "\n"), n.finish = !0,
          E(n.log, t.crypto.filter);
    }
  }) : console.warn("CCCryptorFinal func is null");
}

    function L(o, n) {
      let a = Module.findExportByName("libSystem.B.dylib", o);
  null != a ? (Interceptor.attach(a, {
    onEnter: function (n) {
      this.log = "", this.log = this.log.concat(e.green, "[*] ENTER ", o, e.resetColor, "\n");
      let a = n[1].toInt32(), l = Math.min(a, t.hash.maxInputDataLength);
      this.log = this.log.concat("[+] Data len: ", l, "/", a, "\n"), this.log = this.log.concat("[+] Data: \n", S(n[0], l), "\n");
    },
    onLeave: function (a) {
      this.log = this.log.concat(e.magenta, "[+] Data out len: " + n, e.resetColor, "\n"),
          this.log = this.log.concat(e.magenta, "[+] Data out:\n", S(a, n), e.resetColor, "\n"),
      t.hash.printStack && (this.log = this.log.concat(e.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), e.resetColor, "\n")),
          this.log = this.log.concat(e.green, "[*] EXIT ", o, e.resetColor, "\n"), E(this.log, t.hash.filter);
    }
  }), function() {
    let a = {}, l = Module.findExportByName("libSystem.B.dylib", o + "_Init");
    if (null == l) return void console.warn(o + "_Init func is null");
    Interceptor.attach(l, {
      onEnter: function(t) {
        let n = {
          ctx: t[0],
          dataMap: [],
          totalLen: 0,
          originalLen: 0,
          log: ""
        };
        a[I(t[0])] = n, n.log = n.log.concat(e.green, "[*] ENTER " + o + "_Init\n", e.resetColor);
      }
    });
    let r = Module.findExportByName("libSystem.B.dylib", o + "_Update");
    if (null == r) return void console.warn(o + "_Update func is null");
    Interceptor.attach(r, {
      onEnter: function (e) {
        let o = a[I(e[0])];
        if (null == o) return void console.warn("model is null");
        let n = I(e[2]), l = t.hash.maxInputDataLength - o.totalLen;
        if (n > 0 && l > 0) {
          o.originalLen += n;
          let t = Math.min(n, l), a = Memory.alloc(t);
          Memory.copy(a, e[1], t), o.dataMap.push({
            data: a,
            len: t
          }), o.totalLen += t;
        }
      }
    });
    let i = Module.findExportByName("libSystem.B.dylib", o + "_Final");
    null != i ? Interceptor.attach(i, {
      onEnter: function(t) {
        this.mdSha = t[0], this.ctxSha = t[1];
      },
      onLeave: function (l) {
        let r = a[I(this.ctxSha)];
        if (null == r) return void console.warn(o + "_Final model is null");
        if (r.totalLen <= 0) return void console.warn("totalLen :", r.totalLen);
        let i = Memory.alloc(r.totalLen);
        var c = 0;
        r.dataMap.forEach((function(t) {
          Memory.copy(i.add(c), t.data, t.len), c += t.len;
        })), r.log = r.log.concat("[+] Data len: " + r.totalLen + "/" + r.originalLen + "\n"),
            r.log = r.log.concat("[+] Data :\n"), r.log = r.log.concat(S(i, r.totalLen), "\n"),
            0 !== I(this.mdSha) ? (r.log = r.log.concat(e.magenta, "[+] Data out len: " + n + "\n"),
                r.log = r.log.concat("[+] Data out:\n"), r.log = r.log.concat(S(ptr(this.mdSha), n), "\n", e.resetColor)) : r.log = r.log.concat(e.red, "[!]: Data out: null\n", e.resetColor),
        t.hash.printStack && (r.log = r.log.concat(e.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), e.resetColor, "\n")),
            r.log = r.log.concat(e.green, "[*] EXIT " + o + "_Final\n", e.resetColor), E(r.log, t.hash.filter);
      }
    }) : console.warn(o + "_Final func is null");
  }()) : console.warn(o + " func is null");
}

    function w() {
      function o(e) {
        switch (e) {
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
      if (this.enable = o(a[0].toInt32()), !this.enable) return;
      this.mdLen = f[a[0].toInt32()], this.log = "", this.log = this.log.concat(e.green, "[*] ENTER ", n, "\n"),
          this.log = this.log.concat(e.yellow, "[+] Algorithm: ", y[a[0].toInt32()], "\n", e.resetColor),
          this.log = this.log.concat(e.cyan, "[+] Key len: ", a[2].toInt32(), "\n"), this.log = this.log.concat(e.cyan, "[+] Key : \n", S(a[1], a[2].toInt32()), "\n", e.resetColor);
      let l = a[4].toInt32(), r = Math.min(l, t.hmac.maxInputDataLength);
      this.log = this.log.concat("[+] Data len: ", r, "/", l, "\n"), this.log = this.log.concat("[+] Data: \n", S(a[3], r), "\n"),
          this.macOut = a[5];
    },
    onLeave: function (o) {
      this.enable && (this.log = this.log.concat(e.magenta, "[+] Data out len: " + this.mdLen, e.resetColor, "\n"),
          this.log = this.log.concat(e.magenta, "[+] Data out:\n", S(this.macOut, this.mdLen), e.resetColor, "\n"),
      t.hmac.printStack && (this.log = this.log.concat(e.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), e.resetColor, "\n")),
          this.log = this.log.concat(e.green, "[*] EXIT ", n, e.resetColor, "\n"), E(this.log, t.hmac.filter));
    }
  }), function() {
    let a = {}, l = Module.findExportByName("libSystem.B.dylib", n + "Init");
    if (null == l) return void console.warn(n + "Init func is null");
    Interceptor.attach(l, {
      onEnter: function(t) {
        let l = {
          ctx: t[0],
          dataMap: [],
          totalLen: 0,
          originalLen: 0,
          log: "",
          mdLen: f[t[1].toInt32()],
          enable: o(t[1].toInt32())
        };
        a[I(t[0])] = l, l.enable && (l.log = l.log.concat(e.green, "[*] ENTER " + n + "Init\n", e.resetColor),
            l.log = l.log.concat(e.yellow, "[+] Algorithm: " + y[t[1].toInt32()] + "\n", e.resetColor),
            l.log = l.log.concat(e.cyan, "[+] Key len: " + t[3].toInt32() + e.resetColor + "\n"),
            l.log = l.log.concat(e.cyan, "[+] Key: \n" + S(t[2], I(t[3])) + "\n", e.resetColor));
      }
    });
    let r = Module.findExportByName("libSystem.B.dylib", n + "Update");
    if (null == r) return void console.warn(n + "Update func is null");
    Interceptor.attach(r, {
      onEnter: function (e) {
        let o = a[I(e[0])];
        if (null == o) return void console.warn(n + "Update model is null");
        if (!o.enable) return;
        let l = I(e[2]), r = t.hmac.maxInputDataLength - o.totalLen;
        if (l > 0 && r > 0) {
          o.originalLen += l;
          let t = Math.min(l, r), n = Memory.alloc(t);
          Memory.copy(n, e[1], t), o.dataMap.push({
            data: n,
            len: t
          }), o.totalLen += t;
        }
      }
    });
    let i = Module.findExportByName("libSystem.B.dylib", n + "Final");
    null != i ? Interceptor.attach(i, {
      onEnter: function(t) {
        this.mdOut = t[1], this.ctx = t[0];
      },
      onLeave: function (o) {
        let l = a[I(this.ctx)];
        if (null == l) return void console.warn(n + "Final model is null");
        if (!l.enable) return;
        if (l.totalLen <= 0) return void console.warn("totalLen :", l.totalLen);
        let r = Memory.alloc(l.totalLen);
        var i = 0;
        l.dataMap.forEach((function (t) {
          Memory.copy(r.add(i), t.data, t.len), i += t.len;
        })), l.log = l.log.concat("[+] Data len: " + l.totalLen + "/" + l.originalLen + "\n"),
            l.log = l.log.concat("[+] Data :\n"), l.log = l.log.concat(S(r, l.totalLen), "\n"),
            l.log = l.log.concat(e.magenta, "[+] Data out len: " + l.mdLen + "\n"), l.log = l.log.concat("[+] Data out:\n"),
            l.log = l.log.concat(S(ptr(this.mdOut), l.mdLen), "\n", e.resetColor), t.hmac.printStack && (l.log = l.log.concat(e.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), e.resetColor, "\n")),
            l.log = l.log.concat(e.green, "[*] EXIT " + n + "Final\n", e.resetColor), E(l.log, t.hmac.filter);
      }
    }) : console.warn(n + "Final func is null");
  }()) : console.warn(n + " func is null");
}

    function D() {
      let o = Module.findExportByName("libSystem.B.dylib", "CCKeyDerivationPBKDF");
      if (null == o) return void console.warn("CCKeyDerivationPBKDF func is null");
      Interceptor.attach(o, {
    onEnter: function(t) {
      this.params = [];
      for (let e = 0; e < 9; e++) this.params.push(t[e]);
    },
        onLeave: function (o) {
          var n = "";
          n = (n = (n = (n = (n = (n = (n = (n = (n = (n = n.concat(e.green, "[*] ENTER CCKeyDerivationPBKDF", e.resetColor, "\n")).concat(e.yellow, "[+] Algorithm: ", k[this.params[0].toInt32()], "\n", e.resetColor)).concat(e.yellow, "[+] PseudoRandomAlgorithm: ", b[this.params[5].toInt32()], "\n", e.resetColor)).concat(e.cyan, "[+] Rounds: ", String(I(this.params[6])), "\n", e.resetColor)).concat(e.cyan, "[+] Password len: ", this.params[2].toInt32(), "\n")).concat(e.cyan, "[+] Password : \n", S(this.params[1], this.params[2].toInt32()), "\n", e.resetColor)).concat(e.cyan, "[+] Salt len: ", this.params[4].toInt32(), "\n")).concat(e.cyan, "[+] Salt : \n", S(this.params[3], this.params[4].toInt32()), "\n", e.resetColor)).concat(e.cyan, "[+] DerivedKey len: ", this.params[8].toInt32(), "\n")).concat(e.cyan, "[+] DerivedKey : \n", S(this.params[7], this.params[8].toInt32()), "\n", e.resetColor),
          t.pbkdf.printStack && (n = n.concat(e.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), e.resetColor, "\n")),
              E(n = n.concat(e.green, "[*] EXIT CCKeyDerivationPBKDF", e.resetColor, "\n"), t.pbkdf.filter);
    }
  });
      let n = Module.findExportByName("libSystem.B.dylib", "CCCalibratePBKDF");
      null != n ? Interceptor.attach(n, {
    onEnter: function(t) {
      this.log = "", this.log = this.log.concat(e.green, "[*] ENTER CCCalibratePBKDF", e.resetColor, "\n"),
          this.log = this.log.concat(e.yellow, "[+] Algorithm: ", k[t[0].toInt32()], "\n", e.resetColor),
          this.log = this.log.concat(e.yellow, "[+] PseudoRandomAlgorithm: ", b[t[3].toInt32()], "\n", e.resetColor),
          this.log = this.log.concat(e.cyan, "[+] Password len: ", t[1].toInt32(), e.resetColor, "\n"),
          this.log = this.log.concat(e.cyan, "[+] Salt len: ", t[2].toInt32(), e.resetColor, "\n"),
          this.log = this.log.concat(e.cyan, "[+] DerivedKey len: ", t[4].toInt32(), e.resetColor, "\n"),
          this.log = this.log.concat(e.cyan, "[+] Msec : ", I(t[5]), e.resetColor, "\n");
    },
        onLeave: function (o) {
          this.log = this.log.concat(e.cyan, "[+] IterNum : \n", I(o), e.resetColor, "\n"),
          t.pbkdf.printStack && (this.log = this.log.concat(e.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), e.resetColor, "\n")),
              this.log = this.log.concat(e.green, "[*] EXIT CCCalibratePBKDF", e.resetColor, "\n"),
              E(this.log, t.pbkdf.filter);
    }
      }) : console.warn("CCCalibratePBKDF func is null");
}

    function v() {
      var o = ptr("0x0000000ffffffff8"), n = ptr("0x000003f000000001"), a = ptr("0x000001a000000001");

      function l(t) {
        var e = function (t) {
          if (!r(t)) return NULL;
          var e = t.readPointer(), l = e;
          l.and(n).equals(a) && (l = e.and(o));
          if (r(l)) return l;
          return NULL;
        }(t);
        return !e.isNull();
      }

      function r(t) {
        try {
          return t.readU8(), !0;
        } catch (t) {
          return !1;
        }
      }

      function i(t, e, o, n) {
        var a = Module.findExportByName(null, e);
        if (null === a) return console.warn("[-] Cannot find export:", e), null;
        if ("f" === t) {
          var l = new NativeFunction(a, o, n);
          return l || (console.warn("[-] parse error for function:", e), null);
        }
        if ("d" === t) {
          var r = a.readPointer();
          return r || (console.warn("[-] parse error for data:", e), null);
        }
      }

      function c(o, n = "") {
        var a = "";
        if (!o || 0 === o.toInt32() || o.isNull() || !l(o)) return a;
        var r = new ObjC.Object(o);
        if (r.isKindOfClass_(ObjC.classes.NSArray)) {
          a = a.concat(n, e.green, "[*] ENTER dump NSArray", e.resetColor, "\n");
          for (var i = 0; i < r.count(); i++) {
            var s = r.objectAtIndex_(i);
            a = a.concat(n, "[+] object: \n", c(s.handle, "    " + n), "\n");
          }
          a = a.concat(n, e.green, "[*] EXIT dump NSArray", e.resetColor, "\n");
        } else if (r.isKindOfClass_(ObjC.classes.NSDictionary)) {
          a = a.concat(n, e.green, "[*] ENTER dump NSDictionary", e.resetColor, "\n");
          var h = r.allKeys();
          for (i = 0; i < h.count(); i++) {
            var g = h.objectAtIndex_(i), C = r.objectForKey_(g), u = g.toString();
            a = "NSConcreteData" === C.$className ? a.concat(n, "[+] ", u, ": \n", c(C.handle, "    " + n), "\n") : C.isKindOfClass_(ObjC.classes.NSArray) || C.isKindOfClass_(ObjC.classes.NSDictionary) || C.isKindOfClass_(ObjC.classes.NSData) ? 0 == u.indexOf("v_Data") ? a.concat(n, e.yellow, "[+] ", u, ": \n", c(C.handle, "    " + n), e.resetColor, "\n") : a.concat(n, "[+] ", u, ": \n", c(C.handle, "    " + n), "\n") : 0 == u.indexOf("acct") || 0 == u.indexOf("svce") || 0 == u.indexOf("agrp") ? a.concat(n, e.cyan, "[+] ", `${u}: ${C}`, e.resetColor, "\n") : a.concat(n, "[+] ", `${u}: ${C}`, "\n");
          }
          a = a.concat(n, e.green, "[*] EXIT dump NSDictionary", e.resetColor, "\n");
        } else if (r.isKindOfClass_(ObjC.classes.NSData)) if (!r || r.isNull() || 0 == r.length()) a = (a = a.concat(n, "[-] NSData.Len: 0", "\n")).concat(n, "[-] NSData: null", "\n"); else {
          var d = r.length(), m = r.bytes();
          let e = Math.min(t.keychain.maxDataLength, d);
          a = (a = a.concat(n, "[+] NSData.Len: ", String(e), "/", d, "", "\n")).concat(n, "[+] NSData: \n", S(m, e, n), "\n");
        } else a = a.concat(n, "[-] ", r.$className, ": \n", r.toString(), "\n");
        return a;
      }

      function s() {
        var o = ObjC.classes.NSMutableDictionary, n = new ObjC.Object(i("d", "kCFBooleanTrue")),
            a = new ObjC.Object(i("d", "kSecReturnAttributes")), l = new ObjC.Object(i("d", "kSecReturnData")),
            r = new ObjC.Object(i("d", "kSecReturnRef")), s = ObjC.Object(i("d", "kSecMatchLimitAll")),
            h = ObjC.Object(i("d", "kSecMatchLimit")), g = ObjC.Object(i("d", "kSecClassGenericPassword")),
            C = ObjC.Object(i("d", "kSecClassInternetPassword")), u = ObjC.Object(i("d", "kSecClassCertificate")),
            d = ObjC.Object(i("d", "kSecClassKey")), m = ObjC.Object(i("d", "kSecClassIdentity")),
            p = ObjC.Object(i("d", "kSecClass")), y = (ObjC.Object(i("d", "kSecAttrAccessibleAfterFirstUnlock")),
                ObjC.Object(i("d", "kSecAttrAccessibleWhenUnlocked")), ObjC.Object(i("d", "kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly")),
                ObjC.Object(i("d", "kSecAttrAccessibleAlwaysThisDeviceOnly")), ObjC.Object(i("d", "kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly")),
                ObjC.Object(i("d", "kSecAttrAccessibleWhenUnlockedThisDeviceOnly")), ObjC.Object(i("d", "kSecAttrAccessibleAlways")),
                i("f", "SecItemCopyMatching", "int", ["pointer", "pointer"])), f = [g, C, u, d, m], b = o.alloc().init(),
            k = "";
        k = k.concat(e.green, "[*] ENTER dump keychain", e.resetColor, "\n");
        var S = "";
        f.forEach((function (t) {
          S = "    ", k = k.concat(S, e.green, "[*] ENTER dump item", e.resetColor, "\n"),
              b.removeAllObjects(), b.setObject_forKey_(n, a), b.setObject_forKey_(n, l), b.setObject_forKey_(n, r),
              b.setObject_forKey_(s, h), b.setObject_forKey_(t, p);
          var o = Memory.alloc(Process.pointerSize);
          o.writePointer(NULL);
          var i = y(b.handle, o);
          if (k = k.concat(S, e.resetColor, "[+] status: ", i, e.resetColor, "\n"), 0 === i) {
            var g = o.readPointer();
            k = k.concat(S, e.resetColor, "[+] object: \n", c(g, "   " + S), e.resetColor, "\n");
          } else k = k.concat(S, e.resetColor, "[-] object: null", e.resetColor, "\n");
          k = k.concat(S, e.green, "[*] EXIT dump item", e.resetColor, "\n");
        })), E(k = k.concat(e.green, "\n[*] EXIT dump keychain", e.resetColor, "\n"), t.keychain.filter);
      }

      if (O()) {
        let t = setInterval((function () {
          clearInterval(t), s();
        }), 5e3);
      } else s();
      t.keychain.realtimeIntercept && function () {
        var o = Module.findExportByName(null, "SecItemAdd");
        o && Interceptor.attach(o, {
          onEnter: function (t) {
            this.log = "", this.log = this.log.concat(e.green, "[*] ENTER SecItemAdd", e.resetColor, "\n"),
                this.attrsPtr = t[0], this.resultPtr = t[1], this.log = this.log.concat("[+] attrs: \n", c(this.attrsPtr, "    "), "\n");
          },
          onLeave: function (o) {
            this.log = this.log.concat("[+] status: ", o.toInt32(), "\n"), 0 !== this.resultPtr.toInt32() && l(this.resultPtr.readPointer()) ? this.log = this.log.concat("[+] result: \n", c(this.resultPtr, "    "), "\n") : this.log = this.log.concat("[-] result: null", "\n"),
            t.keychain.printStack && (this.log = this.log.concat(e.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), e.resetColor, "\n")),
                this.log = this.log.concat(e.green, "[*] EXIT SecItemAdd", e.resetColor, "\n"),
                E(this.log, t.keychain.filter);
          }
        });
        var n = Module.findExportByName(null, "SecItemCopyMatching");
        n && Interceptor.attach(n, {
          onEnter: function (t) {
            this.log = "", this.log = this.log.concat(e.green, "[*] ENTER SecItemCopyMatching", e.resetColor, "\n"),
                this.queryPtr = t[0], this.resultPtr = t[1], this.log = this.log.concat("[+] query: \n", c(this.queryPtr, "    "), "\n");
          },
          onLeave: function (o) {
            let n = o.toInt32();
            if (this.log = this.log.concat("[+] status: ", n, "\n"), 0 !== this.resultPtr.toInt32()) {
              let t = this.resultPtr.readPointer();
              l(t) ? this.log = this.log.concat("[+] result: \n", c(t, "    "), "\n") : this.log = this.log.concat("[-] result: null", "\n");
            } else this.log = this.log.concat("[-] result: null", "\n");
            t.keychain.printStack && (this.log = this.log.concat(e.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), e.resetColor, "\n")),
                this.log = this.log.concat(e.green, "[*] EXIT SecItemCopyMatching", e.resetColor, "\n"),
                E(this.log, t.keychain.filter);
          }
        });
        var a = Module.findExportByName(null, "SecItemUpdate");
        a && Interceptor.attach(a, {
          onEnter: function (t) {
            this.log = "", this.log = this.log.concat(e.green, "[*] ENTER SecItemUpdate", e.resetColor, "\n"),
                this.queryPtr = t[0], this.attrsPtr = t[1], this.log = this.log.concat("[+] query: \n", c(this.queryPtr, "    "), "\n"),
                this.log = this.log.concat("[+] attributesToUpdate: \n", c(this.attrsPtr, "    "), "\n");
          },
          onLeave: function (o) {
            let n = o.toInt32();
            this.log = this.log.concat("[+] status: ", n, "\n"), t.keychain.printStack && (this.log = this.log.concat(e.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), e.resetColor, "\n")),
                this.log = this.log.concat(e.green, "[*] EXIT SecItemUpdate", e.resetColor, "\n"),
                E(this.log, t.keychain.filter);
          }
        });
        var r = Module.findExportByName(null, "SecItemDelete");
        r && Interceptor.attach(r, {
          onEnter: function (t) {
            this.log = "", this.log = this.log.concat(e.green, "[*] ENTER SecItemDelete", e.resetColor, "\n"),
                this.queryPtr = t[0], this.log = this.log.concat("[+] query: \n", c(this.queryPtr, "    "), "\n");
          },
          onLeave: function (o) {
            this.log = this.log.concat("[+] status: ", o.toInt32(), "\n"), t.keychain.printStack && (this.log = this.log.concat(e.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), e.resetColor, "\n")),
                this.log = this.log.concat(e.green, "[*] EXIT SecItemDelete", e.resetColor, "\n"),
                E(this.log, t.keychain.filter);
          }
        });
      }();
    }

    ObjC.available ? t.enable && (t.crypto.enable && M(), t.hash.enable && (t.hash.sha1 && L("CC_SHA1", 20),
    t.hash.sha224 && L("CC_SHA224", 28), t.hash.sha256 && L("CC_SHA256", 32), t.hash.sha384 && L("CC_SHA384", 48),
    t.hash.sha512 && L("CC_SHA512", 64), t.hash.md2 && L("CC_MD2", 16), t.hash.md4 && L("CC_MD4", 16),
    t.hash.md5 && L("CC_MD5", 16)), t.hmac.enable && w(), t.pbkdf.enable && D(), t.keychain.enable && v()) : console.log("Only supports iOS!!");

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDd0JBLE1BQU0sSUFBYztFQUNoQixTQUFTO0VBQ1QsZUFBZTtFQUNmLFFBQVM7SUFDTCxTQUFTO0lBQ1QsZUFBZ0I7SUFDaEIsYUFBYTtJQUNiLE1BQU07SUFDTixNQUFNO0lBQ04sU0FBTztJQUNQLE9BQU87SUFDUCxNQUFNO0lBQ04sTUFBTTtJQUNOLFdBQVc7SUFDWCxRQUFTOztFQUViLE1BQU87SUFDSCxTQUFTO0lBQ1Qsb0JBQXFCO0lBQ3JCLGFBQWE7SUFDYixNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixPQUFPO0lBQ1AsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFFBQVM7O0VBRWIsTUFBTztJQUNILFNBQVM7SUFDVCxvQkFBcUI7SUFDckIsYUFBYTtJQUNiLE9BQU87SUFDUCxNQUFNO0lBQ04sU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFFBQVM7O0VBRWIsT0FBUTtJQUNKLFNBQVM7SUFDVCxhQUFhO0lBQ2IsUUFBUzs7RUFFYixVQUFXO0lBQ1AsU0FBUztJQUNULGVBQWdCO0lBQ2hCLGFBQWE7SUFDYixvQkFBb0I7SUFDcEIsUUFBUzs7R0FPWCxJQUFTO0VBQ1gsWUFBYyxFQUFjLGVBQWEsU0FBVTtFQUNuRCxNQUFRLEVBQWMsZUFBYSxTQUFVO0VBQzdDLEtBQU8sRUFBYyxlQUFhLFNBQVU7RUFDNUMsUUFBVSxFQUFjLGVBQWEsU0FBVTtFQUMvQyxXQUFhLEVBQWMsZUFBYSxTQUFVO0VBQ2xELE9BQVMsRUFBYyxlQUFhLFNBQVU7RUFDOUMsU0FBVyxFQUFjLGVBQWEsU0FBVTtFQUNoRCxRQUFVLEVBQWMsZUFBYSxTQUFVO0VBQy9DLE9BQVMsRUFBYyxlQUFhLFVBQVc7RUFDL0MsS0FBTyxFQUFjLGVBQWEsVUFBVztFQUM3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
