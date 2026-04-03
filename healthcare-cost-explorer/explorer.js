/**
 * Healthcare Cost Transparency Explorer — data, sortable table, multiple Chart.js views.
 */
(function () {
	const DATA_URL = "data/explorer.json";

	const fmtMoney = (n) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0,
		}).format(n);

	const fmtShortMoney = (n) => {
		if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
		return "$" + Math.round(n / 1000) + "k";
	};

	const fmtDate = (iso) => {
		try {
			const d = new Date(iso);
			return d.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				timeZone: "UTC",
			});
		} catch {
			return iso;
		}
	};

	const PALETTE = [
		"rgba(24, 191, 239, 0.85)",
		"rgba(129, 140, 248, 0.9)",
		"rgba(52, 211, 153, 0.9)",
		"rgba(251, 191, 36, 0.9)",
		"rgba(244, 114, 182, 0.9)",
		"rgba(148, 163, 184, 0.9)",
		"rgba(56, 189, 248, 0.85)",
	];

	let state = {
		data: null,
		sortKey: "avg_covered_charges",
		sortDir: "desc",
		region: "all",
		charts: [],
	};

	function $(sel, root = document) {
		return root.querySelector(sel);
	}

	function destroyCharts() {
		state.charts.forEach((c) => {
			try {
				c.destroy();
			} catch (_) {}
		});
		state.charts = [];
	}

	function shortLabel(name, max = 34) {
		const s = String(name).replace(/\s+/g, " ").trim();
		if (s.length <= max) return s;
		return s.slice(0, max - 1) + "…";
	}

	function histogramBins(hospitals, binCount = 5) {
		const vals = hospitals.map((h) => h.avg_covered_charges).sort((a, b) => a - b);
		const lo = vals[0];
		const hi = vals[vals.length - 1];
		if (hi <= lo) {
			return { labels: [fmtShortMoney(lo)], counts: [vals.length] };
		}
		const step = (hi - lo) / binCount;
		const counts = new Array(binCount).fill(0);
		for (const v of vals) {
			let idx = Math.min(binCount - 1, Math.floor((v - lo) / step));
			if (v === hi) idx = binCount - 1;
			counts[idx]++;
		}
		const labels = counts.map((_, i) => {
			const a = lo + i * step;
			const b = i === binCount - 1 ? hi : lo + (i + 1) * step;
			return `${fmtShortMoney(a)} – ${fmtShortMoney(b)}`;
		});
		return { labels, counts };
	}

	function chartCommonOptions() {
		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					labels: { color: "#8b98a8", boxWidth: 12, padding: 12 },
				},
			},
		};
	}

	function renderHero(meta, analysis) {
		const spread = meta.headline_spread_covered_charges;
		const n = analysis.n_hospitals;
		const lead = $("#hero-lead");
		if (!lead) return;
		if (spread != null && n) {
			lead.innerHTML = `For the same kind of stay (<strong>major hip or knee replacement</strong>), hospitals in Florida report very different average <em>list prices</em> on Medicare&rsquo;s public file. In this sample of <strong>${n} hospitals</strong>, those averages run from about <strong>${fmtMoney(analysis.covered_charges.min)}</strong> to <strong>${fmtMoney(analysis.covered_charges.max)}</strong>, roughly <strong>${spread}×</strong> apart. The charts below make that easy to see; use the table to dig into each hospital.`;
		} else {
			lead.textContent = "Explore hospital-level Medicare inpatient data for joint replacement in Florida.";
		}
	}

	function renderCallouts(analysis) {
		const cc = analysis.covered_charges;
		const cheap = analysis.cheapest_city_by_avg_charge;
		const pricey = analysis.priciest_city_by_avg_charge;

		$("#callout-spread").textContent = cc.spread_ratio != null ? `${cc.spread_ratio}×` : "—";
		$("#callout-median-charge").textContent = fmtMoney(cc.median);
		$("#callout-cities").textContent = `${cheap.city} (${fmtMoney(cheap.avg_covered_charges)}) vs ${pricey.city} (${fmtMoney(pricey.avg_covered_charges)})`;
	}

	function regionOptions(hospitals) {
		const set = new Set(hospitals.map((h) => h.region));
		return ["all", ...Array.from(set).sort()];
	}

	function filteredHospitals() {
		const { data, region } = state;
		if (!data) return [];
		if (region === "all") return [...data.hospitals];
		return data.hospitals.filter((h) => h.region === region);
	}

	function sortHospitals(list) {
		const { sortKey, sortDir } = state;
		const mult = sortDir === "asc" ? 1 : -1;
		return [...list].sort((a, b) => {
			const va = a[sortKey];
			const vb = b[sortKey];
			if (typeof va === "number" && typeof vb === "number") return (va - vb) * mult;
			return String(va).localeCompare(String(vb), undefined, { sensitivity: "base" }) * mult;
		});
	}

	function renderTable() {
		const tbody = $("#hospital-tbody");
		if (!tbody) return;
		const rows = sortHospitals(filteredHospitals());
		tbody.innerHTML = rows
			.map(
				(h) => `<tr>
			<td>${escapeHtml(h.provider_name)}</td>
			<td>${escapeHtml(h.city)}</td>
			<td>${escapeHtml(h.region)}</td>
			<td class="num">${h.total_discharges}</td>
			<td class="num">${fmtMoney(h.avg_covered_charges)}</td>
			<td class="num">${fmtMoney(h.avg_total_payments)}</td>
			<td class="num">${fmtMoney(h.avg_medicare_payments)}</td>
		</tr>`
			)
			.join("");
	}

	function escapeHtml(s) {
		return String(s)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	function updateSortHeaders() {
		document.querySelectorAll("thead th[data-sort-key]").forEach((th) => {
			const key = th.getAttribute("data-sort-key");
			if (key === state.sortKey) {
				th.setAttribute("aria-sort", state.sortDir === "asc" ? "ascending" : "descending");
				th.title = state.sortDir === "asc" ? "Sorted ascending; click to reverse" : "Sorted descending; click to reverse";
			} else {
				th.setAttribute("aria-sort", "none");
				th.title = "Click to sort";
			}
		});
	}

	function pushChart(cfg) {
		const ctx = document.getElementById(cfg.id);
		if (!ctx) return;
		const ch = new Chart(ctx, cfg.config);
		state.charts.push(ch);
	}

	function renderAllCharts(hospitals, analysis) {
		if (typeof Chart === "undefined" || !hospitals.length) return;
		destroyCharts();

		Chart.defaults.color = "#8b98a8";
		Chart.defaults.borderColor = "rgba(255,255,255,0.08)";

		const { labels: histLabels, counts: histCounts } = histogramBins(hospitals, 5);
		pushChart({
			id: "chart-histogram",
			config: {
				type: "bar",
				data: {
					labels: histLabels,
					datasets: [
						{
							label: "Hospitals in this price range",
							data: histCounts,
							backgroundColor: "rgba(24, 191, 239, 0.55)",
							borderColor: "rgba(24, 191, 239, 0.95)",
							borderWidth: 1,
						},
					],
				},
				options: {
					...chartCommonOptions(),
					plugins: {
						legend: { display: false },
						tooltip: {
							callbacks: {
								label(ctx) {
									const n = ctx.raw;
									return n + " hospital" + (n === 1 ? "" : "s");
								},
							},
						},
					},
					scales: {
						x: { ticks: { maxRotation: 45, minRotation: 0, color: "#c5ced9" }, grid: { color: "rgba(255,255,255,0.06)" } },
						y: {
							beginAtZero: true,
							ticks: { stepSize: 1, color: "#8b98a8" },
							grid: { color: "rgba(255,255,255,0.06)" },
							title: { display: true, text: "Number of hospitals", color: "#6b7a8c" },
						},
					},
				},
			},
		});

		const br = analysis.by_region.slice().sort((a, b) => a.region.localeCompare(b.region));
		pushChart({
			id: "chart-regions-share",
			config: {
				type: "doughnut",
				data: {
					labels: br.map((r) => r.region),
					datasets: [
						{
							data: br.map((r) => r.hospital_count),
							backgroundColor: br.map((_, i) => PALETTE[i % PALETTE.length]),
							borderWidth: 2,
							borderColor: "#141c28",
						},
					],
				},
				options: {
					...chartCommonOptions(),
					plugins: {
						legend: { position: "bottom" },
						tooltip: {
							callbacks: {
								label(ctx) {
									const v = ctx.raw;
									const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
									const pct = sum ? ((v / sum) * 100).toFixed(0) : 0;
									return ` ${v} hospitals (${pct}%)`;
								},
							},
						},
					},
				},
			},
		});

		pushChart({
			id: "region-chart",
			config: {
				type: "bar",
				data: {
					labels: br.map((r) => r.region),
					datasets: [
						{
							label: "Median list price in region",
							data: br.map((r) => r.median_covered_charges),
							backgroundColor: "rgba(24, 191, 239, 0.55)",
							borderColor: "rgba(24, 191, 239, 0.9)",
							borderWidth: 1,
						},
					],
				},
				options: {
					...chartCommonOptions(),
					indexAxis: "y",
					plugins: {
						legend: { display: false },
						tooltip: {
							callbacks: {
								label(ctx) {
									return fmtMoney(ctx.raw);
								},
							},
						},
					},
					scales: {
						x: {
							grid: { color: "rgba(255,255,255,0.06)" },
							ticks: {
								color: "#8b98a8",
								callback: (v) => "$" + (v / 1000).toFixed(0) + "k",
							},
						},
						y: { grid: { display: false }, ticks: { color: "#e8edf4" } },
					},
				},
			},
		});

		const byCharge = [...hospitals].sort((a, b) => b.avg_covered_charges - a.avg_covered_charges);
		const top8 = byCharge.slice(0, 8);
		pushChart({
			id: "chart-top-compare",
			config: {
				type: "bar",
				data: {
					labels: top8.map((h) => shortLabel(h.provider_name, 30)),
					datasets: [
						{
							label: "Avg list price (covered charge)",
							data: top8.map((h) => h.avg_covered_charges),
							backgroundColor: "rgba(129, 140, 248, 0.65)",
							borderColor: "rgba(129, 140, 248, 0.95)",
							borderWidth: 1,
						},
						{
							label: "Avg Medicare payment",
							data: top8.map((h) => h.avg_medicare_payments),
							backgroundColor: "rgba(52, 211, 153, 0.65)",
							borderColor: "rgba(52, 211, 153, 0.95)",
							borderWidth: 1,
						},
					],
				},
				options: {
					...chartCommonOptions(),
					indexAxis: "y",
					plugins: {
						tooltip: {
							callbacks: {
								label(ctx) {
									return ` ${ctx.dataset.label}: ${fmtMoney(ctx.raw)}`;
								},
							},
						},
					},
					scales: {
						x: {
							grid: { color: "rgba(255,255,255,0.06)" },
							ticks: {
								color: "#8b98a8",
								callback: (v) => "$" + (v / 1000).toFixed(0) + "k",
							},
						},
						y: { grid: { display: false }, ticks: { color: "#e8edf4", font: { size: 11 } } },
					},
				},
			},
		});

		const low5 = [...hospitals].sort((a, b) => a.avg_covered_charges - b.avg_covered_charges).slice(0, 5);
		pushChart({
			id: "chart-low-5",
			config: {
				type: "bar",
				data: {
					labels: low5.map((h) => shortLabel(h.provider_name, 26)),
					datasets: [
						{
							label: "Avg list price",
							data: low5.map((h) => h.avg_covered_charges),
							backgroundColor: "rgba(52, 211, 153, 0.55)",
							borderColor: "rgba(52, 211, 153, 0.9)",
							borderWidth: 1,
						},
					],
				},
				options: {
					...chartCommonOptions(),
					indexAxis: "y",
					plugins: {
						legend: { display: false },
						tooltip: {
							callbacks: {
								label(ctx) {
									return fmtMoney(ctx.raw);
								},
							},
						},
					},
					scales: {
						x: {
							grid: { color: "rgba(255,255,255,0.06)" },
							ticks: { color: "#8b98a8", callback: (v) => "$" + (v / 1000).toFixed(0) + "k" },
						},
						y: { grid: { display: false }, ticks: { color: "#e8edf4", font: { size: 10 } } },
					},
				},
			},
		});

		const high5 = byCharge.slice(0, 5);
		pushChart({
			id: "chart-high-5",
			config: {
				type: "bar",
				data: {
					labels: high5.map((h) => shortLabel(h.provider_name, 26)),
					datasets: [
						{
							label: "Avg list price",
							data: high5.map((h) => h.avg_covered_charges),
							backgroundColor: "rgba(251, 191, 36, 0.45)",
							borderColor: "rgba(251, 191, 36, 0.9)",
							borderWidth: 1,
						},
					],
				},
				options: {
					...chartCommonOptions(),
					indexAxis: "y",
					plugins: {
						legend: { display: false },
						tooltip: {
							callbacks: {
								label(ctx) {
									return fmtMoney(ctx.raw);
								},
							},
						},
					},
					scales: {
						x: {
							grid: { color: "rgba(255,255,255,0.06)" },
							ticks: { color: "#8b98a8", callback: (v) => "$" + (v / 1000).toFixed(0) + "k" },
						},
						y: { grid: { display: false }, ticks: { color: "#e8edf4", font: { size: 10 } } },
					},
				},
			},
		});
	}

	function fillRegionSelect(hospitals) {
		const sel = $("#filter-region");
		if (!sel) return;
		const opts = regionOptions(hospitals);
		sel.innerHTML = opts
			.map((v) => {
				if (v === "all") return `<option value="all">All regions</option>`;
				return `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`;
			})
			.join("");
		sel.value = state.region;
	}

	function renderDisclaimer(meta) {
		const ul = $("#disclaimer-list");
		if (!ul) return;
		const fyNote =
			"CMS publishes the underlying file on data.cms.gov; this page was built from a download on " +
			fmtDate(meta.generated_at) +
			" (UTC).";
		ul.innerHTML = `
			<li>${escapeHtml(fyNote)}</li>
			<li><strong>List prices</strong> (covered charges) are what the hospital puts on the claim. They are not the same as your copay, deductible, or what a private insurer negotiates.</li>
			<li>This is an educational view of public data. It is not medical, legal, or financial advice.</li>
		`;
	}

	function renderMethodology(meta) {
		const ol = $("#methodology-list");
		if (!ol) return;
		ol.innerHTML = meta.methodology.map((m) => `<li>${escapeHtml(m)}</li>`).join("");
	}

	function wireEvents() {
		$("#filter-region")?.addEventListener("change", (e) => {
			state.region = e.target.value;
			renderTable();
		});

		document.querySelectorAll("thead th[data-sort-key]").forEach((th) => {
			th.addEventListener("click", () => {
				const key = th.getAttribute("data-sort-key");
				if (state.sortKey === key) {
					state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
				} else {
					state.sortKey = key;
					state.sortDir = key.includes("avg") || key === "total_discharges" ? "desc" : "asc";
				}
				updateSortHeaders();
				renderTable();
			});
		});
	}

	async function init() {
		wireEvents();
		const errEl = $("#load-error");
		try {
			const res = await fetch(DATA_URL);
			if (!res.ok) throw new Error("HTTP " + res.status);
			state.data = await res.json();
		} catch (e) {
			if (errEl) {
				errEl.hidden = false;
				errEl.textContent =
					"Could not load data. If you opened this file from disk, use a local server or open the site from GitHub Pages.";
			}
			console.error(e);
			return;
		}

		const { meta, analysis } = state.data;
		document.title = meta.title + " | Explorer";
		$("#page-title").textContent = meta.title;

		const hospitals = state.data.hospitals;

		renderHero(meta, analysis);
		renderCallouts(analysis);
		fillRegionSelect(hospitals);
		updateSortHeaders();
		renderTable();
		renderAllCharts(hospitals, analysis);
		renderDisclaimer(meta);
		renderMethodology(meta);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
