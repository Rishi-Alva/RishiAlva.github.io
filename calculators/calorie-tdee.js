(function () {
	const C = window.Calc;
	const age = document.getElementById("age");
	const wKg = document.getElementById("w-kg");
	const hCm = document.getElementById("h-cm");
	const activity = document.getElementById("activity");
	const deficit = document.getElementById("deficit");
	const out = document.getElementById("out");
	const btn = document.getElementById("go");

	function sex() {
		const r = document.querySelector('input[name="sex"]:checked');
		return r ? r.value : "m";
	}

	btn.addEventListener("click", function () {
		out.hidden = true;
		const a = parseFloat(age.value);
		const w = parseFloat(wKg.value);
		const h = parseFloat(hCm.value);
		const mult = parseFloat(activity.value);
		const def = parseFloat(deficit.value) || 0;

		if (![a, w, h, mult].every((x) => Number.isFinite(x)) || w <= 0 || h <= 0 || a < 15) {
			out.hidden = false;
			out.innerHTML = "<strong>Check inputs.</strong> Use positive weight/height and age 15+.";
			return;
		}

		const base = sex() === "m" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
		const tdee = base * mult;
		const target = Math.max(800, tdee - def);

		const lines = [
			`<strong>Estimated RMR (Mifflin–St Jeor):</strong> ${C.escapeHtml(C.fmtNum(base, 0))} kcal/day`,
			`<strong>Estimated TDEE:</strong> ${C.escapeHtml(C.fmtNum(tdee, 0))} kcal/day`,
		];
		if (def > 0) {
			lines.push(
				`<strong>Target intake (TDEE − ${C.escapeHtml(C.fmtNum(def, 0))}):</strong> ~${C.escapeHtml(C.fmtNum(target, 0))} kcal/day`,
			);
		}
		out.hidden = false;
		out.innerHTML = lines.join("<br>");
	});
})();
