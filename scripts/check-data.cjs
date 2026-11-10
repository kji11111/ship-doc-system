"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/dayjs/dayjs.min.js
var require_dayjs_min = __commonJS({
  "node_modules/dayjs/dayjs.min.js"(exports2, module2) {
    !function(t, e) {
      "object" == typeof exports2 && "undefined" != typeof module2 ? module2.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).dayjs = e();
    }(exports2, function() {
      "use strict";
      var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
        var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
        return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
      } }, m = function(t2, e2, n2) {
        var r2 = String(t2);
        return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
      }, v = { s: m, z: function(t2) {
        var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
        return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
      }, m: function t2(e2, n2) {
        if (e2.date() < n2.date()) return -t2(n2, e2);
        var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
        return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
      }, a: function(t2) {
        return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
      }, p: function(t2) {
        return { M: c, y: h, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
      }, u: function(t2) {
        return void 0 === t2;
      } }, g = "en", D = {};
      D[g] = M;
      var p = "$isDayjsObject", S = function(t2) {
        return t2 instanceof _ || !(!t2 || !t2[p]);
      }, w = function t2(e2, n2, r2) {
        var i2;
        if (!e2) return g;
        if ("string" == typeof e2) {
          var s2 = e2.toLowerCase();
          D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
          var u2 = e2.split("-");
          if (!i2 && u2.length > 1) return t2(u2[0]);
        } else {
          var a2 = e2.name;
          D[a2] = e2, i2 = a2;
        }
        return !r2 && i2 && (g = i2), i2 || !r2 && g;
      }, O = function(t2, e2) {
        if (S(t2)) return t2.clone();
        var n2 = "object" == typeof e2 ? e2 : {};
        return n2.date = t2, n2.args = arguments, new _(n2);
      }, b = v;
      b.l = w, b.i = S, b.w = function(t2, e2) {
        return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
      };
      var _ = function() {
        function M2(t2) {
          this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p] = true;
        }
        var m2 = M2.prototype;
        return m2.parse = function(t2) {
          this.$d = function(t3) {
            var e2 = t3.date, n2 = t3.utc;
            if (null === e2) return /* @__PURE__ */ new Date(NaN);
            if (b.u(e2)) return /* @__PURE__ */ new Date();
            if (e2 instanceof Date) return new Date(e2);
            if ("string" == typeof e2 && !/Z$/i.test(e2)) {
              var r2 = e2.match($);
              if (r2) {
                var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
              }
            }
            return new Date(e2);
          }(t2), this.init();
        }, m2.init = function() {
          var t2 = this.$d;
          this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
        }, m2.$utils = function() {
          return b;
        }, m2.isValid = function() {
          return !(this.$d.toString() === l);
        }, m2.isSame = function(t2, e2) {
          var n2 = O(t2);
          return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
        }, m2.isAfter = function(t2, e2) {
          return O(t2) < this.startOf(e2);
        }, m2.isBefore = function(t2, e2) {
          return this.endOf(e2) < O(t2);
        }, m2.$g = function(t2, e2, n2) {
          return b.u(t2) ? this[e2] : this.set(n2, t2);
        }, m2.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, m2.valueOf = function() {
          return this.$d.getTime();
        }, m2.startOf = function(t2, e2) {
          var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
            var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
            return r2 ? i2 : i2.endOf(a);
          }, $2 = function(t3, e3) {
            return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
          }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
          switch (f2) {
            case h:
              return r2 ? l2(1, 0) : l2(31, 11);
            case c:
              return r2 ? l2(1, M3) : l2(0, M3 + 1);
            case o:
              var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
              return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
            case a:
            case d:
              return $2(v2 + "Hours", 0);
            case u:
              return $2(v2 + "Minutes", 1);
            case s:
              return $2(v2 + "Seconds", 2);
            case i:
              return $2(v2 + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, m2.endOf = function(t2) {
          return this.startOf(t2, false);
        }, m2.$set = function(t2, e2) {
          var n2, o2 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
          if (o2 === c || o2 === h) {
            var y2 = this.clone().set(d, 1);
            y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
          } else l2 && this.$d[l2]($2);
          return this.init(), this;
        }, m2.set = function(t2, e2) {
          return this.clone().$set(t2, e2);
        }, m2.get = function(t2) {
          return this[b.p(t2)]();
        }, m2.add = function(r2, f2) {
          var d2, l2 = this;
          r2 = Number(r2);
          var $2 = b.p(f2), y2 = function(t2) {
            var e2 = O(l2);
            return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
          };
          if ($2 === c) return this.set(c, this.$M + r2);
          if ($2 === h) return this.set(h, this.$y + r2);
          if ($2 === a) return y2(1);
          if ($2 === o) return y2(7);
          var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$2] || 1, m3 = this.$d.getTime() + r2 * M3;
          return b.w(m3, this);
        }, m2.subtract = function(t2, e2) {
          return this.add(-1 * t2, e2);
        }, m2.format = function(t2) {
          var e2 = this, n2 = this.$locale();
          if (!this.isValid()) return n2.invalidDate || l;
          var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t3, n3, i3, s3) {
            return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
          }, d2 = function(t3) {
            return b.s(s2 % 12 || 12, t3, "0");
          }, $2 = f2 || function(t3, e3, n3) {
            var r3 = t3 < 12 ? "AM" : "PM";
            return n3 ? r3.toLowerCase() : r3;
          };
          return r2.replace(y, function(t3, r3) {
            return r3 || function(t4) {
              switch (t4) {
                case "YY":
                  return String(e2.$y).slice(-2);
                case "YYYY":
                  return b.s(e2.$y, 4, "0");
                case "M":
                  return a2 + 1;
                case "MM":
                  return b.s(a2 + 1, 2, "0");
                case "MMM":
                  return h2(n2.monthsShort, a2, c2, 3);
                case "MMMM":
                  return h2(c2, a2);
                case "D":
                  return e2.$D;
                case "DD":
                  return b.s(e2.$D, 2, "0");
                case "d":
                  return String(e2.$W);
                case "dd":
                  return h2(n2.weekdaysMin, e2.$W, o2, 2);
                case "ddd":
                  return h2(n2.weekdaysShort, e2.$W, o2, 3);
                case "dddd":
                  return o2[e2.$W];
                case "H":
                  return String(s2);
                case "HH":
                  return b.s(s2, 2, "0");
                case "h":
                  return d2(1);
                case "hh":
                  return d2(2);
                case "a":
                  return $2(s2, u2, true);
                case "A":
                  return $2(s2, u2, false);
                case "m":
                  return String(u2);
                case "mm":
                  return b.s(u2, 2, "0");
                case "s":
                  return String(e2.$s);
                case "ss":
                  return b.s(e2.$s, 2, "0");
                case "SSS":
                  return b.s(e2.$ms, 3, "0");
                case "Z":
                  return i2;
              }
              return null;
            }(t3) || i2.replace(":", "");
          });
        }, m2.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m2.diff = function(r2, d2, l2) {
          var $2, y2 = this, M3 = b.p(d2), m3 = O(r2), v2 = (m3.utcOffset() - this.utcOffset()) * e, g2 = this - m3, D2 = function() {
            return b.m(y2, m3);
          };
          switch (M3) {
            case h:
              $2 = D2() / 12;
              break;
            case c:
              $2 = D2();
              break;
            case f:
              $2 = D2() / 3;
              break;
            case o:
              $2 = (g2 - v2) / 6048e5;
              break;
            case a:
              $2 = (g2 - v2) / 864e5;
              break;
            case u:
              $2 = g2 / n;
              break;
            case s:
              $2 = g2 / e;
              break;
            case i:
              $2 = g2 / t;
              break;
            default:
              $2 = g2;
          }
          return l2 ? $2 : b.a($2);
        }, m2.daysInMonth = function() {
          return this.endOf(c).$D;
        }, m2.$locale = function() {
          return D[this.$L];
        }, m2.locale = function(t2, e2) {
          if (!t2) return this.$L;
          var n2 = this.clone(), r2 = w(t2, e2, true);
          return r2 && (n2.$L = r2), n2;
        }, m2.clone = function() {
          return b.w(this.$d, this);
        }, m2.toDate = function() {
          return new Date(this.valueOf());
        }, m2.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, m2.toISOString = function() {
          return this.$d.toISOString();
        }, m2.toString = function() {
          return this.$d.toUTCString();
        }, M2;
      }(), Y = _.prototype;
      return O.prototype = Y, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach(function(t2) {
        Y[t2[1]] = function(e2) {
          return this.$g(e2, t2[0], t2[1]);
        };
      }), O.extend = function(t2, e2) {
        return t2.$i || (t2(e2, _, O), t2.$i = true), O;
      }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
        return O(1e3 * t2);
      }, O.en = D[g], O.Ls = D, O.p = {}, O;
    });
  }
});

