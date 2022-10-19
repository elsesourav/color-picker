const root = document.querySelector(":root");
const mainPicker = ID("main-picker");
const brightnessPicker = ID("brightness-picker");
const main = document.querySelector("main");
const colorOutputBox = ID("color-output-box");
const allInput = document.querySelectorAll("input");
const copyIcon = document.querySelectorAll(".copy-icon");
const rgbInp = ID("rgb-input");
const hexInp = ID("hex-input");
const hslInp = ID("hsl-input");
const hwbInp = ID("hwb-input");
const hsvInp = ID("hsv-input");
const cmykInp = ID("cmyk-input");

/* --------- variables ------------ */
const mainSize = 300; // main color picker canvas size
const mc = new Canvas(mainPicker, mainSize, mainSize); // main color picker canvas 
const r = mainSize / 2;
const x = r, y = r; // hulf main canvas width height
const mainImage = get360Image(mc, mainSize);

const bsw = mainSize, bsh = 25; // brightness selector width and height
const bc = new Canvas(brightnessPicker, bsw, bsh);

let bright = 255;
let vector = { x: mainSize / 2, y: mainSize / 2 }; // main selector location mouse and touch x, y
let BSLocationX = 0; // brightness selector location mouse and touch y
let RGB = { r: 255, g: 255, b: 255 };
let imageData;

let mainCvsClicking = false;
let brightCvsClicking = false;

let mainPickerOffset;
let brightPickerOffset;


