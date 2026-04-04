(function () {
	const C = window.Calc;
	document.getElementById("go").addEventListener("click", function () {
		const out = document.getElementById("out");
		out.hidden = true;
		const F = parseFloat(document.getElementById("fixed").value);
		const P = parseFloat(document.getElementById("price").value);
		const V = parseFloat(document.getElementById("var").value);
		if (![F, P, V].every(Number.isFinite) || F < 0 || P < 0 || V < 0) {
			out.hidden = false;
			out.innerHTML = "<strong>Use non-negative numbers.</strong>";
			return;
		}
		const cm = P - V;
		if (cm <= 0) {
			out.hidden = false;
			out.innerHTML = "<strong>Contribution margin</strong> (price − variable) must be positive to break even.";
			return;
		}
		const q = Math.ceil(F / cm);
		out.hidden = false;
		out.innerHTML = [
			`<strong>Contribution margin / unit:</strong> ${C.escapeHtml(C.fmtMoney(cm))}`,
			`<strong>Break-even units (ceil):</strong> ${C.escapeHtml(String(q))}`,
			`<strong>Break-even revenue (at that Q):</strong> ${C.escapeHtml(C.fmtMoney(q * P))}`,
		].join("<br>");
	});
})();
