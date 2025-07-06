// function sleep(ms) {
//   return new Promise(res => setTimeout(res, ms));
// }


// // Wait for the whole page (images, styles, etc.) to load:
// window.addEventListener('load', function() {
//   // Fade loader out (optional smoothness)
//   const loader = document.getElementById('loader');
//   loader.style.transition = 'opacity 0.5s';
//   loader.style.opacity = '0';

//   // After transition, remove it and show content
//   loader.addEventListener('transitionend', () => {
//     loader.remove();
//     document.getElementById('content').style.display = 'block';
//   });
// });


// // --- Wrapped SEIQR simulation ---
// (function() {
//   const seiForm = document.querySelector('#seiqr-form');
//   const viz     = document.getElementById('seiqr-visual');
//   if (!seiForm || !viz) return;

//   seiForm.addEventListener('submit', async e => {
//     e.preventDefault();

//     // parse inputs
//     const N = parseFloat(document.querySelector('#popN').value);
//     const β = parseFloat(document.querySelector('#beta').value);
//     const σ = parseFloat(document.querySelector('#sigma').value);
//     const α = parseFloat(document.querySelector('#alpha').value);
//     const γ = parseFloat(document.querySelector('#gamma').value);
//     const δ = parseFloat(document.querySelector('#delta').value);
//     const μ = parseFloat(document.querySelector('#mu').value);

//     // basic validation
//     if (N <= 0 || β <= 0 || σ <= 0 || α < 0 || γ < 0 || δ < 0 || μ < 0) {
//       return alert('Please enter positive numeric values for all parameters.');
//     }

//     seiForm.style.display = 'none';

//     // build legend
//     const legend = document.createElement('div');
//     legend.className = 'legend';
//     ['S','E','I','Q','Rec','Dead'].forEach((key, i) => {
//       const item = document.createElement('div');
//       item.className = 'legend-item';
//       const dot = document.createElement('span');
//       dot.className = 'dot ' + [
//         'state-s','state-e','state-i','state-q','state-recovered','state-dead'
//       ][i];
//       item.append(dot, document.createTextNode(` ${key}`));
//       legend.append(item);
//     });
//     viz.append(legend);

//     // grid
//     const maxDots     = 400;
//     const displayCnt  = Math.min(N, maxDots);
//     const scale       = N / displayCnt;
//     const box         = document.createElement('div');
//     box.className     = 'dots-box';
//     const gridSize    = Math.ceil(Math.sqrt(displayCnt));
//     box.style.gridTemplateColumns = `repeat(${gridSize},1fr)`;
//     box.style.gridTemplateRows    = `repeat(${gridSize},1fr)`;

//     for (let i = 0; i < gridSize * gridSize; i++) {
//       const d = document.createElement('div');
//       d.className = 'dot state-s';
//       if (i >= displayCnt) d.style.visibility = 'hidden';
//       box.append(d);
//     }
//     viz.append(box);

//     // initial conditions
//     let S = N - 1, E = 1, I = 0, Q = 0, R = 0, D = 0;
//     const dt = 10;  // days
//     let t  = 0;

//     // Euler integrate until t=200 days
//     while (t < 200) {
//       // derivatives
//       const dE  = (β * S * I / N) * dt;
//       const dI  = (σ * E) * dt;
//       const dQ  = (α * I) * dt;
//       const recI= (γ * I) * dt;
//       const recQ= (δ * Q) * dt;

//       // update
//       S -= dE;
//       E += dE - dI;
//       I += dI - dQ - recI;
//       Q += dQ - recQ;
//       R += recI + recQ;
//       D += μ * (recI + recQ);
//       R -= μ * (recI + recQ);

//       console.log(`${S} and ${Q}`);

//       // map to dots
//       const sCnt = Math.round(S / scale);
//       const eCnt = Math.round(E / scale);
//       const iCnt = Math.round(I / scale);
//       const qCnt = Math.round(Q / scale);
//       const rCnt = Math.round(R / scale);
//       const dCnt = Math.round(D / scale);
//       const dots = box.children;
//       let idx = 0;

