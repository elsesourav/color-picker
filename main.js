const secn = ID("secn");
const colorBox = ID("color-box");
const colorPick = ID("color-pick");
const mainSelected = ID("main-selected");
const choiceBright = ID("choice-bright");

const mainPicker = ID("main-picker");
const brightnessPicker = ID("brightness-picker");
const mainSelecter = ID("main-selecter");
const brightnessSelecter = ID("brightness-selecter");
const main = document.querySelector("main");

let bright = 255;
let MSLocation = { x: mainCvsW / 2, y: mainCvsH / 2 }; // main selector location mouse and touch x, y
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
const allColorImages = getImages();


setCanvasColor(); // first time set color auto

function setCanvasColor(needReturn = false) {
  mc.putImageData(allColorImages[bright], 0, 0);
  if (!needReturn) {
    let rgba = mc.getImageData(MSLocation.x, MSLocation.y, 1, 1).data;
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
    root.style.setProperty('--cursor-x', `${MSLocation.x}px`);
    root.style.setProperty('--cursor-y', `${MSLocation.y}px`);
  }

  if (needReturn)
    return mc.getImageData(0, 0, mainCvsW, mainCvsH).data;
}


let mouseClicking = false;
const clrPkrOfstLeft = main.offsetLeft + mainPicker.offsetLeft;
const clrPkrOfstTop = main.offsetTop + mainPicker.offsetTop;

// pick color any particular positionfrom main canvas
const pickMainCanvasColor = (e, isClick = false) => {
  if (!mouseClicking && !isMobile && !isClick) return;

  if (isMobile && isClick) {
    MSLocation = {
      x: e.clientX - clrPkrOfstLeft, // touch x 
      y: e.clientY - clrPkrOfstTop // touch y
    }
  } else if (isMobile) {
    MSLocation = {
      x: e.touches[0].clientX - clrPkrOfstLeft, // touch x 
      y: e.touches[0].clientY - clrPkrOfstTop // touch y
    }
  } else {
    MSLocation = {
      x: e.offsetX, // mouse x 
      y: e.offsetY // mouse y
    }
  }
  setCanvasColor();
}

// mouse move event
mainPicker.addEventListener("mousedown", () => mouseClicking = true);
document.body.addEventListener("mouseup", () => mouseClicking = false);
mainPicker.addEventListener("mousemove", pickMainCanvasColor);
// mouse and touch click event
mainPicker.addEventListener("click", (e) => {
  pickMainCanvasColor(e, true);
});
// touch move event
mainPicker.addEventListener("touchmove", pickMainCanvasColor);



const bsw = mainCvsW, bsh = 25; // brightness selector width and height
const bc = new Canvas(brightnessPicker, bsw, bsh);

root.style.setProperty('--brightness-picker-height', `${bsh}px`);
const gradient = bc.createLinearGradient(0, 0, bsw, bsh)// create lenear gradient
gradient.addColorStop(0, "#FFFFFF");
gradient.addColorStop(1, "#000000");
bc.fillStyle(gradient);
bc.fillRect(0, 0, bsw, bsh);


const mainOffsetLeft = main.offsetLeft + brightnessPicker.offsetLeft;

// // pick color any particular position from brightness canvas
const pickBriCanvasColor = (e, isClick = false) => {
  if (!mouseClicking && !isMobile && !isClick) return;
  if (isMobile && isClick) {
    BSLocationX = e.clientX - mainOffsetLeft // touch y
  } else if (isMobile) {
    BSLocationX = e.touches[0].clientX - mainOffsetLeft // touch y
  } else {
    BSLocationX = e.offsetX // mouse y
  }

  let color = bc.getImageData(BSLocationX, 0, 1, 1).data;
  if (!color[3]) return;
  bright = color[0];

  //   // set location y to cursor position
  root.style.setProperty('--cursor-bx', `${BSLocationX}px`);
  root.style.setProperty('--color-b', `${rgbToHex(bright, bright, bright)}`);

  setCanvasColor();
}

// mouse move event
brightnessPicker.addEventListener("mousedown", () => mouseClicking = true);
brightnessPicker.addEventListener("mousemove", pickBriCanvasColor);
// mouse and touch click event
brightnessPicker.addEventListener("click", (e) => {
  pickBriCanvasColor(e, true);
});
// touch move event
brightnessPicker.addEventListener("touchmove", pickBriCanvasColor);


findColorLocation(0, 1, 0);