// scripts/check-data.ts
var import_dayjs3 = __toESM(require_dayjs_min(), 1);

// src/mocks/customers.ts
var mockCustomers = [
  { id: "CU0001", name: "\u65FA\u5146", contact: "\u9648\u751F", phone: "138-0000-0001", address: "\u793A\u4F8B\u5E02\u767D\u4E91\u533A\u793A\u4F8B\u8DEF 88 \u53F7", paymentTerm: "\u542B1\u70B9\u7A0E", remark: "\u51B2\u950B\u8863\u4E3B\u529B\u5BA2\u6237\uFF0C\u6708\u7ED3\u5BF9\u8D26", createdAt: "2025-06-01 09:00" },
  { id: "CU0002", name: "\u6052\u6656", contact: "\u6881\u5C0F\u59D0", phone: "138-0000-0002", address: "\u793A\u4F8B\u5E02\u7985\u57CE\u533A\u793A\u4F8B\u5927\u9053 12 \u53F7", paymentTerm: "\u6708\u7ED330\u5929", createdAt: "2025-07-15 10:30" },
  { id: "CU0003", name: "\u5929\u6DFB\u4E50", contact: "\u4F55\u751F", phone: "138-0000-0003", address: "\u793A\u4F8B\u5E02\u6C99\u6EAA\u9547\u793A\u4F8B\u670D\u88C5\u57CE B \u5EA7", paymentTerm: "\u542B1\u70B9\u7A0E", createdAt: "2025-08-20 14:00" },
  { id: "CU0004", name: "\u534E\u65D7", contact: "\u9EA6\u7ECF\u7406", phone: "138-0000-0004", address: "\u793A\u4F8B\u5E02\u864E\u95E8\u9547\u793A\u4F8B\u8DEF 5 \u53F7", paymentTerm: "\u6708\u7ED3", remark: "\u6237\u5916\u5957\u88C5\u4E3A\u4E3B", createdAt: "2025-09-10 11:20" },
  { id: "CU0005", name: "\u60A6\u83B1", contact: "\u82CF\u5C0F\u59D0", phone: "138-0000-0005", address: "\u793A\u4F8B\u5E02\u793A\u4F8B\u533A\u793A\u4F8B\u5927\u9053\u4E2D 66 \u53F7", paymentTerm: "\u542B1\u70B9\u7A0E", createdAt: "2025-10-05 15:45" },
  { id: "CU0006", name: "\u91D1\u660A", contact: "\u51AF\u751F", phone: "138-0000-0006", address: "\u793A\u4F8B\u5E02\u9999\u6D32\u533A\u793A\u4F8B\u79D1\u6280\u56ED 3 \u680B", paymentTerm: "\u6708\u7ED330\u5929", createdAt: "2026-01-12 09:40" },
  { id: "CU0007", name: "\u5F64\u6656", contact: "\u8D56\u5C0F\u59D0", phone: "138-0000-0007", address: "\u793A\u4F8B\u5E02\u756A\u79BA\u533A\u793A\u4F8B\u5927\u9053 26 \u53F7", paymentTerm: "\u73B0\u7ED3", remark: "\u7AE5\u88C5\u5C0F\u5355\u591A", createdAt: "2026-03-18 16:10" }
];