//       const setState = (count, state) => {
//         for (let j = 0; j < count && idx < displayCnt; j++, idx++) {
//           dots[idx].className = `dot ${state}`;
//         }
//       };

//       setState(sCnt, 'state-s');
//       setState(eCnt, 'state-e');
//       setState(iCnt, 'state-i');
//       setState(qCnt, 'state-q');
//       setState(rCnt, 'state-recovered');
//       setState(dCnt, 'state-dead');
//       // any leftover
//       for (; idx < displayCnt; idx++) {
//         dots[idx].className = 'dot state-dead';
//       }

//       t += dt;
//       await new Promise(r => setTimeout(r, 1000));
//     }

//     // reset button
//     const btn = document.createElement('button');
//     btn.textContent = 'Reset SEIQR';
//     btn.style.display = 'block';
//     btn.style.margin = '16px auto';
//     btn.onclick = () => location.reload();
//     viz.append(btn);
//   });
// })();


// // SEIQR(+waning immunity) model simulation in JavaScript
// // Uses classic RK4 to integrate:
// // dS/dt = -beta * S * I / N + mu * R
// // dE/dt = beta * S * I / N - sigma * E
// // dI/dt = sigma * E - (alpha + gamma) * I
// // dQ/dt = alpha * I - delta * Q
// // dR/dt = gamma * I + delta * Q - mu * R

// function simulateSEIQR(n, beta, sigma, alpha, gamma, delta, mu, dt, tMax) {

//   const steps = Math.ceil(tMax / dt);
//   const time = new Array(steps + 1);
//   const S = new Array(steps + 1);
//   const E = new Array(steps + 1);
//   const I = new Array(steps + 1);
//   const Q = new Array(steps + 1);
//   const R = new Array(steps + 1);

//   // Initial conditions
//   S[0] = n - 1;
//   E[0] = 1;
//   I[0] = 0;
//   Q[0] = 0;
//   R[0] = 0;
//   time[0] = 0;

//   // Derivative functions
//   function derivatives(s, e, i, q, r) {
//     const N = n;
//     const dS = -beta * s * i / N + mu * r;
//     const dE =  beta * s * i / N - sigma * e;
//     const dI =  sigma * e - (alpha + gamma) * i;
//     const dQ =  alpha * i - delta * q;
//     const dR =  gamma * i + delta * q - mu * r;
//     return { dS, dE, dI, dQ, dR };
//   }

//   // RK4 integration
//   for (let k = 0; k < steps; k++) {
//     const s0 = S[k], e0 = E[k], i0 = I[k], q0 = Q[k], r0 = R[k];

//     // k1
//     const k1 = derivatives(s0, e0, i0, q0, r0);
//     // k2 inputs
//     const s1 = s0 + k1.dS * dt / 2;
//     const e1 = e0 + k1.dE * dt / 2;
//     const i1 = i0 + k1.dI * dt / 2;
//     const q1 = q0 + k1.dQ * dt / 2;
//     const r1 = r0 + k1.dR * dt / 2;
//     const k2 = derivatives(s1, e1, i1, q1, r1);
//     // k3 inputs
//     const s2 = s0 + k2.dS * dt / 2;
//     const e2 = e0 + k2.dE * dt / 2;
//     const i2 = i0 + k2.dI * dt / 2;
//     const q2 = q0 + k2.dQ * dt / 2;
//     const r2 = r0 + k2.dR * dt / 2;
//     const k3 = derivatives(s2, e2, i2, q2, r2);
//     // k4 inputs
//     const s3 = s0 + k3.dS * dt;
//     const e3 = e0 + k3.dE * dt;
//     const i3 = i0 + k3.dI * dt;
//     const q3 = q0 + k3.dQ * dt;
//     const r3 = r0 + k3.dR * dt;
//     const k4 = derivatives(s3, e3, i3, q3, r3);

