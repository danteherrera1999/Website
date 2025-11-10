// Physical Params
const hbar = 1.054571817E-34
const m = 9.1093837E-31
const T = 1000 // Kinetic Energy in eV
const W = 1e-9
let k = math.sqrt(2 * m * T * 1.6022e-19) / hbar


// Simulation Params
const N = 1000
const dx = W / N
const dt = 1e-19
const x = math.range(0, N).map((x) => x * dx - W / 2)



// Potential
V_step = (x) => math.abs(x) < (10e-12) ? 500 * 1.6022e-19 : 0 // Step Potential
let Vs = x.map((x) => V_step(x));

// Wave Packet
const normalize = (psi) => math.divide(psi, math.sqrt(math.multiply(math.dot(math.conj(psi), psi), dx)))
const sigma = 0.05 * W // Spread Term (StD)
const x0 = -W / 4// Center Term
const Psi_WP = (x) => math.multiply(math.exp((x - x0) ** 2 / (-2 * sigma ** 2)), math.exp(math.complex(0, k * x)));
const psi_0 = normalize(x.map((x) => Psi_WP(x)))
let psi = psi_0.clone()
const psi2 = (psi) => math.re(math.dotMultiply(math.conj(psi), psi)).toArray()

// Build Crank-Nicolson Arrays
const alpha = math.complex(0, hbar * dt / 4 / m / dx / dx)
const beta = math.complex(0, dt / 2 / hbar)
const t_0 = hbar ** 2 / 2 / m / dx ** 2
let B = Vs.map((Vi) => math.subtract(1, math.multiply(beta, 2 * t_0 + Vi))) // B diagonal
let a = math.multiply(-1, alpha) // A subdiagonal
let b = Vs.map((Vi) => math.add(1, math.multiply(beta, 2 * t_0 + Vi))) // A diagonal
let c = math.zeros(N - 1) // A superdiagonal
c.set([0], math.divide(a, b.get([0])))
c.set([0], math.divide(a, b.get([0])))
  for (let i = 1; i < N - 1; i++) {
    const w = math.subtract(b.get([i]), math.multiply(a, c.get([i - 1])))
    c.set([i], math.divide(a, w))
  }
  
  


function mult_B(psi) { // Apply B matrix to psi (exploits tridiagonality to avoid expensive matmul operation)
  let psi_new = psi.clone()
  psi_new.set([0], math.add(math.multiply(B.get([0]), psi.get([0])), math.multiply(alpha, psi.get([1]))))
  for (let i = 1; i < N - 1; i++) {
    psi_new.set([i], math.add(math.multiply(alpha, psi.get([i - 1])), math.multiply(B.get([i]), psi.get([i])), math.multiply(alpha, psi.get([i + 1]))))
  }
  psi_new.set([0], math.add(math.multiply(B.get([N - 1]), psi.get([N - 1])), math.multiply(alpha, psi.get([N - 2]))))
  return psi_new
}

function Thomas_algorithm(d) { // Modified Thomas algorithm (Decompose to upper diagonal matrix [forward sweep] then solve each equation for x_n [backward sweep])
  d.set([0], math.divide(d.get([0]), b.get([0])))

  // Forward Sweep
  for (let i = 1; i < N; i++) {
    const w = math.subtract(b.get([i]), math.multiply(a, c.get([i - 1])))
    d.set([i], math.divide(math.subtract(d.get([i]), math.multiply(a, d.get([i - 1]))), w))
  }

  // Backward Sweep
  let psi_new = math.zeros(N)
  psi_new.set([N - 1], d.get([N - 1]))

  for (let i = N - 2; i >= 0; i--) {
    psi_new.set([i], math.subtract(d.get([i]), math.multiply(c.get([i]), psi_new.get([i + 1]))))
  }
  return psi_new
}

// Plotting
Plotly.newPlot('graph', [{
  x: [],
  y: [],
  name: 'Psi^2'
}, {
  x: [],
  y: [],
  name: 'Potential'
}])


function set_sim_params(T, V) {
  Vs = x.map((x) => V(x));
  k = math.sqrt(2 * m * T * 1.6022e-19) / hbar
  const Psi_WP = (x) => math.multiply(math.exp((x - x0) ** 2 / (-2 * sigma ** 2)), math.exp(math.complex(0, k * x)));
  const psi_0 = normalize(x.map((x) => Psi_WP(x)))
  psi = psi_0.clone()
  B = Vs.map((Vi) => math.subtract(1, math.multiply(beta, 2 * t_0 + Vi))) // B diagonal
  a = math.multiply(-1, alpha) // A subdiagonal
  b = Vs.map((Vi) => math.add(1, math.multiply(beta, 2 * t_0 + Vi))) // A diagonal
  c = math.zeros(N - 1) // A superdiagonal
  c.set([0], math.divide(a, b.get([0])))
  for (let i = 1; i < N - 1; i++) {
    const w = math.subtract(b.get([i]), math.multiply(a, c.get([i - 1])))
    c.set([i], math.divide(a, w))
  }

  // Plot Potential
  trace_V = {
    x: x.toArray(),
    y: math.multiply(1.5, Vs, 1 / Math.max(...Vs.toArray().flat(Infinity).map(Number)), math.max(psi2(psi))).toArray()
  };

  Plotly.relayout('graph', { xaxis: { range: [-W / 2, W / 2] }, yaxis: { range: [0, 2 * math.max(psi2(psi))] } })


  // Reset All Params

}





function update() {
  psi = Thomas_algorithm(mult_B(psi));
  Plotly.animate('graph', {
    data: [{ x: x.toArray(), y: psi2(psi) }, trace_V]
  }, {
    transition: {
      duration: 0
    },
    frame: {
      duration: 0,
      redraw: false
    }
  });
  requestAnimationFrame(update);
}


const checkT = (T) => T<200? 200: (T>2000? 2000: T) 
set_sim_params(1000, V_step)
requestAnimationFrame(update)

simulateButton = document.getElementById('simulate-button');
kineticEnergyInput = document.getElementById('kinetic-energy-input');

simulateButton.addEventListener('click',()=>{set_sim_params(checkT(kineticEnergyInput.value), V_step)})

