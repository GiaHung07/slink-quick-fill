// ==UserScript==
// @name         S-Link Quick Fill
// @version      1.1.0
// @match        https://slink.ptit.edu.vn/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  "use strict";

  // ===== CONFIG =====
  const YEAR = 2;      // 1-4
  const SCORE_5 = 0;   // 0=random 4-5 | hoặc 4 / 5
  const SCORE_10 = 0;  // 0=random 8-10 | hoặc 8 / 9 / 10
  // ==================

  const norm = s => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
  const rand = a => a[Math.floor(Math.random() * a.length)];

  const click = el => {
    if (el && !el.checked && !el.disabled)
      (el.closest("label") || el).click();
  };

  const choose = (q, value) => {
    for (const label of q.querySelectorAll("label")) {
      if (norm(label.textContent).includes(norm(value))) {
        click(label.querySelector("input"));
        return true;
      }
    }
    return false;
  };

  function fillTable(q) {
    const table = q.querySelector("table");
    if (!table) return false;

    const score = SCORE_5 === 0
      ? rand([4, 5])
      : Math.min(5, Math.max(4, SCORE_5));

    const headers = [...table.querySelectorAll("thead th")];
    const col = headers.findIndex(h =>
      norm(h.textContent).startsWith(String(score))
    );

    if (col < 0) return false;

    table.querySelectorAll("tbody tr:not([aria-hidden='true'])")
      .forEach(row => {
        if (row.querySelector("input:checked")) return;
        const cells = row.querySelectorAll(":scope > td");
        click(cells[col]?.querySelector("input"));
      });

    return true;
  }

  function fill() {
    document.querySelectorAll(".question-item").forEach(q => {
      // Chỉ câu bắt buộc (*)
      if (
        !q.querySelector(".required") &&
        !q.querySelector('[aria-required="true"]')
      ) return;

      if (fillTable(q)) return;
      if (q.querySelector("input:checked")) return;

      const title = norm(q.querySelector(".question-title")?.textContent);

      if (title.includes("hình thức học tập"))
        return choose(q, "học trực tuyến hoàn toàn");

      if (title.includes("thiết bị sử dụng chủ yếu"))
        return choose(q, "máy tính/laptop");

      if (title.includes("mức độ hoàn thành"))
        return choose(q, "100%");

      if (title.includes("sinh viên năm mấy"))
        return choose(q, `năm ${YEAR}`);

      if (
        title.includes("hình thức học nào") &&
        title.includes("hiệu quả nhất")
      )
        return choose(q, "học hoàn toàn qua bài giảng điện tử");

      // Nếu câu có thang 1-10
      const score = SCORE_10 === 0
        ? rand([8, 9, 10])
        : Math.min(10, Math.max(8, SCORE_10));

      choose(q, String(score));
    });
  }

  function addButton() {
    if (
      document.getElementById("quick-fill") ||
      !document.querySelector(".question-item")
    ) return;

    const btn = document.createElement("button");
    btn.id = "quick-fill";
    btn.type = "button";
    btn.textContent = "Điền Nhanh";
    btn.onclick = fill;

    Object.assign(btn.style, {
      position: "fixed",
      right: "90px",
      bottom: "24px",
      zIndex: "999999",
      padding: "10px 18px",
      border: "0",
      borderRadius: "9px",
      background: "#202124",
      color: "#fff",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 4px 14px #0003"
    });

    document.body.appendChild(btn);
  }

  new MutationObserver(addButton)
    .observe(document.body, { childList: true, subtree: true });

  addButton();
})();
