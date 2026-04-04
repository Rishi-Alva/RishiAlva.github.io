(function () {
	const C = window.Calc;
	document.getElementById("go").addEventListener("click", function () {
		const out = document.getElementById("out");
		out.hidden = true;
		const u = parseFloat(document.getElementById("universe").value);
		const psam = parseFloat(document.getElementById("p-sam").value);
		const psom = parseFloat(document.getElementById("p-som").value);
		if (!Number.isFinite(u) || u < 0 || !Number.isFinite(psam) || !Number.isFinite(psom)) {
			out.hidden = false;
			out.innerHTML = "<strong>Enter universe and percentages.</strong>";
			return;
		}
		const tam = u;
		const sam = tam * (psam / 100);
		const som = sam * (psom / 100);
		const isMoney = u > 1000;
		const fmt = isMoney ? (x) => C.fmtMoney(x) : (x) => C.fmtNum(x, 0);

		out.hidden = false;
		out.innerHTML = [
			`<strong>TAM (your universe input):</strong> ${C.escapeHtml(fmt(tam))}`,
			`<strong>SAM (${C.escapeHtml(C.fmtNum(psam, 1))}% of TAM):</strong> ${C.escapeHtml(fmt(sam))}`,
			`<strong>SOM (${C.escapeHtml(C.fmtNum(psom, 1))}% of SAM):</strong> ${C.escapeHtml(fmt(som))}`,
		].join("<br>");
	});
})();