// src/mocks/packingLists.ts
var import_dayjs = __toESM(require_dayjs_min(), 1);

// src/mocks/rng.ts
function createRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function pick(rng3, arr) {
  return arr[Math.floor(rng3() * arr.length)];
}
function pickSome(rng3, arr, n) {
  const pool = [...arr];
  const out = [];
  while (out.length < n && pool.length > 0) {
    out.push(pool.splice(Math.floor(rng3() * pool.length), 1)[0]);
  }
  return out;
}

// src/mocks/styles.ts
var mockStyles = [
  { id: "ST0001", styleNo: "J34", name: "\u51B2\u950B\u8863", sizeScale: ["S", "M", "L", "XL", "XXL"], colors: ["\u9ED1\u8272", "\u7D2B\u8272", "\u7C73\u767D"], unit: "\u4EF6", bulkPrice: 45, process: "\u65E0\u7F1D\u538B\u80F6", remark: "\u6837\u4F8B\u4E3B\u529B\u6B3E" },
  { id: "ST0002", styleNo: "K07", name: "\u98CE\u8863", sizeScale: ["S", "M", "L", "XL"], colors: ["\u5361\u5176", "\u9ED1\u8272"], unit: "\u4EF6", bulkPrice: 38, process: "\u8D77\u7248" },
  { id: "ST0003", styleNo: "K12", name: "\u88E4\u5B50", sizeScale: ["M", "L", "XL", "XXL"], colors: ["\u9ED1\u8272", "\u6DF1\u7070"], unit: "\u4EF6", bulkPrice: 22 },
  { id: "ST0004", styleNo: "M21", name: "\u51B2\u950B\u88E4", sizeScale: ["M", "L", "XL", "XXL"], colors: ["\u9ED1\u8272", "\u519B\u7EFF"], unit: "\u4EF6", bulkPrice: 32, process: "\u538B\u80F6" },
  { id: "ST0005", styleNo: "H05", name: "\u536B\u8863", sizeScale: ["S", "M", "L", "XL", "XXL"], colors: ["\u7070\u8272", "\u9ED1\u8272", "\u7C73\u767D"], unit: "\u4EF6", bulkPrice: 28 },
  { id: "ST0006", styleNo: "P09", name: "\u76AE\u80A4\u8863", sizeScale: ["S", "M", "L", "XL"], colors: ["\u767D\u8272", "\u5929\u84DD", "\u7C89\u8272"], unit: "\u4EF6", bulkPrice: 25 },
  { id: "ST0007", styleNo: "W33", name: "\u7FBD\u7ED2\u670D", sizeScale: ["M", "L", "XL", "XXL"], colors: ["\u9ED1\u8272", "\u85CF\u9752"], unit: "\u4EF6", bulkPrice: 88, remark: "\u51AC\u5B63\u4E3B\u529B" },
  { id: "ST0008", styleNo: "G66", name: "\u9A91\u884C\u96E8\u62AB", sizeScale: ["\u5747\u7801"], colors: ["\u8367\u5149\u9EC4", "\u7EA2\u8272"], unit: "\u4EF6", bulkPrice: 18, remark: "\u6237\u5916\u7528\u54C1\uFF08\u8863\u542F\u76C8\uFF09" }
];

