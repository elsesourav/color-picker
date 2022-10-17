const mainPicker = ID("main-picker");
const brightnessPicker = ID("brightness-picker");
const main = document.querySelector("main");
const allInput = document.querySelectorAll("input");
const rgbInp = ID("rgb-input");
const hexInp = ID("hex-input");
const hslInp = ID("hsl-input");
const hwbInp = ID("hwb-input");
const hsvInp = ID("hsv-input");
const cmykInp = ID("cmyk-input");

/* --------- variables ------------ */
const mc = new Canvas(mainPicker, mainCvsW, mainCvsH); // main color picker canvas 
let x = mainCvsW / 2, y = mainCvsH / 2; // hulf main canvas width height
let radius = mainCvsW / 2, _1deg = toRadian(1.4);
const insert = 5;
const divi = 150;
const delta = 1 / divi;

const bsw = mainCvsW - 20, bsh = 25; // brightness selector width and height
const bc = new Canvas(brightnessPicker, bsw, bsh);

let bright = 255;
let vector = { x: 0, y: 0 }; // main selector location mouse and touch x, y
let BSLocationX = 0; // brightness selector location mouse and touch y
let rgbaColor = { r: 0, g: 0, b: 0, a: 0 };

let mainCvsClicking = false;
let brightCvsClicking = false;

let mainPickerOffset;
let brightPickerOffset;


