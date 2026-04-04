(function () {
	const C = window.Calc;
	const lastMeal = document.getElementById("last-meal");
	const fastH = document.getElementById("fast-h");
	const out = document.getElementById("out");
	const btn = document.getElementById("go");

	function fmtTime(d) {
		return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
	}
	function fmtDate(d) {
		return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
	}

	btn.addEventListener("click", function () {
		out.hidden = true;
		const t = lastMeal.value;
		const h = parseFloat(fastH.value);
		if (!t || !Number.isFinite(h) || h < 1 || h > 48) {
			out.hidden = false;
			out.innerHTML = "<strong>Enter a time</strong> and fasting hours between 1 and 48.";
			return;
		}

		const [hh, mm] = t.split(":").map(Number);
		const start = new Date();
		start.setHours(hh, mm, 0, 0);
		const open = new Date(start.getTime() + h * 3600 * 1000);

		const eatDur = 24 - h;
		out.hidden = false;
		out.innerHTML = [
			`<strong>Fast starts:</strong> ${C.escapeHtml(fmtTime(start))} (${C.escapeHtml(fmtDate(start))})`,
			`<strong>Eating can resume:</strong> ${C.escapeHtml(fmtTime(open))} (${C.escapeHtml(fmtDate(open))})`,
			`<strong>Approx. eating window length</strong> (if you repeat daily): ${C.escapeHtml(C.fmtNum(Math.max(0, eatDur), 1))} h`,
		].join("<br>");
	});
})();
