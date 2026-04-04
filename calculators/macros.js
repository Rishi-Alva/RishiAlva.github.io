(function () {
	const C = window.Calc;
	const tdeeEl = document.getElementById("tdee");
	const wKg = document.getElementById("w-kg");
	const protGkg = document.getElementById("prot-gkg");
	const carbPct = document.getElementById("carb-pct");
	const out = document.getElementById("out");
	const btn = document.getElementById("go");

	btn.addEventListener("click", function () {
		out.hidden = true;
		const tdee = parseFloat(tdeeEl.value);
		const w = parseFloat(wKg.value);
		const pg = parseFloat(protGkg.value);
		let cp = parseFloat(carbPct.value);
		if (!Number.isFinite(cp)) cp = 50;
		cp = Math.min(100, Math.max(0, cp));

		if (!Number.isFinite(tdee) || !Number.isFinite(w) || !Number.isFinite(pg) || tdee < 500 || w <= 0 || pg <= 0) {
			out.hidden = false;
			out.innerHTML = "<strong>Check inputs.</strong>";
			return;
		}

		const protG = w * pg;
		const protKcal = protG * 4;
		const remain = tdee - protKcal;
		if (remain <= 0) {
			out.hidden = false;
			out.innerHTML =
				"<strong>Protein calories exceed or match TDEE.</strong> Lower protein per kg or raise calorie target.";
			return;
		}

		const carbKcal = remain * (cp / 100);
		const fatKcal = remain - carbKcal;
		const carbG = carbKcal / 4;
		const fatG = fatKcal / 9;

		out.hidden = false;
		out.innerHTML = [
			`<strong>Protein:</strong> ${C.escapeHtml(C.fmtNum(protG, 0))} g (${C.escapeHtml(C.fmtNum(protKcal, 0))} kcal)`,
			`<strong>Carbs:</strong> ${C.escapeHtml(C.fmtNum(carbG, 0))} g (${C.escapeHtml(C.fmtNum(carbKcal, 0))} kcal)`,
			`<strong>Fat:</strong> ${C.escapeHtml(C.fmtNum(fatG, 0))} g (${C.escapeHtml(C.fmtNum(fatKcal, 0))} kcal)`,
			`<strong>Check:</strong> ${C.escapeHtml(C.fmtNum(protKcal + carbKcal + fatKcal, 0))} kcal total`,
		].join("<br>");
	});
})();
