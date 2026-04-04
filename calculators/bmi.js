(function () {
	const weightInput = document.getElementById("weight");
	const heightInput = document.getElementById("height");
	const weightLabel = document.getElementById("weight-label");
	const heightLabel = document.getElementById("height-label");
	const resultEl = document.getElementById("bmi-result");
	const btn = document.getElementById("bmi-calc");

	function units() {
		const r = document.querySelector('input[name="units"]:checked');
		return r ? r.value : "metric";
	}

	function updateLabels() {
		const u = units();
		if (u === "metric") {
			weightLabel.textContent = "Weight (kg)";
			heightLabel.textContent = "Height (cm)";
			weightInput.placeholder = "e.g. 70";
			heightInput.placeholder = "e.g. 175";
		} else {
			weightLabel.textContent = "Weight (lb)";
			heightLabel.textContent = "Height (in)";
			weightInput.placeholder = "e.g. 165";
			heightInput.placeholder = "e.g. 69";
		}
	}

	function category(bmi) {
		if (bmi < 18.5) return "Underweight";
		if (bmi < 25) return "Normal weight";
		if (bmi < 30) return "Overweight";
		return "Obesity";
	}

	function escapeHtml(s) {
		const d = document.createElement("div");
		d.textContent = s;
		return d.innerHTML;
	}

	function compute() {
		const w = parseFloat(weightInput.value);
		const h = parseFloat(heightInput.value);
		resultEl.hidden = true;

		if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
			resultEl.hidden = false;
			resultEl.innerHTML = "<strong>Check inputs.</strong> Use positive numbers for weight and height.";
			return;
		}

		let bmi;
		if (units() === "metric") {
			const m = h / 100;
			if (m <= 0) {
				resultEl.hidden = false;
				resultEl.innerHTML = "<strong>Height</strong> must be greater than zero.";
				return;
			}
			bmi = w / (m * m);
		} else {
			if (h <= 0) {
				resultEl.hidden = false;
				resultEl.innerHTML = "<strong>Height</strong> must be greater than zero.";
				return;
			}
			bmi = (703 * w) / (h * h);
		}

		const cat = category(bmi);
		const rounded = Math.round(bmi * 10) / 10;
		resultEl.hidden = false;
		resultEl.innerHTML =
			`<strong>BMI:</strong> ${escapeHtml(String(rounded))}<br>` +
			`<strong>Category (adults, WHO-style bands):</strong> ${escapeHtml(cat)}`;
	}

	document.querySelectorAll('input[name="units"]').forEach(function (el) {
		el.addEventListener("change", updateLabels);
	});
	btn.addEventListener("click", compute);
	updateLabels();
})();
