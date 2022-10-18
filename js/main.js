const root = document.querySelector(":root");
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
let RGBA = { r: 255, g: 255, b: 255, a: 255 };
let imageData;

let mainCvsClicking = false;
let brightCvsClicking = false;

let mainPickerOffset;
let brightPickerOffset;


addEventListener("load", () => {
  // set css default root values
  root.style.setProperty('--color-picker-radius', `${mainSize}px`);
  !isMobile && root.style.setProperty('--cursor', `pointer`);
  root.style.setProperty('--brightness-picker-height', `${bsh}px`);
  root.style.setProperty('--brightness-picker-width', `${bsw}px`);
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
    RGBA.r = r; RGBA.g = g; RGBA.b = b;

    root.style.setProperty('--color', `#${rgbToHex(r, g, b)}`);
    // set location x and y to main cursor position
    root.style.setProperty('--cursor-x', `${vector.x}px`);
    root.style.setProperty('--cursor-y', `${vector.y}px`);
    setupTexts(r, g, b);
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

    if (hipotanis >= r - 1) {
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


  function setupAllCss(x, y, r, g, b, bright) {
    vector.x = x; vector.y = y;
    setupTexts(r, g, b)
    root.style.setProperty('--color', `#${rgbToHex(r, g, b)}`);
    root.style.setProperty('--cursor-x', `${vector.x}px`);
    root.style.setProperty('--cursor-y', `${vector.y}px`);
    const dx = ((bsw / 255) * bright).toFixed(2);
    root.style.setProperty('--cursor-bx', `${bsw - dx}px`);
  }


  // find color 
  function findColorLocation(rgb, size) {
    const { r, g, b } = rgb;
    const _l_ = Math.floor(rgbToHsv(r, g, b).s * 2.55);

    for (let brit = _l_ + 2; brit >= _l_; brit--) {
      bright = brit;
      const p = setCanvasColor(true, true); // pixel


      console.log("************************");
      // fiste scane
      // for (let y = 0; y < size; y += gap) {
      //   for (let x = 0; x < size; x += gap) {
      //     const i = (y * size + x) * 4;
      //     // console.log(y, x);
      //     if (isCloseToColor({ r: p[i], g: p[i + 1], b: p[i + 2] },
      //       rgb, round(gap / 2))) {
      //       const _gap = 5; 


      //       console.log("____________________");
      //       // second scane
      //       for (let _y = 0; _y <= gap; _y += _gap) {
      //         for (let _x = 0; _x <= gap; _x += _gap) {
      //           const _i = ((y + _y) * size + (x + _x)) * 4;
      //           console.log(_y + y, _x + x);
      //           if (isCloseToColor({ r: p[_i], g: p[_i + 1], b: p[_i + 2] },
      //             rgb, round(_gap / 2))) {

      //               console.log("+++++++++++++++++++++++++++");
      //             // third scane
      //             for (let __y = 0; __y <= _gap; __y++) {
      //               for (let __x = 0; __x <= _gap; __x++) {
      //                 const __i = ((y + _y + __y) * size + (x + _x + __x)) * 4;
      //                 if (r == p[__i] && g == p[__i + 1] && b == p[__i + 2]) {
      //                   console.log("find core");
      //                   setupCss(x + _x + __x, y + _y + __y, r, g, b, brit);
      //                   return;
      //                 }
      //               }
      //             }

      //             console.log("find only out");
      //             setupCss(x + _x, y + _y, r, g, b, brit);
      //             return;
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
    }
  }



  function setupTexts(r, g, b) {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hwb = rgbToHwb(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const hsb = rgbToHsb(r, g, b);

    rgbInp.value = `${r}, ${g}, ${b}, ${RGBA.a}`;
    hexInp.value = `${hex}`;

    hslInp.value = `${hsl.h.toFixed(0)}, ${hsl.s.toFixed(0)}%, ${hsl.l.toFixed(0)}%`;

    hwbInp.value = `${Math.round(hwb.h)}, ${Math.round(hwb.w)}%, ${Math.round(hwb.b)}%`;
    hsvInp.value = `${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%`;
    hsbInp.value = `${Math.round(hsb.h)}, ${Math.round(hsb.s)}%, ${Math.round(hsb.b)}%`;
  }


  // default call 
  updateCanvas360Image(mc, mainImage, mainSize);
  setupTexts(RGBA.r, RGBA.g, RGBA.b);
  // setCanvasColor(false, true); // first time set color auto
  // findColorLocation(RGBA, mainSize);
  // findColorLocation({ r: 255, g: 0, b: 255 }, mainSize);


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
