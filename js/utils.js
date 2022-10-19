"use strict"

class Canvas {
  constructor(appendElement, width, height) {
    this.appendElement = appendElement;
    this.width = width;
    this.height = height;
    this.canvas = document.createElement("canvas");
    this.appendElement.appendChild(this.canvas);
    this.canvas.setAttribute("width", this.width);
    this.canvas.setAttribute("height", this.height);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.context = this.canvas.getContext("2d");
  }
  fillStyle = color => this.context.fillStyle = color;
  lineTo = (x, y) => this.context.lineTo(x, y);
  clearRect = () => this.context.clearRect(0, 0, this.width, this.height);
  fillRect = (x, y, w, h) => this.context.fillRect(x, y, w, h);
  scale = (x, y) => this.context.scale(x, y);

  createRadialGradient = (x1, y1, r1, x2, y2, r2) =>
    this.context.createRadialGradient(x1, y1, r1, x2, y2, r2);
  createLinearGradient = (x1, y1, x2, y2) =>
    this.context.createLinearGradient(x1, y1, x2, y2);

  arc = (x, y, radius, startAngle, endAngle, anti) => {
    this.context.beginPath();
    this.context.arc(x, y, radius, startAngle, endAngle, anti);
    this.context.closePath();
  }
  moveTo = (x, y) => {
    this.context.beginPath();
    this.context.moveTo(x, y);
  };
  stroke = (strokeWidth) => {
    this.context.lineWidth = strokeWidth;
    this.context.stroke();
    this.context.closePath();
  }
  fill = () => {
    this.context.fill();
    this.context.closePath();
  };

  // for image 
  getImageData = (sx, sy, sw, sh) => this.context.getImageData(sx, sy, sw, sh);
  putImageData = (image, dx, dy) => this.context.putImageData(image, dx, dy);
}


/* ---------- math ---------- */
const PI = Math.PI;
const sin = x => Math.sin(x);
const cos = y => Math.cos(y);
const atan2 = (y, x) => Math.atan2(y, x);
const abs = n => Math.abs(n);
const round = n => Math.round(n);

const toRadian = degree => (degree * Math.PI) / 180;// degree convert to radian
const toDegree = radian => (radian * 180) / Math.PI;// radian convert to Degree

const random = (start = 0, end = 1, int_floor = false) => {
  const result = start + (Math.random() * (end - start));
  return int_floor ? Math.floor(result) : result;
}

/* e.x 
(0 start) -------.------ (10 end) input . = 5
(10 min) ----------------.---------------- (30 max) output . = 20
*/
const map = (point, start, end, min, max) => {
  const per = (point - start) / (end - start);
  return ((max - min) * per) + min;
}


const isMobile = localStorage.mobile || window.navigator.maxTouchPoints > 1;

