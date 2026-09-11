(() => {
  "use strict";

  const root = document.documentElement;
  const themeBtn = document.getElementById("themeBtn");
  const searchInput = document.getElementById("searchInput");
  const cards = [...document.querySelectorAll(".tool-card")];
  const toolCount = document.getElementById("toolCount");
  const noResults = document.getElementById("noResults");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const closeModalBtn = document.getElementById("closeModal");

  const savedTheme = localStorage.getItem("my-web-tools-theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    root.dataset.theme = savedTheme;
  }

  function updateThemeIcon() {
    themeBtn.textContent = root.dataset.theme === "dark" ? "☀️" : "🌙";
  }

  updateThemeIcon();

  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("my-web-tools-theme", next);
    updateThemeIcon();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === "Escape" && !modalBackdrop.hidden) {
      closeModal();
    }
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const matches = card.dataset.name.includes(query);
      card.hidden = !matches;
      if (matches) visible++;
    });

    toolCount.textContent = `${visible} công cụ`;
    noResults.hidden = visible !== 0;
  });

  document.querySelectorAll(".open-btn").forEach((button) => {
    button.addEventListener("click", () => openTool(button.dataset.tool));
  });

  closeModalBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) closeModal();
  });

  function openTool(type) {
    modalBackdrop.hidden = false;
    document.body.style.overflow = "hidden";

    const tools = {
      calculator: {
        title: "Calculator",
        render: renderCalculator
      },
      countdown: {
        title: "Countdown",
        render: renderCountdown
      },
      converter: {
        title: "Number Converter",
        render: renderConverter
      },
      color: {
        title: "Color Picker",
        render: renderColorPicker
      }
    };

    if (!tools[type]) return;
    modalTitle.textContent = tools[type].title;
    modalBody.innerHTML = "";
    tools[type].render(modalBody);
    closeModalBtn.focus();
  }

  function closeModal() {
    modalBackdrop.hidden = true;
    document.body.style.overflow = "";
    modalBody.innerHTML = "";
  }

  function createElement(tag, options = {}) {
    const el = document.createElement(tag);
    if (options.className) el.className = options.className;
    if (options.text) el.textContent = options.text;
    return el;
  }

  function renderCalculator(container) {
    const wrapper = createElement("div", { className: "calculator" });

    const display = document.createElement("input");
    display.className = "calc-display";
    display.type = "text";
    display.inputMode = "decimal";
    display.readOnly = true;
    display.value = "0";
    display.setAttribute("aria-label", "Màn hình máy tính");

    const grid = createElement("div", { className: "calc-grid" });
    const buttons = [
      ["C", "clear"], ["(", "("], [")", ")"], ["÷", "/"],
      ["7", "7"], ["8", "8"], ["9", "9"], ["×", "*"],
      ["4", "4"], ["5", "5"], ["6", "6"], ["−", "-"],
      ["1", "1"], ["2", "2"], ["3", "3"], ["+", "+"],
      ["0", "0"], [".", "."], ["⌫", "back"], ["=", "equals"]
    ];

    let expression = "";

    function refresh() {
      display.value = expression || "0";
    }

    function calculate() {
      if (!expression) return;
      if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
        display.value = "Lỗi";
        expression = "";
        return;
      }

      try {
        const result = Function(`"use strict"; return (${expression})`)();
        if (!Number.isFinite(result)) throw new Error();
        expression = String(Number(result.toFixed(12)));
        refresh();
      } catch {
        display.value = "Lỗi";
        expression = "";
      }
    }

    buttons.forEach(([label, value]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      if (value === "equals") button.classList.add("equals");

      button.addEventListener("click", () => {
        if (value === "clear") {
          expression = "";
          refresh();
          return;
        }

        if (value === "back") {
          expression = expression.slice(0, -1);
          refresh();
          return;
        }

        if (value === "equals") {
          calculate();
          return;
        }

        if (value === "/" || value === "*" || value === "+" || value === "-") {
          const last = expression.slice(-1);
          if ("+-*/".includes(last)) {
            expression = expression.slice(0, -1);
          }
        }

        expression += value;
        refresh();
      });

      grid.appendChild(button);
    });

    wrapper.append(display, grid);
    container.appendChild(wrapper);
  }

  function renderCountdown(container) {
    const form = createElement("div", { className: "tool-form" });

    const dateLabel = document.createElement("label");
    dateLabel.textContent = "Ngày";
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateLabel.appendChild(dateInput);

    const timeLabel = document.createElement("label");
    timeLabel.textContent = "Thời gian";
    const timeInput = document.createElement("input");
    timeInput.type = "time";
    timeInput.value = "00:00";
    timeLabel.appendChild(timeInput);

    const buttonRow = createElement("div", { className: "button-row" });
    const startBtn = createElement("button", { className: "primary-btn", text: "Bắt đầu" });
    startBtn.type = "button";
    const resetBtn = createElement("button", { className: "secondary-btn", text: "Xóa" });
    resetBtn.type = "button";
    buttonRow.append(startBtn, resetBtn);

    const result = createElement("div", { className: "result-box" });
    result.textContent = "Chọn thời gian rồi nhấn Bắt đầu.";

    const grid = createElement("div", { className: "countdown-grid" });
    const labels = ["Ngày", "Giờ", "Phút", "Giây"];
    const valueEls = labels.map((label) => {
      const item = createElement("div", { className: "count-item" });
      const strong = createElement("strong", { text: "0" });
      const span = createElement("span", { text: label });
      item.append(strong, span);
      grid.appendChild(item);
      return strong;
    });

    let interval = null;

    startBtn.addEventListener("click", () => {
      if (!dateInput.value) {
        result.textContent = "Hãy chọn một ngày.";
        return;
      }

      clearInterval(interval);
      const target = new Date(`${dateInput.value}T${timeInput.value || "00:00"}:00`);

      const update = () => {
        const diff = target.getTime() - Date.now();

        if (diff <= 0) {
          valueEls.forEach((el) => (el.textContent = "0"));
          result.textContent = "Đã đến thời điểm bạn chọn!";
          clearInterval(interval);
          return;
        }

        let seconds = Math.floor(diff / 1000);
        const days = Math.floor(seconds / 86400);
        seconds %= 86400;
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        seconds %= 60;

        valueEls[0].textContent = String(days);
        valueEls[1].textContent = String(hours).padStart(2, "0");
        valueEls[2].textContent = String(minutes).padStart(2, "0");
        valueEls[3].textContent = String(seconds).padStart(2, "0");
        result.textContent = "Đang đếm ngược...";
      };

      update();
      interval = setInterval(update, 1000);
    });

    resetBtn.addEventListener("click", () => {
      clearInterval(interval);
      dateInput.value = "";
      timeInput.value = "00:00";
      valueEls.forEach((el) => (el.textContent = "0"));
      result.textContent = "Chọn thời gian rồi nhấn Bắt đầu.";
    });

    form.append(dateLabel, timeLabel, buttonRow, result, grid);
    container.appendChild(form);
  }

  function renderConverter(container) {
    const form = createElement("div", { className: "tool-form" });

    const numberLabel = document.createElement("label");
    numberLabel.textContent = "Số cần chuyển";
    const numberInput = document.createElement("input");
    numberInput.type = "text";
    numberInput.inputMode = "text";
    numberInput.placeholder = "Ví dụ: 255";
    numberLabel.appendChild(numberInput);

    const baseLabel = document.createElement("label");
    baseLabel.textContent = "Hệ số của số nhập vào";
    const baseSelect = document.createElement("select");
    [
      ["2", "Nhị phân (Base 2)"],
      ["10", "Thập phân (Base 10)"],
      ["16", "Thập lục phân (Base 16)"]
    ].forEach(([value, text]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      baseSelect.appendChild(option);
    });
    baseLabel.appendChild(baseSelect);

    const convertBtn = createElement("button", { className: "primary-btn", text: "Chuyển đổi" });
    convertBtn.type = "button";

    const result = createElement("div", { className: "result-box" });
    result.textContent = "Kết quả sẽ xuất hiện ở đây.";

    convertBtn.addEventListener("click", () => {
      const raw = numberInput.value.trim();
      const base = Number(baseSelect.value);

      if (!raw) {
        result.textContent = "Hãy nhập một số.";
        return;
      }

      try {
        const value = parseInt(raw, base);
        if (Number.isNaN(value) || value < 0 || !Number.isSafeInteger(value)) {
          throw new Error();
        }

        result.innerHTML = `
          <div><strong>Binary:</strong> ${value.toString(2)}</div>
          <div><strong>Decimal:</strong> ${value.toString(10)}</div>
          <div><strong>Hex:</strong> ${value.toString(16).toUpperCase()}</div>
        `;
      } catch {
        result.textContent = "Số không hợp lệ hoặc vượt giới hạn.";
      }
    });

    form.append(numberLabel, baseLabel, convertBtn, result);
    container.appendChild(form);
  }

  function renderColorPicker(container) {
    const wrapper = createElement("div", { className: "tool-form" });

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = "#2563eb";
    colorInput.style.height = "52px";
    colorInput.style.padding = "4px";

    const preview = createElement("div", { className: "color-preview" });

    const result = createElement("div", { className: "result-box" });

    function updateColor() {
      const hex = colorInput.value.toUpperCase();
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      const max = Math.max(r, g, b) / 255;
      const min = Math.min(r, g, b) / 255;
      const d = max - min;
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1));
        switch (max) {
          case r / 255:
            h = 60 * (((g - b) / 255 / d) % 6);
            break;
          case g / 255:
            h = 60 * (((b - r) / 255 / d) + 2);
            break;
          default:
            h = 60 * (((r - g) / 255 / d) + 4);
        }
      }

      if (h < 0) h += 360;

      preview.style.background = hex;
      result.innerHTML = `
        <div><strong>HEX:</strong> ${hex}</div>
        <div><strong>RGB:</strong> rgb(${r}, ${g}, ${b})</div>
        <div><strong>HSL:</strong> hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)</div>
      `;
    }

    colorInput.addEventListener("input", updateColor);
    updateColor();

    wrapper.append(colorInput, preview, result);
    container.appendChild(wrapper);
  }
})();