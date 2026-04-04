(function () {
	const C = window.Calc;
	document.getElementById("go").addEventListener("click", function () {
		const out = document.getElementById("out");
		out.hidden = true;
		const cost = parseFloat(document.getElementById("cost").value);
		let gain = parseFloat(document.getElementById("gain").value);
		const finalV = document.getElementById("final").value;
		if (!Number.isFinite(cost) || cost <= 0) {
			out.hidden = false;
			out.innerHTML = "<strong>Cost</strong> must be positive.";
			return;
		}
		if (finalV !== "") {
			const f = parseFloat(finalV);
			if (!Number.isFinite(f)) {
				out.hidden = false;
				out.innerHTML = "<strong>Final value</strong> must be a number.";
				return;
			}
			gain = f - cost;
		} else if (!Number.isFinite(gain)) {
			out.hidden = false;
			out.innerHTML = "<strong>Enter gain</strong> or <strong>final value</strong>.";
			return;
		}

		const roi = (gain / cost) * 100;
		out.hidden = false;
		out.innerHTML = [
			`<strong>Net vs cost:</strong> ${C.escapeHtml(C.fmtMoney(gain))}`,
			`<strong>ROI:</strong> ${C.escapeHtml(C.fmtNum(roi, 2))}%`,
		].join("<br>");
	});
})();