addEventListener("load", () => {
  // set css default root values
  root.style.setProperty('--color-picker-radius', `${mainSize}px`);
  !isMobile && root.style.setProperty('--cursor', `pointer`);
  isMobile && (colorOutputBox.style.position = "fixed");
  isMobile && (colorOutputBox.style.bottom = "50px");
  root.style.setProperty('--brightness-picker-height', `${bsh}px`);
  root.style.setProperty('--brightness-picker-width', `${bsw}px`);

  // create brightness selector
  const gradient = bc.createLinearGradient(0, 0, bsw, bsh)// create lenear gradient
  gradient.addColorStop(0, "#FFFFFF");
  gradient.addColorStop(1, "#000000");
  bc.fillStyle(gradient);
  bc.fillRect(0, 0, bsw, bsh);

  mainPickerOffset = mc.canvas.getBoundingClientRect();
  brightPickerOffset = bc.canvas.getBoundingClientRect();


  function updateCanvas360Image(ctx, image, size) {
    ctx.clearRect();
    ctx.putImageData(image, 0, 0);

    // creat brightness color
    const gradient = ctx.createRadialGradient(x, y, r, x, y, 1); // radial gradient 
    const divi = 300;
    const delta = 1 / divi;
    for (let i = 0; i <= 1; i += delta) {
      gradient.addColorStop(i, `rgba(${bright}, ${bright}, ${bright}, ${i})`);
    }
    ctx.fillStyle(gradient);
    ctx.arc(x, y, r - 2, 0, Math.PI * 2);
    ctx.fill();

    return imageData = ctx.getImageData(0, 0, size, size).data;
  }

  function setMainCss() {
    const color = getImageLocationColor(imageData, vector.y, vector.x, mainSize);
    const { r, g, b } = color;
    RGB.r = r; RGB.g = g; RGB.b = b;

    root.style.setProperty('--color', `#${rgbToHex(r, g, b)}`);
    // set location x and y to main cursor position
    root.style.setProperty('--cursor-x', `${vector.x}px`);
    root.style.setProperty('--cursor-y', `${vector.y}px`);

    !isMobile && setupTexts(r, g, b);
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

    if (hipotanis >= r - 1) {
      const angle = Math.atan2(y, x);
      vector.x = (cos(angle) * r * 0.99) + r;
      vector.y = (sin(angle) * r * 0.99) + r;
    }
    setMainCss();
  }

  // pick color any particular position from brightness canvas
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

    // set location x to cursor position
    root.style.setProperty('--cursor-bx', `${BSLocationX}px`);
    root.style.setProperty('--color-b', `#${rgbToHex(bright, bright, bright)}`);

    updateCanvas360Image(mc, mainImage, mainSize);
    setMainCss();
  }

  function setupAllCss(x, y, index) {
    const { r, g, b } = RGB;
    vector.x = x; vector.y = y;
    setupTexts(r, g, b, index)
    root.style.setProperty('--color', `#${rgbToHex(r, g, b)}`);
    root.style.setProperty('--cursor-x', `${vector.x}px`);
    root.style.setProperty('--cursor-y', `${vector.y}px`);
    const dx = ((bsw / 255) * bright).toFixed(2);
    root.style.setProperty('--cursor-bx', `${bsw - dx}px`);
  }

  // find color 
  function findColorLocation(rgb, index) {
    const { r, g, b } = rgb;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const gap = 3;

    for (let _b_ = max; _b_ >= min; _b_--) {
      bright = _b_;
      const p = updateCanvas360Image(mc, mainImage, mainSize) // pixel

      // fiste scane
      for (let y = 0; y < mainSize; y++) {
        for (let x = 0; x < mainSize; x++) {
          const i = (y * mainSize + x) * 4;

          if (!p[i + 3]) continue;

          if (isCloseToColor({ r: p[i], g: p[i + 1], b: p[i + 2] }, rgb, gap)) {

            for (let _y = 1; _y <= gap; _y++) {
              for (let _x = 0; _x <= gap; _x++) {

                const _i = ((y + _y) * mainSize + (x + _x)) * 4;
                if (r == p[_i] && g == p[_i + 1] && b == p[_i + 2]) {

                  RGB = rgb;
                  setupAllCss(x + _x, y + _y, index);
                  return;
                }
              }
            }

            RGB = rgb;
            setupAllCss(x, y, index);
            return;
          }
        }
      }
    }
  }


  function setupTexts(r, g, b, index = -1) {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hwb = rgbToHwb(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);

    if (index != 0)
      hexInp.value = `${hex}`;

    if (index != 1)
      rgbInp.value = `${round(r)}, ${round(g)}, ${round(b)}`;

    if (index != 2)
      hslInp.value = `${hsl.h.toFixed(0)}°, ${hsl.s.toFixed(0)}%, ${hsl.l.toFixed(0)}%`;

    if (index != 3)
      hwbInp.value = `${round(hwb.h)}°, ${round(hwb.w)}%, ${round(hwb.b)}%`;

    if (index != 4)
      hsvInp.value = `${round(hsv.h)}°, ${round(hsv.s)}%, ${round(hsv.v)}%`;

    if (index != 5)
      cmykInp.value = `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;
  }


  // default call 
  updateCanvas360Image(mc, mainImage, mainSize);
  setupTexts(RGB.r, RGB.g, RGB.b);



  /* --------------- Event Listiner -------------- */
  addEventListener("resize", () => {
    mainPickerOffset = mc.canvas.getBoundingClientRect();
    brightPickerOffset = bc.canvas.getBoundingClientRect();
  })

  copyIcon.forEach((copy, i) => {
    let value = allInput[i].value;
    copy.addEventListener("click", () => {
      i === 0 ? copyText(`#${value}`, allInput[i], copy) : copyText(value, allInput[i], copy);
    })
  })


  // all input event
  allInput.forEach((input, i) => {
    input.addEventListener("keyup", (e) => {
      try {
        const value = e.target.value;
        let color;
        switch (i) {
          case 0:
            color = hexToRgb(value);
            if (color) findColorLocation(color, i);
            break;
          case 1:
            color = validRgb(value);
            if (color) findColorLocation(color, i);
            break;
          case 2:
            color = hslToRgb(value);
            if (color) findColorLocation(color, i);
            break;
          case 3:
            color = hwbToRgb(value);
            if (color) findColorLocation(color, i);
            break;
          case 4:
            color = hsvToRgb(value);
            if (color) findColorLocation(color, i);
            break;
          case 5:
            color = cmykToRgb(value);
            if (color) findColorLocation(color, i);
            break;
        }
      } catch (error) {
        console.log(error);
      }
    });
  });


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
  document.body.addEventListener("touchend", () => {
    mainCvsClicking && setupTexts(RGB.r, RGB.g, RGB.b);
    mainCvsClicking = false;
  });

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
  document.body.addEventListener("touchend", () => {
    brightCvsClicking && setupTexts(RGB.r, RGB.g, RGB.b);
    brightCvsClicking = false
  });

})