// src/mocks/packingLists.ts
var rng = createRng(20261115);
var sampleCartons = [
  { cartonNo: 1, color: "\u9ED1\u8272", sizes: { S: 45 } },
  { cartonNo: 2, color: "\u9ED1\u8272", sizes: { S: 15, M: 30 } },
  { cartonNo: 3, color: "\u9ED1\u8272", sizes: { M: 30, L: 15 } },
  { cartonNo: 4, color: "\u9ED1\u8272", sizes: { L: 45 } },
  { cartonNo: 5, color: "\u9ED1\u8272", sizes: { L: 10, XL: 30, XXL: 5 } },
  { cartonNo: 6, color: "\u7D2B\u8272", sizes: { S: 40, M: 10 } },
  { cartonNo: 7, color: "\u7D2B\u8272", sizes: { M: 40, L: 5 } },
  { cartonNo: 8, color: "\u7D2B\u8272", sizes: { L: 45 } },
  { cartonNo: 9, color: "\u7C73\u767D", sizes: { S: 40, M: 10 } },
  { cartonNo: 10, color: "\u7C73\u767D", sizes: { M: 40, L: 5 } },
  { cartonNo: 11, color: "\u7C73\u767D", sizes: { L: 45 } }
];
function genCartons(sizeScale, colors) {
  const n = 6 + Math.floor(rng() * 9);
  const cartons = [];
  for (let i = 1; i <= n; i++) {
    const sizes = {};
    pickSome(rng, sizeScale, 1 + Math.floor(rng() * 3)).forEach((sz) => {
      sizes[sz] = 30 + Math.floor(rng() * 31);
    });
    const v = rng();
    cartons.push({
      cartonNo: i,
      color: pick(rng, colors),
      sizes,
      volume: v > 0.66 ? "60*40*35" : v > 0.33 ? "50*40*30" : void 0,
      remark: rng() > 0.93 ? "\u5916\u7BB1\u7834\u635F\uFF0C\u5DF2\u66F4\u6362" : void 0
    });
  }
  return cartons;
}
var drafts = [];
drafts.push({
  customerId: "CU0001",
  date: "2026-06-21",
  productName: "\u51B2\u950B\u8863",
  styleNo: "J34",
  sizeScale: ["S", "M", "L", "XL", "XXL"],
  cartons: sampleCartons,
  status: "\u5DF2\u51FA\u8D27"
});
var monthStart = (0, import_dayjs.default)().startOf("month").subtract(5, "month");
var monthCount = [2, 2, 2, 2, 3, 3];
var monthStatus = [
  ["\u5DF2\u5BF9\u8D26", "\u5DF2\u5BF9\u8D26", "\u5DF2\u5BF9\u8D26"],
  ["\u5DF2\u5BF9\u8D26", "\u5DF2\u5BF9\u8D26"],
  ["\u5DF2\u51FA\u8D27", "\u5DF2\u51FA\u8D27", "\u5DF2\u51FA\u8D27"],
  ["\u5DF2\u51FA\u8D27", "\u5DF2\u51FA\u8D27"],
  ["\u5DF2\u51FA\u8D27", "\u8349\u7A3F", "\u8349\u7A3F"],
  ["\u5DF2\u51FA\u8D27", "\u5DF2\u51FA\u8D27", "\u8349\u7A3F"]
];
var dayPool = [4, 14, 24];
for (let m = 0; m < 6; m++) {
  const base = monthStart.add(m, "month");
  for (let k = 0; k < monthCount[m]; k++) {
    const style = pick(rng, mockStyles);
    const customer = pick(rng, mockCustomers);
    const maxDay = m === 5 ? (0, import_dayjs.default)().date() : base.daysInMonth();
    const day = Math.min(dayPool[k % dayPool.length] + Math.floor(rng() * 3), maxDay);
    const date = base.date(day);
    drafts.push({
      customerId: customer.id,
      date: date.format("YYYY-MM-DD"),
      productName: style.name,
      styleNo: style.styleNo,
      orderNo: rng() > 0.4 ? "DD" + date.format("YYYYMMDD") + "-" + String(10 + Math.floor(rng() * 90)) : void 0,
      sizeScale: style.sizeScale,
      cartons: genCartons(style.sizeScale, style.colors),
      status: monthStatus[m][k] ?? "\u5DF2\u51FA\u8D27",
      remark: rng() > 0.85 ? "\u5BA2\u6237\u52A0\u6025\uFF0C\u4F18\u5148\u6392\u4EA7" : void 0
    });
  }
}
drafts.map((d, i) => ({ i, d })).filter(({ i, d }) => i > 0 && d.status === "\u8349\u7A3F" && !(0, import_dayjs.default)().isSame(d.date, "month")).sort((a, b) => b.d.date.localeCompare(a.d.date)).slice(0, 2).forEach(({ i }) => {
  drafts[i].status = "\u5DF2\u53D6\u6D88";
});
var mockPackingLists = [...drafts].sort((a, b) => a.date.localeCompare(b.date)).map((d, i) => ({
  id: "PL" + (0, import_dayjs.default)(d.date).format("YYYY") + "-" + String(i + 1).padStart(3, "0"),
  customerId: d.customerId,
  date: d.date,
  productName: d.productName,
  styleNo: d.styleNo,
  orderNo: d.orderNo,
  sizeScale: d.sizeScale,
  cartons: d.cartons,
  status: d.status,
  remark: d.remark,
  createdAt: d.date + " 17:30"
}));

