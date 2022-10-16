const secn = ID("secn");
const colorBox = ID("color-box");
const colorPick = ID("color-pick");
const choiceBright = ID("choice-bright");

const mainPicker = ID("main-picker");
const brightnessPicker = ID("brightness-picker");
const mainSelecter = ID("main-selecter");
const brightnessSelecter = ID("brightness-selecter");
const main = document.querySelector("main");

let bright = 255;
let vector = { x: mainCvsW / 2, y: mainCvsH / 2 }; // main selector location mouse and touch x, y
let BSLocationX = 0; // brightness selector location mouse and touch y
let rgbaColor = {
  r: 255,
  g: 255,
  b: 255,
}



//type of color: Name, rgb, hex, hsl, hwb, cmyk, Ncol;

const mc = new Canvas(mainPicker, mainCvsW, mainCvsH); // main color picker canvas 
let x = mainCvsW / 2, y = mainCvsH / 2; // hulf main canvas width height
let radius = mainCvsW / 2, _1deg = toRadian(1.4);
const insert = 5;
const divi = 1000;
const delta = 1 / divi;

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


setCanvasColor(false, true); // first time set color auto

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

    rgbaColor = {
      r: rgba[0],
      g: rgba[1],
      b: rgba[2],
      a: rgba[3]
    }

    const { r, g, b } = rgbaColor;
    root.style.setProperty('--color', `${rgbToHex(r, g, b)}`);
    // set location x andy to cursor position
    root.style.setProperty('--cursor-x', `${vector.x}px`);
    root.style.setProperty('--cursor-y', `${vector.y}px`);


  }

  if (needReturn)
    return mc.getImageData(0, 0, mainCvsW, mainCvsH).data;
}


let clrPkrOfstLeft = main.offsetLeft + mainPicker.offsetLeft;
let clrPkrOfstTop = main.offsetTop + mainPicker.offsetTop;
let mainOffsetLeft = main.offsetLeft + brightnessPicker.offsetLeft;

addEventListener("resize", () => {
  clrPkrOfstLeft = main.offsetLeft + mainPicker.offsetLeft;
  clrPkrOfstTop = main.offsetTop + mainPicker.offsetTop;
  mainOffsetLeft = main.offsetLeft + brightnessPicker.offsetLeft;
})


let mainCvsClicking = false;
// pick color any particular positionfrom main canvas
const pickMainCanvasColor = (e, isClick = false) => {
  if (!mainCvsClicking && !isMobile && !isClick) return;

  if (isMobile && !isClick) {
    vector.x = e.touches[0].clientX - clrPkrOfstLeft; // touch x 
    vector.y = e.touches[0].clientY - clrPkrOfstTop // touch y
  } else {
    vector.x = e.clientX - clrPkrOfstLeft; // touch x 
    vector.y = e.clientY - clrPkrOfstTop // touch y
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



const bsw = mainCvsW - 20, bsh = 25; // brightness selector width and height
const bc = new Canvas(brightnessPicker, bsw, bsh);
let brightCvsClicking = false;

root.style.setProperty('--brightness-picker-height', `${bsh}px`);
root.style.setProperty('--brightness-picker-width', `${bsw}px`);
const gradient = bc.createLinearGradient(0, 0, bsw, bsh)// create lenear gradient
gradient.addColorStop(0, "#FFFFFF");
gradient.addColorStop(1, "#000000");
bc.fillStyle(gradient);
bc.fillRect(0, 0, bsw, bsh);



// // pick color any particular position from brightness canvas
const pickBriCanvasColor = (e, isClick = false) => {
  if (!brightCvsClicking && !isMobile && !isClick) return;

  if (isMobile && !isClick) {
    BSLocationX = e.touches[0].clientX - mainOffsetLeft // touch y
  } else {
    BSLocationX = e.clientX - mainOffsetLeft // touch y
  }

  const is = BSLocationX <= bsw && BSLocationX >= 0;
  if (!is) {
    BSLocationX > bsw && (BSLocationX = bsw);
    BSLocationX < 0 && (BSLocationX = 0);
  }

  bright = bc.getImageData(BSLocationX, 0, 1, 1).data[0];

  // set location y to cursor position
  root.style.setProperty('--cursor-bx', `${BSLocationX}px`);
  root.style.setProperty('--color-b', `${rgbToHex(bright, bright, bright)}`);

  setCanvasColor(false, true);
}

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






// findColorLocation(0, 1, 0);

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
            root.style.setProperty('--cursor-x', `${x}px`);
            root.style.setProperty('--cursor-y', `${y}px`);
            const dx = ((mainCvsW / 255) * i).toFixed(2);
            root.style.setProperty('--cursor-bx', `${bsw - dx}px`);
            root.style.setProperty('--color', `${rgbToHex(r, g, b)}`);
            return;
          }
        } catch (e) { }
      }
    }
  }
}


