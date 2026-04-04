(function () {
	const C = window.Calc;

	function zFromTailTwoSided(alpha) {
		if (alpha <= 0 || alpha >= 1) return NaN;
		let lo = 0;
		let hi = 6;
		while (hi - lo > 1e-6) {
			const mid = (lo + hi) / 2;
			if (2 * (1 - C.normalCDF(mid)) > alpha) lo = mid;
			else hi = mid;
		}
		return (lo + hi) / 2;
	}

	function zFromPower(power) {
		const beta = 1 - power;
		if (beta <= 0 || beta >= 1) return NaN;
		let lo = 0;
		let hi = 6;
		while (hi - lo > 1e-6) {
			const mid = (lo + hi) / 2;
			if (1 - C.normalCDF(mid) > beta) lo = mid;
			else hi = mid;
		}
		return (lo + hi) / 2;
	}

	document.getElementById("go").addEventListener("click", function () {
		const out = document.getElementById("out");
		out.hidden = true;
		const p1 = parseFloat(document.getElementById("p1").value);
		const p2 = parseFloat(document.getElementById("p2").value);
		const alpha = parseFloat(document.getElementById("alpha").value);
		const power = parseFloat(document.getElementById("power").value);

		if (![p1, p2, alpha, power].every(Number.isFinite) || p1 === p2) {
			out.hidden = false;
			out.innerHTML = "<strong>Use two different rates</strong> in (0,1).";
			return;
		}

		const za = zFromTailTwoSided(alpha);
		const zb = zFromPower(power);
		const num = Math.pow(za + zb, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
		const den = Math.pow(p2 - p1, 2);
		const n = Math.ceil(num / den);

		out.hidden = false;
		out.innerHTML = [
			`<strong>Approx. n per group:</strong> ${C.escapeHtml(String(n))}`,
			`<strong>Total participants:</strong> ${C.escapeHtml(String(n * 2))}`,
			`<span style="color:var(--calc-muted);font-size:0.88em">z<sub>α/2</sub> ≈ ${C.escapeHtml(C.fmtNum(za, 3))}, z<sub>β</sub> ≈ ${C.escapeHtml(C.fmtNum(zb, 3))}</span>`,
		].join("<br>");
	});
})();
