const mainPicker = ID("main-picker");
const brightnessPicker = ID("brightness-picker");
const main = document.querySelector("main");
const allInput = document.querySelectorAll("input");
const rgbInp = ID("rgb-input");
const hexInp = ID("hex-input");
const hslInp = ID("hsl-input");
const hwbInp = ID("hwb-input");
const hsvInp = ID("hsv-input");
const hsbInp = ID("hsb-input");

/* --------- variables ------------ */
const mc = new Canvas(mainPicker, mainRadius, mainRadius); // main color picker canvas 
let r = mainCvsR / 2, _1deg = toRadian(1.4);
let x = r, y = r; // hulf main canvas width height
const insert = 5;

const bsw = mainCvsR, bsh = 25; // brightness selector width and height
const bc = new Canvas(brightnessPicker, bsw, bsh);

let bright = 255;
let alpha = 255;
let vector = { x: mainCvsR / 2, y: mainCvsR / 2 }; // main selector location mouse and touch x, y
let BSLocationX = 0; // brightness selector location mouse and touch y
let rgbColor = { r: 0, g: 0, b: 0 };

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
    mc.lineTo(x + r * sin(angle), y + r * cos(angle));
    mc.lineTo(x + r * sin(angle + _1deg), y + r * cos(angle + _1deg));
    mc.fill();
  }
  const imdata = mc.getImageData(0, 0, mainCvsR, mainCvsR);




  function setCanvasColor(needReturn = false, isDrawImage = false) {
    // if (isDrawImage) {
    //   mc.clearRect();
    //   mc.putImageData(imdata, 0, 0);
    //   // creat brightness color
    //   const gradient = mc.createRadialGradient(x, y, r, x, y, 1); // create radial gradient
    //   const divi = 300;
    //   const delta = 1 / divi;
    //   for (let i = 0; i <= 1; i += delta) {
    //     gradient.addColorStop(i, `rgba(${bright}, ${bright}, ${bright}, ${i})`);
    //   }
    //   mc.fillStyle(gradient);
    //   mc.arc(x, y, r - insert, 0, Math.PI * 2);
    //   mc.fill();
    // }

    if (!needReturn) {
      // let rgba = mc.getImageData(vector.x, vector.y, 1, 1).data;
      // if (!rgba[3]) return;

      // rgbColor.r = rgba[0];
      // rgbColor.g = rgba[1];
      // rgbColor.b = rgba[2];

      // const { r, g, b } = rgbColor;
      // root.style.setProperty('--color', `#${rgbToHex(r, g, b)}`);
      // set location x andy to cursor position
      root.style.setProperty('--cursor-x', `${vector.x}px`);
      root.style.setProperty('--cursor-y', `${vector.y}px`);

      // setupTexts(r, g, b);
    }

    if (needReturn)
      return mc.getImageData(0, 0, mainCvsR, mainCvsR).data;
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

    let y = vector.y - r;
    let x = vector.x - r;

    
    const hipotanis = Math.sqrt(y * y + x * x);
    const angle = Math.atan2(y, x);
    
    
    if (hipotanis >= r) {
      vector.x = cos(angle) * r + r;
      vector.y = sin(angle) * r + r;
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

    const is = BSLocationX <= brightPickerOffset.width && BSLocationX >= 0;
    if (!is) {
      if (BSLocationX > brightPickerOffset.width) BSLocationX = brightPickerOffset.width;
      else BSLocationX = 0;
    }

    bright = bc.getImageData(BSLocationX, 0, 1, 1).data[0];

    // set location y to cursor position
    root.style.setProperty('--cursor-bx', `${BSLocationX}px`);
    root.style.setProperty('--color-b', `#${rgbToHex(bright, bright, bright)}`);

    setCanvasColor(false, true);
  }

  // find color 
  function findColorLocation(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    for (let i = max; i >= min; i--) {
      bright = i;
      const p = setCanvasColor(true, true);

      for (let y = 0; y < mainCvsR; y++) {
        for (let x = 0; x < mainCvsR; x++) {
          const k = (y * mainCvsR + x) * 4;

          if (!p[k + 3]) continue;

          const e = 3;
          // when r, g, b any one closer -3 and 3
          if (
            ((r >= p[k] - e && r <= p[k] + e) && g == p[k + 1] && b == p[k + 2]) ||
            (r == p[k] && (g >= p[k + 1] - e && g <= p[k + 1] + e) && b == p[k + 2]) ||
            (r == p[k] && g == p[k + 1] && (b >= p[k + 2] - e && b <= p[k + 2] + e))
          ) {


            // find the tergate color
            for (let yo = 0; yo <= e * 3; yo++) {
              for (let xo = 0; xo <= e * 3; xo++) {
                const loc = ((y + yo) * mainCvsR + (x + xo)) * 4;
                if (r == p[loc] && g == p[loc + 1] && b == p[loc + 2]) {
                  vector.x = x; vector.y = y;
                  setupTexts(r, g, b)
                  root.style.setProperty('--color', `#${rgbToHex(r, g, b)}`);
                  root.style.setProperty('--cursor-x', `${vector.x}px`);
                  root.style.setProperty('--cursor-y', `${vector.y}px`);
                  const dx = ((bsw / 255) * i).toFixed(2);
                  root.style.setProperty('--cursor-bx', `${bsw - dx}px`);
                  return;
                }
              }
            }
            vector.x = x; vector.y = y;
            setupTexts(r, g, b)
            root.style.setProperty('--color', `#${rgbToHex(r, g, b)}`);
            root.style.setProperty('--cursor-x', `${vector.x}px`);
            root.style.setProperty('--cursor-y', `${vector.y}px`);
            const dx = ((bsw / 255) * i).toFixed(2);
            root.style.setProperty('--cursor-bx', `${bsw - dx}px`);
            return;
          }
        }
      }
    }
  }



  function setupTexts(r, g, b) {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hwb = rgbToHwb(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const hsb = rgbToHsb(r, g, b);

    rgbInp.value = `${r}, ${g}, ${b}, ${alpha}`;
    hexInp.value = `${hex}`;

    hslInp.value = `${hsl.r.toFixed(0)}, ${hsl.g.toFixed(0)}%, ${hsl.b.toFixed(0)}%`;

    hwbInp.value = `${Math.round(hwb.h)}, ${Math.round(hwb.w)}%, ${Math.round(hwb.b)}%`;
    hsvInp.value = `${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%`;
    hsbInp.value = `${Math.round(hsb.h)}, ${Math.round(hsb.s)}%, ${Math.round(hsb.b)}%`;
    // console.log(hsv);
  }

  // dafualt call 
  setCanvasColor(false, true); // first time set color auto
  // findColorLocation(0, 0, 255);




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
