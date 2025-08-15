/* Calc Session — Random Physics Test (15Q) */
// Utility random helpers
const R = {
  rand: (min, max) => Math.random() * (max - min) + min,
  int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  pow10: (a, b) => (Math.random() < 0.5 ? a : b),
  sig: (x, n = 3) => Number.parseFloat(x).toPrecision(n),
  fixed: (x, n = 2) => Number.parseFloat(x).toFixed(n),
};

function nowStamp(){
  const d = new Date();
  return d.toLocaleString(undefined, { hour12:false });
}

function fmtVal(val, unit) {
  return `${val} ${unit}`.trim();
}

// 15 question generators (story + formula hint). No solutions shown.
const generators = [
  // 1. Relative motion + inelastic collision + momentum
  () => {
    const m1 = R.rand(2.5, 8.5); // kg
    const m2 = R.rand(1.5, 6.5);
    const v1 = R.rand(4, 18); // m/s
    const v2 = R.rand(-6, 6); // m/s opposite possible
    const mu_k = R.rand(0.08, 0.25);
    const L = R.rand(6, 28); // m after collision slide
    const g = 9.8;

    const story = `On a low-friction cargo line inside a spacecraft hangar, a crate (mass m₁ = ${R.sig(m1)} kg) glides at ${R.sig(v1)} m/s and locks magnetically with a tool cart (mass m₂ = ${R.sig(m2)} kg) moving at ${R.sig(v2)} m/s along the same line. After locking, the combined system slides over a deck segment with kinetic friction μₖ = ${R.sig(mu_k)} for ${R.sig(L)} m before stopping. Determine the speed just after locking and verify if the stop distance matches the given deck length.`;
    const formula = `Use: v' = (m₁v₁ + m₂v₂)/(m₁ + m₂);  Work–energy with friction: (1/2)(m₁+m₂)v'^2 = μₖ(m₁+m₂)g·L.`;

    return { story, formula };
  },

  // 2. Projectile with moving platform (Galilean)
  () => {
    const u = R.rand(18, 36);
    const theta = R.rand(28, 62);
    const vp = R.rand(2, 6);
    const h = R.rand(4, 12);
    const story = `A drone-ship cruises rightward at speed vₚ = ${R.sig(vp)} m/s. From its deck at height h = ${R.sig(h)} m above sea level, a probe is fired with speed u = ${R.sig(u)} m/s at angle θ = ${R.sig(theta)}° relative to the deck (horizontal). Find the horizontal range relative to the water and the time to impact, assuming still air.`;
    const formula = `Use ground-frame decomposition: uₓ = u cosθ + vₚ, uᵧ = u sinθ;  y(t) = h + uᵧ t − (1/2)gt²;  R = uₓ·t_hit.`;
    return { story, formula };
  },

  // 3. Pulley + variable mass jet (tension/acceleration)
  () => {
    const m = R.rand(1.8, 4.5);
    const M = R.rand(5.5, 9.5);
    const T = R.rand(1.2, 2.8); // thrust N
    const mu = R.rand(0.04, 0.2);
    const story = `Two blocks m = ${R.sig(m)} kg (on table with μ = ${R.sig(mu)}) and M = ${R.sig(M)} kg (hanging) are linked over a light pulley. A small cold-gas microthruster pushes horizontally on m with constant thrust ${R.sig(T)} N aiding motion. Determine acceleration and string tension.`;
    const formula = `Use F=ma: For m: T + T_thrust? no; along +x: T − μmg + ${R.sig(T)} = m a. For M: Mg − T = M a. Solve simultaneously.`;
    return { story, formula };
  },

  // 4. Work–energy with spring + ramp + friction
  () => {
    const k = R.rand(120, 420);
    const x = R.rand(0.08, 0.22);
    const mu = R.rand(0.05, 0.18);
    const theta = R.rand(15, 35);
    const m = R.rand(0.6, 2.2);
    const g = 9.8;
    const story = `A block (m = ${R.sig(m)} kg) is launched up a rough incline (θ = ${R.sig(theta)}°) by a spring (k = ${R.sig(k)} N/m) compressed by x = ${R.sig(x)} m. Find the maximum distance the block travels along the incline before stopping.`;
    const formula = `Use energy: (1/2)k x² = m g s (sinθ + μ cosθ).`;
    return { story, formula };
  },

  // 5. Rolling without slipping on loop (min speed)
  () => {
    const Rloop = R.rand(0.6, 1.8);
    const m = R.rand(0.2, 0.8);
    const story = `A solid sphere (m = ${R.sig(m)} kg) rolls without slipping from rest at height h above the top of a vertical loop of radius R = ${R.sig(Rloop)} m. Find the minimum h for complete looping.`;
    const formula = `Use at top: v² ≥ gR. Rolling energy: mgh = (1/2)mv² + (1/2)Iω² with I=(2/5)m r² and v=ωr.`;
    return { story, formula };
  },

  // 6. SHM with two springs, effective k
  () => {
    const k1 = R.rand(180, 520);
    const k2 = R.rand(220, 580);
    const m = R.rand(0.25, 1.2);
    const story = `A cart (m = ${R.sig(m)} kg) attached between two horizontal springs (k₁ = ${R.sig(k1)} N/m, k₂ = ${R.sig(k2)} N/m) oscillates on a smooth track. Derive the time period.`;
    const formula = `For series/parallel as connected: if both to walls (in parallel): k_eff = k₁ + k₂.  T = 2π√(m/k_eff).`;
    return { story, formula };
  },

  // 7. Thermodynamics: adiabatic + piston lift
  () => {
    const p1 = R.rand(1.2, 2.6) * 1e5;
    const V1 = R.rand(0.008, 0.03);
    const gamma = R.pick([1.4, 1.67, 1.33]);
    const mLoad = R.rand(2, 8);
    const story = `A frictionless piston traps ideal gas initially at p₁ = ${R.sig(p1)} Pa, V₁ = ${R.sig(V1)} m³. It expands adiabatically pushing a mass of ${R.sig(mLoad)} kg on the piston until equilibrium is reached. Find the final pressure and volume.`;
    const formula = `Adiabatic: pV^γ = const. Force balance at end: p_f A = p_ext A + m_load g (if area A known/implicit cancels ratio).`;
    return { story, formula };
  },

  // 8. Heat transfer: series slabs
  () => {
    const kA = R.rand(80, 210);
    const kB = R.rand(10, 40);
    const L1 = R.rand(0.8, 2.0) * 1e-2;
    const L2 = R.rand(0.8, 2.0) * 1e-2;
    const A = R.rand(0.015, 0.06);
    const dT = R.rand(30, 120);
    const story = `Two slabs A and B (k_A = ${R.sig(kA)} W/mK, L₁ = ${R.sig(L1)} m) and (k_B = ${R.sig(kB)} W/mK, L₂ = ${R.sig(L2)} m) are in series with area A = ${R.sig(A)} m². The steady temperature drop across the stack is ΔT = ${R.sig(dT)} K. Find the heat current and the interface temperature.`;
    const formula = `Use thermal resistance: R_th = L₁/(k_A A) + L₂/(k_B A);  Q̇ = ΔT / R_th;  Interface ΔT split by resistances.`;
    return { story, formula };
  },

  // 9. Electrostatics: non-uniform rod field on axis
  () => {
    const L = R.rand(0.6, 1.6);
    const λ0 = R.rand(1.0e-6, 6.0e-6);
    const x0 = R.rand(0.12, 0.35);
    const story = `A thin rod of length L = ${R.sig(L)} m lies along the x-axis from x=0 to x=L with linear charge density λ(x) = λ₀(1 + x/L), where λ₀ = ${R.sig(λ0)} C/m. Find the electric field magnitude at a point on-axis at x = −${R.sig(x0)} m.`;
    const formula = `E = (1/4πϵ₀) ∫ [λ(x) dx] / (x + x₀)² ; direction is −x. Evaluate integral from 0→L.`;
    return { story, formula };
  },

  // 10. Gauss law: spherical shell + point shift
  () => {
    const Q = R.rand(2e-6, 9e-6);
    const a = R.rand(0.12, 0.35);
    const d = R.rand(0.02, 0.09);
    const story = `A thin conducting spherical shell of radius a = ${R.sig(a)} m carries charge Q = ${R.sig(Q)} C. A point charge +q is placed at the center, then slightly displaced by d = ${R.sig(d)} m (d ≪ a) before reconnecting to ground briefly. Find the field outside the shell and discuss induced charge distribution to first order in d/a.`;
    const formula = `Use uniqueness + multipole expansion: external field remains as if total charge Q+q at center; dipole terms cancel for conductor when grounded (to first order).`;
    return { story, formula };
  },

  // 11. RC transient with internal resistance
  () => {
    const E = R.rand(6, 24);
    const Rb = R.rand(1, 5) * 1e2;
    const R = R.rand(0.8, 4.5) * 1e3;
    const C = R.rand(1.0, 8.0) * 1e-6;
    const story = `A battery of emf E = ${R.sig(E)} V with internal resistance r = ${R.sig(Rb)} Ω charges a capacitor C = ${R.sig(C)} F through an external resistor R = ${R.sig(R)} Ω. Find the capacitor voltage as a function of time and the initial charging current.`;
    const formula = `Effective R_tot = r + R;  V_C(t) = E(1 − e^{−t/(R_tot C)});  I(0⁺) = E/R_tot.`;
    return { story, formula };
  },

  // 12. Magnetic force on current loop in non-uniform B
  () => {
    const I = R.rand(1.2, 6.2);
    const a = R.rand(0.08, 0.25);
    const b = R.rand(0.08, 0.25);
    const k = R.rand(0.3, 1.1);
    const story = `A rectangular loop (a = ${R.sig(a)} m by b = ${R.sig(b)} m) carries current I = ${R.sig(I)} A in a magnetic field B(x) = B₀ + kx (into the page), gradient k = ${R.sig(k)} T/m. The left edge is at x=0. Find the net force and torque on the loop.`;
    const formula = `Use dF = I (dl × B); opposite sides feel different B. Net F ≈ I b [B(0) − B(a)] in ±x; torque from force pair τ ≈ I b a (dB/dx).`;
    return { story, formula };
  },

  // 13. AC circuit with R-L-C at arbitrary ω
  () => {
    const V = R.rand(20, 80);
    const Rv = R.rand(50, 200);
    const L = R.rand(15e-3, 90e-3);
    const C = R.rand(0.5e-6, 3.0e-6);
    const f = R.rand(40, 4000);
    const story = `An AC source of RMS ${R.sig(V)} V at frequency f = ${R.sig(f)} Hz drives a series RLC with R = ${R.sig(Rv)} Ω, L = ${R.sig(L)} H, C = ${R.sig(C)} F. Find the RMS current and the phase angle (current relative to voltage).`;
    const formula = `X_L = 2πfL; X_C = 1/(2πfC); Z = √(R² + (X_L − X_C)²); I_rms = V/Z;  φ = tan⁻¹((X_L − X_C)/R).`;
    return { story, formula };
  },

  // 14. Wave optics: double-slit + thin film cover
  () => {
    const d = R.rand(0.25e-3, 0.7e-3);
    const D = R.rand(1.2, 3.8);
    const t = R.rand(0.8e-6, 4.0e-6);
    const n = R.rand(1.3, 1.7);
    const lam = R.pick([520e-9, 600e-9, 450e-9]);
    const story = `In a double-slit setup (slit separation d = ${R.sig(d)} m, screen distance D = ${R.sig(D)} m) a transparent film (n = ${R.sig(n)}) of thickness t = ${R.sig(t)} m covers one slit. For wavelength λ = ${lam} m, determine the fringe shift and new central maximum location.`;
    const formula = `Optical path added: Δ = (n−1)t; shift m = Δ/λ fringes; y_shift = (D/d)·Δ.`;
    return { story, formula };
  },

  // 15. Modern physics: photoelectric + stopping potential
  () => {
    const phi = R.rand(1.6, 3.0); // eV
    const lam = R.rand(300, 520); // nm
    const story = `A clean metal surface (work function ϕ = ${R.sig(phi)} eV) is illuminated by monochromatic light of wavelength λ = ${R.sig(lam)} nm at low intensity. Find the maximum kinetic energy of emitted electrons and the stopping potential.`;
    const formula = `E_ph = hc/λ;  K_max = E_ph − ϕ (in eV if hc ≈ 1240 eV·nm);  V_stop = K_max/e.`;
    return { story, formula };
  },
];

// Render
function generateTest() {
  const list = document.getElementById('questionList');
  list.innerHTML = '';
  const used = new Set();
  // Ensure we use all 15 unique generators once, but shuffle order for randomness
  const order = [...generators.keys()].sort(() => Math.random() - 0.5);
  order.forEach((idx, i) => {
    const { story, formula } = generators[idx]();
    const li = document.createElement('li');
    li.className = 'q';
    li.innerHTML = `
      <h3>Q${String(i+1).padStart(2,'0')}.</h3>
      <p>${story}</p>
      <div class="formula">formula to use: ${formula}</div>
    `;
    list.appendChild(li);
  });

  // metadata
  const meta = document.getElementById('testMeta');
  const seedish = Math.random().toString(36).slice(2, 8).toUpperCase();
  meta.textContent = `generated at ${nowStamp()} • pattern ${seedish}`;
}

// Hook
document.getElementById('generateBtn').addEventListener('click', generateTest);

// Auto-show an initial pattern to “get started”
generateTest();
