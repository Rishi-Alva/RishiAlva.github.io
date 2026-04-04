(function () {
	const C = window.Calc;

	document.getElementById("btn-dm").addEventListener("click", function () {
		const el = document.getElementById("out-dm");
		el.hidden = true;
		const age = parseFloat(document.getElementById("dm-age").value);
		const bmi = parseFloat(document.getElementById("dm-bmi").value);
		if (!Number.isFinite(age) || !Number.isFinite(bmi) || age < 18) {
			el.hidden = false;
			el.innerHTML = "<strong>Enter age (18+)</strong> and BMI.";
			return;
		}
		let pts = 0;
		if (age >= 65) pts += 3;
		else if (age >= 55) pts += 2;
		else if (age >= 45) pts += 1;
		if (bmi >= 40) pts += 3;
		else if (bmi >= 30) pts += 2;
		else if (bmi >= 25) pts += 1;
		if (document.getElementById("dm-fam").checked) pts += 1;
		if (document.getElementById("dm-inact").checked) pts += 1;
		if (document.getElementById("dm-glu").checked) pts += 2;

		let band =
			pts <= 2
				? "Lower on this crude scale—still get screened per guidelines."
				: pts <= 4
					? "Intermediate—worth discussing A1c or fasting glucose with a clinician."
					: "Higher on this crude scale—please schedule medical evaluation.";
		el.hidden = false;
		el.innerHTML = `<strong>Raw points (demo):</strong> ${C.escapeHtml(String(pts))}<br>${C.escapeHtml(band)}`;
	});

	document.getElementById("btn-hd").addEventListener("click", function () {
		const el = document.getElementById("out-hd");
		el.hidden = true;
		const age = parseFloat(document.getElementById("hd-age").value);
		const sbp = parseFloat(document.getElementById("hd-sbp").value);
		const chol = parseFloat(document.getElementById("hd-chol").value);
		if (!Number.isFinite(age) || age < 25) {
			el.hidden = false;
			el.innerHTML = "<strong>Enter age</strong> (25+ for this toy model).";
			return;
		}
		let pts = 0;
		if (age >= 70) pts += 4;
		else if (age >= 60) pts += 3;
		else if (age >= 50) pts += 2;
		else pts += 1;
		if (Number.isFinite(sbp)) {
			if (sbp >= 160) pts += 3;
			else if (sbp >= 140) pts += 2;
			else if (sbp >= 130) pts += 1;
		}
		if (Number.isFinite(chol)) {
			if (chol >= 280) pts += 2;
			else if (chol >= 240) pts += 1;
		}
		if (document.getElementById("hd-smoke").checked) pts += 3;
		if (document.getElementById("hd-dm").checked) pts += 2;

		let band =
			pts <= 4
				? "Fewer factors on this toy scale—maintain prevention habits and routine care."
				: pts <= 8
					? "Several factors—good topic for a cardiovascular risk review (real calculators use more data)."
					: "Many factors on this toy scale—prioritize clinician visit for formal risk scoring.";
		el.hidden = false;
		el.innerHTML = `<strong>Raw points (demo):</strong> ${C.escapeHtml(String(pts))}<br>${C.escapeHtml(band)}`;
	});
})();
