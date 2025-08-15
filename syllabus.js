(function() {
	const SUBJECTS = ["physics", "chemistry", "mathematics"];
	const STORAGE_KEY = "mjga_syllabus_progress_v1";
	const META_KEY = "mjga_meta_v1"; // for streak, daily goal, heatmap

	let chaptersBySubject = {
		physics: [],
		chemistry: [],
		mathematics: []
	};

	const FALLBACK_CHAPTERS = {
		physics: [
			"Mathematics in Physics","Units and Dimensions","Motion In One Dimension","Motion In Two Dimensions","Laws of Motion","Work Power Energy","Center of Mass Momentum and Collision","Rotational Motion","Gravitation","Mechanical Properties of Solids","Mechanical Properties of Fluids","Thermal Properties of Matter","Thermodynamics","Kinetic Theory of Gases","Oscillations","Waves and Sound","Electrostatics","Capacitance","Current Electricity","Magnetic Properties of Matter","Magnetic Effects of Current","Electromagnetic Induction","Alternating Current","Electromagnetic Waves","Ray Optics","Wave Optics","Dual Nature of Matter","Atomic Physics","Nuclear Physics","Semiconductors","Experimental Physics"
		],
		chemistry: [
			"Some Basic Concepts of Chemistry","Structure of Atom","Classification of Elements and Periodicity in Properties","Chemical Bonding and Molecular Structure","Thermodynamics (C)","Chemical Equilibrium","Ionic Equilibrium","Redox Reactions","p Block Elements (Group 13 & 14)","General Organic Chemistry","Hydrocarbons","Solutions","Electrochemistry","Chemical Kinetics","p Block Elements (Group 15, 16, 17 & 18)","d and f Block Elements","Coordination Compounds","Haloalkanes and Haloarenes","Alcohols Phenols and Ethers","Aldehydes and Ketones","Carboxylic Acid Derivatives","Amines","Biomolecules","Practical Chemistry"
		],
		mathematics: [
			"Basic of Mathematics","Quadratic Equation","Complex Number","Permutation Combination","Sequences and Series","Binomial Theorem","Trigonometric Ratios & Identities","Straight Lines","Circle","Parabola","Ellipse","Hyperbola","Limits","Statistics","Sets and Relations","Matrices","Determinants","Inverse Trigonometric Functions","Functions","Continuity and Differentiability","Differentiation","Application of Derivatives","Indefinite Integration","Definite Integration","Area Under Curves","Differential Equations","Vector Algebra","Three Dimensional Geometry","Probability"
		]
	};

	let completedBySubject = loadProgress();
	let meta = loadMeta();

	function loadProgress() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return { physics: [], chemistry: [], mathematics: [] };
			const parsed = JSON.parse(raw);
			for (const s of SUBJECTS) if (!Array.isArray(parsed[s])) parsed[s] = [];
			return parsed;
		} catch {
			return { physics: [], chemistry: [], mathematics: [] };
		}
	}

	function saveProgress() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(completedBySubject));
	}

	function loadMeta() {
		try {
			const raw = localStorage.getItem(META_KEY);
			const defaults = { dailyGoal: 3, streak: 0, lastDay: null, heatmap: {} };
			if (!raw) return defaults;
			return Object.assign(defaults, JSON.parse(raw));
		} catch {
			return { dailyGoal: 3, streak: 0, lastDay: null, heatmap: {} };
		}
	}
	function saveMeta() { localStorage.setItem(META_KEY, JSON.stringify(meta)); }

	async function fetchChapters() {
		try {
			const res = await fetch("PCM_Chapters.txt");
			if (!res.ok) throw new Error("fetch failed");
			const text = await res.text();
			parseChapters(text);
			if (SUBJECTS.some(s => chaptersBySubject[s].length === 0)) {
				chaptersBySubject = JSON.parse(JSON.stringify(FALLBACK_CHAPTERS));
			}
		} catch (e) {
			chaptersBySubject = JSON.parse(JSON.stringify(FALLBACK_CHAPTERS));
		}
		return chaptersBySubject;
	}

	function parseChapters(text) {
		const lines = text.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0);
		let mode = "physics"; // default until markers appear
		for (const line of lines) {
			const lower = line.toLowerCase();
			if (lower === "chem starts") { mode = "chemistry"; continue; }
			if (lower === "maths starts") { mode = "mathematics"; continue; }
			if (lower === "physics" || lower === "chemistry" || lower === "mathematics") { continue; }
			chaptersBySubject[mode].push(line);
		}
		return chaptersBySubject;
	}

	function $(sel) { return document.querySelector(sel); }
	function el(tag, props = {}, children = []) { const node = document.createElement(tag); Object.assign(node, props); for (const child of children) node.appendChild(child); return node; }

	function renderSubject(subject) {
		const list = $("#chapters");
		list.innerHTML = "";
		const q = $("#searchInput")?.value?.toLowerCase() || "";
		const filter = document.querySelector('.chip.active')?.getAttribute('data-filter') || 'all';
		const doneSet = new Set(completedBySubject[subject]);

		for (const chapter of chaptersBySubject[subject]) {
			const matchesSearch = chapter.toLowerCase().includes(q);
			const isDone = doneSet.has(chapter);
			if (filter === 'done' && !isDone) continue;
			if (filter === 'remaining' && isDone) continue;
			if (!matchesSearch) continue;

			const id = `ch-${subject}-${chapter}`.replace(/\s+/g, "-").toLowerCase();
			const checkbox = el("input", { type: "checkbox", id, checked: isDone });
			checkbox.addEventListener("change", () => toggleChapter(subject, chapter, checkbox.checked));
			const label = el("label", { htmlFor: id, className: "name" });
			label.textContent = chapter;
			const item = el("li", { className: `chapter-item${isDone ? " done" : ""}` }, [checkbox, label]);
			list.appendChild(item);
		}

		updateDonuts();
		updateStats(subject);
	}

	function toggleChapter(subject, chapter, isDone) {
		const before = completedBySubject[subject].length;
		const set = new Set(completedBySubject[subject]);
		if (isDone) set.add(chapter); else set.delete(chapter);
		completedBySubject[subject] = Array.from(set);
		saveProgress();
		const after = completedBySubject[subject].length;
		if (after > before) onCompletedToday(1);
		renderSubject(subject);
	}

	function updateDonuts() {
		for (const subject of SUBJECTS) {
			const total = chaptersBySubject[subject].length || 1;
			const done = completedBySubject[subject].length;
			const pct = Math.round((done / total) * 100);
			const card = document.querySelector(`.summary-card[data-subject="${subject}"]`);
			if (!card) continue;
			const donut = card.querySelector(".donut");
			const meter = donut.querySelector(".meter");
			meter.setAttribute("stroke-dasharray", `${pct}, 100`);
			donut.querySelector(".donut-text").textContent = pct + "%";
		}
	}

	function updateStats(subject) {
		const total = chaptersBySubject[subject].length;
		const done = completedBySubject[subject].length;
		const remaining = Math.max(total - done, 0);
		const weighted = Math.round((done / Math.max(total, 1)) * 100) + "%";
		const dailyGoal = Number($("#dailyGoal").value || meta.dailyGoal);
		const etaDays = dailyGoal > 0 ? Math.ceil(remaining / dailyGoal) : "∞";
		$("#statTotal").textContent = String(total);
		$("#statDone").textContent = String(done);
		$("#statRemaining").textContent = String(remaining);
		$("#statWeighted").textContent = weighted;
		$("#statETA").textContent = String(etaDays);
		$("#statStreak").textContent = meta.streak + "🔥";
	}

	function onCompletedToday(increment = 1) {
		const today = new Date();
		const key = today.toISOString().slice(0,10);
		meta.heatmap[key] = (meta.heatmap[key] || 0) + increment;
		if (meta.lastDay) {
			const last = new Date(meta.lastDay);
			const diff = Math.floor((today - last) / (1000*60*60*24));
			meta.streak = diff === 1 ? meta.streak + 1 : (diff === 0 ? meta.streak : 1);
		} else {
			meta.streak = 1;
		}
		meta.lastDay = key;
		saveMeta();
		renderHeatmap();
	}

	function renderHeatmap() {
		const container = $("#heatmap");
		if (!container) return;
		container.innerHTML = "";
		// show last 120 days compact grid 30x4
		const days = 120;
		for (let i = days - 1; i >= 0; i--) {
			const d = new Date();
			d.setDate(d.getDate() - i);
			const key = d.toISOString().slice(0,10);
			const v = meta.heatmap[key] || 0;
			const level = v >= 6 ? 'l4' : v >= 4 ? 'l3' : v >= 2 ? 'l2' : v >= 1 ? 'l1' : '';
			const cell = el('div', { className: `hm-cell ${level}` });
			cell.title = `${key}: ${v} chapters`;
			container.appendChild(cell);
		}
	}

	function wireEvents() {
		const subjectSelect = $("#subjectSelect");
		subjectSelect.addEventListener("change", () => renderSubject(subjectSelect.value));
		$("#searchInput").addEventListener("input", () => renderSubject(subjectSelect.value));
		for (const btn of document.querySelectorAll('.chip[data-filter]')) {
			btn.addEventListener('click', () => {
				document.querySelectorAll('.chip[data-filter]').forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				renderSubject(subjectSelect.value);
			});
		}
		const dailyGoalInput = $("#dailyGoal");
		dailyGoalInput.value = meta.dailyGoal;
		dailyGoalInput.addEventListener('change', () => { meta.dailyGoal = Math.max(1, Number(dailyGoalInput.value)||1); saveMeta(); renderSubject(subjectSelect.value); });

		$("#exportBtn").addEventListener('click', onExport);
		$("#importBtn").addEventListener('click', onImport);
	}

	function onExport() {
		const payload = {
			progress: completedBySubject,
			meta
		};
		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = 'mjga-progress.json'; a.click();
		URL.revokeObjectURL(url);
	}

	function onImport() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.addEventListener('change', async () => {
			const file = input.files[0]; if (!file) return;
			const text = await file.text();
			try {
				const parsed = JSON.parse(text);
				if (parsed.progress) { completedBySubject = parsed.progress; saveProgress(); }
				if (parsed.meta) { meta = Object.assign(meta, parsed.meta); saveMeta(); }
				renderHeatmap();
				const subject = $("#subjectSelect").value;
				renderSubject(subject);
			} catch (e) { alert('Invalid file'); }
		});
		input.click();
	}

	// init
	wireEvents();
	fetchChapters().then(() => {
		renderHeatmap();
		const subject = $("#subjectSelect").value;
		renderSubject(subject);
	});
})(); 