// src/mocks/statements.ts
var import_dayjs2 = __toESM(require_dayjs_min(), 1);

// src/utils/calc.ts
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
function cartonQty(c) {
  return Object.values(c.sizes).reduce((s, v) => s + (v || 0), 0);
}
function packingQtyBySize(pl) {
  const out = {};
  pl.sizeScale.forEach((sz) => out[sz] = 0);
  pl.cartons.forEach((c) => {
    Object.entries(c.sizes).forEach(([sz, v]) => {
      out[sz] = (out[sz] ?? 0) + (v || 0);
    });
  });
  return out;
}
function packingGrandQty(pl) {
  return pl.cartons.reduce((s, c) => s + cartonQty(c), 0);
}
function cartonCount(pl) {
  return pl.cartons.length;
}
function statementAmount(lines) {
  return round2(lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0));
}
function statementPaid(st) {
  return round2((st.payments ?? []).reduce((s, p) => s + p.amount, 0));
}
function unpaidOf(st) {
  return round2(statementAmount(st.lines) - statementPaid(st));
}
var CN_DIGITS = "\u96F6\u58F9\u8D30\u53C1\u8086\u4F0D\u9646\u67D2\u634C\u7396";
var CN_UNITS = ["", "\u62FE", "\u4F70", "\u4EDF"];
var CN_GROUPS = ["", "\u4E07", "\u4EBF", "\u5146"];
function cnGroup(n) {
  let out = "";
  let pendingZero = false;
  for (let i = 3; i >= 0; i--) {
    const d = Math.floor(n / 10 ** i) % 10;
    if (d === 0) {
      if (out) pendingZero = true;
    } else {
      if (pendingZero) {
        out += "\u96F6";
        pendingZero = false;
      }
      out += CN_DIGITS[d] + CN_UNITS[i];
    }
  }
  return out;
}
function cnInt(n) {
  if (n === 0) return "\u96F6";
  const gs = [];
  let x = n;
  while (x > 0) {
    gs.push(x % 1e4);
    x = Math.floor(x / 1e4);
  }
  let out = "";
  let zeroPending = false;
  for (let i = gs.length - 1; i >= 0; i--) {
    const g = gs[i];
    if (g === 0) {
      zeroPending = out !== "";
      continue;
    }
    if (out && (g < 1e3 || zeroPending)) out += "\u96F6";
    out += cnGroup(g) + CN_GROUPS[i];
    zeroPending = false;
  }
  return out;
}
function rmbInWords(n) {
  const neg = n < 0;
  const cents = Math.round(Math.abs(n) * 100);
  const intPart = Math.floor(cents / 100);
  const jiao = Math.floor(cents % 100 / 10);
  const fen = cents % 10;
  let out = "\u4EBA\u6C11\u5E01" + (neg ? "\u8D1F" : "");
  if (intPart === 0 && jiao === 0 && fen === 0) return out + "\u96F6\u5143\u6574";
  if (intPart > 0) out += cnInt(intPart) + "\u5143";
  if (jiao === 0 && fen === 0) {
    out += "\u6574";
  } else {
    if (jiao > 0) out += CN_DIGITS[jiao] + "\u89D2";
    if (fen > 0) {
      if (jiao === 0 && intPart > 0) out += "\u96F6";
      out += CN_DIGITS[fen] + "\u5206";
    }
  }
  return out;
}

