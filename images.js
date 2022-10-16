function getImages() {
  let images = [];

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
  for (let i = 0; i < 256; i++) {
    mc.clearRect();
    mc.putImageData(imdata, 0, 0);

    // creat brightness color
    const gradient = mc.createRadialGradient(x, y, radius, x, y, 1); // create radial gradient
    for (let j = delta; j <= 1; j += delta) {
      gradient.addColorStop(j, `rgba(${i}, ${i}, ${i}, ${j})`);
    }
    mc.fillStyle(gradient);
    mc.arc(x, y, radius - insert, 0, Math.PI * 2);
    mc.fill();
    images.push(mc.getImageData(0, 0, mainCvsW, mainCvsH));
  }
  return images;
}