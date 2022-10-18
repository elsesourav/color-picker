
/****************************************************************************
 *                -----Example Glow Text Class-----                         *
 *   class="tl-glow opacity-1 brightness-1 animationTime-5 color-#00ffff"   *
 *                                                                          *
 *                                                                          *
 *                                                                          *
 *                                                                          *
 ******************____________©SouravBarui2022____________******************/

"use-strict"
const _tl_glow_ = document.querySelectorAll(".tl-glow");
const _root_ = document.querySelector(":root");
const _style_ = document.createElement('style');
_style_.setAttribute('type', 'text/css');
document.head.appendChild(_style_);

// _style_.innerText = ` `;

_tl_set_glow_text_();

function _tl_set_glow_text_() {
  _style_.innerText += 
  `.tl-glow span {
    position: relative;
    width: min-content;
    height: min-content;
    opacity: 0.1;
    color: var(--color);
    animation: var(--name) linear var(--time) infinite;
    animation-delay: var(--delay);
  }
  .tl-glow span::before {
    position: absolute;
    content: attr(data-tl);
    color: rgba(var(--brightness), var(--brightness), var(--brightness), var(--opacity));
    width: 100%;
    height: 100%;
    transform: scale(0.85, 0.9);
  }`;

  _tl_glow_.forEach((element, index) => {
    let opacity = 0.2;
    let brightness = 1;
    let ani_time = 3; // animation time
    let textColor = "#ffffff";

    for (let i = 0; i < element.classList.length; i++) {
      const cls = element.classList[i].split("-");
      try {
        if (cls[0] == "opacity") {
          opacity = cls[1] && !isNaN(cls[1]) ? parseFloat(cls[1]) : opacity;
        } else if (cls[0] == "brightness") {
          brightness = cls[1] && !isNaN(cls[1]) ? parseFloat(cls[1]) : brightness;
        } else if (cls[0] == "animationTime") {
          ani_time = cls[1] && !isNaN(cls[1]) ? parseFloat(cls[1]) : ani_time;
        }else if (cls[0] == "color") {
          textColor = cls[1] ? cls[1] : textColor;
        }
      } catch (error) {console.log(error);};
    }
    
    const txtLen = element.innerText.length;
    const text = element.innerText;
    const delTime = ani_time / (txtLen + 1);
    element.innerHTML = "";

    for (let i = 0; i < txtLen; i++) {
      element.innerHTML +=
        `<span data-tl="${text[i]}" style="
        --delay: ${(delTime * i).toFixed(3)}s; --name: _tl_ani_glow${index};
        --time: ${ani_time}s; --color: ${textColor}; --brightness: ${brightness * 255}; --opacity: ${opacity};">${text[i]}</span>`
    }

    const alpha = 100 * (1 / txtLen);
    _style_.innerText += 
    `@keyframes _tl_ani_glow${index} {
      0% {
        opacity: 0.1;
        text-shadow: 0 0 0 var(--color);
      } ${alpha / 2}% {
        opacity: 1;
        text-shadow: 0 0 1px var(--color), 0 0 3px var(--color), 0 0 7px var(--color), 0 0 15px var(--color), 0 0 50px var(--color), 0 0 100px var(--color);
      } ${alpha}% {
        opacity: 0.1;
        text-shadow: 0 0 0 var(--color);
      }
    }`;
  });
}
