(() => {
  const feeds = [...document.querySelectorAll("[data-news-feed]")];
  if (!feeds.length) return;

  const dateLabel = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const parts = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(date);
    const part = (type) => parts.find((item) => item.type === type)?.value || "";
    return `${part("year")}.${part("month")}.${part("day")}`;
  };

  function homeRow(item) {
    const link = document.createElement("a");
    link.className = "news-row";
    link.href = "news.html";
    const date = document.createElement("time");
    date.className = "news-date";
    date.dateTime = item.date;
    date.textContent = dateLabel(item.date);
    const category = document.createElement("span");
    category.className = "news-label";
    category.textContent = item.category;
    const title = document.createElement("b");
    title.textContent = item.title;
    const arrow = document.createElement("span");
    arrow.className = "row-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "›";
    link.append(date, category, title, arrow);
    return link;
  }

  function pageCard(item) {
    const article = document.createElement("article");
    article.className = "news-entry";
    const meta = document.createElement("div");
    meta.className = "news-entry-meta";
    const category = document.createElement("span");
    category.className = "news-label";
    category.textContent = item.category;
    const date = document.createElement("time");
    date.dateTime = item.date;
    date.textContent = dateLabel(item.date);
    meta.append(category, date);
    const title = document.createElement("h3");
    title.textContent = item.title;
    const body = document.createElement("p");
    body.textContent = item.body;
    article.append(meta, title, body);
    return article;
  }

  fetch("/api/news", { headers: { Accept: "application/json" } })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error("news unavailable")))
    .then((result) => {
      if (!Array.isArray(result.news) || result.news.length === 0) return;
      feeds.forEach((feed) => {
        if (feed.dataset.newsFeed === "home") {
          feed.replaceChildren(...result.news.slice(0, 3).map(homeRow));
        } else {
          feed.replaceChildren(...result.news.map(pageCard));
        }
      });
    })
    .catch(() => {});
})();
