const form = document.querySelector('#form');
const actual = document.querySelector('.actual');
const E = Math.E;


// Wait for the whole page (images, styles, etc.) to load:
window.addEventListener('load', function() {
  // Fade loader out (optional smoothness)
  const loader = document.getElementById('loader');
  loader.style.transition = 'opacity 0.5s';
  loader.style.opacity = '0';

  // After transition, remove it and show content
  loader.addEventListener('transitionend', () => {
    loader.remove();
    document.getElementById('content').style.display = 'block';
  });
});


// Helper to show an alert and focus the offending field
function showError(inputEl, message) {
  alert(message);
  inputEl.focus();
}

form.addEventListener('submit', async e => {
  e.preventDefault();

  // grab input elements
  const lambda1El = document.querySelector('#lambda1');
  const lambda2El = document.querySelector('#lambda2');
  const n0El      = document.querySelector('#n0');

  // parse values
  const λ1 = parseFloat(lambda1El.value);
  const λ2 = parseFloat(lambda2El.value);
  const n0 = parseInt(n0El.value, 10);

  // validate λ1 ∈ (0, 2]
  if (isNaN(λ1) || λ1 <= 0 || λ1 > 2) {
    return showError(lambda1El, 'Please enter λ1 as a real number > 0 and ≤ 2.');
  }

  // validate λ2 ∈ (0, 2]
  if (isNaN(λ2) || λ2 <= 0 || λ2 > 2) {
    return showError(lambda2El, 'Please enter λ2 as a real number > 0 and ≤ 2.');
  }

  // ensure λ2 > λ1
  if (λ2 <= λ1) {
    return showError(lambda2El, 'λ2 must be greater than λ1.');
  }

  // validate n0 ∈ [1000, 10^10]
  const maxInt = Math.pow(10, 10);
  if (isNaN(n0) || n0 < 1000 || n0 > maxInt) {
    return showError(n0El, `Please enter n₀ as an integer ≥ 1000 and ≤ ${maxInt}.`);
  }

  // hide form
  form.style.display = 'none';

  // --- build and show legend ---
  const legend = document.createElement('div');
  legend.classList.add('legend');
  legend.innerHTML = `
    <div class="legend-item"><span class="dot state-a"></span> A (red)</div>
    <div class="legend-item"><span class="dot state-b"></span> B (blue)</div>
    <div class="legend-item"><span class="dot state-c"></span> C (green)</div>
  `;
  // position: bottom right (CSS .legend should handle absolute positioning)
  actual.appendChild(legend);

  // cap & scale dots
  const maxDots = 400;
  const displayCount = Math.min(n0, maxDots);
  const scale = n0 / displayCount;

  // build grid container
  const box = document.createElement('div');
  box.classList.add('dots-box');
  const gridSize = Math.ceil(Math.sqrt(displayCount));
  box.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  box.style.gridTemplateRows    = `repeat(${gridSize}, 1fr)`;

  // populate with dot elements
  for (let i = 0; i < gridSize * gridSize; i++) {
    const d = document.createElement('div');
    d.classList.add('dot', 'state-c'); // default = C
    if (i < displayCount) {
      d.classList.replace('state-c', 'state-a'); // initial = A
    }
    box.appendChild(d);
  }
  actual.appendChild(box);

  // helper to show reset button
  function showResetButton() {
    const resetWrapper = document.createElement('div');
    resetWrapper.style.marginTop = '20px';
    resetWrapper.style.textAlign = 'center';

    const resetBtn = document.createElement('button');
    resetBtn.id = 'reset';
    resetBtn.textContent = 'Reset Simulation';
    resetBtn.style.padding = '8px 16px';
    resetBtn.style.cursor = 'pointer';

    resetWrapper.appendChild(resetBtn);
    actual.appendChild(resetWrapper);

    resetBtn.addEventListener('click', () => {
      actual.innerHTML = '';
      form.style.display = 'block';
      form.reset();
    });
  }

  // run the kinetics loop
  let t = 0;
  while (true) {
    const a = n0 * Math.exp(-λ1 * t);
    const b = n0 * λ1 * (Math.exp(-λ1 * t) - Math.exp(-λ2 * t)) / (λ2 - λ1);

    const countA = Math.round(a / scale);
    const countB = Math.round(b / scale);

    const dots = box.children;
    for (let i = 0; i < displayCount; i++) {
      dots[i].classList.remove('state-a','state-b','state-c');
      if      (i < countA)               dots[i].classList.add('state-a');
      else if (i < countA + countB)      dots[i].classList.add('state-b');
      else                                dots[i].classList.add('state-c');
    }

    // show reset immediately when all are C
    if (countA + countB === 0) {
      showResetButton();
      break;
    }

    t += 1;
    await sleep(1000);
  }
});

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}
