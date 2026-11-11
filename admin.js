(() => {
  const form = document.querySelector("#news-admin-form");
  const status = document.querySelector("#admin-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    submit.disabled = true;
    status.className = "admin-status";
    status.textContent = "投稿しています…";
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: data.get("pin"),
          category: data.get("category"),
          title: data.get("title"),
          body: data.get("body"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "投稿できませんでした。");
      form.elements.pin.value = "";
      form.elements.title.value = "";
      form.elements.body.value = "";
      status.classList.add("is-success");
      status.textContent = "投稿しました。サイトに反映されました。";
    } catch (error) {
      status.classList.add("is-error");
      status.textContent = error.message || "通信に失敗しました。時間をおいて再度お試しください。";
    } finally {
      form.elements.pin.value = "";
      submit.disabled = false;
    }
  });
})();
