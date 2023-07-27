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
    rc2: !0
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
}, n = {
  resetColor: "[0m",
  green: "[32m",
  yellow: "[33m",
  red: "[31m"
}, o = 16, e = 16, a = 16, l = 20, r = 28, i = 32, c = 48, s = 64, h = {
  0: "kCCEncrypt",
  1: "kCCEncrypt"
}, g = {
  0: "kCCAlgorithmAES128",
  1: "kCCAlgorithmDES",
  2: "kCCAlgorithm3DES",
  3: "kCCAlgorithmCAST",
  4: "kCCAlgorithmRC4",
  5: "kCCAlgorithmRC2"
}, u = {
  1: "kCCOptionPKCS7Padding",
  2: "kCCOptionECBMode"
}, C = {
  16: "kCCKeySizeAES128|kCCKeySizeMaxCAST",
  24: "kCCKeySizeAES192|kCCKeySize3DES",
  32: "kCCKeySizeAES256",
  8: "kCCKeySizeDES",
  5: "kCCKeySizeMinCAST",
  1: "kCCKeySizeMinRC4|kCCKeySizeMinRC2",
  512: "kCCKeySizeMaxRC4",
  128: "kCCKeySizeMaxRC2"
}, d = {
  0: "kCCHmacAlgSHA1",
  1: "kCCHmacAlgMD5",
  2: "kCCHmacAlgSHA256",
  3: "kCCHmacAlgSHA384",
  4: "kCCHmacAlgSHA512",
  5: "kCCHmacAlgSHA224"
}, m = {
  0: l,
  1: a,
  2: i,
  3: c,
  4: s,
  5: r
};

function y(t, n = 240) {
  try {
    return null == t ? "\n" : "\n" + hexdump(t, {
      length: n
    }) + "\n";
  } catch (n) {
    return console.error("print_arg error:", n.stack), t + "\n";
  }
}

function p(t) {
  try {
    return null == t ? 0 : parseInt(t.toString());
  } catch (t) {
    return console.error("pointerToInt error:", t.stack), 0;
  }
}

