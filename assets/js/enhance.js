/**
 * Scroll-triggered reveals, skill-meter animation, reduced-motion respect
 */
(function () {
	var prefersReduced =
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	function revealAll() {
		document.querySelectorAll(".reveal, #main .recruiter-section .reveal-item, #main .career-section .reveal-item").forEach(function (el) {
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
			"#main .post, #main .posts article, #main .recruiter-section .reveal-item, #main .career-section .reveal-item"
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
	});
})();
