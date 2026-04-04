/**
 * Scroll-triggered reveals, skill-meter animation, reduced-motion respect
 */
(function () {
	var prefersReduced =
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	function revealAll() {
		document.querySelectorAll(".reveal, #main .recruiter-section .reveal-item").forEach(function (el) {
			el.classList.add("visible");
		});
		document.querySelectorAll(".skill-meter__fill").forEach(function (el) {
			el.classList.add("skill-meter__fill--animate");
		});
	}

	if (!("IntersectionObserver" in window)) {
		revealAll();
		return;
	}

	document.addEventListener("DOMContentLoaded", function () {
		var revealNodes = document.querySelectorAll(
			"#main .post, #main .posts article, #main .recruiter-section .reveal-item"
		);
		revealNodes.forEach(function (el) {
			if (el.classList.contains("reveal-item")) {
				return;
			}
			el.classList.add("reveal");
		});

		if (prefersReduced) {
			revealAll();
			return;
		}

		var io = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add("visible");
						io.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
		);

		document.querySelectorAll("#main .reveal").forEach(function (el) {
			io.observe(el);
		});
		document.querySelectorAll("#main .recruiter-section .reveal-item").forEach(function (el) {
			io.observe(el);
		});

		var ioSkill = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add("skill-meter__fill--animate");
						ioSkill.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.25, rootMargin: "0px" }
		);

		document.querySelectorAll(".skill-meter__fill").forEach(function (el) {
			ioSkill.observe(el);
		});

		/* Horizontal skills wheel: arrows, scroll state, keyboard */
		var pillsWheel = document.querySelector(".recruiter-pills-wheel");
		if (pillsWheel) {
			var vp = pillsWheel.querySelector(".recruiter-pills-wheel__viewport");
			var btnPrev = pillsWheel.querySelector('[data-scroll-dir="-1"]');
			var btnNext = pillsWheel.querySelector('[data-scroll-dir="1"]');
			if (vp) {
				function scrollStepPx() {
					return Math.max(180, Math.floor(vp.clientWidth * 0.55));
				}
				function updatePillsNav() {
					var maxScroll = vp.scrollWidth - vp.clientWidth;
					var atStart = vp.scrollLeft <= 1;
					var atEnd = vp.scrollLeft >= maxScroll - 1;
					if (btnPrev) btnPrev.disabled = atStart || maxScroll <= 0;
					if (btnNext) btnNext.disabled = atEnd || maxScroll <= 0;
				}
				function scrollPills(dir) {
					var behavior = prefersReduced ? "auto" : "smooth";
					vp.scrollBy({ left: dir * scrollStepPx(), behavior: behavior });
				}
				if (btnPrev) {
					btnPrev.addEventListener("click", function () {
						scrollPills(-1);
					});
				}
				if (btnNext) {
					btnNext.addEventListener("click", function () {
						scrollPills(1);
					});
				}
				vp.addEventListener("scroll", updatePillsNav, { passive: true });
				window.addEventListener("resize", updatePillsNav);
				vp.addEventListener("keydown", function (e) {
					if (e.key === "ArrowLeft") {
						e.preventDefault();
						scrollPills(-1);
					} else if (e.key === "ArrowRight") {
						e.preventDefault();
						scrollPills(1);
					}
				});
				updatePillsNav();
				if (typeof ResizeObserver !== "undefined") {
					var ro = new ResizeObserver(updatePillsNav);
					ro.observe(vp);
				}
			}
		}
	});
})();
