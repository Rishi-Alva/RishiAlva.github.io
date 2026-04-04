(function () {
	const C = window.Calc;
	const tbody = document.getElementById("tbody");

	function addRow(name, imp, eff) {
		const tr = document.createElement("tr");
		const tdN = document.createElement("td");
		const inpN = document.createElement("input");
		inpN.type = "text";
		inpN.className = "cell-name";
		inpN.placeholder = "Initiative";
		inpN.value = name || "";
		tdN.appendChild(inpN);
		const tdI = document.createElement("td");
		const inpI = document.createElement("input");
		inpI.type = "number";
		inpI.className = "cell-imp";
		inpI.min = "1";
		inpI.max = "5";
		inpI.step = "1";
		inpI.value = String(imp != null ? imp : 3);
		tdI.appendChild(inpI);
		const tdE = document.createElement("td");
		const inpE = document.createElement("input");
		inpE.type = "number";
		inpE.className = "cell-eff";
		inpE.min = "1";
		inpE.max = "5";
		inpE.step = "1";
		inpE.value = String(eff != null ? eff : 3);
		tdE.appendChild(inpE);
		const tdR = document.createElement("td");
		const rm = document.createElement("button");
		rm.type = "button";
		rm.className = "btn btn--ghost rm";
		rm.style.cssText = "margin:0;padding:0.35rem 0.6rem;font-size:0.75rem";
		rm.textContent = "Remove";
		rm.addEventListener("click", function () {
			tr.remove();
		});
		tdR.appendChild(rm);
		tr.appendChild(tdN);
		tr.appendChild(tdI);
		tr.appendChild(tdE);
		tr.appendChild(tdR);
		tbody.appendChild(tr);
	}

	document.getElementById("add-row").addEventListener("click", function () {
		addRow("", 3, 3);
	});

	document.getElementById("go").addEventListener("click", function () {
		const rows = Array.from(tbody.querySelectorAll("tr"));
		const qw = [];
		const mb = [];
		const fi = [];
		const ts = [];
		for (const tr of rows) {
			const name = tr.querySelector(".cell-name").value.trim() || "(unnamed)";
			const imp = parseInt(tr.querySelector(".cell-imp").value, 10);
			const eff = parseInt(tr.querySelector(".cell-eff").value, 10);
			if (!Number.isFinite(imp) || !Number.isFinite(eff) || imp < 1 || imp > 5 || eff < 1 || eff > 5) continue;
			if (imp >= 3 && eff <= 2) qw.push(name);
			else if (imp >= 3 && eff >= 3) mb.push(name);
			else if (imp < 3 && eff <= 2) fi.push(name);
			else ts.push(name);
		}
		function fill(id, arr) {
			document.getElementById(id).innerHTML = arr.length ? arr.map((s) => "• " + C.escapeHtml(s)).join("<br>") : "—";
		}
		fill("q-qw", qw);
		fill("q-mb", mb);
		fill("q-fi", fi);
		fill("q-ts", ts);
		document.getElementById("quads").hidden = false;
	});

	addRow("Example: self-serve reporting", 5, 2);
	addRow("Example: data warehouse rebuild", 5, 5);
	addRow("Example: fix typos in dashboard", 2, 1);
	addRow("Example: legacy ETL patch", 2, 4);
})();
