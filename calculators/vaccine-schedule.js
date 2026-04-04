(function () {
	const C = window.Calc;
	const PREFIX = "calc_vax_";

	function load() {
		["flu-date", "tdap-date", "covid-date"].forEach(function (id) {
			const v = localStorage.getItem(PREFIX + id);
			const el = document.getElementById(id);
			if (v && el) el.value = v;
		});
		const dob = localStorage.getItem(PREFIX + "dob");
		if (dob) document.getElementById("dob").value = dob;
	}

	function ageFromDob(d) {
		const today = new Date();
		let a = today.getFullYear() - d.getFullYear();
		const m = today.getMonth() - d.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < d.getDate())) a--;
		return a;
	}

	document.getElementById("age-go").addEventListener("click", function () {
		const dobEl = document.getElementById("dob");
		const manual = document.getElementById("age-manual");
		const out = document.getElementById("age-out");
		if (dobEl.value) {
			const d = new Date(dobEl.value + "T12:00:00");
			if (!Number.isNaN(d.getTime())) {
				out.value = String(ageFromDob(d));
				localStorage.setItem(PREFIX + "dob", dobEl.value);
				return;
			}
		}
		if (manual.value !== "") {
			const a = parseInt(manual.value, 10);
			if (Number.isFinite(a) && a >= 0 && a <= 120) {
				out.value = String(a);
				return;
			}
		}
		out.value = "";
	});

	document.getElementById("save-dates").addEventListener("click", function () {
		["flu-date", "tdap-date", "covid-date"].forEach(function (id) {
			const el = document.getElementById(id);
			localStorage.setItem(PREFIX + id, el.value || "");
		});
		const msg = document.getElementById("save-msg");
		msg.hidden = false;
		msg.textContent = "Saved on this device.";
		setTimeout(function () {
			msg.hidden = true;
		}, 2500);
	});

	load();
})();