// find color 
function findColorLocation(r, g, b) {

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  for (let i = max; i >= min; i--) {
    bright = i;
    const p = setCanvasColor(true);

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












































function choiceHslFun(e) {
  // console.log(e.target.clientHeight)  
  // console.log(e.layerY) 


}

// hsl.forEach((h, i) => {
//   function setcolor() {
//     selectedIndex = i;
//     root.style.setProperty('--selecter-top', `${hsl[selectedIndex].offsetTop}px`);
//     currentColor = getRGB(hsl[selectedIndex].style.background);
//     // colorSetup(currentColor);
//     setCurrentColor();
//   }
//   h.addEventListener("click", setcolor);
//   h.addEventListener("touchstart", setcolor);
//   h.addEventListener("touchmove", setcolor);
//   h.addEventListener("touchend", setcolor);

//   h.addEventListener("mouseenter", () => {
//     currentColor = getRGB(h.style.background);
//     // colorSetup(currentColor);
//   });
//   h.addEventListener("mouseleave", () => {
//     root.style.setProperty('--selecter-top', `${hsl[selectedIndex].offsetTop}px`);
//     currentColor = getRGB(hsl[selectedIndex].style.background);
//     // colorSetup(currentColor);
//   });
// })

// const pick = document.querySelectorAll("pick");
// let mainSelect = 0;
// let hexColor = "FF0000";

// pick.forEach((p, i) => {
//   function setcolor() {
//     mainSelect = i;
//     root.style.setProperty('--main-selecter-top', `${pick[mainSelect].offsetTop}px`);
//     root.style.setProperty('--main-selecter-left', `${pick[mainSelect].offsetLeft}px`);
//     root.style.setProperty('--main-selecter-width', `${pick[mainSelect].clientWidth}px`);
//     root.style.setProperty('--main-selecter-height', `${pick[mainSelect].clientHeight}px`);
//     setCurrentColor();
//   }
//   p.addEventListener("click", setcolor);
//   p.addEventListener("touchstart", setcolor);
//   p.addEventListener("touchend", setcolor);

// })

// const hexColorCode = ID("hex-color-code");
// const hexFild = ID("h-c");
// const rgbaColorCode = ID("rgb-color-code");

// function setCurrentColor() {
//   hexColor = rgbToHex(pick[mainSelect].style.background);
//   hexFild.innerHTML = hexColor;
//   root.style.setProperty('--color', `#${hexColor}`);

//   let rgb = getRGB(pick[mainSelect].style.background);
//   rgbaColorCode.innerHTML = `<b>rgb(</b><p>${rgb[0]}, ${rgb[1]}, ${rgb[2]}</p><b>)</b>`
// }

// const tost = ID("tost");

// function copyText(str, ele) {
//   const inp = document.createElement("input");
//   inp.type = "text";
//   document.body.appendChild(inp);
//   inp.value = str;
//   inp.select();
//   inp.setSelectionRange(0, 100000);
//   navigator.clipboard.writeText(str);
//   document.body.removeChild(inp);

//   ele.classList.add("copy");
//   tost.classList.add("active");

//   setTimeout(() => ele.classList.remove("copy"), 1000);
//   setTimeout(() => tost.classList.remove("active"), 3000);
// }

// hexColorCode.addEventListener("click", () => {
//   let hx = hexColorCode.innerText;
//   copyText(hx, hexColorCode);
// })

// rgbaColorCode.addEventListener("click", () => {
//   let rgb = rgbaColorCode.innerText.split("\n").join("");
//   copyText(rgb, rgbaColorCode);
// })



// function colorSetup(ary) {
//   const r = ary[0], g = ary[1], b = ary[2];
//   const getCol = (x, index) => Math.round((x / (max - 1)) * index);
//   const getRow = (x, index) => Math.round(((255 - x) / (max - 1)) * index);
//   const picker = document.querySelectorAll("pick");

//   for (let i = 0; i < max; i++) {
//     let nr = getRow(r, i) + r;
//     let ng = getRow(g, i) + g;
//     let nb = getRow(b, i) + b;

//     for (let j = 0; j < max; j++) {
//       let rn = nr - getCol(nr, j);
//       let gn = ng - getCol(ng, j);
//       let bn = nb - getCol(nb, j);
//       picker[(max * i) + j].style.background = `rgb(${rn}, ${gn}, ${bn})`;
//     }
//   }

// }