/* ------------- hsl ------------ */
const rgbToHsl = (r, g, b) => {
  r /= 255, g /= 255, b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToRgb = (value) => {
  let v = value.split("%").join("").split("°").join("").split(" ").join("");

  if (/^([0-9]{1,3},[0-9]{1,3},[0-9]{1,3})$/.test(v)) {
    v = v.split(",");

    let h = v[0] % 360, s = v[1] % 100, l = v[2] % 100;
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return { r: 255 * f(0), g: 255 * f(8), b: 255 * f(4) };
  }
  return false;
};

/* ------------- cmyk ------------ */
function cmykToRgb(value) {
  let val = value.split("%").join("").split("°").join("").split(" ").join("");

  if (/^([0-9]{1,3},[0-9]{1,3},[0-9]{1,3},[0-9]{1,3})$/.test(val)) {
    val = val.split(",");
    let k = ((val[3] % 100) / 100);
    let c = ((val[0] % 100) / 100) * (1 - k) + k;
    let m = ((val[1] % 100) / 100) * (1 - k) + k;
    let y = ((val[2] % 100) / 100) * (1 - k) + k;

    return {
      r: Math.round(255 * (1 - c)),
      g: Math.round(255 * (1 - m)),
      b: Math.round(255 * (1 - y))
    }
  }
  return false;
}

function rgbToCmyk(r, g, b) {
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);
  let k = Math.min(c, Math.min(m, y));

  c = (c - k) / (1 - k);
  m = (m - k) / (1 - k);
  y = (y - k) / (1 - k);

  c = Math.round(c * 10000 / 100);
  m = Math.round(m * 10000 / 100);
  y = Math.round(y * 10000 / 100);
  k = Math.round(k * 10000 / 100);

  return {
    c: isNaN(c) ? 0 : c,
    m: isNaN(m) ? 0 : m,
    y: isNaN(y) ? 0 : y,
    k: isNaN(k) ? 0 : k
  }

}
/* ------------- hwb ------------ */
function rgbToHwb(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  let f, i,
    w = Math.min(r, g, b),
    v = Math.max(r, g, b),
    black = 1 - v;

  if (v === w) return { h: 0, w: w * 100, b: black * 100 };
  f = r === w ? g - b : (g === w ? b - r : r - g);
  i = r === w ? 3 : (g === w ? 5 : 1);

  return { h: ((i - f / (v - w)) / 6) * 360, w: w * 100, b: black * 100 };
}
function hwbToRgb(value) {
  let val = value.split("%").join("").split("°").join("").split(" ").join("");

  if (/^([0-9]{1,3},[0-9]{1,3},[0-9]{1,3})$/.test(val)) {
    val = val.split(",");

    let h = (val[0] % 360) / 360;
    let wh = (val[1] % 100) / 100;
    let bl = (val[2] % 100) / 100;
    let ratio = wh + bl;
    let i, v, f, n, /* ---- */ r, g, b;

    // wh + bl cant be > 1
    if (ratio > 1) {
      wh /= ratio;
      bl /= ratio;
    }

    i = Math.floor(6 * h);
    v = 1 - bl;
    f = 6 * h - i;

    if ((i & 0x01) !== 0) {
      f = 1 - f;
    }

    n = wh + f * (v - wh); // linear interpolation

    switch (i) {
      default:
      case 6:
      case 0: r = v; g = n; b = wh; break;
      case 1: r = n; g = v; b = wh; break;
      case 2: r = wh; g = v; b = n; break;
      case 3: r = wh; g = n; b = v; break;
      case 4: r = n; g = wh; b = v; break;
      case 5: r = v; g = wh; b = n; break;
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }
  return false;
}


/* ------------- hsv ------------ */
function rgbToHsv(r, g, b) {
  let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
  rabs = r / 255;
  gabs = g / 255;
  babs = b / 255;
  v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
  diffc = c => (v - c) / 6 / diff + 1 / 2;
  percentRoundFn = num => Math.round(num * 100) / 100;
  if (diff == 0) {
    h = s = 0;
  } else {
    s = diff / v;
    rr = diffc(rabs);
    gg = diffc(gabs);
    bb = diffc(babs);

    if (rabs === v) {
      h = bb - gg;
    } else if (gabs === v) {
      h = (1 / 3) + rr - bb;
    } else if (babs === v) {
      h = (2 / 3) + gg - rr;
    }
    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
  }
  return {
    h: Math.round(h * 360),
    s: percentRoundFn(s * 100),
    v: percentRoundFn(v * 100)
  };
}
function hsvToRgb(value) {
  let val = value.split("%").join("").split("°").join("").split(" ").join("");

  if (/^([0-9]{1,3},[0-9]{1,3},[0-9]{1,3})$/.test(val)) {
    val = val.split(",");

    let r, g, b, i, f, p, q, t;
    let h = (val[0] % 360) / 360;
    let s = (val[1] % 100) / 100;
    let v = (val[2] % 100) / 100;

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
  return false;
}

/* ------------- hex ------------ */
const rgbToHex = (r, g, b) => ((r << 16) + (g << 8) + b).toString(16).padStart(6, '0');

function hexToRgb(hex) {
  const valid = (/^([0-9a-f]{3}|[0-9a-f]{6})$/i).test(hex);
  if (valid) {
    let ary = [];

    if (hex.length == 3) {
      for (let i = 0; i < 3; i++) ary.push(`${hex[i]}${hex[i]}`);
    } else {
      for (let i = 0; i < 6; i += 2) ary.push(`${hex[i]}${hex[i + 1]}`);
    }
    return {
      r: parseInt(ary[0], 16),
      g: parseInt(ary[1], 16),
      b: parseInt(ary[2], 16)
    }
  }
  return false;
}

/* ----------- rgb -------------- */
function validRgb(value) {
  let val = value.split(" ").join("");

  if (/^([0-9]{1,3},[0-9]{1,3},[0-9]{1,3})$/.test(val)) {
    val = val.split(",");
    return { r: parseInt(val[0]) % 256, g: parseInt(val[1]) % 256, b: parseInt(val[2]) % 256 };
  }
  return false;
}


/**
 * Returns the selected html element.
 * @param {string} id html element id.
 */
const ID = (id) => document.getElementById(id);