//     // Advance
//     S[k+1] = s0 + (dt/6) * (k1.dS + 2*k2.dS + 2*k3.dS + k4.dS);
//     E[k+1] = e0 + (dt/6) * (k1.dE + 2*k2.dE + 2*k3.dE + k4.dE);
//     I[k+1] = i0 + (dt/6) * (k1.dI + 2*k2.dI + 2*k3.dI + k4.dI);
//     Q[k+1] = q0 + (dt/6) * (k1.dQ + 2*k2.dQ + 2*k3.dQ + k4.dQ);
//     R[k+1] = r0 + (dt/6) * (k1.dR + 2*k2.dR + 2*k3.dR + k4.dR);
//     time[k+1] = time[k] + dt;
//   }

//   return [time, S, E, I, Q, R]; 
// }

// // print(simulateSEIQR (1e6, 0.3, 0.2, 0.05, 0.1, 0.07, 0.02, 1, 200));


// // function print (arr) {
// //     console.log(arr[0]);
// //     console.log(arr[1]);
// //     console.log(arr[2]);
// //     console.log(arr[3]);
// //     console.log(arr[4]);
// //     console.log(arr[5]);
// // }


function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

window.addEventListener('load', () => {
  // Fade loader out
  const loader = document.getElementById('loader');
  loader.style.transition = 'opacity 0.5s';
  loader.style.opacity = '0';
  loader.addEventListener('transitionend', () => {
    loader.remove();
    document.getElementById('content').style.display = 'block';
  });
});

(function() {
  const seiForm = document.querySelector('#seiqr-form');
  const viz     = document.getElementById('seiqr-visual');
  if (!seiForm || !viz) return;

  seiForm.addEventListener('submit', async e => {
    e.preventDefault();

    // parse inputs
    const N = +document.querySelector('#popN').value;
    const β = +document.querySelector('#beta').value;
    const σ = +document.querySelector('#sigma').value;
    const α = +document.querySelector('#alpha').value;
    const γ = +document.querySelector('#gamma').value;
    const δ = +document.querySelector('#delta').value;
    const μ = +document.querySelector('#mu').value;

    if (N <= 0 || β <= 0 || σ <= 0 || α < 0 || γ < 0 || δ < 0 || μ < 0) {
      return alert('Please enter positive numeric values for all parameters.');
    }

    seiForm.style.display = 'none';

    // legend
    const legend = document.createElement('div');
    legend.className = 'legend';
    ['Susceptible','Exposed','Infected','Quarantined','Recovered/Dead'].forEach((key,i) => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      const dot = document.createElement('span');
      dot.className = 'dot ' + ['state-s','state-e','state-i','state-q','state-recovered','state-dead'][i];
      item.append(dot, document.createTextNode(` ${key}`));
      legend.append(item);
    });
    viz.append(legend);

    // grid
    const maxDots    = 400;
    const displayCnt = Math.min(N, maxDots);
    const gridSize   = Math.ceil(Math.sqrt(displayCnt));
    const box        = document.createElement('div');
    box.className    = 'dots-box';
    box.style.gridTemplateColumns = `repeat(${gridSize},1fr)`;
    box.style.gridTemplateRows    = `repeat(${gridSize},1fr)`;
    for (let i = 0; i < gridSize*gridSize; i++) {
      const d = document.createElement('div');
      d.className = 'dot state-s';
      if (i >= displayCnt) d.style.visibility = 'hidden';
      box.append(d);
    }
    viz.append(box);

    // run RK4 integrator
    const dt   = 0.5;    // days per step
    const tMax = 1000;  // total days
    const [timeArr, Sarr, Earr, Iarr, Qarr, Rarr] =
      simulateSEIQR(N, β, σ, α, γ, δ, μ, dt, tMax);

    // animate
    // … after you get Sarr, Earr, …, Rarr …

const dots = box.children;
for (let step = 0; step < timeArr.length; step++) {
  const scale = N / displayCnt;
  const sCnt = Math.round(Sarr[step] / scale);
  const eCnt = Math.round(Earr[step] / scale);
  const iCnt = Math.round(Iarr[step] / scale);
  const qCnt = Math.round(Qarr[step] / scale);
  const rCnt = Math.round(Rarr[step] / scale);

  // compute dead as the remainder
  const painted = sCnt + eCnt + iCnt + qCnt + rCnt;
  const dCnt = displayCnt - painted;

  const counts = {
    'state-s':         sCnt,
    'state-e':         eCnt,
    'state-i':         iCnt,
    'state-q':         qCnt,
    'state-recovered': rCnt,
    'state-dead':      dCnt
  };

  // paint everything
  let idx = 0;
  for (const [cls, cnt] of Object.entries(counts)) {
    for (let j = 0; j < cnt && idx < displayCnt; j++, idx++) {
      dots[idx].className = `dot ${cls}`;
    }
  }

  await sleep(10);
}


    // Reset button
    const btn = document.createElement('button');
    btn.textContent = 'Reset SEIQR';
    btn.style.display = 'block';
    btn.style.margin = '16px auto';
    btn.addEventListener('click', () => location.reload());
    viz.append(btn);
  });
})();


