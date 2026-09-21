// ==UserScript==
// @name         S-Link Quick Fill
// @namespace    https://github.com/GiaHung07/slink-quick-fill
// @version      1.0.0
// @description  Điền nhanh S-Link.
// @match        https://slink.ptit.edu.vn/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/GiaHung07/slink-quick-fill/main/slink-quick-fill.user.js
// @downloadURL  https://raw.githubusercontent.com/GiaHung07/slink-quick-fill/main/slink-quick-fill.user.js
// ==/UserScript==

(() => {
  "use strict";

  const BUTTON_ID = "slink-quick-fill-button";

  const normalize = (s) =>
    String(s || "")
      .normalize("NFC")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const visible = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  function required(question) {
    return Boolean(
      question.querySelector(".question-title .required") ||
      question.querySelector('[aria-required="true"]')
    );
  }

  function questionTitle(question) {
    return normalize(
      question.querySelector(".question-title")?.textContent
    );
  }

  function clickInput(input) {
    if (!input || input.disabled || input.checked) return false;

    (input.closest("label") || input).click();
    return true;
  }

  function hasSelection(container) {
    return Boolean(
      container.querySelector(
        'input[type="radio"]:checked, input[type="checkbox"]:checked'
      )
    );
  }

  function chooseByText(question, choices) {
    if (hasSelection(question)) return false;

    const targets = choices.map(normalize);

    for (const label of question.querySelectorAll("label")) {
      const labelText = normalize(label.textContent);

      if (!targets.some((x) => labelText.includes(x))) {
        continue;
      }

      const input = label.querySelector(
        'input[type="radio"], input[type="checkbox"]'
      );

      if (clickInput(input)) return true;
    }

    return false;
  }
  function fillLikert(question) {
    const table = question.querySelector("table");
    if (!table) return false;

    const headers = [...table.querySelectorAll("thead th")];

    const columnIndex = headers.findIndex((th) => {
      const t = normalize(th.textContent);

      return (
        t.includes("5 - rất đồng ý") ||
        t.includes("5 – rất đồng ý") ||
        t.includes("5 - rất hài lòng") ||
        t.includes("5 – rất hài lòng") ||
        t.includes("rất đồng ý")
      );
    });

    if (columnIndex < 0) return false;

    let changed = false;

    const rows = [...table.querySelectorAll("tbody tr")].filter(
      (row) =>
        row.getAttribute("aria-hidden") !== "true" &&
        visible(row)
    );

    for (const row of rows) {
      if (hasSelection(row)) continue;

      const cells = [...row.querySelectorAll(":scope > td")];
      const cell = cells[columnIndex];

      if (!cell) continue;

      const input = cell.querySelector(
        'input[type="radio"], input[type="checkbox"]'
      );

      if (clickInput(input)) changed = true;
    }

    return changed;
  }

  function fillScore10(question) {
    if (hasSelection(question)) return false;

    const labels = [...question.querySelectorAll("label")];

    const nine = labels.find(
      (label) => normalize(label.textContent) === "9"
    );

    const ten = labels.find(
      (label) => normalize(label.textContent) === "10"
    );

    if (!nine || !ten) return false;

    const random = new Uint32Array(1);
    crypto.getRandomValues(random);

    const selected = random[0] % 2 === 0 ? nine : ten;

    return clickInput(
      selected.querySelector(
        'input[type="radio"], input[type="checkbox"]'
      )
    );
  }

  function fillKnownQuestion(question) {
    const title = questionTitle(question);

    if (title.includes("hình thức học tập")) {
      return chooseByText(question, [
        "học trực tuyến hoàn toàn",
        "e-learning 100%"
      ]);
    }

    if (title.includes("thiết bị sử dụng chủ yếu")) {
      return chooseByText(question, [
        "máy tính/laptop"
      ]);
    }

    if (title.includes("mức độ hoàn thành bài giảng")) {
      return chooseByText(question, [
        "100% (hoàn thành toàn bộ)",
        "100%"
      ]);
    }

    if (title.includes("bạn là sinh viên năm mấy")) {
      return chooseByText(question, [
        "năm 2"
      ]);
    }

    if (
      title.includes("hình thức học nào") &&
      title.includes("hiệu quả nhất")
    ) {
      return chooseByText(question, [
        "học hoàn toàn qua bài giảng điện tử"
      ]);
    }

    return false;
  }

  function quickFill() {
    const questions = [
      ...document.querySelectorAll(".question-item")
    ].filter(visible);

    for (const question of questions) {
      if (!required(question)) continue;
      if (question.querySelector("table")) {
        fillLikert(question);
        continue;
      }
      if (hasSelection(question)) continue;

      if (fillScore10(question)) continue;

      fillKnownQuestion(question);
    }
  }

  function injectButton() {
    if (document.getElementById(BUTTON_ID)) return;

    if (!document.querySelector(".question-item")) return;

    const button = document.createElement("button");

    button.id = BUTTON_ID;
    button.type = "button";
    button.textContent = "Điền Nhanh";

    Object.assign(button.style, {
      position: "fixed",
      right: "92px",
      bottom: "24px",
      zIndex: "2147483647",

      height: "40px",
      padding: "0 18px",

      border: "1px solid rgba(255,255,255,.12)",
      borderRadius: "9px",

      background: "#202124",
      color: "#fff",

      fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif',

      fontSize: "13px",
      fontWeight: "600",

      boxShadow: "0 5px 18px rgba(0,0,0,.22)",
      cursor: "pointer",

      transition:
        "background .12s ease, transform .12s ease"
    });

    button.addEventListener("mouseenter", () => {
      button.style.background = "#2b2d31";
    });

    button.addEventListener("mouseleave", () => {
      button.style.background = "#202124";
    });

    button.addEventListener("mousedown", () => {
      button.style.transform = "scale(.97)";
    });

    button.addEventListener("mouseup", () => {
      button.style.transform = "scale(1)";
    });

    button.addEventListener("click", quickFill);

    document.body.appendChild(button);
  }
  let queued = false;

  const observer = new MutationObserver(() => {
    if (queued) return;

    queued = true;

    requestAnimationFrame(() => {
      queued = false;
      injectButton();
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  window.addEventListener("hashchange", () => {
    setTimeout(injectButton, 250);
  });

  injectButton();
  setTimeout(injectButton, 500);
  setTimeout(injectButton, 1500);
})();
