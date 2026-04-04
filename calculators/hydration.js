(function () {
	const C = window.Calc;
	const wEl = document.getElementById("w");
	const act = document.getElementById("act");
	const out = document.getElementById("out");
	const btn = document.getElementById("go");

	function unit() {
		const r = document.querySelector('input[name="wu"]:checked');
		return r ? r.value : "kg";
	}

	btn.addEventListener("click", function () {
		out.hidden = true;
		const w = parseFloat(wEl.value);
		const bonus = parseFloat(act.value) || 0;
		if (!Number.isFinite(w) || w <= 0) {
			out.hidden = false;
			out.innerHTML = "<strong>Enter a positive weight.</strong>";
			return;
		}
		const kg = unit() === "lb" ? w * 0.453592 : w;
		const ml = kg * 33 + bonus;
		const oz = ml / 29.5735;
		const cups = ml / 236.588;

		out.hidden = false;
		out.innerHTML = [
			`<strong>Approx. daily fluids:</strong> ${C.escapeHtml(C.fmtNum(ml, 0))} ml`,
			`(~${C.escapeHtml(C.fmtNum(oz, 0))} fl oz, ~${C.escapeHtml(C.fmtNum(cups, 1))} US cups)`,
			`<span style="color:var(--calc-muted);font-size:0.9em">Includes beverages and high-water foods on average days.</span>`,
		].join("<br>");
	});
})();
