// Test interface functionality
class PhysicsTest {
  constructor() {
    this.currentQuestion = 0;
    this.questions = [];
    this.answers = new Array(15).fill('');
    this.markedForReview = new Set();
    this.attempted = new Set();
    this.startTime = Date.now();
    
    this.init();
  }
  
  init() {
    this.generateQuestions();
    this.setupEventListeners();
    this.updateUI();
    this.startTimer();
    
    // Hide loading after a short delay
    setTimeout(() => {
      document.getElementById('loadingOverlay').style.display = 'none';
    }, 2000);
  }
  
  generateQuestions() {
    // Import the question generators from the original script
    const generators = [
      // 1. Relative motion + inelastic collision + momentum
      () => {
        const m1 = this.rand(2.5, 8.5);
        const m2 = this.rand(1.5, 6.5);
        const v1 = this.rand(4, 18);
        const v2 = this.rand(-6, 6);
        const mu_k = this.rand(0.08, 0.25);
        const L = this.rand(6, 28);
        
        const story = `On a low-friction cargo line inside a spacecraft hangar, a crate (mass m₁ = ${this.sig(m1)} kg) glides at ${this.sig(v1)} m/s and locks magnetically with a tool cart (mass m₂ = ${this.sig(m2)} kg) moving at ${this.sig(v2)} m/s along the same line. After locking, the combined system slides over a deck segment with kinetic friction μₖ = ${this.sig(mu_k)} for ${this.sig(L)} m before stopping. Determine the speed just after locking and verify if the stop distance matches the given deck length.`;
        const formula = `Use: v' = (m₁v₁ + m₂v₂)/(m₁ + m₂);  Work–energy with friction: (1/2)(m₁+m₂)v'^2 = μₖ(m₁+m₂)g·L.`;
        
        return { story, formula };
      },
      
      // 2. Projectile with moving platform
      () => {
        const u = this.rand(18, 36);
        const theta = this.rand(28, 62);
        const vp = this.rand(2, 6);
        const h = this.rand(4, 12);
        
        const story = `A drone-ship cruises rightward at speed vₚ = ${this.sig(vp)} m/s. From its deck at height h = ${this.sig(h)} m above sea level, a probe is fired with speed u = ${this.sig(u)} m/s at angle θ = ${this.sig(theta)}° relative to the deck (horizontal). Find the horizontal range relative to the water and the time to impact, assuming still air.`;
        const formula = `Use ground-frame decomposition: uₓ = u cosθ + vₚ, uᵧ = u sinθ;  y(t) = h + uᵧ t − (1/2)gt²;  R = uₓ·t_hit.`;
        
        return { story, formula };
      },
      
      // 3. Pulley + variable mass jet
      () => {
        const m = this.rand(1.8, 4.5);
        const M = this.rand(5.5, 9.5);
        const T = this.rand(1.2, 2.8);
        const mu = this.rand(0.04, 0.2);
        
        const story = `Two blocks m = ${this.sig(m)} kg (on table with μ = ${this.sig(mu)}) and M = ${this.sig(M)} kg (hanging) are linked over a light pulley. A small cold-gas microthruster pushes horizontally on m with constant thrust ${this.sig(T)} N aiding motion. Determine acceleration and string tension.`;
        const formula = `Use F=ma: For m: T + T_thrust? no; along +x: T − μmg + ${this.sig(T)} = m a. For M: Mg − T = M a. Solve simultaneously.`;
        
        return { story, formula };
      },
      
      // 4. Work–energy with spring + ramp + friction
      () => {
        const k = this.rand(120, 420);
        const x = this.rand(0.08, 0.22);
        const mu = this.rand(0.05, 0.18);
        const theta = this.rand(15, 35);
        const m = this.rand(0.6, 2.2);
        
        const story = `A block (m = ${this.sig(m)} kg) is launched up a rough incline (θ = ${this.sig(theta)}°) by a spring (k = ${this.sig(k)} N/m) compressed by x = ${this.sig(x)} m. Find the maximum distance the block travels along the incline before stopping.`;
        const formula = `Use energy: (1/2)k x² = m g s (sinθ + μ cosθ).`;
        
        return { story, formula };
      },
      
      // 5. Rolling without slipping on loop
      () => {
        const Rloop = this.rand(0.6, 1.8);
        const m = this.rand(0.2, 0.8);
        
        const story = `A solid sphere (m = ${this.sig(m)} kg) rolls without slipping from rest at height h above the top of a vertical loop of radius R = ${this.sig(Rloop)} m. Find the minimum h for complete looping.`;
        const formula = `Use at top: v² ≥ gR. Rolling energy: mgh = (1/2)mv² + (1/2)Iω² with I=(2/5)m r² and v=ωr.`;
        
        return { story, formula };
      },
      
      // 6. SHM with two springs
      () => {
        const k1 = this.rand(180, 520);
        const k2 = this.rand(220, 580);
        const m = this.rand(0.25, 1.2);
        
        const story = `A cart (m = ${this.sig(m)} kg) attached between two horizontal springs (k₁ = ${this.sig(k1)} N/m, k₂ = ${this.sig(k2)} N/m) oscillates on a smooth track. Derive the time period.`;
        const formula = `For series/parallel as connected: if both to walls (in parallel): k_eff = k₁ + k₂.  T = 2π√(m/k_eff).`;
        
        return { story, formula };
      },
      
      // 7. Thermodynamics: adiabatic + piston lift
      () => {
        const p1 = this.rand(1.2, 2.6) * 1e5;
        const V1 = this.rand(0.008, 0.03);
        const gamma = this.pick([1.4, 1.67, 1.33]);
        const mLoad = this.rand(2, 8);
        
        const story = `A frictionless piston traps ideal gas initially at p₁ = ${this.sig(p1)} Pa, V₁ = ${this.sig(V1)} m³. It expands adiabatically pushing a mass of ${this.sig(mLoad)} kg on the piston until equilibrium is reached. Find the final pressure and volume.`;
        const formula = `Adiabatic: pV^γ = const. Force balance at end: p_f A = p_ext A + m_load g (if area A known/implicit cancels ratio).`;
        
        return { story, formula };
      },
      
      // 8. Heat transfer: series slabs
      () => {
        const kA = this.rand(80, 210);
        const kB = this.rand(10, 40);
        const L1 = this.rand(0.8, 2.0) * 1e-2;
        const L2 = this.rand(0.8, 2.0) * 1e-2;
        const A = this.rand(0.015, 0.06);
        const dT = this.rand(30, 120);
        
        const story = `Two slabs A and B (k_A = ${this.sig(kA)} W/mK, L₁ = ${this.sig(L1)} m) and (k_B = ${this.sig(kB)} W/mK, L₂ = ${this.sig(L2)} m) are in series with area A = ${this.sig(A)} m². The steady temperature drop across the stack is ΔT = ${this.sig(dT)} K. Find the heat current and the interface temperature.`;
        const formula = `Use thermal resistance: R_th = L₁/(k_A A) + L₂/(k_B A);  Q̇ = ΔT / R_th;  Interface ΔT split by resistances.`;
        
        return { story, formula };
      },
      
      // 9. Electrostatics: non-uniform rod field
      () => {
        const L = this.rand(0.6, 1.6);
        const λ0 = this.rand(1.0e-6, 6.0e-6);
        const x0 = this.rand(0.12, 0.35);
        
        const story = `A thin rod of length L = ${this.sig(L)} m lies along the x-axis from x=0 to x=L with linear charge density λ(x) = λ₀(1 + x/L), where λ₀ = ${this.sig(λ0)} C/m. Find the electric field magnitude at a point on-axis at x = −${this.sig(x0)} m.`;
        const formula = `E = (1/4πϵ₀) ∫ [λ(x) dx] / (x + x₀)² ; direction is −x. Evaluate integral from 0→L.`;
        
        return { story, formula };
      },
      
      // 10. Gauss law: spherical shell + point shift
      () => {
        const Q = this.rand(2e-6, 9e-6);
        const a = this.rand(0.12, 0.35);
        const d = this.rand(0.02, 0.09);
        
        const story = `A thin conducting spherical shell of radius a = ${this.sig(a)} m carries charge Q = ${this.sig(Q)} C. A point charge +q is placed at the center, then slightly displaced by d = ${this.sig(d)} m (d ≪ a) before reconnecting to ground briefly. Find the field outside the shell and discuss induced charge distribution to first order in d/a.`;
        const formula = `Use uniqueness + multipole expansion: external field remains as if total charge Q+q at center; dipole terms cancel for conductor when grounded (to first order).`;
        
        return { story, formula };
      },
      
      // 11. RC transient with internal resistance
      () => {
        const E = this.rand(6, 24);
        const Rb = this.rand(1, 5) * 1e2;
        const R = this.rand(0.8, 4.5) * 1e3;
        const C = this.rand(1.0, 8.0) * 1e-6;
        
        const story = `A battery of emf E = ${this.sig(E)} V with internal resistance r = ${this.sig(Rb)} Ω charges a capacitor C = ${this.sig(C)} F through an external resistor R = ${this.sig(R)} Ω. Find the capacitor voltage as a function of time and the initial charging current.`;
        const formula = `Effective R_tot = r + R;  V_C(t) = E(1 − e^{−t/(R_tot C)});  I(0⁺) = E/R_tot.`;
        
        return { story, formula };
      },
      
      // 12. Magnetic force on current loop
      () => {
        const I = this.rand(1.2, 6.2);
        const a = this.rand(0.08, 0.25);
        const b = this.rand(0.08, 0.25);
        const k = this.rand(0.3, 1.1);
        
        const story = `A rectangular loop (a = ${this.sig(a)} m by b = ${this.sig(b)} m) carries current I = ${this.sig(I)} A in a magnetic field B(x) = B₀ + kx (into the page), gradient k = ${this.sig(k)} T/m. The left edge is at x=0. Find the net force and torque on the loop.`;
        const formula = `Use dF = I (dl × B); opposite sides feel different B. Net F ≈ I b [B(0) − B(a)] in ±x; torque from force pair τ ≈ I b a (dB/dx).`;
        
        return { story, formula };
      },
      
      // 13. AC circuit with R-L-C
      () => {
        const V = this.rand(20, 80);
        const Rv = this.rand(50, 200);
        const L = this.rand(15e-3, 90e-3);
        const C = this.rand(0.5e-6, 3.0e-6);
        const f = this.rand(40, 4000);
        
        const story = `An AC source of RMS ${this.sig(V)} V at frequency f = ${this.sig(f)} Hz drives a series RLC with R = ${this.sig(Rv)} Ω, L = ${this.sig(L)} H, C = ${this.sig(C)} F. Find the RMS current and the phase angle (current relative to voltage).`;
        const formula = `X_L = 2πfL; X_C = 1/(2πfC); Z = √(R² + (X_L − X_C)²); I_rms = V/Z;  φ = tan⁻¹((X_L − X_C)/R).`;
        
        return { story, formula };
      },
      
      // 14. Wave optics: double-slit + thin film
      () => {
        const d = this.rand(0.25e-3, 0.7e-3);
        const D = this.rand(1.2, 3.8);
        const t = this.rand(0.8e-6, 4.0e-6);
        const n = this.rand(1.3, 1.7);
        const lam = this.pick([520e-9, 600e-9, 450e-9]);
        
        const story = `In a double-slit setup (slit separation d = ${this.sig(d)} m, screen distance D = ${this.sig(D)} m) a transparent film (n = ${this.sig(n)}) of thickness t = ${this.sig(t)} m covers one slit. For wavelength λ = ${lam} m, determine the fringe shift and new central maximum location.`;
        const formula = `Optical path added: Δ = (n−1)t; shift m = Δ/λ fringes; y_shift = (D/d)·Δ.`;
        
        return { story, formula };
      },
      
      // 15. Modern physics: photoelectric
      () => {
        const phi = this.rand(1.6, 3.0);
        const lam = this.rand(300, 520);
        
        const story = `A clean metal surface (work function ϕ = ${this.sig(phi)} eV) is illuminated by monochromatic light of wavelength λ = ${this.sig(lam)} nm at low intensity. Find the maximum kinetic energy of emitted electrons and the stopping potential.`;
        const formula = `E_ph = hc/λ;  K_max = E_ph − ϕ (in eV if hc ≈ 1240 eV·nm);  V_stop = K_max/e.`;
        
        return { story, formula };
      }
    ];
    
    // Generate questions in random order
    const order = [...generators.keys()].sort(() => Math.random() - 0.5);
    this.questions = order.map((idx, i) => {
      const { story, formula } = generators[idx]();
      return {
        id: i + 1,
        story,
        formula,
        originalIndex: idx
      };
    });
  }
  
