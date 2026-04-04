(function () {
	const C = window.Calc;

	function label(absd) {
		if (absd < 0.2) return "small (by Cohen’s rough cutoffs)";
		if (absd < 0.5) return "small-to-medium";
		if (absd < 0.8) return "medium";
		return "large (by Cohen’s rough cutoffs)";
	}

	document.getElementById("go").addEventListener("click", function () {
		const out = document.getElementById("out");
		out.hidden = true;
		const n1 = parseInt(document.getElementById("n1").value, 10);
		const n2 = parseInt(document.getElementById("n2").value, 10);
		const m1 = parseFloat(document.getElementById("m1").value);
		const m2 = parseFloat(document.getElementById("m2").value);
		const s1 = parseFloat(document.getElementById("s1").value);
		const s2 = parseFloat(document.getElementById("s2").value);

		if (![n1, n2].every((n) => Number.isFinite(n) && n >= 2)) {
			out.hidden = false;
			out.innerHTML = "<strong>Each group needs n ≥ 2.</strong>";
			return;
		}
		if (![m1, m2, s1, s2].every(Number.isFinite) || s1 < 0 || s2 < 0 || (s1 === 0 && s2 === 0)) {
			out.hidden = false;
			out.innerHTML = "<strong>Enter means and non-negative SDs</strong> (not both SD zero).";
			return;
		}

		const df = n1 + n2 - 2;
		const sp = Math.sqrt(((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / df);
		if (sp === 0) {
			out.hidden = false;
			out.innerHTML = "<strong>Pooled SD is zero</strong> (no within-group spread).";
			return;
		}
		const d = (m1 - m2) / sp;

		out.hidden = false;
		out.innerHTML = [
			`<strong>Cohen&rsquo;s d (group 1 − group 2):</strong> ${C.escapeHtml(C.fmtNum(d, 3))}`,
			`<strong>|d| magnitude (informal):</strong> ${C.escapeHtml(label(Math.abs(d)))}`,
			`<strong>Pooled SD:</strong> ${C.escapeHtml(C.fmtNum(sp, 4))}`,
		].join("<br>");
	});
})();
