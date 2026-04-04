(function () {
	const C = window.Calc;
	const z = 1.959963984540054;

	document.querySelectorAll('input[name="mode"]').forEach(function (r) {
		r.addEventListener("change", function () {
			const mean = document.querySelector('input[name="mode"]:checked').value === "mean";
			document.getElementById("blk-mean").hidden = !mean;
			document.getElementById("blk-prop").hidden = mean;
		});
	});

	document.getElementById("go").addEventListener("click", function () {
		const out = document.getElementById("out");
		out.hidden = true;
		const meanMode = document.querySelector('input[name="mode"]:checked').value === "mean";

		if (meanMode) {
			const xbar = parseFloat(document.getElementById("m-mean").value);
			const sd = parseFloat(document.getElementById("m-sd").value);
			const n = parseInt(document.getElementById("m-n").value, 10);
			if (!Number.isFinite(xbar) || !Number.isFinite(sd) || !Number.isFinite(n) || n < 2 || sd < 0) {
				out.hidden = false;
				out.innerHTML = "<strong>Check mean, SD ≥ 0, and n ≥ 2.</strong>";
				return;
			}
			const se = sd / Math.sqrt(n);
			const lo = xbar - z * se;
			const hi = xbar + z * se;
			out.hidden = false;
			out.innerHTML = `<strong>95% CI (mean):</strong> [${C.escapeHtml(C.fmtNum(lo, 4))}, ${C.escapeHtml(C.fmtNum(hi, 4))}]`;
			return;
		}

		const x = parseInt(document.getElementById("p-x").value, 10);
		const n = parseInt(document.getElementById("p-n").value, 10);
		if (!Number.isFinite(x) || !Number.isFinite(n) || n < 1 || x < 0 || x > n) {
			out.hidden = false;
			out.innerHTML = "<strong>Successes</strong> must be between 0 and n.";
			return;
		}

		const phat = x / n;
		const denom = 1 + (z * z) / n;
		const center = (phat + (z * z) / (2 * n)) / denom;
		const rad =
			(z * Math.sqrt((phat * (1 - phat)) / n + (z * z) / (4 * n * n))) / denom;
		const lo = Math.max(0, center - rad);
		const hi = Math.min(1, center + rad);

		out.hidden = false;
		out.innerHTML =
			`<strong>95% CI (Wilson, proportion):</strong> [${C.escapeHtml(C.fmtNum(lo, 4))}, ${C.escapeHtml(C.fmtNum(hi, 4))}]` +
			`<br><strong>Point estimate:</strong> ${C.escapeHtml(C.fmtPct(phat))}`;
	});
})();
