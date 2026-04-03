/**
 * Scroll-triggered reveals + optional reduced-motion respect
 */
(function () {
	if (!("IntersectionObserver" in window)) {
		document.querySelectorAll(".reveal").forEach(function (el) {
			el.classList.add("visible");
		});
		return;
	}

	var prefersReduced =
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	document.addEventListener("DOMContentLoaded", function () {
		var nodes = document.querySelectorAll("#main .post, #main .posts article");
		nodes.forEach(function (el) {
			el.classList.add("reveal");
		});

		if (prefersReduced) {
			document.querySelectorAll(".reveal").forEach(function (el) {
				el.classList.add("visible");
			});
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

		document.querySelectorAll(".reveal").forEach(function (el) {
			io.observe(el);
		});
	});
})();
