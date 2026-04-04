(function () {
	const C = window.Calc;
	const nA = document.getElementById("n-a");
	const xA = document.getElementById("x-a");
	const nB = document.getElementById("n-b");
	const xB = document.getElementById("x-b");
	const resultEl = document.getElementById("ab-result");
	const btn = document.getElementById("ab-calc");

	function compute() {
		resultEl.hidden = true;
		const na = parseInt(nA.value, 10);
		const xa = parseInt(xA.value, 10);
		const nb = parseInt(nB.value, 10);
		const xb = parseInt(xB.value, 10);

		if (![na, xa, nb, xb].every((n) => Number.isFinite(n))) {
			resultEl.hidden = false;
			resultEl.innerHTML = "<strong>Enter whole numbers</strong> for all four fields.";
			return;
		}
		if (na < 1 || nb < 1) {
			resultEl.hidden = false;
			resultEl.innerHTML = "<strong>Visitors</strong> must be at least 1 for each arm.";
			return;
		}
		if (xa < 0 || xb < 0 || xa > na || xb > nb) {
			resultEl.hidden = false;
			resultEl.innerHTML = "<strong>Conversions</strong> must be between 0 and visitors for that arm.";
			return;
		}

		const p1 = xa / na;
		const p2 = xb / nb;
		const pooled = (xa + xb) / (na + nb);
		const se = Math.sqrt(pooled * (1 - pooled) * (1 / na + 1 / nb));

		let z;
		let pTwoSided;
		if (se === 0) {
			z = p1 === p2 ? 0 : Infinity * (p2 > p1 ? 1 : -1);
			pTwoSided = p1 === p2 ? 1 : 0;
		} else {
			z = (p2 - p1) / se;
			pTwoSided = 2 * (1 - C.normalCDF(Math.abs(z)));
		}

		const liftRel = p1 > 0 ? ((p2 - p1) / p1) * 100 : null;
		const sig05 = pTwoSided < 0.05 && Number.isFinite(pTwoSided);
		const verdict = !Number.isFinite(pTwoSided)
			? "Rates are identical under this test (no variance to compare)."
			: sig05
				? "At α = 0.05 (two-sided), the difference is statistically significant (rough check only)."
				: "Not significant at α = 0.05 (two-sided) with this normal approximation.";

		let pStr;
		if (!Number.isFinite(pTwoSided)) pStr = "n/a";
		else if (pTwoSided < 1e-10) pStr = "< 1e-10";
		else pStr = C.fmtNum(pTwoSided, 6);

		const lines = [
			`<strong>Conversion A:</strong> ${C.escapeHtml(C.fmtPct(p1))} (${C.escapeHtml(String(xa))} / ${C.escapeHtml(String(na))})`,
			`<strong>Conversion B:</strong> ${C.escapeHtml(C.fmtPct(p2))} (${C.escapeHtml(String(xb))} / ${C.escapeHtml(String(nb))})`,
			liftRel !== null
				? `<strong>Relative lift (B vs A):</strong> ${C.escapeHtml(C.fmtNum(liftRel, 2))}%`
				: `<strong>Relative lift:</strong> undefined (A conversion rate is 0)`,
			`<strong>z-score (B − A):</strong> ${C.escapeHtml(C.fmtNum(z, 4))}`,
			`<strong>Two-sided p-value (approx):</strong> ${C.escapeHtml(pStr)}`,
			`<strong>Readout:</strong> ${C.escapeHtml(verdict)}`,
		];

		resultEl.hidden = false;
		resultEl.innerHTML = lines.join("<br>");
	}

	btn.addEventListener("click", compute);
})();
