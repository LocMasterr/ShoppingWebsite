/**
 * =========================================================
 * MODULE ĐIỀU KHIỂN CHÍNH (js/app.js)
 * =========================================================
 * Nhiệm vụ:
 * 1. Đọc dữ liệu từ js/products.js để tự động vẽ Danh mục, Sản phẩm và Thành viên
 * 2. Xử lý Tìm kiếm thời gian thực, Lọc danh mục và Sắp xếp sản phẩm
 * 3. Quản lý Cửa sổ xem chi tiết sản phẩm (Product Detail Modal)
 * 4. Xử lý Menu trên điện thoại, nút Lên đầu trang và kiểm tra form Liên hệ
 */

(function () {
  let uiState = {
    searchQuery: "",
    selectedCategory: "ALL",
    sortBy: "default"
  };

  // 1. Tự động vẽ 6 ô danh mục và dải nút bấm lọc danh mục
  function renderDynamicCategories() {
    const showcaseGrid = document.getElementById("categoryShowcaseGrid");
    const filterPillsBox = document.getElementById("filterPillsContainer");

    if (showcaseGrid && typeof CATEGORIES_DATA !== "undefined") {
      showcaseGrid.innerHTML = CATEGORIES_DATA.map(
        (cat) => `
        <div class="category-card" data-category="${cat.id}">
          <div class="category-thumb"><img src="${cat.image}" alt="${cat.title}" loading="lazy"></div>
          <h3>${cat.title}</h3>
          <span>${cat.subtitle}</span>
        </div>
      `
      ).join("");
    }

    if (filterPillsBox && typeof PRODUCTS_DATA !== "undefined") {
      const uniqueCategories = Array.from(new Set(PRODUCTS_DATA.map((p) => p.category)));
      filterPillsBox.innerHTML =
        `<button type="button" class="filter-pill active" data-category="ALL">Tất cả sản phẩm (${PRODUCTS_DATA.length})</button>` +
        uniqueCategories
          .map(
            (cat) =>
              `<button type="button" class="filter-pill" data-category="${cat}">${cat}</button>`
          )
          .join("");
    }
  }

  // 2. Tự động vẽ danh sách 5 thành viên ở trang about.html
  function renderDynamicTeam() {
    const teamGrid = document.getElementById("teamMembersGrid");
    if (!teamGrid || typeof TEAM_MEMBERS_DATA === "undefined") return;

    teamGrid.innerHTML = TEAM_MEMBERS_DATA.map(
      (member) => `
      <div class="team-card">
        <div class="team-avatar">${member.avatarText}</div>
        <h3>${member.name}</h3>
        <p style="color:var(--yellow-primary); font-size:0.82rem; font-weight:700; margin:4px 0;">MSSV: ${member.mssv}</p>
        <p style="font-size:0.84rem; color:var(--text-secondary);">${member.role}</p>
      </div>
    `
    ).join("");
  }

  // 3. Lọc và sắp xếp danh sách sản phẩm theo lựa chọn của người dùng
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

  // 4. Vẽ các thẻ sản phẩm ra lưới #productsGrid
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
          <h3>Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác nhé!</h3>
          <p>Bạn có thể xóa bộ lọc hiện tại để xem lại toàn bộ ${PRODUCTS_DATA.length} sản phẩm tại Gay Tech Store.</p>
          <button type="button" class="btn btn-primary btn-sm" id="resetCatalogFilterBtn">XEM TẤT CẢ SẢN PHẨM</button>
        </div>
      `;
      document.getElementById("resetCatalogFilterBtn")?.addEventListener("click", () => {
        uiState.searchQuery = "";
        uiState.selectedCategory = "ALL";
        uiState.sortBy = "default";
        syncSearchInputs();
        const sortSelect = document.getElementById("sortSelect");
        if (sortSelect) sortSelect.value = "default";
        renderCatalog();
      });
      return;
    }

    gridEl.innerHTML = filtered
      .map(
        (product) => `
        <article class="product-card">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
          <div class="product-img-wrap" data-action="detail" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
          </div>
          <div class="product-body">
            <div class="product-category">${product.category} • ${product.categoryLabel}</div>
            <h3 class="product-title" data-action="detail" data-id="${product.id}">${product.name}</h3>
            <p class="product-desc">${product.shortDesc}</p>
            <div class="product-footer">
              <div class="product-price">${CartModule.formatVND(product.price)}</div>
              <div class="product-actions">
                <button type="button" class="btn btn-secondary btn-sm" data-action="detail" data-id="${product.id}">Xem chi tiết</button>
                <button type="button" class="btn btn-primary btn-sm" data-action="add-cart" data-id="${product.id}">+ Thêm vào giỏ</button>
              </div>
            </div>
          </div>
        </article>
      `
      )
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

  // 5. Mở cửa sổ xem chi tiết sản phẩm
  function openProductModal(productId) {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) return;

    const modal = document.getElementById("productDetailModal");
    const content = document.getElementById("productModalContent");
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="modal-detail-grid">
        <div class="modal-img-box">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div>
          <div class="product-category">${product.category} • ${product.categoryLabel}</div>
          <h2 style="font-size:1.55rem; margin-bottom:10px;">${product.name}</h2>
          <div class="product-price" style="font-size:1.6rem; margin-bottom:14px;">${CartModule.formatVND(product.price)}</div>
          <p style="color:var(--text-secondary); font-size:0.95rem;">${product.description}</p>
          <ul class="modal-highlights">
            ${(product.highlights || []).map((h) => `<li>${h}</li>`).join("")}
          </ul>
          <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
            <div class="qty-Selector">
              <button type="button" id="modalQtyDec" aria-label="Giảm số lượng">−</button>
              <input type="text" id="modalQtyInput" value="1" readonly aria-label="Số lượng">
              <button type="button" id="modalQtyInc" aria-label="Tăng số lượng">+</button>
            </div>
            <button type="button" class="btn btn-primary" id="modalAddToCartBtn">THÊM VÀO GIỎ HÀNG</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("open");
    const qtyInput = document.getElementById("modalQtyInput");
    document.getElementById("modalQtyDec").addEventListener("click", () => {
      qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
    });
    document.getElementById("modalQtyInc").addEventListener("click", () => {
      qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + 1;
    });
    document.getElementById("modalAddToCartBtn").addEventListener("click", () => {
      CartModule.add(product.id, parseInt(qtyInput.value, 10) || 1);
      modal.classList.remove("open");
      CartModule.openDrawer();
    });
  }

  // 6. Khởi tạo toàn bộ sự kiện khi trang tải xong
  function init() {
    CartModule.init();
    CheckoutModule.init();
    renderDynamicCategories();
    renderDynamicTeam();

    const params = new URLSearchParams(window.location.search);
    if (params.get("category")) uiState.selectedCategory = params.get("category");
    if (params.get("search")) uiState.searchQuery = params.get("search");

    syncSearchInputs();
    renderCatalog();

    // Bắt sự kiện trên lưới sản phẩm
    document.getElementById("productsGrid")?.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;
      const { id, action } = target.dataset;
      if (action === "detail") openProductModal(id);
      if (action === "add-cart") CartModule.add(id, 1);
    });

    // Bắt sự kiện bấm nút lọc danh mục
    document.getElementById("filterPillsContainer")?.addEventListener("click", (e) => {
      const pill = e.target.closest(".filter-pill");
      if (!pill) return;
      uiState.selectedCategory = pill.dataset.category;
      renderCatalog();
    });

    // Bắt sự kiện bấm vào 6 thẻ danh mục có ảnh
    document.getElementById("categoryShowcaseGrid")?.addEventListener("click", (e) => {
      const card = e.target.closest(".category-card");
      if (!card) return;
      uiState.selectedCategory = card.dataset.category;
      renderCatalog();
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
    });

    // Bắt sự kiện bấm vào các ảnh sản phẩm trên Hero
    document.querySelectorAll("[data-id]").forEach((el) => {
      if (el.classList.contains("hero-mini-card") || el.classList.contains("hero-main-img-wrap")) {
        el.addEventListener("click", () => openProductModal(el.dataset.id));
      }
    });

    const productModalEl = document.getElementById("productDetailModal");
    productModalEl?.addEventListener("click", (e) => {
      if (e.target === productModalEl) productModalEl.classList.remove("open");
    });
    document.getElementById("closeProductModalBtn")?.addEventListener("click", () => {
      productModalEl?.classList.remove("open");
    });

    // Xử lý tìm kiếm
    const onSearchChange = (val) => {
      uiState.searchQuery = val;
      syncSearchInputs();
      renderCatalog();
    };

    const headerSearchInput = document.getElementById("headerSearchInput");
    if (headerSearchInput) {
      headerSearchInput.addEventListener("input", (e) => onSearchChange(e.target.value));
      headerSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const catalog = document.getElementById("catalog");
          if (catalog) {
            catalog.scrollIntoView({ behavior: "smooth" });
          } else {
            window.location.href = `index.html?search=${encodeURIComponent(headerSearchInput.value)}#catalog`;
          }
        }
      });
    }

    document.getElementById("catalogSearchInput")?.addEventListener("input", (e) => onSearchChange(e.target.value));
    document.getElementById("headerSearchClear")?.addEventListener("click", () => onSearchChange(""));
    document.getElementById("catalogSearchClear")?.addEventListener("click", () => onSearchChange(""));

    document.getElementById("sortSelect")?.addEventListener("change", (e) => {
      uiState.sortBy = e.target.value;
      renderCatalog();
    });

    // Menu trên điện thoại
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const mainNav = document.getElementById("mainNav");
    if (mobileBtn && mainNav) {
      mobileBtn.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");
        mobileBtn.setAttribute("aria-expanded", String(isOpen));
      });
    }

    // Nút cuộn lên đầu trang
    const backToTopBtn = document.getElementById("backToTopBtn");
    if (backToTopBtn) {
      window.addEventListener("scroll", () => {
        backToTopBtn.classList.toggle("visible", window.scrollY > 360);
      });
      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // Kiểm tra biểu mẫu Liên hệ (contact.html)
    const contactForm = document.getElementById("contactDemoForm");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
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
      });
    }

    // Đóng mọi cửa sổ khi bấm phím Escape
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