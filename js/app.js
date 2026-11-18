/**
 * MODULE ĐIỀU KHIỂN CHÍNH (js/app.js)
 * Tích hợp Icon Font Awesome 6 & Khóa chống lặp giao diện
 */
(function () {
  let uiState = {
    searchQuery: "",
    selectedCategory: "ALL",
    sortBy: "default"
  };

  const categoryIcons = {
    "Gaming Mouse": "fa-solid fa-computer-mouse",
    "Mechanical Keyboard": "fa-solid fa-keyboard",
    "Gaming Headset": "fa-solid fa-headset",
    "Monitor": "fa-solid fa-desktop",
    "Mousepad": "fa-solid fa-border-all",
    "Game Controller": "fa-solid fa-gamepad"
  };

  // Tự động xóa các phần tử bị lặp nếu người dùng vô tình dán chồng file HTML
  function cleanupAccidentalDuplicateDOM() {
    const headers = document.querySelectorAll(".site-header");
    if (headers.length > 1) {
      for (let i = 1; i < headers.length; i++) headers[i].remove();
    }
    const mains = document.querySelectorAll("main");
    if (mains.length > 1) {
      for (let i = 1; i < mains.length; i++) mains[i].remove();
    }
    const footers = document.querySelectorAll(".site-footer");
    if (footers.length > 1) {
      for (let i = 1; i < footers.length; i++) footers[i].remove();
    }
    const bars = document.querySelectorAll(".announcement-bar");
    if (bars.length > 1) {
      for (let i = 1; i < bars.length; i++) bars[i].remove();
    }
  }

  function ensureUniqueProductIds() {
    if (typeof PRODUCTS_DATA === "undefined") return;
    const seen = new Set();
    PRODUCTS_DATA.forEach((p, idx) => {
      if (!p.id || seen.has(p.id)) {
        p.id = (p.id || "gts-prod") + "-" + (idx + 1);
      }
      seen.add(p.id);
    });
  }

  function renderDynamicCategories() {
    const showcaseGrid = document.getElementById("categoryShowcaseGrid");
    const filterPillsBox = document.getElementById("filterPillsContainer");

    if (showcaseGrid && typeof CATEGORIES_DATA !== "undefined") {
      showcaseGrid.innerHTML = CATEGORIES_DATA.map((cat) => {
        const iconClass = categoryIcons[cat.id] || "fa-solid fa-microchip";
        return `
          <div class="category-card" data-category="${cat.id}">
            <div class="category-thumb"><img src="${cat.image}" alt="${cat.title}" loading="lazy"></div>
            <h3><i class="${iconClass}" style="color:var(--yellow-primary); margin-right:5px;"></i>${cat.title}</h3>
            <span>${cat.subtitle}</span>
          </div>
        `;
      }).join("");
    }

    if (filterPillsBox && typeof PRODUCTS_DATA !== "undefined") {
      const uniqueCategories = Array.from(new Set(PRODUCTS_DATA.map((p) => p.category)));
      filterPillsBox.innerHTML =
        `<button type="button" class="filter-pill active" data-category="ALL"><i class="fa-solid fa-border-all" style="margin-right:6px;"></i>Tất cả (${PRODUCTS_DATA.length})</button>` +
        uniqueCategories
          .map((cat) => {
            const iconClass = categoryIcons[cat] || "fa-solid fa-tag";
            return `<button type="button" class="filter-pill" data-category="${cat}"><i class="${iconClass}" style="margin-right:6px;"></i>${cat}</button>`;
          })
          .join("");
    }
  }

  function renderDynamicTeam() {
    const teamGrid = document.getElementById("teamMembersGrid");
    if (!teamGrid || typeof TEAM_MEMBERS_DATA === "undefined") return;

    teamGrid.innerHTML = TEAM_MEMBERS_DATA.map(
      (member) => `
      <div class="team-card">
        <div class="team-avatar"><i class="fa-solid fa-user-astronaut"></i></div>
        <h4 style="margin-bottom: 4px; color: lightgray;">${member.avatarText}</h4>
        <h3>${member.name}</h3>
        <p style="color:var(--yellow-primary); font-size:0.82rem; font-weight:700; margin:4px 0;">
          <i class="fa-solid fa-id-card" style="margin-right:5px;"></i>MSSV: ${member.mssv}
        </p>
        <p style="font-size:0.84rem; color:var(--text-secondary);">${member.role}</p>
      </div>
    `
    ).join("");
  }

  function getFilteredAndSortedProducts() {
    let list = [...PRODUCTS_DATA];

    if (uiState.selectedCategory !== "ALL") {
      list = list.filter((p) => p.category === uiState.selectedCategory);
    }

    if (uiState.searchQuery.trim() !== "") {
      const q = uiState.searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.shortDesc.toLowerCase().includes(q)
      );
    }

    if (uiState.sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (uiState.sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (uiState.sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    } else if (uiState.sortBy === "name-desc") {
      list.sort((a, b) => b.name.localeCompare(a.name, "vi"));
    }

    return list;
  }

  function renderCatalog() {
    const gridEl = document.getElementById("productsGrid");
    if (!gridEl) return;

    const filtered = getFilteredAndSortedProducts();

    document.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.category === uiState.selectedCategory);
    });

    document.querySelectorAll(".category-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.category === uiState.selectedCategory);
    });

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div class="empty-catalog-state">
          <h3><i class="fa-solid fa-magnifying-glass-minus" style="color:var(--yellow-primary); margin-right:8px;"></i>Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác nhé!</h3>
          <p>Bạn có thể xóa bộ lọc hiện tại để xem lại toàn bộ ${PRODUCTS_DATA.length} sản phẩm tại Gay Tech Store.</p>
          <button type="button" class="btn btn-primary btn-sm" id="resetCatalogFilterBtn">
            <i class="fa-solid fa-rotate-left"></i> XEM TẤT CẢ SẢN PHẨM
          </button>
        </div>
      `;
      const resetBtn = document.getElementById("resetCatalogFilterBtn");
      if (resetBtn) {
        resetBtn.onclick = () => {
          uiState.searchQuery = "";
          uiState.selectedCategory = "ALL";
          uiState.sortBy = "default";
          syncSearchInputs();
          const sortSelect = document.getElementById("sortSelect");
          if (sortSelect) sortSelect.value = "default";
          renderCatalog();
        };
      }
      return;
    }

    gridEl.innerHTML = filtered
      .map((product) => {
        const iconClass = categoryIcons[product.category] || "fa-solid fa-microchip";
        return `
        <article class="product-card">
          ${product.badge ? `<span class="product-badge"><i class="fa-solid fa-fire" style="margin-right:4px;"></i>${product.badge}</span>` : ""}
          <div class="product-img-wrap" data-action="detail" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
          </div>
          <div class="product-body">
            <div class="product-category"><i class="${iconClass}" style="margin-right:5px;"></i>${product.category} • ${product.categoryLabel}</div>
            <h3 class="product-title" data-action="detail" data-id="${product.id}">${product.name}</h3>
            <p class="product-desc">${product.shortDesc}</p>
            <div class="product-footer">
              <div class="product-price">${CartModule.formatVND(product.price)}</div>
              <div class="product-actions">
                <button type="button" class="btn btn-secondary btn-sm" data-action="detail" data-id="${product.id}">
                  <i class="fa-solid fa-eye"></i> Chi tiết
                </button>
                <button type="button" class="btn btn-primary btn-sm" data-action="add-cart" data-id="${product.id}">
                  <i class="fa-solid fa-cart-plus"></i> Thêm giỏ
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  }

  function syncSearchInputs() {
    const headerInput = document.getElementById("headerSearchInput");
    const catalogInput = document.getElementById("catalogSearchInput");
    const headerClear = document.getElementById("headerSearchClear");
    const catalogClear = document.getElementById("catalogSearchClear");

    if (headerInput && headerInput.value !== uiState.searchQuery) {
      headerInput.value = uiState.searchQuery;
    }
    if (catalogInput && catalogInput.value !== uiState.searchQuery) {
      catalogInput.value = uiState.searchQuery;
    }
    if (headerClear) headerClear.classList.toggle("visible", uiState.searchQuery.length > 0);
    if (catalogClear) catalogClear.classList.toggle("visible", uiState.searchQuery.length > 0);
  }

  function openProductModal(productId) {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) return;

    const modal = document.getElementById("productDetailModal");
    const content = document.getElementById("productModalContent");
    if (!modal || !content) return;

    const iconClass = categoryIcons[product.category] || "fa-solid fa-microchip";

    content.innerHTML = `
      <div class="modal-detail-grid">
        <div class="modal-img-box">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div>
          <div class="product-category"><i class="${iconClass}" style="margin-right:5px;"></i>${product.category} • ${product.categoryLabel}</div>
          <h2 style="font-size:1.55rem; margin-bottom:10px;">${product.name}</h2>
          <div class="product-price" style="font-size:1.6rem; margin-bottom:14px;">${CartModule.formatVND(product.price)}</div>
          <p style="color:var(--text-secondary); font-size:0.95rem;">${product.description}</p>
          <ul class="modal-highlights">
            ${(product.highlights || []).map((h) => `<li>${h}</li>`).join("")}
          </ul>
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <div class="qty-Selector">
              <button type="button" id="modalQtyDec" aria-label="Giảm số lượng">−</button>
              <input type="text" id="modalQtyInput" value="1" readonly aria-label="Số lượng">
              <button type="button" id="modalQtyInc" aria-label="Tăng số lượng">+</button>
            </div>
            <button type="button" class="btn btn-secondary" id="modalAddToCartBtn">
              <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ
            </button>
            <button type="button" class="btn btn-primary" id="modalBuyNowSingleBtn">
              <i class="fa-solid fa-bolt"></i> Mua ngay món này
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("open");
    const qtyInput = document.getElementById("modalQtyInput");

    document.getElementById("modalQtyDec").onclick = () => {
      qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
    };
    document.getElementById("modalQtyInc").onclick = () => {
      qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + 1;
    };
    document.getElementById("modalAddToCartBtn").onclick = () => {
      CartModule.add(product.id, parseInt(qtyInput.value, 10) || 1);
      modal.classList.remove("open");
      CartModule.openDrawer();
    };
    document.getElementById("modalBuyNowSingleBtn").onclick = () => {
      const qty = parseInt(qtyInput.value, 10) || 1;
      if (CartModule.setSingleBuyItem(product.id, qty)) {
        modal.classList.remove("open");
        CheckoutModule.openModal();
      }
    };
  }

  function init() {
    if (window.__GTS_APP_INIT__) return;
    window.__GTS_APP_INIT__ = true;

    cleanupAccidentalDuplicateDOM();
    ensureUniqueProductIds();
    CartModule.init();
    CheckoutModule.init();
    renderDynamicCategories();
    renderDynamicTeam();

    const params = new URLSearchParams(window.location.search);
    if (params.get("category")) uiState.selectedCategory = params.get("category");
    if (params.get("search")) uiState.searchQuery = params.get("search");

    syncSearchInputs();
    renderCatalog();

    const gridEl = document.getElementById("productsGrid");
    if (gridEl) {
      gridEl.onclick = (e) => {
        const target = e.target.closest("[data-action]");
        if (!target) return;
        const { id, action } = target.dataset;
        if (action === "detail") openProductModal(id);
        if (action === "add-cart") CartModule.add(id, 1);
      };
    }

    const filterPillsEl = document.getElementById("filterPillsContainer");
    if (filterPillsEl) {
      filterPillsEl.onclick = (e) => {
        const pill = e.target.closest(".filter-pill");
        if (!pill) return;
        uiState.selectedCategory = pill.dataset.category;
        renderCatalog();
      };
    }

    const showcaseEl = document.getElementById("categoryShowcaseGrid");
    if (showcaseEl) {
      showcaseEl.onclick = (e) => {
        const card = e.target.closest(".category-card");
        if (!card) return;
        uiState.selectedCategory = card.dataset.category;
        renderCatalog();
        document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
      };
    }

    document.querySelectorAll("[data-id]").forEach((el) => {
      if (el.classList.contains("hero-mini-card") || el.classList.contains("hero-main-img-wrap")) {
        el.onclick = () => openProductModal(el.dataset.id);
      }
    });

    const productModalEl = document.getElementById("productDetailModal");
    if (productModalEl) {
      productModalEl.onclick = (e) => {
        if (e.target === productModalEl) productModalEl.classList.remove("open");
      };
    }
    const closeProdBtn = document.getElementById("closeProductModalBtn");
    if (closeProdBtn) {
      closeProdBtn.onclick = () => productModalEl?.classList.remove("open");
    }

    const onSearchChange = (val) => {
      uiState.searchQuery = val;
      syncSearchInputs();
      renderCatalog();
    };

    const headerSearchInput = document.getElementById("headerSearchInput");
    if (headerSearchInput) {
      headerSearchInput.oninput = (e) => onSearchChange(e.target.value);
      headerSearchInput.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const catalog = document.getElementById("catalog");
          if (catalog) {
            catalog.scrollIntoView({ behavior: "smooth" });
          } else {
            window.location.href = `index.html?search=${encodeURIComponent(headerSearchInput.value)}#catalog`;
          }
        }
      };
    }

    const catalogSearchInput = document.getElementById("catalogSearchInput");
    if (catalogSearchInput) {
      catalogSearchInput.oninput = (e) => onSearchChange(e.target.value);
    }

    const hClear = document.getElementById("headerSearchClear");
    if (hClear) hClear.onclick = () => onSearchChange("");

    const cClear = document.getElementById("catalogSearchClear");
    if (cClear) cClear.onclick = () => onSearchChange("");

    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
      sortSelect.onchange = (e) => {
        uiState.sortBy = e.target.value;
        renderCatalog();
      };
    }

    const mobileBtn = document.getElementById("mobileMenuBtn");
    const mainNav = document.getElementById("mainNav");
    if (mobileBtn && mainNav) {
      mobileBtn.onclick = () => {
        const isOpen = mainNav.classList.toggle("open");
        mobileBtn.setAttribute("aria-expanded", String(isOpen));
      };
    }

    const backToTopBtn = document.getElementById("backToTopBtn");
    if (backToTopBtn) {
      window.addEventListener("scroll", () => {
        backToTopBtn.classList.toggle("visible", window.scrollY > 360);
      });
      backToTopBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
    }

    const contactForm = document.getElementById("contactDemoForm");
    if (contactForm) {
      contactForm.onsubmit = (e) => {
        e.preventDefault();
        const nameEl = document.getElementById("contactName");
        const emailEl = document.getElementById("contactEmail");
        const subjectEl = document.getElementById("contactSubject");
        const msgEl = document.getElementById("contactMessage");

        let valid = true;
        const validate = (el, cond) => {
          const grp = el.closest(".form-group");
          if (!cond) {
            grp.classList.add("invalid");
            valid = false;
          } else {
            grp.classList.remove("invalid");
          }
        };

        validate(nameEl, nameEl.value.trim().length >= 2);
        validate(emailEl, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim()));
        validate(subjectEl, subjectEl.value.trim().length >= 3);
        validate(msgEl, msgEl.value.trim().length >= 10);

        if (!valid) {
          CartModule.showToast("Vui lòng điền đầy đủ thông tin hợp lệ vào biểu mẫu liên hệ.");
          return;
        }

        const banner = document.getElementById("contactSuccessBanner");
        if (banner) banner.style.display = "block";
        contactForm.reset();
        CartModule.showToast("Đã gửi lời nhắn (Mô phỏng) thành công!");
      };
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        productModalEl?.classList.remove("open");
        CheckoutModule.closeModal();
        CartModule.closeDrawer();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();