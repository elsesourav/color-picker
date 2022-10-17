"use strict"
const root = document.querySelector(":root");
const mainCvsW = 300;
const mainCvsH = 300;
root.style.setProperty('--color-picker-radius', `${mainCvsH}px`);

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


let isMobile = localStorage.mobile || window.navigator.maxTouchPoints > 1;
!isMobile && root.style.setProperty('--cursor', `pointer`);
// isMobile = true;

function rgbToHsl(r, g, b) {
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

  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    let hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


function rgbToHwb(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  let f, i,
    w = Math.min(r, g, b),
    v = Math.max(r, g, b),
    black = 1 - v;

  if (v === w) return { h: 0, w: w, b: black };
  f = r === w ? g - b : (g === w ? b - r : r - g);
  i = r === w ? 3 : (g === w ? 5 : 1);

  return { h: (i - f / (v - w)) / 6, w: w, b: black }
}

function hwbToRgb(h, w, b) {
  h *= 6;

  let v = 1 - b, n, f, i;
  if (!h) return { r: v, g: v, b: v };
  i = h | 0;
  f = h - i;
  if (i & 1) f = 1 - f;
  n = w + f * (v - w);
  v = (v * 255) | 0;
  n = (n * 255) | 0;
  w = (w * 255) | 0;

  switch (i) {
    case 6:
    case 0: return { r: v, g: n, b: w };
    case 1: return { r: n, g: v, b: w };
    case 2: return { r: w, g: v, b: n };
    case 3: return { r: w, g: n, b: v };
    case 4: return { r: n, g: w, b: v };
    case 5: return { r: v, g: w, b: n };
  }
}

function rgbToCmyk(R,G,B)
{
    if ((R == 0) && (G == 0) && (B == 0)) {
        return [0, 0, 0, 1];
    } else {
        var calcR = 1 - (R / 255),
            calcG = 1 - (G / 255),
            calcB = 1 - (B / 255);

        var K = Math.min(calcR, Math.min(calcG, calcB)),
            C = (calcR - K) / (1 - K),
            M = (calcG - K) / (1 - K),
            Y = (calcB - K) / (1 - K);

        return [C, M, Y, K];
    }
}
var cmykToRgb = function(c, m, y, k, normalized){
  c = (c / 100);
  m = (m / 100);
  y = (y / 100);
  k = (k / 100);
  
  c = c * (1 - k) + k;
  m = m * (1 - k) + k;
  y = y * (1 - k) + k;
  
  var r = 1 - c;
  var g = 1 - m;
  var b = 1 - y;
  
  if(!normalized){
      r = Math.round(255 * r);
      g = Math.round(255 * g);
      b = Math.round(255 * b);
  }
  
  return {
      r: r,
      g: g,
      b: b
  }
}

function rgbToHsv(r, g, b) {
  if (arguments.length === 1) {
      g = r.g, b = r.b, r = r.r;
  }
  var max = Math.max(r, g, b), min = Math.min(r, g, b),
      d = max - min,
      h,
      s = (max === 0 ? 0 : d / max),
      v = max / 255;

  switch (max) {
      case min: h = 0; break;
      case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
      case g: h = (b - r) + d * 2; h /= 6 * d; break;
      case b: h = (r - g) + d * 4; h /= 6 * d; break;
  }

  return {
      h: h,
      s: s,
      v: v
  };
}

function hsvToRgb(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
  }
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

/**
 * Returns the selected html element.
 * @param {string} id html element id.
 */
const ID = (id) => document.getElementById(id);



function getRGB(str) {
  return str.split(",").join("").split("rgb(").join("")
    .split(")").join("").split(" ").map(e => parseInt(e));
}

function rgbToHex(r, g, b) {
  let s = "#";
  for (let i = 0; i < 3; i++) {
    let t = ([r, g, b][i] % 256).toString(16);
    s += `${t}`.length < 2 ? `0${t}` : t;
  }
  return s;
}
