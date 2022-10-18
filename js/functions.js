// create hsl 0 to 360 deg all color 
function get360Image(ctx, size) {
  const r = size / 2; // radius
  const stape = toRadian(1.4)

  for (let i = 0; i < 360; i++) {
    const angle = toRadian(i);
    ctx.fillStyle(`hsl(${i}, 100%, 50%)`);
    ctx.moveTo(r, r);
    ctx.lineTo(r + r * sin(angle), r + r * cos(angle));
    ctx.lineTo(r + r * sin(angle + stape), r + r * cos(angle + stape));
    ctx.fill();
  }
  return ctx.getImageData(0, 0, size, size);
}

function getImageLocationColor(imgData, y, x, size) {
  const i = (round(y) * size + round(x)) * 4;
  return { r: imgData[i], g: imgData[i + 1], b: imgData[i + 2] };
}

/**
 * @param {Object} c normal color
 * @param {Object} tc terget color
 * @param {Number} extra extra
 */
function isCloseToColor(c, tc, extra) {
  return (
    (tc.r >= c.r - extra && tc.r <= c.r + extra) &&
    (tc.g >= c.g - extra && tc.g <= c.g + extra) &&
    (tc.b >= c.b - extra && tc.b <= c.b + extra)
  );
}


const _inp_ = document.createElement("input");
document.body.appendChild(_inp_);
_inp_.style.position = "fixed";
_inp_.style.scale = "0";

function copyText(str, ele, ele1) {
  _inp_.type = "text";
  _inp_.value = str;
  _inp_.select();
  _inp_.setSelectionRange(0, 30); 
  navigator.clipboard.writeText(str);
  
  ele.focus();
  ele.select();
  
  ele1.classList.add("hover");
  
  setTimeout(() => {
    ele1.classList.remove("hover");
    _inp_.focus();
    _inp_.select();
  }, 2000);
}
