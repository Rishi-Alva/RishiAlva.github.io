/**
 * Shared helpers for calculator pages (load before tool-specific scripts).
 */
(function (global) {
	function escapeHtml(s) {
		const d = document.createElement("div");
		d.textContent = s;
		return d.innerHTML;
	}

	/** Standard normal CDF Φ(z) */
	function normalCDF(z) {
		const t = 1 / (1 + 0.2316419 * Math.abs(z));
		const d = 0.3989423 * Math.exp((-z * z) / 2);
		const p =
			1 -
			d *
				t *
				(0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
		return z >= 0 ? p : 1 - p;
	}

	function fmtNum(x, d) {
		const m = Math.pow(10, d);
		return String(Math.round(x * m) / m);
	}

	function fmtPct(p) {
		return (Math.round(p * 10000) / 100).toFixed(2) + "%";
	}

	function fmtMoney(x) {
		return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(x);
	}

	global.Calc = { escapeHtml, normalCDF, fmtNum, fmtPct, fmtMoney };
})(typeof window !== "undefined" ? window : globalThis);
