(function () {
	const C = window.Calc;
	document.getElementById("go").addEventListener("click", function () {
		const out = document.getElementById("out");
		out.hidden = true;
		const cur = parseFloat(document.getElementById("cur").value);
		const pctIn = document.getElementById("pct").value;
		const newIn = document.getElementById("new").value;
		const yrs = parseInt(document.getElementById("yrs").value, 10) || 0;

		if (!Number.isFinite(cur) || cur < 0) {
			out.hidden = false;
			out.innerHTML = "<strong>Enter current salary.</strong>";
			return;
		}

		let newSal;
		let pct;
		if (newIn !== "") {
			newSal = parseFloat(newIn);
			if (!Number.isFinite(newSal) || newSal < 0) {
				out.hidden = false;
				out.innerHTML = "<strong>New salary</strong> must be a number.";
				return;
			}
			pct = ((newSal - cur) / cur) * 100;
		} else if (pctIn !== "") {
			pct = parseFloat(pctIn);
			if (!Number.isFinite(pct)) {
				out.hidden = false;
				out.innerHTML = "<strong>Percent</strong> must be a number.";
				return;
			}
			newSal = cur * (1 + pct / 100);
		} else {
			out.hidden = false;
			out.innerHTML = "<strong>Enter percent raise or new salary.</strong>";
			return;
		}

		const delta = newSal - cur;
		const lines = [
			`<strong>New salary:</strong> ${C.escapeHtml(C.fmtMoney(newSal))}`,
			`<strong>Change:</strong> ${C.escapeHtml(C.fmtMoney(delta))} (${C.escapeHtml(C.fmtNum(pct, 2))}%)`,
		];

		if (yrs > 0 && Number.isFinite(pct)) {
			const proj = newSal * Math.pow(1 + pct / 100, yrs);
			lines.push(
				`<strong>After ${yrs} more year(s) at the same annual %:</strong> ~${C.escapeHtml(C.fmtMoney(proj))} (illustrative)`,
			);
		}

		out.hidden = false;
		out.innerHTML = lines.join("<br>");
	});
})();