// src/mocks/statements.ts
var rng2 = createRng(20261116);
var sampleStatement = {
  id: "STA2025-001",
  customerId: "CU0001",
  period: "2025-12",
  title: "\u65FA\u5146 2025\u5E7412\u6708\u4EFD\u5BA2\u6237\u5BF9\u5E10\u5355",
  lines: [
    { date: "2025-12-10", name: "\u8D77\u7248\u98CE\u8863", unit: "\u4EF6", quantity: 8, unitPrice: 500, remark: "\u542B1\u70B9\u7A0E" },
    { date: "2025-12-10", name: "\u8D77\u7248\u88E4\u5B50", unit: "\u4EF6", quantity: 8, unitPrice: 500 }
  ],
  status: "\u5DF2\u786E\u8BA4",
  confirmedAt: "2025-12-20 10:30"
};
function titleOf(customerName, period) {
  const [y, m] = period.split("-");
  return customerName + " " + y + "\u5E74" + Number(m) + "\u6708\u4EFD\u5BA2\u6237\u5BF9\u5E10\u5355";
}
var drafts2 = [
  { customerId: "CU0002", period: (0, import_dayjs2.default)().subtract(4, "month").format("YYYY-MM"), pay: "full", confirmed: true },
  { customerId: "CU0003", period: (0, import_dayjs2.default)().subtract(2, "month").format("YYYY-MM"), pay: "partial", confirmed: true },
  { customerId: "CU0004", period: (0, import_dayjs2.default)().subtract(1, "month").format("YYYY-MM"), pay: "none", confirmed: true },
  { customerId: "CU0005", period: (0, import_dayjs2.default)().format("YYYY-MM"), pay: "none", confirmed: false }
];
function buildStatement(d, seq) {
  const customer = mockCustomers.find((c) => c.id === d.customerId);
  const lineCount = 2 + Math.floor(rng2() * 2);
  const lines = [];
  for (let i = 0; i < lineCount; i++) {
    const st = pick(rng2, mockStyles);
    lines.push({
      date: d.period + "-" + String(2 + Math.floor(rng2() * 26)).padStart(2, "0"),
      name: st.name,
      unit: st.unit,
      quantity: 100 + Math.floor(rng2() * 700),
      unitPrice: st.bulkPrice ?? 30,
      remark: rng2() > 0.5 ? "\u542B1\u70B9\u7A0E" : void 0
    });
  }
  const total = round2(lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0));
  const payments = [];
  if (d.pay === "partial") {
    payments.push({
      date: d.period + "-" + String(15 + Math.floor(rng2() * 13)).padStart(2, "0"),
      amount: round2(total * (0.3 + rng2() * 0.4)),
      note: "\u90E8\u5206\u8D27\u6B3E"
    });
  } else if (d.pay === "full") {
    const p1Date = d.period + "-" + String(15 + Math.floor(rng2() * 10)).padStart(2, "0");
    const p1 = round2(total * 0.6);
    payments.push({ date: p1Date, amount: p1, note: "\u8D27\u6B3E\uFF0860%\uFF09" });
    payments.push({
      date: (0, import_dayjs2.default)(p1Date).add(10 + Math.floor(rng2() * 10), "day").format("YYYY-MM-DD"),
      amount: round2(total - p1),
      note: "\u8D27\u6B3E\u7ED3\u6E05"
    });
  }
  return {
    id: "STA" + d.period.slice(0, 4) + "-" + String(seq).padStart(3, "0"),
    customerId: d.customerId,
    period: d.period,
    title: titleOf(customer?.name ?? d.customerId, d.period),
    lines,
    status: d.confirmed ? "\u5DF2\u786E\u8BA4" : "\u5F85\u786E\u8BA4",
    confirmedAt: d.confirmed ? d.period + "-28 10:00" : void 0,
    payments: payments.length ? payments : void 0
  };
}
var mockStatements = [
  sampleStatement,
  ...drafts2.slice().sort((a, b) => a.period.localeCompare(b.period)).map((d, i) => buildStatement(d, i + 1))
];

