(function () {
	const C = window.Calc;
	document.getElementById("go").addEventListener("click", function () {
		const out = document.getElementById("out");
		out.hidden = true;
		const sal = parseFloat(document.getElementById("sal").value);
		const ia = parseFloat(document.getElementById("ia").value);
		const ib = parseFloat(document.getElementById("ib").value);
		if (!Number.isFinite(sal) || sal < 0 || !Number.isFinite(ia) || !Number.isFinite(ib) || ia <= 0 || ib <= 0) {
			out.hidden = false;
			out.innerHTML = "<strong>Enter salary ≥ 0</strong> and positive indices.";
			return;
		}
		const equivB = sal * (ib / ia);
		const checkA = equivB * (ia / ib);
		out.hidden = false;
		out.innerHTML = [
			`<strong>To match purchasing power in city B:</strong> ~${C.escapeHtml(C.fmtMoney(equivB))}`,
			`<strong>Round-trip check (that B salary back to A):</strong> ~${C.escapeHtml(C.fmtMoney(checkA))} (should match your A salary up to rounding)`,
		].join("<br>");
	});
})();
