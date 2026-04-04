(function () {
	const C = window.Calc;

	function band(absr) {
		if (absr < 0.1) return "negligible";
		if (absr < 0.3) return "weak";
		if (absr < 0.5) return "moderate";
		if (absr < 0.7) return "strong";
		return "very strong";
	}

	document.getElementById("go").addEventListener("click", function () {
		const out = document.getElementById("out");
		out.hidden = true;
		const r = parseFloat(document.getElementById("r").value);
		if (!Number.isFinite(r) || r < -1 || r > 1) {
			out.hidden = false;
			out.innerHTML = "<strong>r</strong> must be between −1 and 1.";
			return;
		}
		const a = Math.abs(r);
		const b = band(a);
		const r2 = r * r;
		out.hidden = false;
		out.innerHTML = [
			`<strong>|r| =</strong> ${C.escapeHtml(C.fmtNum(a, 3))} → informal label: <strong>${C.escapeHtml(b)}</strong> linear association`,
			`<strong>r² =</strong> ${C.escapeHtml(C.fmtNum(r2, 3))} (do not over-interpret as “percent explained” outside context)`,
		].join("<br>");
	});
})();