// scripts/check-data.ts
var issues = 0;
var warn = (...args) => {
  issues++;
  console.log("\u274C", ...args);
};
var j34 = mockPackingLists.find((p) => p.styleNo === "J34" && p.date === "2026-06-21");
if (!j34) {
  warn("\u672A\u627E\u5230 J34 \u6837\u4F8B\u88C5\u7BB1\u5355\uFF082026-06-21\uFF09");
} else {
  const bySize = packingQtyBySize(j34);
  console.log("J34 \u5404\u7801\u5408\u8BA1:", bySize, " \u603B\u4EF6:", packingGrandQty(j34), " \u7BB1\u6570:", cartonCount(j34));
  if (cartonCount(j34) !== 11) warn("J34 \u7BB1\u6570\u5E94\u4E3A 11\uFF0C\u5B9E\u9645", cartonCount(j34));
  if (packingGrandQty(j34) !== 505) warn("J34 \u603B\u4EF6\u6570\u5E94\u4E3A 505\uFF0C\u5B9E\u9645", packingGrandQty(j34));
  const expect = { S: 140, M: 160, L: 170, XL: 30, XXL: 5 };
  Object.entries(expect).forEach(([sz, v]) => {
    if ((bySize[sz] ?? 0) !== v) warn("J34 " + sz + " \u7801\u5408\u8BA1\u5E94\u4E3A " + v + "\uFF0C\u5B9E\u9645", bySize[sz]);
  });
  const cust = mockCustomers.find((c) => c.id === j34.customerId);
  if (cust?.name !== "\u65FA\u5146") warn("J34 \u5BA2\u6237\u5E94\u4E3A \u65FA\u5146\uFF0C\u5B9E\u9645", cust?.name);
  if (j34.status !== "\u5DF2\u51FA\u8D27") warn("J34 \u72B6\u6001\u5E94\u4E3A \u5DF2\u51FA\u8D27\uFF0C\u5B9E\u9645", j34.status);
  j34.cartons.forEach((c, i) => {
    if (c.cartonNo !== i + 1) warn("J34 \u7BB1\u53F7\u4E0D\u8FDE\u7EED:", c.cartonNo);
  });
}
var wz = mockStatements.find((s) => s.period === "2025-12");
if (!wz) {
  warn("\u672A\u627E\u5230\u65FA\u5146 2025-12 \u5BF9\u8D26\u5355");
} else {
  const amt = statementAmount(wz.lines);
  console.log("\u65FA\u5146\u5BF9\u8D26\u5355\u91D1\u989D:", amt, " \u672A\u6536:", unpaidOf(wz));
  if (amt !== 8e3) warn("\u5BF9\u8D26\u5355\u5408\u8BA1\u5E94\u4E3A 8000\uFF0C\u5B9E\u9645", amt);
  if (wz.lines.length !== 2) warn("\u6837\u4F8B\u5BF9\u8D26\u5355\u5E94\u4E3A 2 \u884C\uFF0C\u5B9E\u9645", wz.lines.length);
  else {
    if (statementAmount([wz.lines[0]]) !== 4e3) warn("\u7B2C\u4E00\u884C\u91D1\u989D\u5E94\u4E3A 4000");
    if (statementAmount([wz.lines[1]]) !== 4e3) warn("\u7B2C\u4E8C\u884C\u91D1\u989D\u5E94\u4E3A 4000");
  }
  if (unpaidOf(wz) !== 8e3) warn("\u65FA\u5146\u5BF9\u8D26\u5355\u5E94\u672A\u6536\u6B3E 8000\uFF0C\u5B9E\u9645", unpaidOf(wz));
  if (wz.status !== "\u5DF2\u786E\u8BA4") warn("\u65FA\u5146\u5BF9\u8D26\u5355\u5E94\u5DF2\u786E\u8BA4");
  if (wz.title !== "\u65FA\u5146 2025\u5E7412\u6708\u4EFD\u5BA2\u6237\u5BF9\u5E10\u5355") warn("\u5BF9\u8D26\u5355\u6807\u9898\u4E0D\u7B26:", wz.title);
}
console.log("\u88C5\u7BB1\u5355\u603B\u6570:", mockPackingLists.length, " \u5BF9\u8D26\u5355\u603B\u6570:", mockStatements.length);
mockPackingLists.forEach((pl) => {
  pl.cartons.forEach((c, i) => {
    if (c.cartonNo !== i + 1) warn("\u7BB1\u53F7\u4E0D\u8FDE\u7EED:", pl.id, "\u7B2C", i + 1, "\u884C\u7BB1\u53F7", c.cartonNo);
  });
  if (packingGrandQty(pl) <= 0) warn("\u88C5\u7BB1\u5355\u603B\u4EF6\u6570\u4E3A 0:", pl.id);
});
var statusSet = new Set(mockPackingLists.map((p) => p.status));
["\u8349\u7A3F", "\u5DF2\u51FA\u8D27", "\u5DF2\u5BF9\u8D26", "\u5DF2\u53D6\u6D88"].forEach((s) => {
  if (!statusSet.has(s)) warn("\u7F3A\u5C11\u88C5\u7BB1\u5355\u72B6\u6001\u8986\u76D6:", s);
});
console.log(
  "\u72B6\u6001\u5206\u5E03:",
  mockPackingLists.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {})
);
var hasUnpaid = false;
mockStatements.forEach((st) => {
  const due = unpaidOf(st);
  if (due < -0.01) warn("\u5BF9\u8D26\u5355\u8D85\u6536:", st.id, due);
  if (due > 5e-3) hasUnpaid = true;
});
if (!hasUnpaid) warn("\u6CA1\u6709\u4EFB\u4F55\u672A\u6536\u6B3E\u5BF9\u8D26\u5355\uFF0C\u4EEA\u8868\u76D8\u5E94\u6536\u4E3A\u7A7A");
var periods = new Set(mockPackingLists.map((p) => p.date.slice(0, 7)));
console.log("\u88C5\u7BB1\u5355\u8986\u76D6\u6708\u4EFD:", [...periods].sort().join(", "));
if (periods.size < 6) warn("\u88C5\u7BB1\u5355\u6708\u4EFD\u8986\u76D6\u4E0D\u8DB3 6 \u4E2A\u6708");
console.log("rmbInWords(0)       =", rmbInWords(0));
console.log("rmbInWords(10)      =", rmbInWords(10));
console.log("rmbInWords(100000)  =", rmbInWords(1e5));
console.log("rmbInWords(8000)    =", rmbInWords(8e3));
console.log("rmbInWords(1234.56) =", rmbInWords(1234.56));
console.log("rmbInWords(1000.05) =", rmbInWords(1000.05));
var rmbExpect = [
  [0, "\u4EBA\u6C11\u5E01\u96F6\u5143\u6574"],
  [10, "\u4EBA\u6C11\u5E01\u58F9\u62FE\u5143\u6574"],
  [1e5, "\u4EBA\u6C11\u5E01\u58F9\u62FE\u4E07\u5143\u6574"],
  [8e3, "\u4EBA\u6C11\u5E01\u634C\u4EDF\u5143\u6574"],
  [1234.56, "\u4EBA\u6C11\u5E01\u58F9\u4EDF\u8D30\u4F70\u53C1\u62FE\u8086\u5143\u4F0D\u89D2\u9646\u5206"],
  [1000.05, "\u4EBA\u6C11\u5E01\u58F9\u4EDF\u5143\u96F6\u4F0D\u5206"]
];
rmbExpect.forEach(([n, expectStr]) => {
  if (rmbInWords(n) !== expectStr) warn("rmbInWords(" + n + ") \u5E94\u4E3A " + expectStr + "\uFF0C\u5B9E\u9645", rmbInWords(n));
});
var styleNos = new Set(mockStyles.map((s) => s.styleNo));
if (styleNos.size !== mockStyles.length) warn("\u6B3E\u53F7\u5B58\u5728\u91CD\u590D");
var nowMonth = (0, import_dayjs3.default)().format("YYYY-MM");
var monthActive = mockPackingLists.filter((p) => (0, import_dayjs3.default)(p.date).isSame(nowMonth, "month") && p.status !== "\u5DF2\u53D6\u6D88");
var monthShipped = mockPackingLists.filter(
  (p) => (0, import_dayjs3.default)(p.date).isSame(nowMonth, "month") && (p.status === "\u5DF2\u51FA\u8D27" || p.status === "\u5DF2\u5BF9\u8D26")
);
var monthQty = monthShipped.reduce((s, p) => s + packingGrandQty(p), 0);
console.log("\u672C\u6708\u88C5\u7BB1\u5355\uFF08\u975E\u53D6\u6D88\uFF09:", monthActive.length, " \u672C\u6708\u51FA\u8D27\u4EF6\u6570:", monthQty);
if (monthActive.length === 0) warn("\u672C\u6708\u6CA1\u6709\u4EFB\u4F55\u6709\u6548\u88C5\u7BB1\u5355\uFF0C\u4EEA\u8868\u76D8\u300C\u672C\u6708\u88C5\u7BB1\u5355\u6570\u300D\u5C06\u4E3A 0");
if (monthQty <= 0) warn("\u672C\u6708\u51FA\u8D27\u4EF6\u6570\u4E3A 0\uFF0C\u4EEA\u8868\u76D8\u300C\u672C\u6708\u51FA\u8D27\u4EF6\u6570\u300D\u5C06\u4E3A 0");
var monthStatement = mockStatements.find((s) => s.period === nowMonth);
if (!monthStatement) {
  warn("\u7F3A\u5C11\u672C\u6708\uFF08" + nowMonth + "\uFF09\u5BF9\u8D26\u5355\uFF0C\u4EEA\u8868\u76D8\u300C\u672C\u6708\u5BF9\u8D26\u91D1\u989D\u300D\u5C06\u4E3A 0");
} else {
  console.log("\u672C\u6708\u5BF9\u8D26\u5355:", monthStatement.id, " \u91D1\u989D:", statementAmount(monthStatement.lines));
}
console.log(issues === 0 ? "\u2705 \u5168\u90E8\u6821\u9A8C\u901A\u8FC7" : `\u26A0 \u5171 ${issues} \u4E2A\u95EE\u9898`);
