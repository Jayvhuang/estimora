/* Estimora — construction & DIY material estimator engine
 * 10 client-side estimators. Everything runs locally in the browser.
 * Bilingual (EN / 中文) via bi-en / bi-zh spans toggled by <html data-lang>.
 */
(function () {
  "use strict";

  // ---------- unit constants ----------
  var M_FT = 0.3048, M_IN = 0.0254, M_YD = 0.9144, M_CM = 0.01, M_MM = 0.001;
  var M2_FT2 = 0.09290304;
  var M3_FT3 = 0.028316846592, M3_YD3 = 0.764554857984;
  var L_GAL = 3.785411784;
  var KG_LB = 0.45359237;

  // generic numeric conversions: imperial value * factor = metric value
  var CONV = {
    area: M2_FT2,          // ft² -> m²
    dens: 16.018463,       // lb/ft³ -> kg/m³
    cov: 0.02454249        // ft²/gal -> m²/L
  };
  var CONV_UNIT = {
    area: { imp: "ft²", met: "m²" },
    dens: { imp: "lb/ft³", met: "kg/m³" },
    cov: { imp: "ft²/gal", met: "m²/L" }
  };

  var state = { lang: "en", theme: "light", sys: "imperial" };
  var params = new URLSearchParams(window.location.search);
  var landingTool = (window.ESTIMORA_TOOL || null);

  // ---------- i18n chrome ----------
  var I18N = {
    en: {
      nav_tools: "Estimators", nav_how: "How it works", nav_faq: "FAQ", nav_privacy: "Privacy",
      hero_eyebrow: "Free · Private · No sign-up",
      hero_title: "Know exactly what to buy before you drive to the store",
      hero_sub: "Ten construction and DIY material estimators that turn your room dimensions into a real shopping list — bags, boxes, sheets, bundles and boards. Type feet-and-inches or metric, either works.",
      hero_cta: "Open the estimators",
      hp1: "Type 12' 6\" or 3.8 m — both parse",
      hp2: "Results rounded to what you actually buy",
      hp3: "Live scale diagram on every tool",
      hp4: "Runs 100% in your browser",
      tools_title: "Ten material estimators",
      tools_sub: "Pick a job, enter the dimensions, and get quantities rounded up to purchasable units with a waste allowance you control.",
      how_title: "How Estimora works",
      how_sub: "Every estimate follows the same three steps — the same ones an estimator uses on site.",
      how1_t: "1. Geometry", how1_d: "Your dimensions become an area or a volume. Openings such as doors and windows are subtracted where they matter.",
      how2_t: "2. Coverage", how2_d: "That quantity is divided by the coverage rate of the material — square feet per gallon, cubic feet per bag, tiles per box.",
      how3_t: "3. Waste & rounding", how3_d: "A waste factor covers cuts, breakage and offcuts. The result is rounded up to whole bags, boxes, sheets or bundles, because that is how materials are sold.",
      sources_title: "Where the numbers come from",
      faq_title: "Frequently asked questions",
      amazon_title: "Measuring & layout tools",
      amazon_disclosure: "Estimora is an Amazon Associate. As an Amazon Associate we earn from qualifying purchases. This does not change what you pay.",
      footer_tagline: "Estimora — private, browser-based construction material estimators.",
      footer_privacy: "Privacy Policy",
      footer_disclaimer: "Estimora is an estimating aid for planning and budgeting, not an engineering service. Coverage rates and material densities vary by product and supplier — always check the packaging and, for structural work, consult a qualified professional and your local building code.",
      footer_rights: "© 2026 Estimora. All calculations run locally in your browser.",
      back_all: "← All estimators",
      unit_imp: "Feet & inches", unit_met: "Metres & cm"
    },
    zh: {
      nav_tools: "计算器", nav_how: "工作原理", nav_faq: "常见问题", nav_privacy: "隐私",
      hero_eyebrow: "免费 · 隐私优先 · 无需注册",
      hero_title: "出门买料前，先算清楚到底要买多少",
      hero_sub: "十款装修与建材用量计算器，把房间尺寸直接换算成真实的采购清单——多少袋、多少箱、多少张、多少捆、多少根。英尺英寸或公制输入都能识别。",
      hero_cta: "打开计算器",
      hp1: "输入 12' 6\" 或 3.8 m 都能解析",
      hp2: "结果按实际售卖单位向上取整",
      hp3: "每个工具都有实时示意图",
      hp4: "100% 在你的浏览器本地运行",
      tools_title: "十款建材用量计算器",
      tools_sub: "选择施工项目，输入尺寸，即可得到按采购单位向上取整的用量，损耗率可自行调整。",
      how_title: "Estimora 的工作原理",
      how_sub: "每一次估算都遵循同样三步——和工地上造价员的做法一致。",
      how1_t: "1. 几何量", how1_d: "先把尺寸换算成面积或体积，并在需要时扣除门窗等洞口。",
      how2_t: "2. 覆盖率", how2_d: "再用材料的覆盖率去除：每加仑涂多少平方英尺、每袋多少立方英尺、每箱多少块砖。",
      how3_t: "3. 损耗与取整", how3_d: "损耗率用于覆盖切割、破损和边角料，最后按整袋、整箱、整张、整捆向上取整——因为材料就是这样卖的。",
      sources_title: "数据依据",
      faq_title: "常见问题",
      amazon_title: "测量与放线工具",
      amazon_disclosure: "Estimora 是 Amazon Associates 会员。作为会员，我们会从符合条件的购买中获得佣金，这不会影响你的支付价格。",
      footer_tagline: "Estimora —— 隐私优先、基于浏览器的建材用量计算器。",
      footer_privacy: "隐私政策",
      footer_disclaimer: "Estimora 是用于规划与预算的估算辅助工具，不是工程设计服务。不同产品与供应商的覆盖率、材料密度会有差异——请以包装标注为准；涉及结构安全的工程，请咨询有资质的专业人员并遵守当地建筑规范。",
      footer_rights: "© 2026 Estimora。所有计算均在你的浏览器本地运行。",
      back_all: "← 返回全部计算器",
      unit_imp: "英尺 / 英寸", unit_met: "米 / 厘米"
    }
  };

  // ---------- helpers ----------
  function bi(en, zh) { return '<span class="bi-en">' + en + '</span><span class="bi-zh">' + zh + '</span>'; }
  function L(en, zh) { return state.lang === "zh" ? zh : en; }
  function isImp() { return state.sys === "imperial"; }
  function num(x, dp) {
    if (!isFinite(x)) return "—";
    var d = (dp === undefined) ? 2 : dp;
    return x.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });
  }
  function up(x) { return Math.ceil(x - 1e-9); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  // ---------- length parsing ----------
  var UNIT_M = {
    "mm": M_MM, "cm": M_CM, "m": 1, "km": 1000,
    "ft": M_FT, "foot": M_FT, "feet": M_FT, "'": M_FT,
    "in": M_IN, "inch": M_IN, "inches": M_IN, '"': M_IN,
    "yd": M_YD, "yard": M_YD, "yards": M_YD
  };
  var TOKEN_RE = /((?:\d+\s+)?\d+\s*\/\s*\d+|\d*\.?\d+)\s*(mm|cm|km|m|ft|feet|foot|inches|inch|in|yards|yard|yd|'|")?/g;

  function numFromToken(t) {
    t = t.trim();
    if (t.indexOf("/") >= 0) {
      var mixed = t.split(/\s+/);
      if (mixed.length === 2) {
        var fr = mixed[1].split("/");
        return parseFloat(mixed[0]) + parseFloat(fr[0]) / parseFloat(fr[1]);
      }
      var f = t.split("/");
      return parseFloat(f[0]) / parseFloat(f[1]);
    }
    return parseFloat(t);
  }

  /** Parse a length string into metres. Bare numbers use the active unit system. */
  function parseLen(raw) {
    if (raw === null || raw === undefined) return NaN;
    var s = String(raw).toLowerCase().replace(/[’′]/g, "'").replace(/[”″]/g, '"').replace(/,/g, "").trim();
    if (!s) return NaN;
    TOKEN_RE.lastIndex = 0;
    var total = 0, found = false, prevUnit = null, m;
    while ((m = TOKEN_RE.exec(s)) !== null) {
      if (m[0].trim() === "") { if (TOKEN_RE.lastIndex <= m.index) TOKEN_RE.lastIndex++; continue; }
      var v = numFromToken(m[1]);
      if (!isFinite(v)) continue;
      var u = m[2];
      var factor;
      if (u) {
        factor = UNIT_M[u];
        prevUnit = u;
      } else if (prevUnit === "ft" || prevUnit === "'" || prevUnit === "feet" || prevUnit === "foot") {
        factor = M_IN; // "12' 6" -> second bare number is inches
      } else {
        factor = isImp() ? M_FT : 1;
      }
      total += v * factor;
      found = true;
    }
    return found ? total : NaN;
  }

  /** Format metres for an input box, in a form parseLen can read back. */
  function lenInput(m) {
    if (!isFinite(m)) return "";
    if (isImp()) {
      var totIn = m / M_IN;
      if (totIn < 12) return (Math.round(totIn * 1000) / 1000) + '"';
      var ft = Math.floor(totIn / 12 + 1e-9);
      var inch = Math.round((totIn - ft * 12) * 100) / 100;
      if (inch >= 12) { ft += 1; inch = 0; }
      return inch > 0 ? (ft + "' " + inch + '"') : (ft + "'");
    }
    if (m < 1) {
      var mm = m / M_MM;
      if (mm < 100) return (Math.round(mm * 10) / 10) + " mm";
      return (Math.round(m / M_CM * 10) / 10) + " cm";
    }
    return (Math.round(m * 1000) / 1000) + " m";
  }

  /** Human display of a length. */
  function lenTxt(m) {
    if (!isFinite(m)) return "—";
    if (isImp()) {
      var totIn = m / M_IN;
      if (totIn < 12) return num(totIn, 2) + " in";
      var ft = Math.floor(totIn / 12 + 1e-9);
      var inch = Math.round((totIn - ft * 12) * 10) / 10;
      if (inch >= 12) { ft += 1; inch = 0; }
      return inch > 0 ? (ft + "′ " + inch + "″") : (ft + " ft");
    }
    if (m < 1) return num(m / M_MM, 0) + " mm";
    return num(m, 3) + " m";
  }
  function areaTxt(m2) {
    return isImp() ? num(m2 / M2_FT2, 1) + " ft²" : num(m2, 2) + " m²";
  }
  function volTxt(m3) {
    return isImp() ? num(m3 / M3_YD3, 2) + " yd³" : num(m3, 2) + " m³";
  }
  function volSub(m3) {
    return isImp() ? num(m3 / M3_FT3, 1) + " ft³ · " + num(m3, 2) + " m³"
                   : num(m3 / M3_YD3, 2) + " yd³ · " + num(m3 / M3_FT3, 1) + " ft³";
  }

  // ---------- SVG helpers ----------
  function svgWrap(inner, h) {
    return '<svg viewBox="0 0 340 ' + (h || 210) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + L("estimate diagram", "示意图") + '">' + inner + '</svg>';
  }
  function rect(x, y, w, h, cls, extra) {
    return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(0, w).toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '" class="' + cls + '" ' + (extra || "") + '/>';
  }
  function poly(pts, cls) {
    return '<polygon points="' + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" class="' + cls + '"/>';
  }
  function line(x1, y1, x2, y2, cls) {
    return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" class="' + cls + '"/>';
  }
  function txt(x, y, t, cls, anchor) {
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" class="' + (cls || "lbl") + '" text-anchor="' + (anchor || "middle") + '">' + esc(t) + "</text>";
  }
  /** Scale a w×h footprint into a box of maxW×maxH, preserving aspect ratio. */
  function fitBox(w, h, maxW, maxH) {
    w = (w > 0 && isFinite(w)) ? w : 1;
    h = (h > 0 && isFinite(h)) ? h : 1;
    var s = Math.min(maxW / w, maxH / h);
    return { w: w * s, h: h * s };
  }

  // ---------- reference data (industry-typical; user-adjustable where it matters) ----------
  // Concrete mix bag yields follow the manufacturer's printed yield for pre-mixed concrete.
  var BAGS = {
    "80lb": { m3: 0.6 * M3_FT3, en: "80 lb bag (0.60 ft³)", zh: "80 磅袋（0.60 ft³）" },
    "60lb": { m3: 0.45 * M3_FT3, en: "60 lb bag (0.45 ft³)", zh: "60 磅袋（0.45 ft³）" },
    "40lb": { m3: 0.30 * M3_FT3, en: "40 lb bag (0.30 ft³)", zh: "40 磅袋（0.30 ft³）" },
    "20kg": { m3: 0.0092, en: "20 kg bag (≈9.2 L)", zh: "20 kg 袋（≈9.2 L）" },
    "25kg": { m3: 0.0115, en: "25 kg bag (≈11.5 L)", zh: "25 kg 袋（≈11.5 L）" }
  };

  // ---------- tool definitions ----------
  var TOOLS = [];

  // 1 — CONCRETE ---------------------------------------------------------
  TOOLS.push({
    id: "concrete", slug: "concrete",
    title: bi("Concrete", "混凝土"),
    h1: bi("Concrete Calculator", "混凝土用量计算器"),
    desc: bi("Volume and bag count for slabs, footings and round columns.",
             "计算地坪、基础和圆柱的混凝土体积与袋数。"),
    inputs: [
      { key: "shape", type: "sel", en: "Pour type", zh: "浇筑类型", def: "slab", options: [
        { v: "slab", en: "Slab / patio / driveway", zh: "地坪 / 露台 / 车道" },
        { v: "footing", en: "Footing / strip foundation", zh: "条形基础" },
        { v: "column", en: "Round column / post hole", zh: "圆柱 / 立柱孔" }
      ] },
      { key: "len", type: "len", en: "Length", zh: "长度", def: 3.048, when: function (v) { return v.shape !== "column"; } },
      { key: "wid", type: "len", en: "Width", zh: "宽度", def: 3.048, when: function (v) { return v.shape !== "column"; } },
      { key: "thk", type: "len", en: "Thickness / depth", zh: "厚度 / 深度", def: 0.1016, when: function (v) { return v.shape !== "column"; } },
      { key: "dia", type: "len", en: "Diameter", zh: "直径", def: 0.3048, when: function (v) { return v.shape === "column"; } },
      { key: "hgt", type: "len", en: "Height / depth", zh: "高度 / 深度", def: 0.9144, when: function (v) { return v.shape === "column"; } },
      { key: "qty", type: "num", en: "How many", zh: "数量", def: 4, min: 1, when: function (v) { return v.shape === "column"; } },
      { key: "waste", type: "num", en: "Waste allowance %", zh: "损耗率 %", def: 10, min: 0 },
      { key: "bag", type: "sel", en: "Bag size", zh: "袋装规格", def: "80lb", options: [
        { v: "80lb", en: "80 lb (0.60 ft³ yield)", zh: "80 磅（0.60 ft³）" },
        { v: "60lb", en: "60 lb (0.45 ft³ yield)", zh: "60 磅（0.45 ft³）" },
        { v: "40lb", en: "40 lb (0.30 ft³ yield)", zh: "40 磅（0.30 ft³）" },
        { v: "20kg", en: "20 kg (≈9.2 L yield)", zh: "20 kg（≈9.2 L）" },
        { v: "25kg", en: "25 kg (≈11.5 L yield)", zh: "25 kg（≈11.5 L）" }
      ] }
    ],
    compute: function (v) {
      var base, detail;
      if (v.shape === "column") {
        if (!(v.dia > 0 && v.hgt > 0)) return { error: L("Enter a diameter and a height.", "请输入直径与高度。") };
        var n = Math.max(1, Math.round(v.qty || 1));
        base = Math.PI * Math.pow(v.dia / 2, 2) * v.hgt * n;
        detail = "V = π × (d/2)² × h × " + n;
      } else {
        if (!(v.len > 0 && v.wid > 0 && v.thk > 0)) return { error: L("Enter length, width and thickness.", "请输入长度、宽度和厚度。") };
        base = v.len * v.wid * v.thk;
        detail = "V = L × W × T";
      }
      var waste = Math.max(0, v.waste || 0);
      var total = base * (1 + waste / 100);
      var bag = BAGS[v.bag] || BAGS["80lb"];
      var bags = up(total / bag.m3);
      var readyMix = isImp() ? (Math.ceil(total / M3_YD3 * 4) / 4) : (Math.ceil(total * 4) / 4);
      return {
        results: [
          { en: "Volume (no waste)", zh: "净体积", val: volTxt(base), sub: volSub(base) },
          { en: "Volume + " + waste + "% waste", zh: "含 " + waste + "% 损耗", val: volTxt(total), sub: volSub(total), accent: true },
          { en: "Bags needed", zh: "需要袋数", val: num(bags, 0) + L(" bags", " 袋"), sub: L(bag.en, bag.zh) },
          { en: "Ready-mix order", zh: "商品混凝土", val: isImp() ? num(readyMix, 2) + " yd³" : num(readyMix, 2) + " m³", sub: L("rounded to ¼ unit", "按 ¼ 单位取整") }
        ],
        buy: [
          { en: bag.en, zh: bag.zh, qty: num(bags, 0) + L(" bags", " 袋") },
          { en: "or ready-mix delivery", zh: "或商品混凝土配送", qty: isImp() ? num(readyMix, 2) + " yd³" : num(readyMix, 2) + " m³" }
        ],
        formula: { en: detail + " ; total = V × (1 + waste)", zh: detail + " ；总量 = V × (1 + 损耗率)" },
        note: {
          en: "Bag yields are the manufacturer's printed yield for pre-mixed concrete. Ready-mix suppliers usually have a minimum order (often 1 yd³ / 1 m³) — check before ordering.",
          zh: "袋装出料量采用预拌混凝土包装标注值。商品混凝土通常有最小起订量（常见 1 yd³ / 1 m³），下单前请先确认。"
        }
      };
    },
    svg: function (v) {
      if (v.shape === "column") {
        var n = Math.min(5, Math.max(1, Math.round(v.qty || 1)));
        var s = "", gap = 300 / (n + 1);
        var ratio = (v.dia > 0 && v.hgt > 0) ? Math.min(2.2, Math.max(0.25, v.dia / v.hgt)) : 0.35;
        var ch = 120, cw = Math.min(gap * 0.75, ch * ratio);
        for (var i = 0; i < n; i++) {
          var cx = 20 + gap * (i + 1);
          s += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + (60).toFixed(1) + '" rx="' + (cw / 2).toFixed(1) + '" ry="' + (cw / 5).toFixed(1) + '" class="shape-top"/>';
          s += rect(cx - cw / 2, 60, cw, ch, "shape-side");
          s += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + (60 + ch).toFixed(1) + '" rx="' + (cw / 2).toFixed(1) + '" ry="' + (cw / 5).toFixed(1) + '" class="shape"/>';
        }
        s += line(20, 60, 20, 180, "dim") + txt(14, 122, L("h", "高"), "dimtxt", "end");
        s += txt(170, 200, L("Round columns: V = π(d/2)²h", "圆柱：V = π(d/2)²h"), "lbl");
        return svgWrap(s);
      }
      var f = fitBox(v.len || 1, v.wid || 1, 210, 96);
      var x0 = 60, y0 = 52, dx = 44, dy = -26;
      var thkPx = Math.max(8, Math.min(46, ((v.thk || 0.1) / Math.max(v.len || 3, 0.1)) * f.w * 3));
      var A = [x0, y0 + f.h], B = [x0 + f.w, y0 + f.h], C = [x0 + f.w + dx, y0 + f.h + dy], D = [x0 + dx, y0 + f.h + dy];
      var s2 = "";
      s2 += poly([[A[0], A[1] + thkPx], [B[0], B[1] + thkPx], B, A], "shape-side");
      s2 += poly([[B[0], B[1] + thkPx], [C[0], C[1] + thkPx], C, B], "shape-side");
      s2 += poly([A, B, C, D], "shape-top");
      s2 += line(A[0] - 12, A[1], A[0] - 12, A[1] + thkPx, "dim") + txt(A[0] - 18, A[1] + thkPx / 2 + 4, "T", "dimtxt", "end");
      s2 += txt((A[0] + B[0]) / 2, A[1] + thkPx + 22, "L", "dimtxt");
      s2 += txt((B[0] + C[0]) / 2 + 16, (B[1] + C[1]) / 2, "W", "dimtxt", "start");
      s2 += txt(170, 200, L("Slab volume = L × W × T", "地坪体积 = 长 × 宽 × 厚"), "lbl");
      return svgWrap(s2);
    }
  });

  // 2 — PAINT ------------------------------------------------------------
  TOOLS.push({
    id: "paint", slug: "paint",
    title: bi("Paint", "油漆涂料"),
    h1: bi("Paint Calculator", "油漆用量计算器"),
    desc: bi("How many gallons or litres a room needs, after subtracting doors and windows.",
             "扣除门窗后，计算房间需要多少加仑或升的涂料。"),
    inputs: [
      { key: "len", type: "len", en: "Room length", zh: "房间长度", def: 4.267 },
      { key: "wid", type: "len", en: "Room width", zh: "房间宽度", def: 3.658 },
      { key: "hgt", type: "len", en: "Wall height", zh: "墙面高度", def: 2.438 },
      { key: "doors", type: "num", en: "Doors", zh: "门（扇）", def: 1, min: 0 },
      { key: "wins", type: "num", en: "Windows", zh: "窗（扇）", def: 2, min: 0 },
      { key: "coats", type: "num", en: "Coats", zh: "涂刷遍数", def: 2, min: 1 },
      { key: "ceil", type: "sel", en: "Include ceiling", zh: "是否含天花", def: "no", options: [
        { v: "no", en: "Walls only", zh: "仅墙面" }, { v: "yes", en: "Walls + ceiling", zh: "墙面 + 天花" }
      ] },
      { key: "cover", type: "sel", en: "Coverage rate", zh: "覆盖率", def: "350", options: [
        { v: "350", en: "350 ft²/gal (8.6 m²/L) — smooth, painted before", zh: "350 ft²/gal（8.6 m²/L）—— 平整旧墙" },
        { v: "300", en: "300 ft²/gal (7.4 m²/L) — light texture", zh: "300 ft²/gal（7.4 m²/L）—— 轻微拉毛" },
        { v: "250", en: "250 ft²/gal (6.1 m²/L) — rough / porous", zh: "250 ft²/gal（6.1 m²/L）—— 粗糙 / 吸水面" },
        { v: "400", en: "400 ft²/gal (9.8 m²/L) — premium, sealed", zh: "400 ft²/gal（9.8 m²/L）—— 高遮盖已封闭面" }
      ] }
    ],
    compute: function (v) {
      if (!(v.len > 0 && v.wid > 0 && v.hgt > 0)) return { error: L("Enter the room length, width and wall height.", "请输入房间长、宽和墙高。") };
      var doorA = 1.858, winA = 1.394; // 3'0"×6'8" door, 3'×5' window
      var perim = 2 * (v.len + v.wid);
      var wall = perim * v.hgt;
      var openings = Math.max(0, v.doors || 0) * doorA + Math.max(0, v.wins || 0) * winA;
      var net = Math.max(0, wall - openings);
      var ceilA = (v.ceil === "yes") ? v.len * v.wid : 0;
      var paintable = net + ceilA;
      var coats = Math.max(1, Math.round(v.coats || 1));
      var covM2L = parseFloat(v.cover) * CONV.cov; // ft²/gal -> m²/L
      var litres = paintable * coats / covM2L;
      var gallons = litres / L_GAL;
      var cans;
      if (isImp()) {
        var five = Math.floor(gallons / 5);
        var rest = up(gallons - five * 5);
        if (five > 0 && rest === 0) cans = five + L(" × 5-gal bucket", " × 5 加仑桶");
        else if (five > 0) cans = five + L(" × 5-gal + ", " × 5 加仑桶 + ") + rest + L(" × 1-gal", " × 1 加仑");
        else cans = up(gallons) + L(" × 1-gal can", " × 1 加仑罐");
      } else {
        var tens = Math.floor(litres / 10), r2 = up((litres - tens * 10) / 4);
        cans = (tens > 0 ? tens + L(" × 10 L", " × 10 L") + (r2 > 0 ? " + " : "") : "") + (r2 > 0 || tens === 0 ? (r2 || up(litres / 4)) + L(" × 4 L", " × 4 L") : "");
      }
      return {
        results: [
          { en: "Wall area (gross)", zh: "墙面毛面积", val: areaTxt(wall), sub: L("perimeter × height", "周长 × 高度") },
          { en: "Openings deducted", zh: "扣除洞口", val: areaTxt(openings), sub: L("door 20 ft² · window 15 ft²", "门 20 ft² · 窗 15 ft²") },
          { en: "Paintable area", zh: "可涂面积", val: areaTxt(paintable), sub: (v.ceil === "yes" ? L("walls + ceiling", "墙面 + 天花") : L("walls only", "仅墙面")) },
          { en: "Paint for " + coats + " coat(s)", zh: coats + " 遍用量", val: isImp() ? num(gallons, 2) + " gal" : num(litres, 1) + " L", sub: isImp() ? num(litres, 1) + " L" : num(gallons, 2) + " gal", accent: true }
        ],
        buy: [
          { en: "Paint", zh: "涂料", qty: cans },
          { en: "Primer (bare or patched surfaces)", zh: "底漆（新面或修补面）", qty: L("about 1 coat of the same area", "约同面积一遍用量") }
        ],
        formula: {
          en: "area = 2(L+W) × H − openings ; paint = area × coats ÷ coverage",
          zh: "面积 = 2(长+宽) × 高 − 洞口 ；用量 = 面积 × 遍数 ÷ 覆盖率"
        },
        note: {
          en: "Deductions use a standard 3′0″×6′8″ door (20 ft² / 1.86 m²) and a 3′×5′ window (15 ft² / 1.39 m²). Coverage on the can is measured on a smooth sealed surface — bare drywall, deep colour changes and rollers with a thick nap all use more.",
          zh: "扣除按标准 3′0″×6′8″ 门（20 ft² / 1.86 m²）与 3′×5′ 窗（15 ft² / 1.39 m²）计算。罐体标注的覆盖率是在平整封闭基面上测得的——新石膏板、深浅色大跨度变化、长毛滚筒都会更费漆。"
        }
      };
    },
    svg: function (v) {
      var f = fitBox(v.len || 4, v.hgt || 2.4, 190, 92);
      var x = 46, y = 46, W = f.w, H = f.h;
      var s = rect(x, y, W, H, "shape");
      // side wall in perspective
      var dx = 52, dy = -22;
      s += poly([[x + W, y], [x + W + dx, y + dy], [x + W + dx, y + H + dy], [x + W, y + H]], "shape-side");
      s += poly([[x, y], [x + W, y], [x + W + dx, y + dy], [x + dx, y + dy]], "shape-top");
      var nd = Math.min(2, Math.max(0, Math.round(v.doors || 0)));
      var nw = Math.min(3, Math.max(0, Math.round(v.wins || 0)));
      for (var i = 0; i < nd; i++) {
        var dw = Math.min(24, W / 5), dh = Math.min(H * 0.72, 48);
        s += rect(x + 14 + i * (dw + 10), y + H - dh, dw, dh, "opening");
      }
      for (var j = 0; j < nw; j++) {
        var ww = Math.min(22, W / 6), wh = ww * 0.8;
        s += rect(x + W - 18 - j * (ww + 9) - ww, y + H * 0.28, ww, wh, "opening");
      }
      s += line(x, y + H + 14, x + W, y + H + 14, "dim") + txt(x + W / 2, y + H + 28, L("length", "长度"), "dimtxt");
      s += line(x - 14, y, x - 14, y + H, "dim") + txt(x - 20, y + H / 2 + 4, L("height", "高"), "dimtxt", "end");
      s += txt(170, 200, L("Paintable = walls − doors − windows", "可涂面积 = 墙面 − 门 − 窗"), "lbl");
      return svgWrap(s);
    }
  });

  // 3 — TILE / FLOORING --------------------------------------------------
  TOOLS.push({
    id: "tile", slug: "tile",
    title: bi("Tile & flooring", "瓷砖 / 地板"),
    h1: bi("Tile & Flooring Calculator", "瓷砖与地板用量计算器"),
    desc: bi("Tiles, planks and boxes needed for a floor or wall, including the grout joint.",
             "计算地面或墙面需要多少块砖 / 地板与多少箱，并计入砖缝。"),
    inputs: [
      { key: "len", type: "len", en: "Area length", zh: "区域长度", def: 4.267 },
      { key: "wid", type: "len", en: "Area width", zh: "区域宽度", def: 3.658 },
      { key: "tl", type: "len", en: "Tile / plank length", zh: "单块长度", def: 0.3048 },
      { key: "tw", type: "len", en: "Tile / plank width", zh: "单块宽度", def: 0.3048 },
      { key: "joint", type: "len", en: "Grout joint", zh: "砖缝宽度", def: 0.003 },
      { key: "waste", type: "num", en: "Waste allowance %", zh: "损耗率 %", def: 10, min: 0 },
      { key: "box", type: "num", conv: "area", en: "Coverage per box", zh: "每箱覆盖面积", def: 15, min: 0.01 }
    ],
    compute: function (v) {
      if (!(v.len > 0 && v.wid > 0)) return { error: L("Enter the area length and width.", "请输入区域长度和宽度。") };
      if (!(v.tl > 0 && v.tw > 0)) return { error: L("Enter the tile length and width.", "请输入单块瓷砖的长和宽。") };
      var area = v.len * v.wid;
      var j = Math.max(0, v.joint || 0);
      var cell = (v.tl + j) * (v.tw + j);
      var waste = Math.max(0, v.waste || 0);
      var exact = area / cell;
      var tiles = up(exact * (1 + waste / 100));
      var boxM2 = isImp() ? (v.box * CONV.area) : v.box;
      var boxes = boxM2 > 0 ? up(area * (1 + waste / 100) / boxM2) : NaN;
      var perBox = boxM2 / cell;
      return {
        results: [
          { en: "Floor / wall area", zh: "铺贴面积", val: areaTxt(area), sub: lenTxt(v.len) + " × " + lenTxt(v.wid) },
          { en: "Tiles (exact fit)", zh: "净需块数", val: num(exact, 1), sub: L("with " + lenTxt(j) + " joint", "含 " + lenTxt(j) + " 砖缝") },
          { en: "Tiles + " + waste + "% waste", zh: "含 " + waste + "% 损耗", val: num(tiles, 0) + L(" pcs", " 块"), accent: true },
          { en: "Boxes to buy", zh: "需购箱数", val: isFinite(boxes) ? num(boxes, 0) + L(" boxes", " 箱") : "—", sub: L("≈" + num(perBox, 1) + " tiles per box", "约 " + num(perBox, 1) + " 块/箱") }
        ],
        buy: [
          { en: "Tiles / planks", zh: "瓷砖 / 地板", qty: num(tiles, 0) + L(" pcs", " 块") },
          { en: "Full boxes", zh: "整箱", qty: isFinite(boxes) ? num(boxes, 0) : "—" },
          { en: "Spacers", zh: "十字定位卡", qty: num(up(tiles * 1.1), 0) + L(" pcs", " 个") }
        ],
        formula: {
          en: "tiles = area ÷ ((tile L + joint) × (tile W + joint)) × (1 + waste)",
          zh: "块数 = 面积 ÷ ((砖长 + 缝) × (砖宽 + 缝)) × (1 + 损耗率)"
        },
        note: {
          en: "10% waste suits a straight lay in a simple rectangle. Use 15% for a diagonal or herringbone layout, or for a room with many cuts. Buy all boxes from the same batch — shade varies between production lots.",
          zh: "10% 损耗适用于矩形房间直铺。斜铺、人字铺或切割较多的房间建议 15%。请一次买齐同一批号——不同批次存在色差。"
        }
      };
    },
    svg: function (v) {
      var f = fitBox(v.len || 4, v.wid || 3, 230, 120);
      var x = (340 - f.w) / 2, y = 34;
      var s = rect(x, y, f.w, f.h, "shape");
      var tl = v.tl > 0 ? v.tl : 0.3, tw = v.tw > 0 ? v.tw : 0.3, j = Math.max(0, v.joint || 0);
      var cols = Math.max(1, Math.min(24, Math.round((v.len || 4) / (tl + j))));
      var rows = Math.max(1, Math.min(18, Math.round((v.wid || 3) / (tw + j))));
      var cw = f.w / cols, ch = f.h / rows;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          s += rect(x + c * cw + 0.7, y + r * ch + 0.7, cw - 1.4, ch - 1.4, "unitcell");
        }
      }
      s += line(x, y + f.h + 14, x + f.w, y + f.h + 14, "dim") + txt(x + f.w / 2, y + f.h + 28, lenTxt(v.len), "dimtxt");
      s += line(x - 14, y, x - 14, y + f.h, "dim") + txt(x - 18, y + f.h / 2 + 4, lenTxt(v.wid), "dimtxt", "end");
      s += txt(170, 200, cols + " × " + rows + L(" tiles shown", " 块（示意）"), "lbl");
      return svgWrap(s);
    }
  });

  // 4 — DRYWALL ----------------------------------------------------------
  TOOLS.push({
    id: "drywall", slug: "drywall",
    title: bi("Drywall", "石膏板"),
    h1: bi("Drywall Calculator", "石膏板用量计算器"),
    desc: bi("Sheets, screws, tape and joint compound for a room.",
             "计算房间需要的石膏板张数、螺钉、接缝纸带和腻子。"),
    inputs: [
      { key: "len", type: "len", en: "Room length", zh: "房间长度", def: 4.267 },
      { key: "wid", type: "len", en: "Room width", zh: "房间宽度", def: 3.658 },
      { key: "hgt", type: "len", en: "Ceiling height", zh: "净高", def: 2.438 },
      { key: "ceil", type: "sel", en: "Include ceiling", zh: "是否含吊顶", def: "yes", options: [
        { v: "yes", en: "Walls + ceiling", zh: "墙面 + 顶面" }, { v: "no", en: "Walls only", zh: "仅墙面" }
      ] },
      { key: "sheet", type: "sel", en: "Sheet size", zh: "板材规格", def: "4x8", options: [
        { v: "4x8", en: "4 × 8 ft (32 ft²)", zh: "4 × 8 英尺（32 ft²）" },
        { v: "4x10", en: "4 × 10 ft (40 ft²)", zh: "4 × 10 英尺（40 ft²）" },
        { v: "4x12", en: "4 × 12 ft (48 ft²)", zh: "4 × 12 英尺（48 ft²）" },
        { v: "1200x2400", en: "1200 × 2400 mm (2.88 m²)", zh: "1200 × 2400 mm（2.88 m²）" },
        { v: "1200x3000", en: "1200 × 3000 mm (3.60 m²)", zh: "1200 × 3000 mm（3.60 m²）" }
      ] },
      { key: "open", type: "num", conv: "area", en: "Openings to deduct", zh: "扣除洞口面积", def: 35, min: 0 },
      { key: "waste", type: "num", en: "Waste allowance %", zh: "损耗率 %", def: 10, min: 0 }
    ],
    compute: function (v) {
      if (!(v.len > 0 && v.wid > 0 && v.hgt > 0)) return { error: L("Enter the room length, width and height.", "请输入房间长、宽、高。") };
      var SHEETS = {
        "4x8": { m2: 32 * M2_FT2, en: "4 × 8 ft sheet", zh: "4 × 8 英尺板" },
        "4x10": { m2: 40 * M2_FT2, en: "4 × 10 ft sheet", zh: "4 × 10 英尺板" },
        "4x12": { m2: 48 * M2_FT2, en: "4 × 12 ft sheet", zh: "4 × 12 英尺板" },
        "1200x2400": { m2: 2.88, en: "1200 × 2400 mm board", zh: "1200 × 2400 mm 板" },
        "1200x3000": { m2: 3.60, en: "1200 × 3000 mm board", zh: "1200 × 3000 mm 板" }
      };
      var sh = SHEETS[v.sheet] || SHEETS["4x8"];
      var openM2 = isImp() ? (Math.max(0, v.open || 0) * CONV.area) : Math.max(0, v.open || 0);
      var wall = 2 * (v.len + v.wid) * v.hgt;
      var ceilA = (v.ceil === "yes") ? v.len * v.wid : 0;
      var net = Math.max(0, wall - openM2) + ceilA;
      var waste = Math.max(0, v.waste || 0);
      var sheets = up(net * (1 + waste / 100) / sh.m2);
      var screws = sheets * 32;
      var screwLb = Math.max(1, up(screws / 320));
      var netFt2 = net / M2_FT2;
      var tapeFt = netFt2 * 0.4;
      var buckets = up(netFt2 / 475);
      return {
        results: [
          { en: "Wall area (net)", zh: "墙面净面积", val: areaTxt(Math.max(0, wall - openM2)), sub: L("openings deducted", "已扣除洞口") },
          { en: "Ceiling area", zh: "顶面面积", val: areaTxt(ceilA), sub: (v.ceil === "yes" ? L("included", "已计入") : L("not included", "未计入")) },
          { en: "Total board area", zh: "封板总面积", val: areaTxt(net), sub: "+" + waste + "% " + L("waste", "损耗") },
          { en: "Sheets needed", zh: "需要板数", val: num(sheets, 0) + L(" sheets", " 张"), sub: L(sh.en, sh.zh), accent: true }
        ],
        buy: [
          { en: L(sh.en, sh.zh), zh: L(sh.en, sh.zh), qty: num(sheets, 0) + L(" sheets", " 张") },
          { en: "Drywall screws (1¼″)", zh: "石膏板螺钉（1¼″）", qty: "≈" + num(screws, 0) + L(" pcs (~", " 颗（约 ") + screwLb + L(" lb)", " 磅）") },
          { en: "Joint tape", zh: "接缝纸带", qty: isImp() ? "≈" + num(tapeFt, 0) + " ft" : "≈" + num(tapeFt * M_FT, 0) + " m" },
          { en: "All-purpose joint compound", zh: "接缝腻子", qty: num(buckets, 0) + L(" × 4.5-gal bucket", " × 4.5 加仑桶") }
        ],
        formula: {
          en: "sheets = (wall + ceiling − openings) × (1 + waste) ÷ sheet area",
          zh: "板数 = (墙面 + 顶面 − 洞口) × (1 + 损耗率) ÷ 单张面积"
        },
        note: {
          en: "Screws assume roughly 32 per sheet at 16″ stud spacing; tape at ~400 ft per 1,000 ft² and one 4.5-gal compound bucket per ~475 ft² are common trade rules of thumb, not product specifications. Longer sheets mean fewer butt joints and less finishing work.",
          zh: "螺钉按 16″ 龙骨间距约 32 颗/张估算；纸带按每 1,000 ft² 约 400 ft、腻子按每约 475 ft² 一桶（4.5 加仑）——这些是行业经验值，并非产品规格。板越长，对接缝越少，批嵌工作量也越小。"
        }
      };
    },
    svg: function (v) {
      var f = fitBox(v.len || 4, v.hgt || 2.4, 210, 92);
      var x = 50, y = 44;
      var s = rect(x, y, f.w, f.h, "shape");
      var cols = Math.max(1, Math.round((v.len || 4) / 1.22));
      var cw = f.w / cols;
      for (var c = 0; c < cols; c++) s += rect(x + c * cw + 1, y + 1, cw - 2, f.h - 2, "unitcell");
      if (v.ceil === "yes") {
        s += poly([[x, y], [x + f.w, y], [x + f.w + 40, y - 20], [x + 40, y - 20]], "shape-top");
        s += txt(x + f.w / 2 + 20, y - 6, L("ceiling", "顶面"), "lbl");
      }
      s += line(x, y + f.h + 14, x + f.w, y + f.h + 14, "dim") + txt(x + f.w / 2, y + f.h + 28, lenTxt(v.len), "dimtxt");
      s += line(x - 14, y, x - 14, y + f.h, "dim") + txt(x - 18, y + f.h / 2 + 4, lenTxt(v.hgt), "dimtxt", "end");
      s += txt(170, 200, L("Sheets laid out across the wall", "沿墙面排布的板材"), "lbl");
      return svgWrap(s);
    }
  });

  // 5 — ROOFING ----------------------------------------------------------
  TOOLS.push({
    id: "roofing", slug: "roofing",
    title: bi("Roofing", "屋面"),
    h1: bi("Roofing Calculator", "屋面材料计算器"),
    desc: bi("Roof area, squares and shingle bundles from the footprint and the pitch.",
             "根据投影面积和坡度计算屋面面积、Square 数与瓦捆数。"),
    inputs: [
      { key: "len", type: "len", en: "Building length", zh: "建筑长度", def: 12.192 },
      { key: "wid", type: "len", en: "Building width", zh: "建筑宽度", def: 8.534 },
      { key: "over", type: "len", en: "Eave overhang (each side)", zh: "檐口出挑（每侧）", def: 0.3048 },
      { key: "pitch", type: "sel", en: "Roof pitch (rise in 12)", zh: "屋面坡度（每 12 升高）", def: "6", options: [
        { v: "0", en: "Flat (0/12)", zh: "平屋面（0/12）" },
        { v: "3", en: "3/12 — low slope", zh: "3/12 —— 缓坡" },
        { v: "4", en: "4/12", zh: "4/12" },
        { v: "6", en: "6/12 — most common", zh: "6/12 —— 最常见" },
        { v: "8", en: "8/12", zh: "8/12" },
        { v: "10", en: "10/12 — steep", zh: "10/12 —— 陡坡" },
        { v: "12", en: "12/12 — 45°", zh: "12/12 —— 45°" }
      ] },
      { key: "waste", type: "num", en: "Waste allowance %", zh: "损耗率 %", def: 12, min: 0 }
    ],
    compute: function (v) {
      if (!(v.len > 0 && v.wid > 0)) return { error: L("Enter the building length and width.", "请输入建筑长度和宽度。") };
      var over = Math.max(0, v.over || 0);
      var fl = v.len + 2 * over, fw = v.wid + 2 * over;
      var foot = fl * fw;
      var rise = parseFloat(v.pitch) || 0;
      var factor = Math.sqrt(rise * rise + 144) / 12;
      var angle = Math.atan2(rise, 12) * 180 / Math.PI;
      var roof = foot * factor;
      var waste = Math.max(0, v.waste || 0);
      var withWaste = roof * (1 + waste / 100);
      var squares = withWaste / M2_FT2 / 100;
      var bundles = up(squares * 3);
      var rolls = up(squares / 4);
      var nailsLb = Math.max(1, up(squares * 2.5));
      var dripFt = 2 * (fl + fw) / M_FT;
      return {
        results: [
          { en: "Footprint (incl. overhang)", zh: "投影面积（含出檐）", val: areaTxt(foot), sub: lenTxt(fl) + " × " + lenTxt(fw) },
          { en: "Pitch factor", zh: "坡度系数", val: "× " + num(factor, 4), sub: "≈ " + num(angle, 1) + "° " + L("slope", "坡角") },
          { en: "Actual roof area", zh: "实际屋面面积", val: areaTxt(roof), sub: L("footprint × pitch factor", "投影 × 坡度系数") },
          { en: "Roofing squares (+" + waste + "%)", zh: "Square 数（含 " + waste + "% 损耗）", val: num(squares, 2) + L(" squares", " square"), sub: L("1 square = 100 ft² = 9.29 m²", "1 square = 100 ft² = 9.29 m²"), accent: true }
        ],
        buy: [
          { en: "Shingle bundles (3 per square)", zh: "沥青瓦（每 square 3 捆）", qty: num(bundles, 0) + L(" bundles", " 捆") },
          { en: "Underlayment (4 squares per roll)", zh: "防水垫层（每卷 4 square）", qty: num(rolls, 0) + L(" rolls", " 卷") },
          { en: "Roofing nails", zh: "屋面钉", qty: "≈" + num(nailsLb, 0) + L(" lb", " 磅") },
          { en: "Drip edge", zh: "滴水檐板", qty: isImp() ? num(up(dripFt / 10) * 10, 0) + " ft" : num(up(dripFt * M_FT), 0) + " m" }
        ],
        formula: {
          en: "pitch factor = √(rise² + 12²) ÷ 12 ; roof area = footprint × pitch factor",
          zh: "坡度系数 = √(升高² + 12²) ÷ 12 ；屋面面积 = 投影面积 × 坡度系数"
        },
        note: {
          en: "This models a simple gable or hip roof measured from the ground. Valleys, dormers and hips need extra material — that is what the waste allowance is for; 12–15% is normal on a cut-up roof. Never measure a roof by walking it without fall protection.",
          zh: "此模型适用于从地面量取的简单双坡或四坡屋面。天沟、老虎窗、斜脊都会增加用量——这正是损耗率的作用，造型复杂的屋面通常取 12–15%。没有防坠落保护时，切勿上屋面量尺。"
        }
      };
    },
    svg: function (v) {
      var rise = parseFloat(v.pitch) || 0;
      var halfW = 120, h = Math.min(96, halfW * rise / 12);
      var baseY = 148, cx = 170;
      var s = "";
      s += poly([[cx - halfW, baseY], [cx, baseY - h], [cx + halfW, baseY]], "shape");
      s += rect(cx - halfW + 16, baseY, 2 * (halfW - 16), 34, "shape-side");
      s += line(cx - halfW - 8, baseY, cx + halfW + 8, baseY, "ground");
      s += line(cx, baseY - h, cx, baseY, "dim-dash");
      s += line(cx, baseY - h + 4, cx + 46, baseY - h + 4, "dim");
      s += txt(cx + 24, baseY - h - 4, rise + "", "dimtxt");
      s += line(cx + 46, baseY - h + 4, cx + 46, baseY - h + 4 + (46 * rise / 12), "dim");
      s += txt(cx + 58, baseY - h + 20, "12", "dimtxt", "start");
      s += txt(cx, baseY + 52, L("pitch ", "坡度 ") + rise + "/12", "lbl");
      s += txt(cx, baseY + 68, L("measured from the ground footprint", "自地面投影量取"), "dimtxt");
      return svgWrap(s, 230);
    }
  });

  // 6 — DECK -------------------------------------------------------------
  TOOLS.push({
    id: "deck", slug: "deck",
    title: bi("Deck boards", "木平台"),
    h1: bi("Deck Board Calculator", "木平台板材计算器"),
    desc: bi("Boards, joists and screws for a rectangular deck, including the gap between boards.",
             "计算矩形木平台的面板、龙骨与螺钉数量，并计入板缝。"),
    inputs: [
      { key: "len", type: "len", en: "Deck length (along boards)", zh: "平台长度（顺板方向）", def: 4.877 },
      { key: "wid", type: "len", en: "Deck width (across boards)", zh: "平台宽度（垂直板方向）", def: 3.658 },
      { key: "bw", type: "len", en: "Board width (actual)", zh: "面板实际宽度", def: 0.1397 },
      { key: "gap", type: "len", en: "Gap between boards", zh: "板缝宽度", def: 0.0048 },
      { key: "bl", type: "len", en: "Board length sold", zh: "面板出售长度", def: 3.658 },
      { key: "joist", type: "sel", en: "Joist spacing", zh: "龙骨间距", def: "16", options: [
        { v: "12", en: "12 in / 300 mm", zh: "12 英寸 / 300 mm" },
        { v: "16", en: "16 in / 400 mm — standard", zh: "16 英寸 / 400 mm —— 常规" },
        { v: "24", en: "24 in / 600 mm", zh: "24 英寸 / 600 mm" }
      ] },
      { key: "waste", type: "num", en: "Waste allowance %", zh: "损耗率 %", def: 10, min: 0 }
    ],
    compute: function (v) {
      if (!(v.len > 0 && v.wid > 0)) return { error: L("Enter the deck length and width.", "请输入平台长度和宽度。") };
      if (!(v.bw > 0)) return { error: L("Enter the actual board width.", "请输入面板实际宽度。") };
      if (!(v.bl > 0)) return { error: L("Enter the length the boards are sold in.", "请输入面板出售长度。") };
      var gap = Math.max(0, v.gap || 0);
      var rows = up(v.wid / (v.bw + gap));
      var perRow = up(v.len / v.bl);
      var waste = Math.max(0, v.waste || 0);
      var boards = up(rows * perRow * (1 + waste / 100));
      var linear = rows * v.len * (1 + waste / 100);
      var spacingM = parseFloat(v.joist) * M_IN;
      var joists = Math.floor(v.len / spacingM) + 1;
      var screws = rows * joists * 2;
      var area = v.len * v.wid;
      return {
        results: [
          { en: "Deck area", zh: "平台面积", val: areaTxt(area), sub: lenTxt(v.len) + " × " + lenTxt(v.wid) },
          { en: "Rows of boards", zh: "面板排数", val: num(rows, 0) + L(" rows", " 排"), sub: L("board + gap = ", "板宽 + 缝 = ") + lenTxt(v.bw + gap) },
          { en: "Boards to buy", zh: "面板数量", val: num(boards, 0) + L(" boards", " 根"), sub: L("each ", "每根 ") + lenTxt(v.bl) + " · +" + waste + "%", accent: true },
          { en: "Linear length", zh: "线性总长", val: isImp() ? num(linear / M_FT, 0) + " ft" : num(linear, 1) + " m", sub: L("total decking run", "面板总延长米") }
        ],
        buy: [
          { en: "Deck boards @ " + lenTxt(v.bl), zh: "面板 @ " + lenTxt(v.bl), qty: num(boards, 0) + L(" pcs", " 根") },
          { en: "Joists @ " + (v.joist) + "″ / " + num(spacingM * 1000, 0) + " mm centres", zh: "龙骨 @ " + (v.joist) + "″ / " + num(spacingM * 1000, 0) + " mm 间距", qty: num(joists, 0) + L(" pcs", " 根") },
          { en: "Deck screws (2 per board per joist)", zh: "平台螺钉（每板每龙骨 2 颗）", qty: "≈" + num(screws, 0) + L(" pcs", " 颗") }
        ],
        formula: {
          en: "rows = deck width ÷ (board width + gap) ; boards = rows × ceil(deck length ÷ board length) × (1 + waste)",
          zh: "排数 = 平台宽 ÷ (板宽 + 缝) ；根数 = 排数 × ceil(平台长 ÷ 板长) × (1 + 损耗率)"
        },
        note: {
          en: "Use the actual board width, not the nominal name: a \"2×6\" deck board is about 5½″ (140 mm) wide. Gap it 3⁄16″ (5 mm) for kiln-dried lumber; wet pressure-treated boards shrink, so they can be laid closer.",
          zh: "请填写面板的实际宽度而非名义规格：所谓 “2×6” 面板实宽约 5½″（140 mm）。窑干木材留缝约 3⁄16″（5 mm）；含水率高的防腐材干燥后会收缩，可以铺得更紧。"
        }
      };
    },
    svg: function (v) {
      var f = fitBox(v.len || 5, v.wid || 3.6, 240, 116);
      var x = (340 - f.w) / 2, y = 36;
      var s = rect(x - 3, y - 3, f.w + 6, f.h + 6, "shape");
      var rows = Math.max(1, Math.min(26, Math.round((v.wid || 3.6) / ((v.bw || 0.14) + (v.gap || 0)))));
      var rh = f.h / rows;
      for (var r = 0; r < rows; r++) s += rect(x, y + r * rh + 0.8, f.w, Math.max(1, rh - 1.6), "unitcell");
      var spacing = parseFloat(v.joist) * M_IN;
      var nj = Math.max(2, Math.min(14, Math.floor((v.len || 5) / spacing) + 1));
      for (var jj = 0; jj < nj; jj++) {
        var jx = x + (f.w) * (jj / (nj - 1));
        s += line(jx, y, jx, y + f.h, "dim-dash");
      }
      s += txt(x + f.w / 2, y + f.h + 26, rows + L(" board rows · ", " 排面板 · ") + nj + L(" joists", " 根龙骨"), "dimtxt");
      s += txt(170, 200, L("Boards run along the length; joists cross them", "面板顺长向铺设，龙骨垂直支撑"), "lbl");
      return svgWrap(s);
    }
  });

  // 7 — FENCE ------------------------------------------------------------
  TOOLS.push({
    id: "fence", slug: "fence",
    title: bi("Fence", "围栏"),
    h1: bi("Fence Calculator", "围栏材料计算器"),
    desc: bi("Posts, rails, pickets and the concrete needed to set each post.",
             "计算立柱、横档、栅板数量，以及每根立柱埋设所需的混凝土。"),
    inputs: [
      { key: "len", type: "len", en: "Fence length", zh: "围栏总长", def: 30.48 },
      { key: "space", type: "len", en: "Post spacing", zh: "立柱间距", def: 2.438 },
      { key: "rails", type: "sel", en: "Rails per section", zh: "每档横档数", def: "3", options: [
        { v: "2", en: "2 rails", zh: "2 根" }, { v: "3", en: "3 rails", zh: "3 根" }, { v: "4", en: "4 rails", zh: "4 根" }
      ] },
      { key: "pw", type: "len", en: "Picket width", zh: "栅板宽度", def: 0.1397 },
      { key: "pgap", type: "len", en: "Gap between pickets", zh: "栅板间距", def: 0 },
      { key: "hdepth", type: "len", en: "Post hole depth", zh: "柱孔深度", def: 0.6096 },
      { key: "hdia", type: "len", en: "Post hole diameter", zh: "柱孔直径", def: 0.254 },
      { key: "post", type: "sel", en: "Post size", zh: "立柱规格", def: "4x4", options: [
        { v: "4x4", en: "4 × 4 (3½″ actual)", zh: "4 × 4（实 3½″）" },
        { v: "6x6", en: "6 × 6 (5½″ actual)", zh: "6 × 6（实 5½″）" },
        { v: "100", en: "100 × 100 mm", zh: "100 × 100 mm" },
        { v: "150", en: "150 × 150 mm", zh: "150 × 150 mm" }
      ] }
    ],
    compute: function (v) {
      if (!(v.len > 0)) return { error: L("Enter the total fence length.", "请输入围栏总长。") };
      if (!(v.space > 0)) return { error: L("Enter the post spacing.", "请输入立柱间距。") };
      var sections = up(v.len / v.space);
      var posts = sections + 1;
      var railsPer = parseInt(v.rails, 10) || 3;
      var rails = sections * railsPer;
      var railLen = rails * v.space;
      var pw = v.pw > 0 ? v.pw : 0.14, pgap = Math.max(0, v.pgap || 0);
      var pickets = up(v.len / (pw + pgap));
      var POSTM = { "4x4": 0.0889, "6x6": 0.1397, "100": 0.1, "150": 0.15 };
      var pside = POSTM[v.post] || 0.0889;
      var holeV = Math.PI * Math.pow((v.hdia > 0 ? v.hdia : 0.254) / 2, 2) * (v.hdepth > 0 ? v.hdepth : 0.61);
      var postV = pside * pside * (v.hdepth > 0 ? v.hdepth : 0.61);
      var concPer = Math.max(0, holeV - postV);
      var concTotal = concPer * posts;
      var bags = up(concTotal / BAGS["80lb"].m3);
      return {
        results: [
          { en: "Sections", zh: "档数", val: num(sections, 0) + L(" sections", " 档"), sub: L("at ", "间距 ") + lenTxt(v.space) },
          { en: "Posts", zh: "立柱", val: num(posts, 0) + L(" posts", " 根"), sub: L("sections + 1", "档数 + 1"), accent: true },
          { en: "Rails", zh: "横档", val: num(rails, 0) + L(" rails", " 根"), sub: L("total run ", "总长 ") + lenTxt(railLen) },
          { en: "Pickets", zh: "栅板", val: num(pickets, 0) + L(" pcs", " 块"), sub: lenTxt(pw) + L(" wide + ", " 宽 + ") + lenTxt(pgap) + L(" gap", " 缝") }
        ],
        buy: [
          { en: "Posts", zh: "立柱", qty: num(posts, 0) + L(" pcs", " 根") },
          { en: "Rails", zh: "横档", qty: num(rails, 0) + L(" pcs", " 根") },
          { en: "Pickets / boards", zh: "栅板", qty: num(pickets, 0) + L(" pcs", " 块") },
          { en: "Concrete for post holes (80 lb bags)", zh: "柱孔混凝土（80 磅袋）", qty: num(bags, 0) + L(" bags", " 袋") + " · " + volTxt(concTotal) }
        ],
        formula: {
          en: "posts = ceil(length ÷ spacing) + 1 ; concrete per hole = π(d/2)²×depth − post volume",
          zh: "立柱数 = ceil(总长 ÷ 间距) + 1 ；每孔混凝土 = π(d/2)²×深度 − 立柱占体积"
        },
        note: {
          en: "A common rule is to bury one third of the post length, and below the local frost line where the ground freezes. Gates, corners and slopes need extra posts — add them to the count. Check property lines and any permit or height limits before you dig.",
          zh: "常见做法是柱长的三分之一埋入地下，且在冰冻地区要埋至当地冻土线以下。门柱、转角和坡地需要额外立柱，请自行增加。开挖前请先确认地界、报建要求与高度限制。"
        }
      };
    },
    svg: function (v) {
      var sections = Math.max(1, Math.min(6, up((v.len || 30) / (v.space || 2.4))));
      var n = Math.min(6, sections);
      var x0 = 26, x1 = 314, groundY = 150, topY = 46;
      var s = line(x0 - 10, groundY, x1 + 10, groundY, "ground");
      var step = (x1 - x0) / n;
      var railsPer = parseInt(v.rails, 10) || 3;
      // pickets
      var pw = 7;
      for (var px = x0 + 2; px < x1 - 2; px += pw + 1.6) {
        s += rect(px, topY + 6, pw, groundY - topY - 6, "unitcell");
      }
      // rails
      for (var r = 0; r < railsPer; r++) {
        var ry = topY + 16 + r * ((groundY - topY - 26) / Math.max(1, railsPer - 1 || 1));
        s += rect(x0, ry, x1 - x0, 4, "shape-side");
      }
      // posts
      for (var i = 0; i <= n; i++) {
        var pxp = x0 + step * i - 5;
        s += rect(pxp, topY, 10, groundY - topY + 30, "shape");
      }
      s += txt(170, 196, (up((v.len || 30) / (v.space || 2.4)) + 1) + L(" posts · ", " 根立柱 · ") + railsPer + L(" rails per section", " 根横档/档"), "lbl");
      s += txt(170, 178, L("posts set below grade in concrete", "立柱埋入地下并浇混凝土"), "dimtxt");
      return svgWrap(s);
    }
  });

  // 8 — GRAVEL / MULCH ---------------------------------------------------
  TOOLS.push({
    id: "gravel", slug: "gravel",
    title: bi("Gravel & mulch", "碎石 / 覆盖物"),
    h1: bi("Gravel, Sand & Mulch Calculator", "碎石、沙、覆盖物用量计算器"),
    desc: bi("Cubic yards, tons and bag count for any loose material spread to a depth.",
             "按铺设厚度计算散状材料的体积、吨位与袋数。"),
    inputs: [
      { key: "len", type: "len", en: "Area length", zh: "区域长度", def: 6.096 },
      { key: "wid", type: "len", en: "Area width", zh: "区域宽度", def: 3.048 },
      { key: "dep", type: "len", en: "Depth", zh: "铺设厚度", def: 0.0762 },
      { key: "mat", type: "sel", en: "Material", zh: "材料", def: "gravel", options: [
        { v: "gravel", en: "Crushed stone / gravel", zh: "碎石 / 砾石" },
        { v: "pea", en: "Pea gravel", zh: "豆石" },
        { v: "sand", en: "Sand", zh: "沙" },
        { v: "topsoil", en: "Topsoil", zh: "种植土" },
        { v: "mulch", en: "Bark mulch", zh: "树皮覆盖物" }
      ] },
      { key: "dens", type: "num", conv: "dens", en: "Density (adjust if known)", zh: "密度（如已知可修改）", def: 100, min: 1 },
      { key: "bagft3", type: "sel", en: "Bag size", zh: "袋装规格", def: "0.5", options: [
        { v: "0.5", en: "0.5 ft³ bag (≈14 L)", zh: "0.5 ft³ 袋（≈14 L）" },
        { v: "1", en: "1 ft³ bag (≈28 L)", zh: "1 ft³ 袋（≈28 L）" },
        { v: "2", en: "2 ft³ mulch bag (≈57 L)", zh: "2 ft³ 覆盖物袋（≈57 L）" }
      ] }
    ],
    densityDefaults: { gravel: 100, pea: 96, sand: 100, topsoil: 75, mulch: 25 },
    compute: function (v) {
      if (!(v.len > 0 && v.wid > 0 && v.dep > 0)) return { error: L("Enter the length, width and depth.", "请输入长度、宽度和厚度。") };
      var vol = v.len * v.wid * v.dep;
      var densMetric = isImp() ? (v.dens * CONV.dens) : v.dens; // kg/m³
      if (!(densMetric > 0)) densMetric = 1600;
      var kg = vol * densMetric;
      var tons = kg / 1000 / 1.0160469 * 1.0160469; // metric tonnes
      var usTons = kg / KG_LB / 2000;
      var bagFt3 = parseFloat(v.bagft3) || 0.5;
      var bagM3 = bagFt3 * M3_FT3;
      var bags = up(vol / bagM3);
      return {
        results: [
          { en: "Coverage area", zh: "铺设面积", val: areaTxt(v.len * v.wid), sub: L("at ", "厚度 ") + lenTxt(v.dep) },
          { en: "Volume", zh: "体积", val: volTxt(vol), sub: volSub(vol), accent: true },
          { en: "Weight", zh: "重量", val: isImp() ? num(usTons, 2) + " US tons" : num(tons, 2) + " t", sub: isImp() ? num(tons, 2) + " tonnes" : num(usTons, 2) + " US tons" },
          { en: "Bags", zh: "袋数", val: num(bags, 0) + L(" bags", " 袋"), sub: bagFt3 + " ft³ " + L("each", "每袋") }
        ],
        buy: [
          { en: "Bulk delivery", zh: "散装配送", qty: volTxt(vol) + " · " + (isImp() ? num(usTons, 2) + L(" US tons", " 美吨") : num(tons, 2) + " t") },
          { en: "or bagged", zh: "或袋装", qty: num(bags, 0) + L(" × ", " × ") + bagFt3 + " ft³" },
          { en: "Landscape fabric (if under gravel)", zh: "防草布（碎石下铺设时）", qty: areaTxt(v.len * v.wid) }
        ],
        formula: {
          en: "volume = L × W × depth ; weight = volume × density",
          zh: "体积 = 长 × 宽 × 厚 ；重量 = 体积 × 密度"
        },
        note: {
          en: "Densities are typical dry values and vary a lot with moisture, stone size and compaction — the field is editable so you can enter your supplier's figure. Bulk material is usually cheaper than bags above roughly 1 cubic yard. For a gravel driveway, a 4″ (100 mm) compacted depth over a base layer is a common starting point.",
          zh: "此处密度为典型干态值，会随含水率、粒径和压实度显著变化——该字段可编辑，可填入供应商提供的数据。用量超过约 1 立方码时，散装通常比袋装便宜。碎石车道常见做法是在垫层之上压实约 4″（100 mm）。"
        }
      };
    },
    svg: function (v) {
      var f = fitBox(v.len || 6, v.wid || 3, 200, 84);
      var x = 58, y = 54, dx = 44, dy = -24;
      var depPx = Math.max(7, Math.min(40, ((v.dep || 0.08) / Math.max(v.len || 6, 0.1)) * f.w * 8));
      var A = [x, y + f.h], B = [x + f.w, y + f.h], C = [x + f.w + dx, y + f.h + dy], D = [x + dx, y + f.h + dy];
      var s = "";
      s += poly([[A[0], A[1] + depPx], [B[0], B[1] + depPx], B, A], "shape-side");
      s += poly([[B[0], B[1] + depPx], [C[0], C[1] + depPx], C, B], "shape-side");
      s += poly([A, B, C, D], "shape-top");
      for (var i = 0; i < 26; i++) {
        var rx = A[0] + 8 + ((i * 37) % Math.max(10, f.w - 16));
        var ry = D[1] + 6 + ((i * 23) % Math.max(8, f.h - 10));
        s += '<circle cx="' + rx.toFixed(1) + '" cy="' + ry.toFixed(1) + '" r="2.6" class="unitcell"/>';
      }
      s += line(A[0] - 12, A[1], A[0] - 12, A[1] + depPx, "dim") + txt(A[0] - 18, A[1] + depPx / 2 + 4, lenTxt(v.dep), "dimtxt", "end");
      s += txt((A[0] + B[0]) / 2, A[1] + depPx + 24, lenTxt(v.len), "dimtxt");
      s += txt(170, 200, L("Loose material spread to an even depth", "散状材料按均匀厚度摊铺"), "lbl");
      return svgWrap(s);
    }
  });

  // 9 — STAIRS -----------------------------------------------------------
  TOOLS.push({
    id: "stairs", slug: "stairs",
    title: bi("Stairs", "楼梯"),
    h1: bi("Stair Calculator", "楼梯踏步计算器"),
    desc: bi("Riser height, tread depth, total run and stringer length — checked against code limits.",
             "计算踏步高度、踏面宽度、总水平投影与斜梁长度，并对照规范限值检查。"),
    inputs: [
      { key: "rise", type: "len", en: "Total rise (floor to floor)", zh: "总高（楼面到楼面）", def: 2.7432 },
      { key: "target", type: "len", en: "Preferred riser height", zh: "期望踏步高", def: 0.1778 },
      { key: "tread", type: "len", en: "Tread depth (run)", zh: "踏面宽度", def: 0.254 },
      { key: "width", type: "len", en: "Stair width", zh: "梯段宽度", def: 0.9144 }
    ],
    compute: function (v) {
      if (!(v.rise > 0)) return { error: L("Enter the total rise from finished floor to finished floor.", "请输入完成面到完成面的总高。") };
      var target = v.target > 0 ? v.target : 0.1778;
      var risers = Math.max(1, Math.round(v.rise / target));
      var riserH = v.rise / risers;
      var treads = risers - 1;
      var tread = v.tread > 0 ? v.tread : 0.254;
      var run = treads * tread;
      var stringer = Math.sqrt(v.rise * v.rise + run * run);
      var angle = Math.atan2(v.rise, run) * 180 / Math.PI;
      var riserIn = riserH / M_IN, treadIn = tread / M_IN;
      var blondel = 2 * riserIn + treadIn;
      var okRiser = riserIn <= 7.75 + 1e-6;
      var okTread = treadIn >= 10 - 1e-6;
      var okBlondel = blondel >= 24 && blondel <= 25.5;
      var allOk = okRiser && okTread;
      var flagTxt = allOk
        ? L("Within IRC limits: riser ≤ 7¾″ (196 mm), tread ≥ 10″ (254 mm)", "符合 IRC 限值：踏步高 ≤ 7¾″（196 mm），踏面 ≥ 10″（254 mm）")
        : L("Outside IRC limits — " + (!okRiser ? "riser too tall" : "") + (!okRiser && !okTread ? " and " : "") + (!okTread ? "tread too shallow" : ""),
            "超出 IRC 限值 —— " + (!okRiser ? "踏步过高" : "") + (!okRiser && !okTread ? "，且" : "") + (!okTread ? "踏面过窄" : ""));
      return {
        results: [
          { en: "Number of risers", zh: "踏步级数", val: num(risers, 0), sub: num(treads, 0) + L(" treads", " 级踏面"), accent: true },
          { en: "Actual riser height", zh: "实际踏步高", val: lenTxt(riserH), sub: num(riserIn, 2) + " in · " + num(riserH * 1000, 0) + " mm" },
          { en: "Total run", zh: "水平投影总长", val: lenTxt(run), sub: num(treads, 0) + " × " + lenTxt(tread) },
          { en: "Stringer length", zh: "斜梁长度", val: lenTxt(stringer), sub: "≈ " + num(angle, 1) + "° " + L("slope", "坡角") }
        ],
        buy: [
          { en: "Stringers (typical 3 for " + lenTxt(v.width > 0 ? v.width : 0.9144) + " width)", zh: "斜梁（宽 " + lenTxt(v.width > 0 ? v.width : 0.9144) + " 通常 3 根）", qty: "3 × " + lenTxt(stringer * 1.1) },
          { en: "Tread boards", zh: "踏面板", qty: num(treads, 0) + L(" pcs @ ", " 块 @ ") + lenTxt(v.width > 0 ? v.width : 0.9144) },
          { en: "Riser boards", zh: "踢面板", qty: num(risers, 0) + L(" pcs @ ", " 块 @ ") + lenTxt(v.width > 0 ? v.width : 0.9144) }
        ],
        flag: { ok: allOk, text: flagTxt },
        formula: {
          en: "risers = round(total rise ÷ preferred riser) ; riser height = total rise ÷ risers ; run = (risers − 1) × tread",
          zh: "级数 = round(总高 ÷ 期望踏步高) ；实际踏步高 = 总高 ÷ 级数 ；投影长 = (级数 − 1) × 踏面"
        },
        note: {
          en: "Limits shown follow the 2021 International Residential Code (IRC R311.7.5): maximum riser 7¾″ (196 mm), minimum tread depth 10″ (254 mm), and no more than ⅜″ variation between the tallest and shortest riser in a flight. The comfort rule 2 × riser + tread ≈ 24–25″ currently gives " + num(blondel, 1) + "″" + (okBlondel ? " (comfortable)" : " (outside the comfortable band)") + ". Your local code may differ — always confirm before cutting stringers.",
          zh: "此处限值依据 2021 年版 International Residential Code（IRC R311.7.5）：踏步高最大 7¾″（196 mm），踏面最小 10″（254 mm），同一梯段最高与最低踏步高差不超过 ⅜″。舒适度经验公式 2×踏步高 + 踏面 ≈ 24–25″，当前为 " + num(blondel, 1) + "″" + (okBlondel ? "（舒适区间内）" : "（超出舒适区间）") + "。各地规范可能不同——切割斜梁前请务必核对当地要求。"
        }
      };
    },
    svg: function (v) {
      var target = v.target > 0 ? v.target : 0.1778;
      var risers = Math.max(1, Math.round((v.rise || 2.74) / target));
      var n = Math.min(16, risers);
      var totalH = 120, totalW = 200;
      var rh = totalH / n, rw = totalW / Math.max(1, n - 1 || 1);
      var x0 = 62, y0 = 40;
      var pts = [[x0, y0 + totalH]];
      for (var i = 0; i < n; i++) {
        pts.push([x0 + i * rw, y0 + totalH - i * rh]);
        pts.push([x0 + i * rw, y0 + totalH - (i + 1) * rh]);
        pts.push([x0 + (i + 1) * rw, y0 + totalH - (i + 1) * rh]);
      }
      pts.push([x0 + n * rw, y0 + totalH]);
      var s = poly(pts, "shape");
      s += line(x0 - 16, y0, x0 - 16, y0 + totalH, "dim") + txt(x0 - 22, y0 + totalH / 2, L("total", "总高"), "dimtxt", "end");
      s += txt(x0 - 22, y0 + totalH / 2 + 14, lenTxt(v.rise), "dimtxt", "end");
      s += line(x0, y0 + totalH + 14, x0 + n * rw, y0 + totalH + 14, "dim");
      s += txt(x0 + n * rw / 2, y0 + totalH + 28, L("run ", "投影 ") + lenTxt((risers - 1) * (v.tread > 0 ? v.tread : 0.254)), "dimtxt");
      s += txt(170, 200, risers + L(" risers · ", " 级踏步 · ") + (risers - 1) + L(" treads", " 级踏面"), "lbl");
      return svgWrap(s);
    }
  });

  // 10 — BRICK & BLOCK ---------------------------------------------------
  TOOLS.push({
    id: "masonry", slug: "masonry",
    title: bi("Brick & block", "砖 / 砌块"),
    h1: bi("Brick & Block Calculator", "砖与砌块用量计算器"),
    desc: bi("Units and mortar for a wall, using standard face sizes including the mortar joint.",
             "按含灰缝的标准砌块面尺寸，计算墙体所需的块数与砂浆。"),
    inputs: [
      { key: "len", type: "len", en: "Wall length", zh: "墙体长度", def: 6.096 },
      { key: "hgt", type: "len", en: "Wall height", zh: "墙体高度", def: 1.829 },
      { key: "unit", type: "sel", en: "Unit type", zh: "砌块类型", def: "modular", options: [
        { v: "modular", en: "Modular brick — 6.75 per ft²", zh: "模数砖 —— 6.75 块/ft²" },
        { v: "queen", en: "Queen brick — 5.76 per ft²", zh: "Queen 砖 —— 5.76 块/ft²" },
        { v: "cmu", en: "CMU block 8×8×16 in — 1.125 per ft²", zh: "混凝土砌块 8×8×16 英寸 —— 1.125 块/ft²" },
        { v: "ukbrick", en: "Metric brick 215×65 mm — 60 per m²", zh: "公制标准砖 215×65 mm —— 60 块/m²" },
        { v: "ukblock", en: "Metric block 440×215 mm — 10 per m²", zh: "公制砌块 440×215 mm —— 10 块/m²" }
      ] },
      { key: "open", type: "num", conv: "area", en: "Openings to deduct", zh: "扣除洞口面积", def: 0, min: 0 },
      { key: "waste", type: "num", en: "Waste allowance %", zh: "损耗率 %", def: 5, min: 0 }
    ],
    compute: function (v) {
      if (!(v.len > 0 && v.hgt > 0)) return { error: L("Enter the wall length and height.", "请输入墙体长度和高度。") };
      var UNITS = {
        modular: { perM2: 6.75 / M2_FT2, kind: "brick", en: "Modular brick", zh: "模数砖" },
        queen: { perM2: 5.76 / M2_FT2, kind: "brick", en: "Queen brick", zh: "Queen 砖" },
        cmu: { perM2: 1.125 / M2_FT2, kind: "block", en: "CMU 8×8×16 in", zh: "混凝土砌块 8×8×16 英寸" },
        ukbrick: { perM2: 60, kind: "brick", en: "Metric brick 215×65 mm", zh: "公制标准砖 215×65 mm" },
        ukblock: { perM2: 10, kind: "block", en: "Metric block 440×215 mm", zh: "公制砌块 440×215 mm" }
      };
      var U = UNITS[v.unit] || UNITS.modular;
      var openM2 = isImp() ? (Math.max(0, v.open || 0) * CONV.area) : Math.max(0, v.open || 0);
      var area = Math.max(0, v.len * v.hgt - openM2);
      var waste = Math.max(0, v.waste || 0);
      var units = up(area * U.perM2 * (1 + waste / 100));
      var mortarBags = (U.kind === "brick") ? up(units / 125) : up(units * 3 / 100);
      return {
        results: [
          { en: "Wall face area", zh: "墙面面积", val: areaTxt(area), sub: lenTxt(v.len) + " × " + lenTxt(v.hgt) },
          { en: "Units per area", zh: "单位面积块数", val: isImp() ? num(U.perM2 * M2_FT2, 2) + L(" per ft²", " 块/ft²") : num(U.perM2, 2) + L(" per m²", " 块/m²"), sub: L(U.en, U.zh) },
          { en: "Units needed", zh: "需要块数", val: num(units, 0) + L(" pcs", " 块"), sub: "+" + waste + "% " + L("waste", "损耗"), accent: true },
          { en: "Mortar", zh: "砂浆", val: num(mortarBags, 0) + L(" bags", " 袋"), sub: U.kind === "brick" ? L("≈1 bag per 125 bricks", "约每 125 块砖 1 袋") : L("≈3 bags per 100 blocks", "约每 100 块砌块 3 袋") }
        ],
        buy: [
          { en: L(U.en, U.zh), zh: L(U.en, U.zh), qty: num(units, 0) + L(" pcs", " 块") },
          { en: "Mortar mix (70 lb / 30 kg bags)", zh: "砌筑砂浆（70 磅 / 30 kg 袋）", qty: num(mortarBags, 0) + L(" bags", " 袋") },
          { en: "Wall ties / reinforcement", zh: "拉结件 / 配筋", qty: L("per your wall design", "按墙体设计确定") }
        ],
        formula: {
          en: "units = (L × H − openings) × units per area × (1 + waste)",
          zh: "块数 = (长 × 高 − 洞口) × 单位面积块数 × (1 + 损耗率)"
        },
        note: {
          en: "Unit counts already include the standard mortar joint (⅜″ for modular brick, 10 mm for metric units), which is why a modular brick counts as 6.75 per ft² rather than its bare face size. Mortar figures are trade rules of thumb and depend on joint thickness and how much you drop. Load-bearing or retaining walls need engineering — this tool only counts materials.",
          zh: "块数已包含标准灰缝（模数砖 ⅜″，公制砌体 10 mm），这正是模数砖按 6.75 块/ft² 而非净面尺寸计算的原因。砂浆用量为行业经验值，受灰缝厚度与施工损耗影响。承重墙或挡土墙需经结构设计——本工具仅统计材料用量。"
        }
      };
    },
    svg: function (v) {
      var isBlock = (v.unit === "cmu" || v.unit === "ukblock");
      var f = fitBox(v.len || 6, v.hgt || 1.8, 250, 110);
      var x = (340 - f.w) / 2, y = 40;
      var s = rect(x, y, f.w, f.h, "shape");
      var cols = isBlock ? 6 : 12, rows = isBlock ? 4 : 10;
      var cw = f.w / cols, ch = f.h / rows;
      for (var r = 0; r < rows; r++) {
        var offset = (r % 2) ? cw / 2 : 0;
        for (var c = -1; c <= cols; c++) {
          var bx = x + c * cw + offset;
          var bw = cw;
          if (bx + bw <= x || bx >= x + f.w) continue;
          var left = Math.max(bx, x), right = Math.min(bx + bw, x + f.w);
          s += rect(left + 0.8, y + r * ch + 0.8, right - left - 1.6, ch - 1.6, "unitcell");
        }
      }
      s += line(x, y + f.h + 14, x + f.w, y + f.h + 14, "dim") + txt(x + f.w / 2, y + f.h + 28, lenTxt(v.len), "dimtxt");
      s += line(x - 14, y, x - 14, y + f.h, "dim") + txt(x - 18, y + f.h / 2 + 4, lenTxt(v.hgt), "dimtxt", "end");
      s += txt(170, 200, L("Running bond — joints included in the count", "错缝砌筑 —— 块数已含灰缝"), "lbl");
      return svgWrap(s);
    }
  });

  // ---------- rendering ----------
  function unitLabel(inp) {
    if (inp.conv) return CONV_UNIT[inp.conv][isImp() ? "imp" : "met"];
    return "";
  }

  function fieldHtml(t, inp) {
    var id = "in-" + t.id + "-" + inp.key;
    var label = bi(inp.en + (inp.conv ? " (" + CONV_UNIT[inp.conv].imp + ")" : ""), inp.zh + (inp.conv ? "（" + CONV_UNIT[inp.conv].imp + "）" : ""));
    var labelEl = '<label for="' + id + '"><span class="lbl-txt">' + label + '</span></label>';
    var control;
    if (inp.type === "sel") {
      control = '<select id="' + id + '">' + inp.options.map(function (o) {
        return '<option value="' + o.v + '"' + (o.v === inp.def ? " selected" : "") + '>' + esc(L(o.en, o.zh)) + "</option>";
      }).join("") + "</select>";
    } else if (inp.type === "len") {
      control = '<input type="text" inputmode="decimal" id="' + id + '" value="' + esc(lenInput(inp.def)) + '" autocomplete="off" />';
    } else {
      var dv = inp.def;
      if (inp.conv && !isImp()) dv = Math.round(inp.def * CONV[inp.conv] * 1000) / 1000;
      control = '<input type="number" step="any" id="' + id + '" value="' + dv + '" autocomplete="off" />';
    }
    return '<div class="field" data-field="' + inp.key + '">' + labelEl + control + "</div>";
  }

  function panelInner(t) {
    var id = t.id;
    var fields = t.inputs.map(function (inp) { return fieldHtml(t, inp); }).join("");
    return '' +
      '<div class="tool-head"><h3>' + t.h1 + "</h3><p>" + t.desc + "</p></div>" +
      '<div class="tool-grid">' +
        '<div class="card">' +
          '<div class="unit-switch" role="group" aria-label="' + L("Unit system", "单位制") + '">' +
            '<button type="button" class="unit-btn' + (isImp() ? " active" : "") + '" data-sys="imperial">' + bi("Feet &amp; inches", "英尺 / 英寸") + "</button>" +
            '<button type="button" class="unit-btn' + (!isImp() ? " active" : "") + '" data-sys="metric">' + bi("Metres &amp; cm", "米 / 厘米") + "</button>" +
          "</div>" +
          fields +
          '<p class="error-msg" id="err-' + id + '"></p>' +
        "</div>" +
        '<div class="card">' +
          '<div class="diagram" id="svg-' + id + '"></div>' +
          '<div class="results" id="res-' + id + '"></div>' +
          '<div id="buy-' + id + '"></div>' +
          '<div id="flag-' + id + '"></div>' +
          '<div class="formula-box" id="formula-' + id + '"></div>' +
          '<div class="note-box" id="note-' + id + '"></div>' +
        "</div>" +
      "</div>";
  }

  function buildInto(container) {
    if (landingTool) {
      var lt = TOOLS.filter(function (t) { return t.slug === landingTool; })[0] || TOOLS[0];
      container.innerHTML = '<div class="tool-panel active" id="panel-' + lt.id + '">' + panelInner(lt) + "</div>";
    } else {
      var tabs = "", panels = "";
      TOOLS.forEach(function (t, i) {
        tabs += '<button class="tool-tab' + (i === 0 ? " active" : "") + '" data-tool="' + t.id + '" type="button">' + t.title + "</button>";
        panels += '<div class="tool-panel' + (i === 0 ? " active" : "") + '" id="panel-' + t.id + '">' + panelInner(t) + "</div>";
      });
      container.innerHTML = '<div class="tool-tabs">' + tabs + "</div>" + panels;
    }
  }

  function readValues(t) {
    var v = {};
    t.inputs.forEach(function (inp) {
      var el = document.getElementById("in-" + t.id + "-" + inp.key);
      if (!el) { v[inp.key] = inp.def; return; }
      if (inp.type === "sel") v[inp.key] = el.value;
      else if (inp.type === "len") v[inp.key] = parseLen(el.value);
      else v[inp.key] = (el.value === "" ? NaN : parseFloat(el.value));
    });
    return v;
  }

  function applyVisibility(t, v) {
    t.inputs.forEach(function (inp) {
      if (typeof inp.when !== "function") return;
      var el = document.getElementById("in-" + t.id + "-" + inp.key);
      if (!el) return;
      var wrap = el.closest(".field");
      if (wrap) wrap.style.display = inp.when(v) ? "" : "none";
    });
  }

  function recomputeTool(id) {
    var t = TOOLS.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    var v = readValues(t);
    applyVisibility(t, v);
    var out;
    try { out = t.compute(v); } catch (e) { out = { error: L("Check your inputs.", "请检查输入。") }; }
    var svgEl = document.getElementById("svg-" + id);
    var resEl = document.getElementById("res-" + id);
    var errEl = document.getElementById("err-" + id);
    var buyEl = document.getElementById("buy-" + id);
    var flagEl = document.getElementById("flag-" + id);
    var fEl = document.getElementById("formula-" + id);
    var nEl = document.getElementById("note-" + id);
    if (svgEl) svgEl.innerHTML = t.svg(v);
    if (out.error) {
      if (errEl) errEl.textContent = out.error;
      if (resEl) resEl.innerHTML = "";
      if (buyEl) buyEl.innerHTML = "";
      if (flagEl) flagEl.innerHTML = "";
      if (fEl) fEl.innerHTML = "";
      if (nEl) nEl.innerHTML = "";
      return;
    }
    if (errEl) errEl.textContent = "";
    if (resEl) resEl.innerHTML = out.results.map(function (r) {
      return '<div class="result' + (r.accent ? " accent" : "") + '">' +
        '<span class="rlabel">' + esc(L(r.en, r.zh)) + "</span>" +
        '<span class="rval">' + r.val + "</span>" +
        (r.sub ? '<span class="rsub">' + r.sub + "</span>" : "") + "</div>";
    }).join("");
    if (buyEl) {
      buyEl.innerHTML = out.buy && out.buy.length
        ? '<div class="buylist"><div class="bl-head">' + L("Shopping list", "采购清单") + "</div><ul>" +
          out.buy.map(function (b) {
            return "<li><span class=\"bl-item\">" + esc(L(b.en, b.zh)) + '</span><span class="bl-qty">' + b.qty + "</span></li>";
          }).join("") + "</ul></div>"
        : "";
    }
    if (flagEl) {
      flagEl.innerHTML = out.flag
        ? '<div class="code-flag ' + (out.flag.ok ? "ok" : "warn") + '">' + (out.flag.ok ? "✓ " : "⚠ ") + esc(out.flag.text) + "</div>"
        : "";
    }
    if (fEl) fEl.innerHTML = '<span class="f-title">' + L("Formula", "计算公式") + "</span>" + esc(L(out.formula.en, out.formula.zh));
    if (nEl) nEl.innerHTML = out.note ? esc(L(out.note.en, out.note.zh)) : "";
  }

  function recomputeAll() {
    TOOLS.forEach(function (t) { if (document.getElementById("panel-" + t.id)) recomputeTool(t.id); });
  }

  function switchTab(id) {
    TOOLS.forEach(function (t) {
      var p = document.getElementById("panel-" + t.id);
      var tab = document.querySelector('.tool-tab[data-tool="' + t.id + '"]');
      if (p) p.classList.toggle("active", t.id === id);
      if (tab) tab.classList.toggle("active", t.id === id);
    });
  }

  /** Convert all live input values to the new unit system, then re-render. */
  function switchSystem(sys) {
    if (sys === state.sys) return;
    var snapshot = {};
    TOOLS.forEach(function (t) {
      if (!document.getElementById("panel-" + t.id)) return;
      var vals = {};
      t.inputs.forEach(function (inp) {
        var el = document.getElementById("in-" + t.id + "-" + inp.key);
        if (!el) return;
        if (inp.type === "len") vals[inp.key] = parseLen(el.value);            // metres, system-independent
        else if (inp.type === "sel") vals[inp.key] = el.value;
        else if (inp.conv) {
          var raw = parseFloat(el.value);
          vals[inp.key] = isFinite(raw) ? (state.sys === "imperial" ? raw * CONV[inp.conv] : raw) : NaN; // store metric
        } else vals[inp.key] = el.value;
      });
      snapshot[t.id] = vals;
    });
    var activeId = null;
    var act = document.querySelector(".tool-tab.active");
    if (act) activeId = act.getAttribute("data-tool");
    state.sys = sys;
    try { localStorage.setItem("estimora-sys", sys); } catch (e) {}
    render();
    TOOLS.forEach(function (t) {
      var vals = snapshot[t.id];
      if (!vals) return;
      t.inputs.forEach(function (inp) {
        var el = document.getElementById("in-" + t.id + "-" + inp.key);
        if (!el || !(inp.key in vals)) return;
        var val = vals[inp.key];
        if (inp.type === "len") { if (isFinite(val)) el.value = lenInput(val); }
        else if (inp.type === "sel") el.value = val;
        else if (inp.conv) { if (isFinite(val)) el.value = Math.round((isImp() ? val / CONV[inp.conv] : val) * 1000) / 1000; }
        else el.value = val;
      });
    });
    if (activeId) switchTab(activeId);
    recomputeAll();
  }

  function applyI18n() {
    var dict = I18N[state.lang] || I18N.en;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (dict[k] !== undefined) el.textContent = dict[k];
    });
    var lt = document.getElementById("lang-toggle");
    if (lt) lt.textContent = (state.lang === "zh") ? "EN" : "中文";
  }

  function setLang(lang) {
    state.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    try { localStorage.setItem("estimora-lang", lang); } catch (e) {}
    applyI18n();
  }

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = (theme === "dark") ? "☀︎" : "☾";
    try { localStorage.setItem("estimora-theme", theme); } catch (e) {}
  }

  function render() {
    var container = landingTool ? document.getElementById("landing-tool") : document.getElementById("tools-root");
    if (!container) return;
    buildInto(container);
    recomputeAll();
  }

  function bindGlobal() {
    var lt = document.getElementById("lang-toggle");
    if (lt) lt.addEventListener("click", function () {
      var activeId = null;
      var act = document.querySelector(".tool-tab.active");
      if (act) activeId = act.getAttribute("data-tool");
      setLang(state.lang === "en" ? "zh" : "en");
      render();
      if (activeId) switchTab(activeId);
    });
    var tt = document.getElementById("theme-toggle");
    if (tt) tt.addEventListener("click", function () { setTheme(state.theme === "dark" ? "light" : "dark"); });

    document.addEventListener("input", function (e) {
      var t = e.target;
      if (!t || !t.id || t.id.indexOf("in-") !== 0) return;
      var parts = t.id.split("-");
      if (parts.length >= 3) recomputeTool(parts[1]);
    });
    document.addEventListener("change", function (e) {
      var t = e.target;
      if (!t || !t.id || t.id.indexOf("in-") !== 0) return;
      var parts = t.id.split("-");
      if (parts.length >= 3) recomputeTool(parts[1]);
    });
    document.addEventListener("click", function (e) {
      if (!e.target || !e.target.closest) return;
      var tabEl = e.target.closest(".tool-tab");
      if (tabEl) { switchTab(tabEl.getAttribute("data-tool")); return; }
      var unitEl = e.target.closest(".unit-btn");
      if (unitEl) { switchSystem(unitEl.getAttribute("data-sys")); }
    });
  }

  function init() {
    var savedLang = null, savedTheme = null, savedSys = null;
    try {
      savedLang = localStorage.getItem("estimora-lang");
      savedTheme = localStorage.getItem("estimora-theme");
      savedSys = localStorage.getItem("estimora-sys");
    } catch (e) {}
    if (params.get("lang") === "zh") savedLang = "zh";
    if (params.get("lang") === "en") savedLang = "en";
    if (!savedTheme && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) savedTheme = "dark";
    state.sys = (savedSys === "metric") ? "metric" : "imperial";
    setTheme(savedTheme === "dark" ? "dark" : "light");
    setLang(savedLang === "zh" ? "zh" : "en");
    bindGlobal();
    render();
  }

  // expose for tests
  window.__ESTIMORA__ = { parseLen: parseLen, TOOLS: TOOLS, state: state };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
