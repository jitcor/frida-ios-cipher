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
  }
}, o = {
  resetColor: "[0m",
  green: "[32m",
  yellow: "[33m",
  red: "[31m"
}, n = 16, e = 16, a = 16, l = 20, r = 28, i = 32, c = 48, s = 64, h = {
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
  0: l,
  1: a,
  2: i,
  3: c,
  4: s,
  5: r
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

function k(t) {
  try {
    return null == t ? 0 : parseInt(t.toString());
  } catch (t) {
    return t instanceof Error && console.error("pointerToInt error:", t.stack), 0;
  }
}

function M() {
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
  if (null == e) return void console.error("CCCrypt func is null");
  Interceptor.attach(e, {
    onEnter: function(e) {
      if (this.enable = n(e[1].toInt32()), !this.enable) return;
      this.log = "", this.log = this.log.concat(o.green, "[*] ENTER CCCrypt", o.resetColor), 
      this.log = this.log.concat(Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), "\n"), 
      this.log = this.log.concat(o.yellow, "[+] CCOperation: " + h[e[0].toInt32()], o.resetColor, "\n"), 
      this.log = this.log.concat(o.yellow, "[+] CCAlgorithm: " + g[e[1].toInt32()], o.resetColor, "\n"), 
      this.log = this.log.concat("[+] CCOptions: " + C[e[2].toInt32()], "\n"), this.log = this.log.concat("[+] KeySize: " + y[e[4].toInt32()], "\n"), 
      this.log = this.log.concat("[+] Key: \n" + L(e[3], e[4].toInt32()), "\n"), this.log = this.log.concat("[+] IV: \n" + L(e[5], 16), "\n");
      let a = k(e[7]), l = Math.min(a, t.crypto.maxDataLength);
      this.log = this.log.concat("[+] Data len: ", l, "/", a, "\n"), this.log = this.log.concat("[+] Data : \n", "\n"), 
      this.log = this.log.concat(L(e[6], l)), this.dataOut = e[8], this.dataOutLength = e[10];
    },
    onLeave: function(o) {
      if (!this.enable) return;
      let n = k(this.dataOutLength.readPointer()), e = Math.min(n, t.crypto.maxDataLength);
      this.log = this.log.concat("[+] Data out len: ", e, "/", n, "\n"), this.log = this.log.concat("[+] Data out: \n", L(this.dataOut, e), "\n"), 
      t.crypto.printStack && (this.log = this.log.concat("[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), "\n")), 
      this.log = this.log.concat("[*] EXIT CCCrypt", "\n");
    }
  });
  let a = {}, l = Module.findExportByName("libSystem.B.dylib", "CCCryptorCreate");
  if (null == l) return void console.error("CCCryptorCreate func is null ");
  Interceptor.attach(l, {
    onEnter: function(t) {
      this.cRefPtr = t[6], this.operation = t[0], this.algorithm = t[1], this.options = t[2], 
      this.key = t[3], this.keyLen = t[4], this.iv = t[5];
    },
    onLeave: function(t) {
      let e = {
        enable: n(this.algorithm),
        cRef: this.cRefPtr.readPointer(),
        dataMap: [],
        dataOutMap: [],
        totalLen: 0,
        totalOutLen: 0,
        originalLen: 0,
        originalOutLen: 0,
        log: ""
      };
      a[k(e.cRef)] = e, e.enable && (e.log = e.log.concat("[*] ENTER CCCryptorCreate", "\n"), 
      e.log = e.log.concat("[+] CCOperation: " + h[this.operation.toInt32()], "\n"), e.log = e.log.concat("[+] CCAlgorithm: " + g[this.algorithm.toInt32()], "\n"), 
      e.log = e.log.concat("[+] CCOptions: " + C[this.options.toInt32()], "\n"), e.log = e.log.concat("[+] Key len: " + y[this.keyLen.toInt32()], "\n"), 
      e.log = e.log.concat("[+] Key: \n" + L(this.key, k(this.keyLen)), "\n"), 0 != k(this.iv) ? e.log = e.log.concat("[+] Iv:\n" + L(this.iv, 16), "\n") : e.log = e.log.concat(o.red, "[!] Iv: null", "\n", o.resetColor));
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
      let e = {
        enable: n(this.algorithm),
        cRef: this.cRefPtr.readPointer(),
        dataMap: [],
        dataOutMap: [],
        totalLen: 0,
        totalOutLen: 0,
        originalLen: 0,
        originalOutLen: 0,
        log: ""
      };
      if (a[k(e.cRef)] = e, !e.enable) return;
      e.log = e.log.concat("[*] ENTER CCCryptorCreateWithMode", "\n"), e.log = e.log.concat("[+] CCOperation: " + h[this.operation.toInt32()], "\n"), 
      e.log = e.log.concat("[+] CCMode: " + u[this.mode.toInt32()], "\n"), e.log = e.log.concat("[+] CCAlgorithm: " + g[this.algorithm.toInt32()], "\n"), 
      e.log = e.log.concat("[+] CCPadding: " + d[this.padding.toInt32()], "\n"), e.log = e.log.concat("[+] CCModeOptions: " + m[this.options.toInt32()], "\n");
      let l = this.tweakLen.toInt32();
      l > 0 && 0 != k(this.tweak) && (e.log = e.log.concat("[+] tweak len: " + l, "\n"), 
      e.log = e.log.concat("[+] tweak: \n" + L(this.tweak, k(this.tweakLen)), "\n")), 
      e.log = e.log.concat("[+] numRounds: " + this.numRounds.toInt32(), "\n"), e.log = e.log.concat("[+] Key len: " + y[this.keyLen.toInt32()], "\n"), 
      e.log = e.log.concat("[+] Key: \n" + L(this.key, k(this.keyLen)), "\n"), 0 != k(this.iv) ? e.log = e.log.concat("[+] Iv:\n" + L(this.iv, 16), "\n") : e.log = e.log.concat(o.red, "[!] Iv: null", "\n", o.resetColor);
    }
  });
  let i = Module.findExportByName("libSystem.B.dylib", "CCCryptorUpdate");
  if (null == i) return void console.error("CCCryptorUpdate func is null");
  Interceptor.attach(i, {
    onEnter: function(t) {
      this.outLen = t[5], this.out = t[3], this.cRef = t[0], this.dataLen = t[2], this.data = t[1];
    },
    onLeave: function(o) {
      let n = a[k(this.cRef)];
      if (null == n) return void console.error("CCCryptorUpdate model is null");
      if (!n.enable) return;
      n.originalLen += this.dataLen, n.originalOutLen += this.outLen;
      let e = t.crypto.maxDataLength - n.totalLen, l = k(this.dataLen);
      if (l > 0 && e > 0) {
        let t = Math.min(l, e), o = Memory.alloc(t);
        Memory.copy(o, this.data, t), n.dataMap.push({
          data: o,
          len: t
        }), n.totalLen += t;
      }
      let r = t.crypto.maxDataLength - n.totalOutLen, i = k(this.outLen.readPointer());
      if (i > 0 && r > 0) {
        let t = Math.min(i, r), o = Memory.alloc(t);
        Memory.copy(o, this.out, t), n.dataOutMap.push({
          data: o,
          len: t
        }), n.totalOutLen += t;
      }
    }
  });
  let c = Module.findExportByName("libSystem.B.dylib", "CCCryptorFinal");
  null != c ? Interceptor.attach(c, {
    onEnter: function(t) {
      this.cRef = t[0], this.dataOut = t[1], this.dataOutLen = t[3];
    },
    onLeave: function(o) {
      let n = a[k(this.cRef)];
      if (null == n) return void console.error("CCCryptorFinal model is null");
      if (!n.enable) return;
      if (n.originalOutLen += this.dataOutLen, n.totalOutLen < t.crypto.maxDataLength) {
        let o = t.crypto.maxDataLength - n.totalOutLen, e = k(this.dataOutLen.readPointer());
        if (e > 0 && o > 0) {
          let t = Math.min(e, o), a = Memory.alloc(t);
          Memory.copy(a, this.dataOut, t), n.dataOutMap.push({
            data: a,
            len: t
          }), n.totalOutLen += t;
        }
      }
      let e = Memory.alloc(n.totalLen);
      var l = 0;
      n.dataMap.forEach((function(t) {
        Memory.copy(e.add(l), t.data, t.len), l += t.len;
      }));
      let r = Memory.alloc(n.totalOutLen);
      var i = 0;
      n.dataOutMap.forEach((function(t) {
        Memory.copy(r.add(i), t.data, t.len), i += t.len;
      })), n.log = n.log.concat("[+] Data len: " + n.totalLen + "/" + n.originalLen + "\n"), 
      n.log = n.log.concat("[+] Data : \n", L(e, n.totalLen), "\n"), n.log = n.log.concat("[+] Data out len: " + n.totalOutLen + "/" + n.originalOutLen + "\n"), 
      n.log = n.log.concat("[+] Data out: \n", L(r, n.totalOutLen), "\n"), t.crypto.printStack && (n.log = n.log.concat("[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), "\n")), 
      n.log = n.log.concat("[*] EXIT CCCryptorFinal ", "\n"), console.log(n.log);
    }
  }) : console.error("CCCryptorFinal func is null");
}

function b(n, e) {
  let a = Module.findExportByName("libSystem.B.dylib", n);
  null != a ? (Interceptor.attach(a, {
    onEnter: function(o) {
      this.log = "", this.log = this.log.concat("[*] ENTER ", n, "\n");
      let e = o[1].toInt32(), a = Math.min(e, t.hash.maxInputDataLength);
      this.log = this.log.concat("[+] Data len:", a, "/", e, "\n"), this.log = this.log.concat("[+] Data: \n", L(o[0], a), "\n");
    },
    onLeave: function(a) {
      this.log = this.log.concat(o.green, "[+] Data out len: " + e, o.resetColor, "\n"), 
      this.log = this.log.concat(o.green, "[+] Data out:\n", L(a, e), o.resetColor, "\n"), 
      t.hash.printStack && (this.log = this.log.concat("[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), "\n")), 
      this.log = this.log.concat("[*] EXIT", n, "\n"), console.log(this.log);
    }
  }), function() {
    let a = {}, l = Module.findExportByName("libSystem.B.dylib", n + "_Init");
    if (null == l) return void console.error(n + "_Init func is null");
    Interceptor.attach(l, {
      onEnter: function(t) {
        let o = {
          ctx: t[0],
          dataMap: [],
          totalLen: 0,
          originalLen: 0,
          log: ""
        };
        a[k(t[0])] = o, o.log = o.log.concat("[*] ENTER " + n + "_Init\n");
      }
    });
    let r = Module.findExportByName("libSystem.B.dylib", n + "_Update");
    if (null == r) return void console.error(n + "_Update func is null");
    Interceptor.attach(r, {
      onEnter: function(o) {
        let n = a[k(o[0])];
        if (null == n) return void console.error("model is null");
        let e = k(o[2]), l = t.hash.maxInputDataLength - n.totalLen;
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
      onLeave: function(l) {
        let r = a[k(this.ctxSha)];
        if (null == r) return void console.error(n + "_Final model is null");
        if (r.totalLen <= 0) return void console.error("totalLen :", r.totalLen);
        let i = Memory.alloc(r.totalLen);
        var c = 0;
        r.dataMap.forEach((function(t) {
          Memory.copy(i.add(c), t.data, t.len), c += t.len;
        })), r.log = r.log.concat("[+] Data len: " + r.totalLen + "/" + r.originalLen + "\n"), 
        r.log = r.log.concat("[+] Data :\n"), r.log = r.log.concat(L(i, r.totalLen), "\n"), 
        0 !== k(this.mdSha) ? (r.log = r.log.concat(o.green, "[+] Data out len: " + e + "\n"), 
        r.log = r.log.concat("[+] Data out:\n"), r.log = r.log.concat(L(ptr(this.mdSha), e), "\n", o.resetColor)) : r.log = r.log.concat(o.red, "[!]: Data out: null\n", o.resetColor), 
        t.hash.printStack && (r.log = r.log.concat("[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), "\n")), 
        r.log = r.log.concat("[*] EXIT " + n + "_Final\n"), console.log(r.log);
      }
    }) : console.error(n + "_Final func is null");
  }()) : console.error(n + " func is null");
}

function E() {
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
    onEnter: function(a) {
      if (this.enable = n(a[0].toInt32()), !this.enable) return;
      this.mdLen = f[a[0].toInt32()], this.log = "", this.log = this.log.concat("[*] ENTER ", e, "\n"), 
      this.log = this.log.concat(o.yellow, "[+] Algorithm: ", p[a[0].toInt32()], "\n", o.resetColor), 
      this.log = this.log.concat("[+] Key len: ", a[2].toInt32(), "\n"), this.log = this.log.concat(o.green, "[+] Key : \n", L(a[1], a[2].toInt32()), "\n", o.resetColor);
      let l = a[4].toInt32(), r = Math.min(l, t.hmac.maxInputDataLength);
      this.log = this.log.concat("[+] Data len:", r, "/", l, "\n"), this.log = this.log.concat("[+] Data: \n", L(a[3], r), "\n"), 
      this.macOut = a[5];
    },
    onLeave: function(n) {
      this.enable && (this.log = this.log.concat("[+] Data out len: " + this.mdLen, "\n"), 
      this.log = this.log.concat(o.green, "[+] Data out:\n", L(n, this.mdLen), o.resetColor, "\n"), 
      t.hmac.printStack && (this.log = this.log.concat("[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), "\n")), 
      this.log = this.log.concat("[*] EXIT", e, "\n"), console.log(this.log));
    }
  }), function() {
    let a = {}, l = Module.findExportByName("libSystem.B.dylib", e + "Init");
    if (null == l) return void console.error(e + "Init func is null");
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
        a[k(t[0])] = l, l.enable && (l.log = l.log.concat("[*] ENTER " + e + "Init\n"), 
        l.log = l.log.concat(o.yellow, "[+] Algorithm: " + p[t[1].toInt32()] + "\n", o.resetColor), 
        l.log = l.log.concat("[+] Key len: " + t[3].toInt32() + "\n"), l.log = l.log.concat(o.green, "[+] Key: \n" + L(t[2], k(t[3])) + "\n", o.resetColor));
      }
    });
    let r = Module.findExportByName("libSystem.B.dylib", e + "Update");
    if (null == r) return void console.error(e + "Update func is null");
    Interceptor.attach(r, {
      onEnter: function(o) {
        let n = a[k(o[0])];
        if (null == n) return void console.error(e + "Update model is null");
        if (!n.enable) return;
        let l = k(o[2]), r = t.hmac.maxInputDataLength - n.totalLen;
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
      onLeave: function(n) {
        let l = a[k(this.ctx)];
        if (null == l) return void console.error(e + "Final model is null");
        if (!l.enable) return;
        if (l.totalLen <= 0) return void console.error("totalLen :", l.totalLen);
        let r = Memory.alloc(l.totalLen);
        var i = 0;
        l.dataMap.forEach((function(t) {
          Memory.copy(r.add(i), t.data, t.len), i += t.len;
        })), l.log = l.log.concat("[+] Data len: " + l.totalLen + "/" + l.originalLen + "\n"), 
        l.log = l.log.concat("[+] Data :\n"), l.log = l.log.concat(L(r, l.totalLen), "\n"), 
        l.log = l.log.concat("[+] Data out len: " + l.mdLen + "\n"), l.log = l.log.concat(o.green, "[+] Data out:\n"), 
        l.log = l.log.concat(L(ptr(this.mdOut), l.mdLen), o.resetColor, "\n"), t.hmac.printStack && (l.log = l.log.concat("[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), "\n")), 
        l.log = l.log.concat("[*] EXIT " + e + "Final\n"), console.log(l.log);
      }
    }) : console.error(e + "Final func is null");
  }()) : console.error(e + " func is null");
}

t.enable && (t.crypto.enable && M(), t.hash.enable && (t.hash.sha1 && b("CC_SHA1", 20), 
t.hash.sha224 && b("CC_SHA224", 28), t.hash.sha256 && b("CC_SHA256", 32), t.hash.sha384 && b("CC_SHA384", 48), 
t.hash.sha512 && b("CC_SHA512", 64), t.hash.md2 && b("CC_MD2", 16), t.hash.md4 && b("CC_MD4", 16), 
t.hash.md5 && b("CC_MD5", 16), t.hmac.enable && E()));

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDdUJBLE1BQU0sSUFBYztFQUNoQixTQUFTO0VBQ1QsUUFBUztJQUNMLFNBQVM7SUFDVCxlQUFnQjtJQUNoQixhQUFhO0lBQ2IsTUFBTTtJQUNOLE1BQU07SUFDTixTQUFPO0lBQ1AsT0FBTztJQUNQLE1BQU07SUFDTixNQUFNO0lBQ04sV0FBVzs7RUFFZixNQUFPO0lBQ0gsU0FBUztJQUNULG9CQUFxQjtJQUNyQixhQUFhO0lBQ2IsTUFBTTtJQUNOLE1BQU07SUFDTixNQUFNO0lBQ04sT0FBTztJQUNQLFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7O0VBRWIsTUFBTztJQUNILFNBQVM7SUFDVCxvQkFBcUI7SUFDckIsYUFBYTtJQUNiLE9BQU87SUFDUCxNQUFNO0lBQ04sU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUzs7R0FPWCxJQUFTO0VBQ1gsWUFBYztFQUNkLE9BQVM7RUFDVCxRQUFVO0VBQ1YsS0FBTztHQUVMLElBQXVCLElBQ3ZCLElBQXVCLElBQ3ZCLElBQXVCLElBQ3ZCLElBQXNCLElBQ3RCLElBQXdCLElBQ3hCLElBQXdCLElBQ3hCLElBQXdCLElBQ3hCLElBQXdCLElBRXhCLElBQWtDO0VBQ3BDLEdBQUU7RUFDRixHQUFFO0dBRUEsSUFBa0M7RUFDcEMsR0FBRTtFQUNGLEdBQUU7RUFDRixHQUFFO0VBQ0YsR0FBRTtFQUNGLEdBQUU7RUFDRixHQUFFO0VBQ0YsR0FBRTtHQUdBLElBQWdDO0VBQ2xDLEdBQUU7RUFDRixHQUFFO0dBRUEsSUFBNkI7RUFDL0IsR0FBRTtFQUNGLEdBQUU7RUFDRixHQUFFO0VBQ0YsR0FBRTtFQUNGLEdBQUU7RUFDRixHQUFFO0VBQ0YsR0FBRTtFQUNGLEdBQUU7RUFDRixHQUFFO0VBQ0YsSUFBRztHQUVELElBQWdDO0VBQ2xD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
