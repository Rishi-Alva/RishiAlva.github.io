(function () {
	const C = window.Calc;

	/** Very rough remaining years at age a (illustrative, not actuarial). */
	function baseRemaining(age, sex) {
		const e0 = sex === "f" ? 81 : 76;
		const slope = 0.12;
		const rem = Math.max(5, e0 - age * slope - (age - 25) * 0.65);
		return rem;
	}

	document.getElementById("go").addEventListener("click", function () {
		const out = document.getElementById("out");
		out.hidden = true;
		const age = parseFloat(document.getElementById("le-age").value);
		const sex = document.getElementById("le-sex").value;
		if (!Number.isFinite(age) || age < 18 || age > 100) {
			out.hidden = false;
			out.innerHTML = "<strong>Age</strong> should be 18–100.";
			return;
		}

		let adj = 0;
		adj += parseFloat(document.getElementById("le-smoke").value) || 0;
		adj += parseFloat(document.getElementById("le-ex").value) || 0;
		adj += parseFloat(document.getElementById("le-diet").value) || 0;
		adj += parseFloat(document.getElementById("le-bmi").value) || 0;

		const base = baseRemaining(age, sex);
		const rem = Math.max(0.5, base + adj);
		const approxTotal = age + rem;

		out.hidden = false;
		out.innerHTML = [
			`<strong>Illustrative remaining years (from a toy baseline):</strong> ~${C.escapeHtml(C.fmtNum(rem, 1))}`,
			`<strong>Illustrative total age at end of that span:</strong> ~${C.escapeHtml(C.fmtNum(approxTotal, 1))} years`,
			`<span style="color:var(--calc-muted);font-size:0.88em">Adjustments summed: ${C.escapeHtml(C.fmtNum(adj, 1))} years vs baseline slice.</span>`,
		].join("<br>");
	});
})();
