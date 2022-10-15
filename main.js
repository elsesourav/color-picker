const secn = ID("secn");
const colorBox = ID("color-box");
const colorPick = ID("color-pick");
const mainSelected = ID("main-selected");
const choiceBright = ID("choice-bright");

let bright = 255;
let MSLocation = { x: 130, y: 130 }; // main selector location mouse and touch x, y
let BSLocationY = 0; // brightness selector location mouse and touch y
let rgbaColor = { 
  r: 255,
  g: 255,
  b: 255,
}

//type of color: Name, rgb, hex, hsl, hwb, cmyk, Ncol;

const mc = new Canvas(colorPick, mainCvsW, mainCvsH); // main color picker canvas
// mc.scale(0.65, 0.65); 
let x = mainCvsW / 2, y = mainCvsH / 2; // hulf main canvas width height
let radius = mainCvsW / 2, _1deg = toRadian(1.5);
const insert = 7;


setCanvasColor(); // first time set color auto

function setCanvasColor() {
  // create hsl 0 to 360 deg all color 
  for (let i = 0; i < 360; i++) {
    const angle = toRadian(i);
    mc.fillStyle(`hsl(${i}, 100%, 50%)`);
    mc.moveTo(x, y);
    mc.lineTo(x + radius * sin(angle), y + radius * cos(angle));
    mc.lineTo(x + radius * sin(angle + _1deg), y + radius * cos(angle + _1deg));
    mc.fill();
  }

  // creat brightness color
  const gradient = mc.createRadialGradient(x, y, radius, x, y, 1); // create radial gradient
  const divi = 1000;
  const delta = 1 / divi;
  for (let i = delta; i <= 1; i += delta) {
    gradient.addColorStop(i, `rgba(${bright}, ${bright}, ${bright}, ${i})`);
  }
  mc.fillStyle(gradient);
  mc.arc(x, y, radius - insert, 0, Math.PI * 2);
  mc.fill();

  let rgba = mc.getImageData(MSLocation.x, MSLocation.y, 1, 1).data;

  rgbaColor = {
    r: rgba[0],
    g: rgba[1],
    b: rgba[2],
    a: rgba[3]
  }

  const { r, g, b } = rgbaColor;
  root.style.setProperty('--color', `${rgbToHex(r, g, b)}`);

  return mc.getImageData(0, 0, mainCvsW, mainCvsH).data;
}


let mouseClicking = false;
const clrPkrOfstLeft = colorBox.offsetLeft + secn.offsetLeft;
const clrPkrOfstTop = colorBox.offsetTop + secn.offsetTop;

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

  let rgba = mc.getImageData(MSLocation.x, MSLocation.y, 1, 1).data;
  if (!rgba[3]) return;

  rgbaColor = {
    r: rgba[0],
    g: rgba[1],
    b: rgba[2],
  }

  // set location x andy to cursor position
  root.style.setProperty('--cursor-x', `${MSLocation.x}px`);
  root.style.setProperty('--cursor-y', `${MSLocation.y}px`);

  setCanvasColor();
}

// mouse move event
colorPick.addEventListener("mousedown", () => mouseClicking = true);
document.body.addEventListener("mouseup", () => mouseClicking = false);
colorPick.addEventListener("mousemove", pickMainCanvasColor);
// mouse and touch click event
colorPick.addEventListener("click", (e) => {
  pickMainCanvasColor(e, true);
});
// touch move event
colorPick.addEventListener("touchmove", pickMainCanvasColor);



const bsw = 30, bsh = mainCvsH; // brightness selector width and height
const bc = new Canvas(choiceBright, bsw, bsh);

const gradient = bc.createLinearGradient(0, 0, bsw, bsh)// create lenear gradient
gradient.addColorStop(0, "#FFFFFF");
gradient.addColorStop(1, "#000000");
bc.fillStyle("#FFFFFF");
bc.fillRect(0, 0, bsw, insert);
bc.fillStyle(gradient);
bc.fillRect(0, insert, bsw, bsh - insert);
bc.fillStyle("#000000");
bc.fillRect(0, bsh - insert, bsw, bsh);


const briPkrOfstTop = colorBox.offsetTop + secn.offsetTop;

// // pick color any particular position from brightness canvas
const pickBriCanvasColor = (e, isClick = false) => {
  if (!mouseClicking && !isMobile && !isClick) return;

  if (isMobile && isClick) {
    BSLocationY = e.clientY - briPkrOfstTop // touch y
  } else if (isMobile) {
    BSLocationY = e.touches[0].clientY - briPkrOfstTop // touch y
  } else {
    BSLocationY = e.offsetY // mouse y
  }

  let color = bc.getImageData(0, BSLocationY, 1, 1).data;
  if (!color[3]) return;
  bright = color[0];

  //   // set location y to cursor position
  root.style.setProperty('--cursor-by', `${BSLocationY}px`);
  root.style.setProperty('--color-b', `${rgbToHex(bright, bright, bright)}`);

  setCanvasColor();
}

