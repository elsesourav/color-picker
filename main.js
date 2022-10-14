const secn = ID("secn");
const colorBox = ID("color-box");
const choiceHsl = ID("choice-hsl");
const colorPick = ID("color-pick");
colorPick.appendChild(cvs)

let rgbColor = {
  r: 255,
  g: 255,
  b: 255,
}
 

const mainSelected = ID("main-selected");
const hsl = document.querySelectorAll("c");


choiceHsl.addEventListener("click", choiceHslFun);
choiceHsl.addEventListener("mouseenter", choiceHslFun);
choiceHsl.addEventListener("mousemove", choiceHslFun);

//type of color: Name, rgb, hex, hsl, hwb, cmyk, Ncol;

let x = winw / 2, y = winh / 2;
let radius = 150, _1deg = toRadian(1.5);

for(let i = 0; i < 360; i++) {
  let angle = toRadian(i);
  ctx.fillStyle = `hsl(${i}, 100%, 50%)`;
  ctx.beginPath();
  moveTo(x, y);
  lineTo(x + radius * sin(angle), y + radius * cos(angle));
  lineTo(x + radius * sin(angle + _1deg), y + radius * cos(angle + _1deg));
  ctx.fill();
  ctx.closePath();
}

const insert = 5;
const g = ctx.createRadialGradient(x, y, winw / 2 - insert, x, y, insert);
const divi = 200, _color = getRGB("rgb(255, 255, 255)");
for (let i = 1; i <= divi; i++) {
  let alpha = (1 / divi);
  g.addColorStop(
    alpha * i, `rgba(${_color[0]}, ${_color[1]}, ${_color[2]}, ${alpha * i})`);
}
ctx.fillStyle = g;
ctx.fillRect(0 + insert, 0 + insert, winw - insert * 2, winh - insert * 2);


let mouseClicking = false;
let clrPkrOfstLeft = colorBox.offsetLeft + secn.offsetLeft;
let clrPkrOfstTop = colorBox.offsetTop + secn.offsetTop;

// pick canvas color any particular position
const pickCanvasColor = (e, isClick = false) => {
  if(!mouseClicking && !isMobile && !isClick) return;
  let location; // mouse and touch x, y location

  if (isMobile && isClick) {
    location = {
      x: e.clientX - clrPkrOfstLeft, // touch x 
      y: e.clientY - clrPkrOfstTop // touch y
    }
  } else if (isMobile) {
    console.log(1);
    location = {
      x: e.touches[0].clientX - clrPkrOfstLeft, // touch x 
      y: e.touches[0].clientY - clrPkrOfstTop // touch y
    }
  } else {
    location = {
      x: e.offsetX, // mouse x 
      y: e.offsetY // mouse y
    }
  }

  let rgba = ctx.getImageData(Math.round(location.x), Math.round(location.y), 1, 1).data; 
  if (rgba[3] < 1) return;

  rgbColor = {
    r: rgba[0],
    g: rgba[1],
    b: rgba[2],
  }

  // set location x andy to cursor position
  root.style.setProperty('--cursor-x', `${location.x}px`);
  root.style.setProperty('--cursor-y', `${location.y}px`);
  const {r, g, b} = rgbColor;
  root.style.setProperty('--color', `${rgbToHex(r, g, b)}`);


  // console.log(rgbToHex(r, g, b));
}

// mouse move event
colorPick.addEventListener("mousedown", () => mouseClicking = true);
colorPick.addEventListener("mouseup", () => mouseClicking = false);
colorPick.addEventListener("mouseleave", () => mouseClicking = false);
colorPick.addEventListener("mousemove", pickCanvasColor);
// mouse and touch click event
colorPick.addEventListener("click", (e) => {
  pickCanvasColor(e, true);
});
// touch move event
colorPick.addEventListener("touchmove", pickCanvasColor);






















function choiceHslFun(e) {
  // console.log(e.target.clientHeight)  
  // console.log(e.layerY) 


}

hsl.forEach((h, i) => {
  function setcolor() {
    selectedIndex = i;
    root.style.setProperty('--selecter-top', `${hsl[selectedIndex].offsetTop}px`);
    currentColor = getRGB(hsl[selectedIndex].style.background);
    // colorSetup(currentColor);
    setCurrentColor();
  }
  h.addEventListener("click", setcolor);
  h.addEventListener("touchstart", setcolor);
  h.addEventListener("touchmove", setcolor);
  h.addEventListener("touchend", setcolor);

  h.addEventListener("mouseenter", () => {
    currentColor = getRGB(h.style.background);
    // colorSetup(currentColor);
  });
  h.addEventListener("mouseleave", () => {
    root.style.setProperty('--selecter-top', `${hsl[selectedIndex].offsetTop}px`);
    currentColor = getRGB(hsl[selectedIndex].style.background);
    // colorSetup(currentColor);
  });
})

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
const rgbColorCode = ID("rgb-color-code");

function setCurrentColor() {
  hexColor = rgbToHex(pick[mainSelect].style.background);
  hexFild.innerHTML = hexColor;
  root.style.setProperty('--color', `#${hexColor}`);

  let rgb = getRGB(pick[mainSelect].style.background);
  rgbColorCode.innerHTML = `<b>rgb(</b><p>${rgb[0]}, ${rgb[1]}, ${rgb[2]}</p><b>)</b>`
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

rgbColorCode.addEventListener("click", () => {
  let rgb = rgbColorCode.innerText.split("\n").join("");
  copyText(rgb, rgbColorCode);
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