// your existing RK4 integrator:
function simulateSEIQR(n, beta, sigma, alpha, gamma, delta, mu, dt, tMax) {
  const steps = Math.ceil(tMax/dt);
  const time = Array(steps+1).fill(0);
  const S = Array(steps+1).fill(0);
  const E = Array(steps+1).fill(0);
  const I = Array(steps+1).fill(0);
  const Q = Array(steps+1).fill(0);
  const R = Array(steps+1).fill(0);

  S[0] = n - 1; E[0] = 1; I[0] = Q[0] = R[0] = 0;

  function deriv(s,e,i,q,r) {
    const N=n;
    return {
      dS: -beta*s*i/N + mu*r,
      dE:  beta*s*i/N - sigma*e,
      dI:  sigma*e - (alpha+gamma)*i,
      dQ:  alpha*i - delta*q,
      dR:  gamma*i + delta*q - mu*r
    };
  }

  for (let k=0; k<steps; k++) {
    const s0=S[k], e0=E[k], i0=I[k], q0=Q[k], r0=R[k];
    const k1=deriv(s0,e0,i0,q0,r0);
    const k2=deriv(s0+k1.dS*dt/2, e0+k1.dE*dt/2, i0+k1.dI*dt/2, q0+k1.dQ*dt/2, r0+k1.dR*dt/2);
    const k3=deriv(s0+k2.dS*dt/2, e0+k2.dE*dt/2, i0+k2.dI*dt/2, q0+k2.dQ*dt/2, r0+k2.dR*dt/2);
    const k4=deriv(s0+k3.dS*dt,   e0+k3.dE*dt,   i0+k3.dI*dt,   q0+k3.dQ*dt,   r0+k3.dR*dt);

    S[k+1] = s0 + (dt/6)*(k1.dS + 2*k2.dS + 2*k3.dS + k4.dS);
    E[k+1] = e0 + (dt/6)*(k1.dE + 2*k2.dE + 2*k3.dE + k4.dE);
    I[k+1] = i0 + (dt/6)*(k1.dI + 2*k2.dI + 2*k3.dI + k4.dI);
    Q[k+1] = q0 + (dt/6)*(k1.dQ + 2*k2.dQ + 2*k3.dQ + k4.dQ);
    R[k+1] = r0 + (dt/6)*(k1.dR + 2*k2.dR + 2*k3.dR + k4.dR);
    time[k+1] = time[k] + dt;
  }

  console.log(`S = ${S}`);
  console.log(`E = ${E}`);
  console.log(`I = ${I}`);
  console.log(`Q = ${Q}`);  
  console.log(`R = ${R}`);

  return [time, S, E, I, Q, R];
}