function f() {
  function o(n) {
    switch (n) {
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

     default:
      return !0;
    }
  }
  let e = Module.findExportByName("libSystem.B.dylib", "CCCrypt");
  if (null == e) return void console.error("CCCrypt func is null");
  Interceptor.attach(e, {
    onEnter: function(e) {
      if (this.enable = o(e[1].toInt32()), !this.enable) return;
      this.log = "", this.log = this.log.concat(n.green, "[*] ENTER CCCrypt", n.resetColor), 
      this.log = this.log.concat(Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), "\n"), 
      this.log = this.log.concat(n.yellow, "[+] CCOperation: " + h[e[0].toInt32()], n.resetColor, "\n"), 
      this.log = this.log.concat(n.yellow, "[+] CCAlgorithm: " + g[e[1].toInt32()], n.resetColor, "\n"), 
      this.log = this.log.concat("[+] CCOptions: " + u[e[2].toInt32()], "\n"), this.log = this.log.concat("[+] KeySize: " + C[e[4].toInt32()], "\n"), 
      this.log = this.log.concat("[+] Key: \n" + y(e[3], e[4].toInt32()), "\n"), this.log = this.log.concat("[+] IV: \n" + y(e[5], 16), "\n");
      let a = p(e[7]), l = Math.min(a, t.crypto.maxDataLength);
      this.log = this.log.concat("[+] Data len: ", l, "/", a, "\n"), this.log = this.log.concat("[+] Data : \n", "\n"), 
      this.log = this.log.concat(y(e[6], l)), this.dataOut = e[8], this.dataOutLength = e[10];
    },
    onLeave: function(n) {
      if (!this.enable) return;
      let o = p(this.dataOutLength.readPointer()), e = Math.min(o, t.crypto.maxDataLength);
      this.log = this.log.concat("[+] Data out len: ", e, "/", o, "\n"), this.log = this.log.concat("[+] Data out: \n", y(this.dataOut, e), "\n"), 
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
        enable: o(this.algorithm),
        cRef: this.cRefPtr.readPointer(),
        dataMap: [],
        dataOutMap: [],
        totalLen: 0,
        totalOutLen: 0,
        originalLen: 0,
        originalOutLen: 0,
        log: ""
      };
      a[p(e.cRef)] = e, e.enable && (e.log = e.log.concat("[*] ENTER CCCryptorCreate", "\n"), 
      e.log = e.log.concat("[+] CCOperation: " + h[this.operation.toInt32()], "\n"), e.log = e.log.concat("[+] CCAlgorithm: " + g[this.algorithm.toInt32()], "\n"), 
      e.log = e.log.concat("[+] CCOptions: " + u[this.options.toInt32()], "\n"), e.log = e.log.concat("[+] Key len: " + C[this.keyLen.toInt32()], "\n"), 
      e.log = e.log.concat("[+] Key: \n" + y(this.key, p(this.keyLen)), "\n"), 0 != p(this.iv) ? e.log = e.log.concat("[+] Iv:\n" + y(this.iv, 16), "\n") : e.log = e.log.concat(n.red, "[!] Iv: null", "\n", n.resetColor));
    }
  });
  let r = Module.findExportByName("libSystem.B.dylib", "CCCryptorUpdate");
  if (null == r) return void console.error("CCCryptorUpdate func is null");
  Interceptor.attach(r, {
    onEnter: function(t) {
      this.outLen = t[5], this.out = t[3], this.cRef = t[0], this.dataLen = t[2], this.data = t[1];
    },
    onLeave: function(n) {
      let o = a[p(this.cRef)];
      if (null == o) return void console.error("CCCryptorUpdate model is null");
      if (!o.enable) return;
      o.originalLen += this.dataLen, o.originalOutLen += this.outLen;
      let e = t.crypto.maxDataLength - o.totalLen, l = p(this.dataLen);
      if (l > 0 && e > 0) {
        let t = Math.min(l, e), n = Memory.alloc(t);
        Memory.copy(n, this.data, t), o.dataMap.push({
          data: n,
          len: t
        }), o.totalLen += t;
      }
      let r = t.crypto.maxDataLength - o.totalOutLen, i = p(this.outLen.readPointer());
      if (i > 0 && r > 0) {
        let t = Math.min(i, r), n = Memory.alloc(t);
        Memory.copy(n, this.out, t), o.dataOutMap.push({
          data: n,
          len: t
        }), o.totalOutLen += t;
      }
    }
  });
  let i = Module.findExportByName("libSystem.B.dylib", "CCCryptorFinal");
  null != i ? Interceptor.attach(i, {
    onEnter: function(t) {
      this.cRef = t[0], this.dataOut = t[1], this.dataOutLen = t[3];
    },
    onLeave: function(n) {
      let o = a[p(this.cRef)];
      if (null == o) return void console.error("CCCryptorFinal model is null");
      if (!o.enable) return;
      if (o.originalOutLen += this.dataOutLen, o.totalOutLen < t.crypto.maxDataLength) {
        let n = t.crypto.maxDataLength - o.totalOutLen, e = p(this.dataOutLen.readPointer());
        if (e > 0 && n > 0) {
          let t = Math.min(e, n), a = Memory.alloc(t);
          Memory.copy(a, this.dataOut, t), o.dataOutMap.push({
            data: a,
            len: t
          }), o.totalOutLen += t;
        }
      }
      let e = Memory.alloc(o.totalLen);
      var l = 0;
      o.dataMap.forEach((function(t) {
        Memory.copy(e.add(l), t.data, t.len), l += t.len;
      }));
      let r = Memory.alloc(o.totalOutLen);
      var i = 0;
      o.dataOutMap.forEach((function(t) {
        Memory.copy(r.add(i), t.data, t.len), i += t.len;
      })), o.log = o.log.concat("[+] Data len: " + o.totalLen + "/" + o.originalLen + "\n"), 
      o.log = o.log.concat("[+] Data : \n", y(e, o.totalLen), "\n"), o.log = o.log.concat("[+] Data out len: " + o.totalOutLen + "/" + o.originalOutLen + "\n"), 
      o.log = o.log.concat("[+] Data out: \n", y(r, o.totalOutLen), "\n"), t.crypto.printStack && (o.log = o.log.concat("[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), "\n")), 
      o.log = o.log.concat("[*] EXIT CCCryptorFinal ", "\n"), console.log(o.log);
    }
  }) : console.error("CCCryptorFinal func is null");
}

function L(o, e) {
  let a = Module.findExportByName("libSystem.B.dylib", o);
  null != a ? (Interceptor.attach(a, {
    onEnter: function(n) {
      this.log = "", this.log = this.log.concat("[*] ENTER ", o, "\n");
      let e = n[1].toInt32(), a = Math.min(e, t.hash.maxInputDataLength);
      this.log = this.log.concat("[+] Data len:", a, "/", e, "\n"), this.log = this.log.concat("[+] Data: \n", y(n[0], a), "\n");
    },
    onLeave: function(a) {
      this.log = this.log.concat(n.green, "[+] Data out len: " + e, n.resetColor, "\n"), 
      this.log = this.log.concat(n.green, "[+] Data out:\n", y(a, e), n.resetColor, "\n"), 
      t.hash.printStack && (this.log = this.log.concat("[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), "\n")), 
      this.log = this.log.concat("[*] EXIT", o, "\n"), console.log(this.log);
    }
  }), function() {
    let a = {}, l = Module.findExportByName("libSystem.B.dylib", o + "_Init");
    if (null == l) return void console.error(o + "_Init func is null");
    Interceptor.attach(l, {
      onEnter: function(t) {
        let n = {
          ctx: t[0],
          dataMap: [],
          totalLen: 0,
          originalLen: 0,
          log: ""
        };
        a[p(t[0])] = n, n.log = n.log.concat("[*] ENTER " + o + "_Init\n");
      }
    });
    let r = Module.findExportByName("libSystem.B.dylib", o + "_Update");
    if (null == r) return void console.error(o + "_Update func is null");
    Interceptor.attach(r, {
      onEnter: function(n) {
        let o = a[p(n[0])];
        if (null == o) return void console.error("model is null");
        let e = p(n[2]), l = t.hash.maxInputDataLength - o.totalLen;
        if (e > 0 && l > 0) {
          o.originalLen += e;
          let t = Math.min(e, l), a = Memory.alloc(t);
          Memory.copy(a, n[1], t), o.dataMap.push({
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
      onLeave: function(l) {
        let r = a[p(this.ctxSha)];
        if (null == r) return void console.error(o + "_Final model is null");
        if (r.totalLen <= 0) return void console.error("totalLen :", r.totalLen);
        let i = Memory.alloc(r.totalLen);
        var c = 0;
        r.dataMap.forEach((function(t) {
          Memory.copy(i.add(c), t.data, t.len), c += t.len;
        })), r.log = r.log.concat("[+] Data len: " + r.totalLen + "/" + r.originalLen + "\n"), 
        r.log = r.log.concat("[+] Data :\n"), r.log = r.log.concat(y(i, r.totalLen), "\n"), 
        0 !== p(this.mdSha) ? (r.log = r.log.concat(n.green, "[+] Data out len: " + e + "\n"), 
        r.log = r.log.concat("[+] Data out:\n"), r.log = r.log.concat(y(ptr(this.mdSha), e), "\n", n.resetColor)) : r.log = r.log.concat(n.red, "[!]: Data out: null\n", n.resetColor), 
        t.hash.printStack && (r.log = r.log.concat("[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), "\n")), 
        r.log = r.log.concat("[*] EXIT " + o + "_Final\n"), console.log(r.log);
      }
    }) : console.error(o + "_Final func is null");
  }()) : console.error(o + " func is null");
}

function S() {
  function o(n) {
    switch (n) {
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
      if (this.enable = o(a[0].toInt32()), !this.enable) return;
      this.mdLen = m[a[0].toInt32()], this.log = "", this.log = this.log.concat("[*] ENTER ", e, "\n"), 
      this.log = this.log.concat(n.yellow, "[+] Algorithm: ", d[a[0].toInt32()], "\n", n.resetColor), 
      this.log = this.log.concat("[+] Key len: ", a[2].toInt32(), "\n"), this.log = this.log.concat(n.green, "[+] Key : \n", y(a[1], a[2].toInt32()), "\n", n.resetColor);
      let l = a[4].toInt32(), r = Math.min(l, t.hmac.maxInputDataLength);
      this.log = this.log.concat("[+] Data len:", r, "/", l, "\n"), this.log = this.log.concat("[+] Data: \n", y(a[3], r), "\n"), 
      this.macOut = a[5];
    },
    onLeave: function(o) {
      this.enable && (this.log = this.log.concat("[+] Data out len: " + this.mdLen, "\n"), 
      this.log = this.log.concat(n.green, "[+] Data out:\n", y(o, this.mdLen), n.resetColor, "\n"), 
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
          mdLen: m[t[1].toInt32()],
          enable: o(t[1].toInt32())
        };
        a[p(t[0])] = l, l.enable && (l.log = l.log.concat("[*] ENTER " + e + "Init\n"), 
        l.log = l.log.concat(n.yellow, "[+] Algorithm: " + d[t[1].toInt32()] + "\n", n.resetColor), 
        l.log = l.log.concat("[+] Key len: " + t[3].toInt32() + "\n"), l.log = l.log.concat(n.green, "[+] Key: \n" + y(t[2], p(t[3])) + "\n", n.resetColor));
      }
    });
    let r = Module.findExportByName("libSystem.B.dylib", e + "Update");
    if (null == r) return void console.error(e + "Update func is null");
    Interceptor.attach(r, {
      onEnter: function(n) {
        let o = a[p(n[0])];
        if (null == o) return void console.error(e + "Update model is null");
        if (!o.enable) return;
        let l = p(n[2]), r = t.hmac.maxInputDataLength - o.totalLen;
        if (l > 0 && r > 0) {
          o.originalLen += l;
          let t = Math.min(l, r), e = Memory.alloc(t);
          Memory.copy(e, n[1], t), o.dataMap.push({
            data: e,
            len: t
          }), o.totalLen += t;
        }
      }
    });
    let i = Module.findExportByName("libSystem.B.dylib", e + "Final");
    null != i ? Interceptor.attach(i, {
      onEnter: function(t) {
        this.mdOut = t[1], this.ctx = t[0];
      },
      onLeave: function(o) {
        let l = a[p(this.ctx)];
        if (null == l) return void console.error(e + "Final model is null");
        if (!l.enable) return;
        if (l.totalLen <= 0) return void console.error("totalLen :", l.totalLen);
        let r = Memory.alloc(l.totalLen);
        var i = 0;
        l.dataMap.forEach((function(t) {
          Memory.copy(r.add(i), t.data, t.len), i += t.len;
        })), l.log = l.log.concat("[+] Data len: " + l.totalLen + "/" + l.originalLen + "\n"), 
        l.log = l.log.concat("[+] Data :\n"), l.log = l.log.concat(y(r, l.totalLen), "\n"), 
        l.log = l.log.concat("[+] Data out len: " + l.mdLen + "\n"), l.log = l.log.concat(n.green, "[+] Data out:\n"), 
        l.log = l.log.concat(y(ptr(this.mdOut), l.mdLen), n.resetColor, "\n"), t.hmac.printStack && (l.log = l.log.concat("[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), "\n")), 
        l.log = l.log.concat("[*] EXIT " + e + "Final\n"), console.log(l.log);
      }
    }) : console.error(e + "Final func is null");
  }()) : console.error(e + " func is null");
}

t.enable && (t.crypto.enable && f(), t.hash.enable && (t.hash.sha1 && L("CC_SHA1", 20), 
t.hash.sha224 && L("CC_SHA224", 28), t.hash.sha256 && L("CC_SHA256", 32), t.hash.sha384 && L("CC_SHA384", 48), 
t.hash.sha512 && L("CC_SHA512", 64), t.hash.md2 && L("CC_MD2", 16), t.hash.md4 && L("CC_MD4", 16), 
t.hash.md5 && L("CC_MD5", 16), t.hmac.enable && S()));

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDaUJBLE1BQU0sSUFBYztFQUNoQixTQUFTO0VBQ1QsUUFBUztJQUNMLFNBQVM7SUFDVCxlQUFnQjtJQUNoQixhQUFhO0lBQ2IsTUFBTTtJQUNOLE1BQU07SUFDTixTQUFPO0lBQ1AsT0FBTztJQUNQLE1BQU07SUFDTixNQUFNOztFQUVWLE1BQU87SUFDSCxTQUFTO0lBQ1Qsb0JBQXFCO0lBQ3JCLGFBQWE7SUFDYixNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixPQUFPO0lBQ1AsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUzs7RUFFYixNQUFPO0lBQ0gsU0FBUztJQUNULG9CQUFxQjtJQUNyQixhQUFhO0lBQ2IsT0FBTztJQUNQLE1BQU07SUFDTixTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTOztHQU9YLElBQVM7RUFDWCxZQUFjO0VBQ2QsT0FBUztFQUNULFFBQVU7RUFDVixLQUFPO0dBRUwsSUFBdUIsSUFDdkIsSUFBdUIsSUFDdkIsSUFBdUIsSUFDdkIsSUFBc0IsSUFDdEIsSUFBd0IsSUFDeEIsSUFBd0IsSUFDeEIsSUFBd0IsSUFDeEIsSUFBd0IsSUFFeEIsSUFBa0M7RUFDcEMsR0FBRTtFQUNGLEdBQUU7R0FFQSxJQUFrQztFQUNwQyxHQUFFO0VBQ0YsR0FBRTtFQUNGLEdBQUU7RUFDRixHQUFFO0VBQ0YsR0FBRTtFQUNGLEdBQUU7R0FHQSxJQUFnQztFQUNsQyxHQUFFO0VBQ0YsR0FBRTtHQUVBLElBQWdDO0VBQ2xDLElBQUc7RUFDSCxJQUFHO0VBQ0gsSUFBRztFQUNILEdBQUU7RUFDRixHQUFFO0VBQ0YsR0FBRTtFQUNGLEtBQUk7RUFDSixLQUFJO0dBRUYsSUFBc0M7RUFDeEMsR0FBRTtFQUNGLEdBQUU7RUFDRixHQUFFO0VBQ0YsR0FBRTtFQUNG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