// mouse move event
choiceBright.addEventListener("mousedown", () => mouseClicking = true); 
choiceBright.addEventListener("mousemove", pickBriCanvasColor);
// mouse and touch click event
choiceBright.addEventListener("click", (e) => {
  pickBriCanvasColor(e, true);
});
// touch move event
choiceBright.addEventListener("touchmove", pickBriCanvasColor);





findColorLocation(0, 0, 0); 

// find color 
function findColorLocation(r, g, b) {

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  root.style.setProperty('--color', `${rgbToHex(r, g, b)}`); 
 
  
  for (let i = max; i >= min; i--) {
    bright = i;
    const px = setCanvasColor();
    
    for (let y = 0; y < mainCvsH; y++) {
      for (let x = 0; x < mainCvsW; x++) {
        const index = (y * mainCvsW + x) * 4;
        if (!px[index + 3]) continue;

        if (r == px[index] && g == px[index + 1] && b == px[index + 2]) {
            root.style.setProperty('--cursor-x', `${x}px`);
            root.style.setProperty('--cursor-y', `${y}px`);
            root.style.setProperty('--color', `${rgbToHex(r, g, b)}`); 
            console.log(x, y);
          return;
        }
      }
    } 
  }
}

console.log("end");











































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

const pick = document.querySelectorAll("pick");
let mainSelect = 0;
let hexColor = "FF0000";

pick.forEach((p, i) => {
  function setcolor() {
    mainSelect = i;
    root.style.setProperty('--main-selecter-top', `${pick[mainSelect].offsetTop}px`);
    root.style.setProperty('--main-selecter-left', `${pick[mainSelect].offsetLeft}px`);
    root.style.setProperty('--main-selecter-width', `${pick[mainSelect].clientWidth}px`);
    root.style.setProperty('--main-selecter-height', `${pick[mainSelect].clientHeight}px`);
    setCurrentColor();
  }
  p.addEventListener("click", setcolor);
  p.addEventListener("touchstart", setcolor);
  p.addEventListener("touchend", setcolor);

})

const hexColorCode = ID("hex-color-code");
const hexFild = ID("h-c");
const rgbaColorCode = ID("rgb-color-code");

function setCurrentColor() {
  hexColor = rgbToHex(pick[mainSelect].style.background);
  hexFild.innerHTML = hexColor;
  root.style.setProperty('--color', `#${hexColor}`);

  let rgb = getRGB(pick[mainSelect].style.background);
  rgbaColorCode.innerHTML = `<b>rgb(</b><p>${rgb[0]}, ${rgb[1]}, ${rgb[2]}</p><b>)</b>`
}

const tost = ID("tost");

function copyText(str, ele) {
  const inp = document.createElement("input");
  inp.type = "text";
  document.body.appendChild(inp);
  inp.value = str;
  inp.select();
  inp.setSelectionRange(0, 100000);
  navigator.clipboard.writeText(str);
  document.body.removeChild(inp);

  ele.classList.add("copy");
  tost.classList.add("active");

  setTimeout(() => ele.classList.remove("copy"), 1000);
  setTimeout(() => tost.classList.remove("active"), 3000);
}

hexColorCode.addEventListener("click", () => {
  let hx = hexColorCode.innerText;
  copyText(hx, hexColorCode);
})

rgbaColorCode.addEventListener("click", () => {
  let rgb = rgbaColorCode.innerText.split("\n").join("");
  copyText(rgb, rgbaColorCode);
})



function colorSetup(ary) {
  const r = ary[0], g = ary[1], b = ary[2];
  const getCol = (x, index) => Math.round((x / (max - 1)) * index);
  const getRow = (x, index) => Math.round(((255 - x) / (max - 1)) * index);
  const picker = document.querySelectorAll("pick");

  for (let i = 0; i < max; i++) {
    let nr = getRow(r, i) + r;
    let ng = getRow(g, i) + g;
    let nb = getRow(b, i) + b;

    for (let j = 0; j < max; j++) {
      let rn = nr - getCol(nr, j);
      let gn = ng - getCol(ng, j);
      let bn = nb - getCol(nb, j);
      picker[(max * i) + j].style.background = `rgb(${rn}, ${gn}, ${bn})`;
    }
  }

}
