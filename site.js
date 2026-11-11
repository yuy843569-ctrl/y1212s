(() => {
  if (location.pathname.endsWith("/") || location.pathname.endsWith("/index.html")) {
    if (location.hash === "#about") {
      location.replace("about.html");
      return;
    }
  }
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      menuButton.setAttribute("aria-label", open ? "メニューを開く" : "メニューを閉じる");
      nav.classList.toggle("is-open", !open);
    });
  }

  const currentPath = location.pathname.split("/").pop() || "index";
  const file = currentPath.endsWith(".html") ? currentPath : currentPath + ".html";
  document.querySelectorAll(".primary-nav a").forEach((link) => {
    if (link.getAttribute("href") === file) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
    link.addEventListener("click", () => {
      if (menuButton) {
        menuButton.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });
  });

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const downloads = window.UMEDA_SITE && window.UMEDA_SITE.downloads;
  document.querySelectorAll("[data-download]").forEach((link) => {
    const url = downloads && downloads[link.dataset.download];
    if (url) {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.removeAttribute("aria-disabled");
      link.removeAttribute("tabindex");
      link.classList.remove("button-disabled");
      link.innerHTML = "ワールドをダウンロード <b>↗</b>";
    }
  });
})();


