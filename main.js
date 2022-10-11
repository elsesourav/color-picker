const root = document.querySelector(':root');
// root.style.setProperty('--color', `${}`);

const choiceHsl = document.getElementById("choice-hsl");
const colorPick = document.getElementById("color-pick");

let currentColor = [255, 0, 0];
let selectedIndex = 0;
const max = 32;
root.style.setProperty('--max', `${max}`);

for (let i = 0; i < max * max; i++) {
  colorPick.innerHTML += `<pick></pick>`;
}

colorSetup(currentColor)

for (let i = 0; i < 360; i++) {
  choiceHsl.innerHTML += `<c style="background: hsl(${i}, ${100}%, ${50}%)"></c>`
}
const hsl = document.querySelectorAll("c");

hsl.forEach((h, i) => {
  function setcolor() {
    selectedIndex = i;
    root.style.setProperty('--selecter-top', `${hsl[selectedIndex].offsetTop}px`);
    currentColor = getRGB(hsl[selectedIndex].style.background);
    colorSetup(currentColor);
    setCurrentColor();
  }
  h.addEventListener("click", setcolor);
  h.addEventListener("touchstart", setcolor);
  h.addEventListener("touchmove", setcolor);
  h.addEventListener("touchend", setcolor);

  h.addEventListener("mouseenter", () => {
    currentColor = getRGB(h.style.background);
    colorSetup(currentColor);
  });
  h.addEventListener("mouseleave", () => {
    root.style.setProperty('--selecter-top', `${hsl[selectedIndex].offsetTop}px`);
    currentColor = getRGB(hsl[selectedIndex].style.background);
    colorSetup(currentColor);
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

const hexColorCode = document.getElementById("hex-color-code");
const hexFild = document.getElementById("h-c");
const rgbColorCode = document.getElementById("rgb-color-code");

function setCurrentColor() {
  hexColor = rgbToHexColor(pick[mainSelect].style.background);
  hexFild.innerHTML = hexColor;
  root.style.setProperty('--color', `#${hexColor}`);

  let rgb = getRGB(pick[mainSelect].style.background);
  rgbColorCode.innerHTML = `<b>rgb(</b><p>${rgb[0]}, ${rgb[1]}, ${rgb[2]}</p><b>)</b>`
}

const tost = document.getElementById("tost");

function copyText(str, ele) {
  const inp = document.createElement("input");
  inp.type = "text";
  document.body.appendChild(inp);
  inp.value = str;
  inp.select();
  inp.setSelectionRange(0, 99999); 
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

function getRGB(str) {
  return str.split(",").join("").split("rgb(").join("")
    .split(")").join("").split(" ").map(e => parseInt(e));
}

function rgbToHexColor(str) {
  let hex = getRGB(str);
  let s = "";
  for (let i = 0; i < 3; i++) {
    let t = (hex[i] % 256).toString(16);
    s += `${t}`.length < 2 ? `0${t}` : t;
  }
  return s.toUpperCase();
}


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
