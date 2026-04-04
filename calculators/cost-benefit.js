(function () {
	const C = window.Calc;
	document.getElementById("go").addEventListener("click", function () {
		const out = document.getElementById("out");
		out.hidden = true;
		const T = parseInt(document.getElementById("horizon").value, 10);
		const r = parseFloat(document.getElementById("r").value);
		const annual = parseFloat(document.getElementById("annual").value);
		const upfront = parseFloat(document.getElementById("upfront").value) || 0;

		if (!Number.isFinite(T) || T < 1 || !Number.isFinite(r) || r < 0 || !Number.isFinite(annual)) {
			out.hidden = false;
			out.innerHTML = "<strong>Enter horizon ≥ 1, r ≥ 0, and annual net benefit.</strong>";
			return;
		}

		let pvBenefits = 0;
		if (r === 0) pvBenefits = annual * T;
		else {
			for (let t = 1; t <= T; t++) {
				pvBenefits += annual / Math.pow(1 + r, t);
			}
		}
		const npv = pvBenefits - upfront;

		out.hidden = false;
		out.innerHTML = [
			`<strong>PV of annual net benefits:</strong> ${C.escapeHtml(C.fmtMoney(pvBenefits))}`,
			`<strong>NPV (after upfront):</strong> ${C.escapeHtml(C.fmtMoney(npv))}`,
		].join("<br>");
	});
})();