  setupEventListeners() {
    // Navigation buttons
    document.getElementById('prevBtn').addEventListener('click', () => this.previousQuestion());
    document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
    document.getElementById('skipBtn').addEventListener('click', () => this.skipQuestion());
    
    // Action buttons
    document.getElementById('markReviewBtn').addEventListener('click', () => this.toggleMarkReview());
    document.getElementById('markReviewBtn2').addEventListener('click', () => this.toggleMarkReview());
    document.getElementById('clearResponseBtn').addEventListener('click', () => this.clearResponse());
    
    // Answer input
    document.getElementById('answerInput').addEventListener('input', (e) => {
      this.answers[this.currentQuestion] = e.target.value;
      this.updateQuestionGrid();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && this.currentQuestion > 0) {
        this.previousQuestion();
      } else if (e.key === 'ArrowRight' && this.currentQuestion < 14) {
        this.nextQuestion();
      } else if (e.key === 's' || e.key === 'S') {
        this.skipQuestion();
      } else if (e.key === 'm' || e.key === 'M') {
        this.toggleMarkReview();
      }
    });
  }
  
  updateUI() {
    this.updateQuestionDisplay();
    this.updateQuestionGrid();
    this.updateNavigation();
    this.updateStats();
  }
  
  updateQuestionDisplay() {
    const question = this.questions[this.currentQuestion];
    document.getElementById('questionNumber').textContent = `Question ${question.id}`;
    document.getElementById('questionStory').innerHTML = `<p>${question.story}</p>`;
    document.getElementById('questionFormula').innerHTML = `<div class="formula-hint"><strong>Formula to use:</strong> ${question.formula}</div>`;
    
    // Load saved answer
    document.getElementById('answerInput').value = this.answers[this.currentQuestion] || '';
    
    // Update current question display
    document.getElementById('currentQuestion').textContent = question.id;
  }
  
  updateQuestionGrid() {
    const grid = document.getElementById('questionGrid');
    grid.innerHTML = '';
    
    this.questions.forEach((q, index) => {
      const btn = document.createElement('button');
      btn.className = 'question-btn';
      btn.textContent = q.id;
      
      // Add status classes
      if (this.markedForReview.has(index)) {
        btn.classList.add('marked');
      }
      if (this.answers[index] && this.answers[index].trim()) {
        btn.classList.add('attempted');
      }
      if (index === this.currentQuestion) {
        btn.classList.add('current');
      }
      
      btn.addEventListener('click', () => this.goToQuestion(index));
      grid.appendChild(btn);
    });
  }
  
  updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = this.currentQuestion === 0;
    nextBtn.disabled = this.currentQuestion === 14;
    
    // Update button text for last question
    if (this.currentQuestion === 14) {
      nextBtn.innerHTML = 'Finish <span class="btn-icon">✓</span>';
    } else {
      nextBtn.innerHTML = 'Next <span class="btn-icon">→</span>';
    }
  }
  
  updateStats() {
    const attemptedCount = this.answers.filter(answer => answer && answer.trim()).length;
    document.getElementById('attemptedCount').textContent = attemptedCount;
  }
  
  previousQuestion() {
    if (this.currentQuestion > 0) {
      this.currentQuestion--;
      this.updateUI();
    }
  }
  
  nextQuestion() {
    if (this.currentQuestion < 14) {
      this.currentQuestion++;
      this.updateUI();
    } else {
      this.finishTest();
    }
  }
  
  skipQuestion() {
    this.nextQuestion();
  }
  
  toggleMarkReview() {
    if (this.markedForReview.has(this.currentQuestion)) {
      this.markedForReview.delete(this.currentQuestion);
    } else {
      this.markedForReview.add(this.currentQuestion);
    }
    this.updateQuestionGrid();
  }
  
  clearResponse() {
    this.answers[this.currentQuestion] = '';
    document.getElementById('answerInput').value = '';
    this.updateQuestionGrid();
    this.updateStats();
  }
  
  goToQuestion(index) {
    this.currentQuestion = index;
    this.updateUI();
  }
  
  startTimer() {
    setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      document.getElementById('timeDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }
  
  finishTest() {
    const attemptedCount = this.answers.filter(answer => answer && answer.trim()).length;
    const markedCount = this.markedForReview.size;
    
    alert(`Test completed!\n\nQuestions attempted: ${attemptedCount}/15\nMarked for review: ${markedCount}\n\nYou can review your answers by navigating through the questions.`);
  }
  
  // Utility functions
  rand(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  sig(x, n = 3) {
    return Number.parseFloat(x).toPrecision(n);
  }
  
  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

// Initialize the test when page loads
document.addEventListener('DOMContentLoaded', () => {
  new PhysicsTest();
}); 