addEventListener("load", () => {
  // set css default root values
  root.style.setProperty('--brightness-picker-height', `${bsh}px`);
  root.style.setProperty('--brightness-picker-width', `${bsw}px`);
  const gradient = bc.createLinearGradient(0, 0, bsw, bsh)// create lenear gradient
  gradient.addColorStop(0, "#FFFFFF");
  gradient.addColorStop(1, "#000000");
  bc.fillStyle(gradient);
  bc.fillRect(0, 0, bsw, bsh);
  
  mainPickerOffset = mc.canvas.getBoundingClientRect();
  brightPickerOffset = bc.canvas.getBoundingClientRect();
  

  // create hsl 0 to 360 deg all color 
  for (let i = 0; i < 360; i++) {
    const angle = toRadian(i);
    mc.fillStyle(`hsl(${i}, 100%, 50%)`);
    mc.moveTo(x, y);
    mc.lineTo(x + radius * sin(angle), y + radius * cos(angle));
    mc.lineTo(x + radius * sin(angle + _1deg), y + radius * cos(angle + _1deg));
    mc.fill();
  }
  const imdata = mc.getImageData(0, 0, mainCvsW, mainCvsH);


  function setCanvasColor(needReturn = false, isDrawImage = false) {
    if (isDrawImage) {
      mc.clearRect();
      mc.putImageData(imdata, 0, 0);
      // creat brightness color
      const gradient = mc.createRadialGradient(x, y, radius, x, y, 1); // create radial gradient
      for (let i = delta; i <= 1; i += delta) {
        gradient.addColorStop(i, `rgba(${bright}, ${bright}, ${bright}, ${i})`);
      }
      mc.fillStyle(gradient);
      mc.arc(x, y, radius - insert, 0, Math.PI * 2);
      mc.fill();
    }

    if (!needReturn) {
      let rgba = mc.getImageData(vector.x, vector.y, 1, 1).data;
      if (!rgba[3]) return;

      rgbaColor.r = rgba[0];
      rgbaColor.g = rgba[1];
      rgbaColor.b = rgba[2];
      rgbaColor.a = rgba[3];

      const { r, g, b, a } = rgbaColor;
      root.style.setProperty('--color', `${rgbToHex(r, g, b)}`);
      // set location x andy to cursor position
      root.style.setProperty('--cursor-x', `${vector.x}px`);
      root.style.setProperty('--cursor-y', `${vector.y}px`);

      setupTexts(r, g, b, a);
    }

    if (needReturn)
      return mc.getImageData(0, 0, mainCvsW, mainCvsH).data;
  }


  // pick color any particular positionfrom main canvas
  const pickMainCanvasColor = (e, isClick = false) => {
    if (!mainCvsClicking && !isMobile && !isClick) return;

    if (isMobile && !isClick) {
      vector.x = e.touches[0].clientX - mainPickerOffset.left; // touch x 
      vector.y = e.touches[0].clientY - mainPickerOffset.top; // touch y
    } else {
      vector.x = e.clientX - mainPickerOffset.left; // touch x 
      vector.y = e.clientY - mainPickerOffset.top; // touch y
    }

    let y = vector.y - radius;
    let x = vector.x - radius;

    const hipotanis = Math.sqrt(y * y + x * x);
    const angle = Math.atan2(y, x);

    if (hipotanis >= 150) {
      vector.x = cos(angle) * radius + radius;
      vector.y = sin(angle) * radius + radius;
    }

    setCanvasColor();
  }

  // // pick color any particular position from brightness canvas
  const pickBriCanvasColor = (e, isClick = false) => {
    if (!brightCvsClicking && !isMobile && !isClick) return;

    if (isMobile && !isClick) {
      BSLocationX = e.touches[0].clientX - brightPickerOffset.left; // touch x
    } else {
      BSLocationX = e.clientX - brightPickerOffset.left; // touch x
    }

    const is = BSLocationX <= bsw && BSLocationX >= 0;
    if (!is) {
      if (BSLocationX > bsw) BSLocationX = bsw;
      else BSLocationX = 0;
    }

    bright = bc.getImageData(BSLocationX, 0, 1, 1).data[0];

    // set location y to cursor position
    root.style.setProperty('--cursor-bx', `${BSLocationX}px`);
    root.style.setProperty('--color-b', `${rgbToHex(bright, bright, bright)}`);

    setCanvasColor(false, true);
  }

  // find color 
  function findColorLocation(r, g, b) {

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    for (let i = max; i >= min; i--) {
      bright = i;
      const p = setCanvasColor(true, true);

      for (let y = 0; y < mainCvsH; y++) {
        for (let x = 0; x < mainCvsW; x++) {
          const k = (y * mainCvsW + x) * 4;
          try {
            if (!p[k + 3]) continue;

            const e = 5;
            // when r, g, b any one closer -3 and 3
            if (
              ((r >= p[k] - e && r <= p[k] + e) && g == p[k + 1] && b == p[k + 2]) ||
              (r == p[k] && (g >= p[k + 1] - e && g <= p[k + 1] + e) && b == p[k + 2]) ||
              (r == p[k] && g == p[k + 1] && (b >= p[k + 2] - e && b <= p[k + 2] + e))
            ) {
              vector.x = x; vector.y = y;
              setCanvasColor();
              const dx = ((bsw / 255) * i).toFixed(2);
              root.style.setProperty('--cursor-bx', `${bsw - dx}px`);
              return;
            }
          } catch (e) { }
        }
      }
    }
  }

  function setupTexts(r, g, b, a) {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b)
    const hwb = rgbToHwb(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);

    rgbInp.value = `${r}, ${g}, ${b}, ${a}`;
  }


  // dafualt call 
  setCanvasColor(false, true); // first time set color auto
  findColorLocation(255, 255, 255);


  /* --------------- Event Listiner -------------- */
  addEventListener("resize", () => {
    mainPickerOffset = mc.canvas.getBoundingClientRect();
    brightPickerOffset = bc.canvas.getBoundingClientRect();
  })

  // mouse move event
  mainPicker.addEventListener("mousedown", () => mainCvsClicking = true);
  document.body.addEventListener("mousemove", pickMainCanvasColor);
  document.body.addEventListener("mouseup", () => mainCvsClicking = false);
  // mouse and touch click event
  mainPicker.addEventListener("click", (e) => {
    pickMainCanvasColor(e, true);
  });
  // touch move event
  mainPicker.addEventListener("touchstart", () => mainCvsClicking = true);
  mainPicker.addEventListener("touchmove", pickMainCanvasColor);
  document.body.addEventListener("touchend", () => mainCvsClicking = false);

  // mouse move event
  brightnessPicker.addEventListener("mousedown", () => brightCvsClicking = true);
  document.body.addEventListener("mousemove", pickBriCanvasColor);
  document.body.addEventListener("mouseup", () => brightCvsClicking = false);
  // mouse and touch click event
  brightnessPicker.addEventListener("click", (e) => {
    pickBriCanvasColor(e, true);
  });
  // touch move event
  brightnessPicker.addEventListener("touchstart", () => brightCvsClicking = true);
  brightnessPicker.addEventListener("touchmove", pickBriCanvasColor);
  document.body.addEventListener("touchend", () => brightCvsClicking = false);

})
