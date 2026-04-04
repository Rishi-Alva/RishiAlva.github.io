(function () {
	const C = window.Calc;

	function paymentFromTerm(P, r, nMonths) {
		if (r === 0) return P / nMonths;
		return (P * r * Math.pow(1 + r, nMonths)) / (Math.pow(1 + r, nMonths) - 1);
	}

	function monthsToPayoff(P, r, M) {
		if (M <= 0) return Infinity;
		if (r === 0) return Math.ceil(P / M);
		if (M <= P * r) return Infinity;
		return Math.ceil(-Math.log(1 - (P * r) / M) / Math.log(1 + r));
	}

	document.getElementById("go").addEventListener("click", function () {
		const out = document.getElementById("out");
		out.hidden = true;
		const P = parseFloat(document.getElementById("bal").value);
		const apr = parseFloat(document.getElementById("apr").value);
		const pmtIn = document.getElementById("pmt").value;
		const yrsIn = document.getElementById("yrs").value;

		if (!Number.isFinite(P) || P < 0 || !Number.isFinite(apr) || apr < 0) {
			out.hidden = false;
			out.innerHTML = "<strong>Enter balance and APR.</strong>";
			return;
		}

		const r = apr / 100 / 12;
		const hasPmt = pmtIn !== "" && Number.isFinite(parseFloat(pmtIn));
		const hasYrs = yrsIn !== "" && Number.isFinite(parseFloat(yrsIn));

		if (hasPmt && hasYrs) {
			out.hidden = false;
			out.innerHTML = "<strong>Leave either payment or term blank</strong> (not both filled).";
			return;
		}

		if (!hasPmt && !hasYrs) {
			out.hidden = false;
			out.innerHTML = "<strong>Enter monthly payment or term in years.</strong>";
			return;
		}

		if (hasYrs) {
			const y = parseFloat(yrsIn);
			const n = Math.round(y * 12);
			if (n < 1) {
				out.hidden = false;
				out.innerHTML = "<strong>Term</strong> too short.";
				return;
			}
			const M = paymentFromTerm(P, r, n);
			const total = M * n;
			out.hidden = false;
			out.innerHTML = [
				`<strong>Monthly payment:</strong> ${C.escapeHtml(C.fmtMoney(M))}`,
				`<strong>Payments:</strong> ${n} (~${C.escapeHtml(C.fmtNum(y, 2))} yr)`,
				`<strong>Total paid (approx):</strong> ${C.escapeHtml(C.fmtMoney(total))} (principal ${C.escapeHtml(C.fmtMoney(P))})`,
			].join("<br>");
			return;
		}

		const M = parseFloat(pmtIn);
		if (!Number.isFinite(M) || M <= 0) {
			out.hidden = false;
			out.innerHTML = "<strong>Payment</strong> must be positive.";
			return;
		}
		const n = monthsToPayoff(P, r, M);
		if (!Number.isFinite(n) || n > 1200) {
			out.hidden = false;
			out.innerHTML = "<strong>Payment too low</strong> to amortize this balance at this APR (interest would grow).";
			return;
		}
		const total = M * n;
		out.hidden = false;
		out.innerHTML = [
			`<strong>Payoff time:</strong> ~${n} months (~${C.escapeHtml(C.fmtNum(n / 12, 1))} years)`,
			`<strong>Total paid (approx):</strong> ${C.escapeHtml(C.fmtMoney(total))}`,
		].join("<br>");
	});
})();
