(function () {
  const CART_STORAGE_KEY = "gay_tech_store_cart_v1";

  let state = {
    searchQuery: "",
    selectedCategory: "ALL",
    sortBy: "default",
    cart: loadCartFromStorage(),
    activeModalProduct: null
  };

  function formatVND(amount) {
    return Number(amount).toLocaleString("vi-VN") + "đ";
  }

  function loadCartFromStorage() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
    } catch (err) {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  }

  function showToast(message) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast-item";
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2800);
  }

  // Giỏ hàng
  function getCartCount() {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getCartSubtotal() {
    return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function addToCart(productId, qty = 1) {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) return;

    const parsedQty = Math.max(1, parseInt(qty, 10) || 1);
    const existing = state.cart.find((item) => item.id === productId);

    if (existing) {
      existing.quantity += parsedQty;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        categoryLabel: product.categoryLabel,
        quantity: parsedQty
      });
    }

    saveCartToStorage();
    renderCartUI();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
  }

  function updateCartQty(productId, delta) {
    const item = state.cart.find((i) => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter((i) => i.id !== productId);
      showToast("Đã xóa sản phẩm khỏi giỏ hàng.");
    } else {
      showToast("Đã cập nhật số lượng sản phẩm.");
    }
    saveCartToStorage();
    renderCartUI();
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter((i) => i.id !== productId);
    saveCartToStorage();
    renderCartUI();
    showToast("Đã xóa sản phẩm khỏi giỏ hàng.");
  }

  function renderCartUI() {
    const badgeEls = document.querySelectorAll(".js-cart-count");
    const count = getCartCount();
    badgeEls.forEach((el) => {
      el.textContent = count;
    });

    const bodyEl = document.getElementById("cartDrawerBody");
    const footerEl = document.getElementById("cartDrawerFooter");
    if (!bodyEl || !footerEl) return;

    if (state.cart.length === 0) {
      bodyEl.innerHTML = `
        <div class="empty-catalog-state" style="margin:auto 0;">
          <h3>Giỏ hàng của bạn đang trống.</h3>
          <p>Hãy chọn thêm thiết bị gaming phù hợp với góc học tập và giải trí của bạn.</p>
          <button type="button" class="btn btn-primary btn-sm" id="emptyCartExploreBtn">KHÁM PHÁ SẢN PHẨM</button>
        </div>
      `;
      footerEl.style.display = "none";

      const exploreBtn = document.getElementById("emptyCartExploreBtn");
      if (exploreBtn) {
        exploreBtn.addEventListener("click", () => {
          closeCartDrawer();
          const catalogSec = document.getElementById("catalog");
          if (catalogSec) {
            catalogSec.scrollIntoView({ behavior: "smooth" });
          } else {
            window.location.href = "index.html#catalog";
          }
        });
      }
      return;
    }

    footerEl.style.display = "block";
    bodyEl.innerHTML = state.cart
      .map(
        (item) => `
        <div class="cart-item">
          <div class="cart-item-thumb">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div>
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">${formatVND(item.price)} × ${item.quantity} = ${formatVND(item.price * item.quantity)}</div>
            <div class="cart-item-controls">
              <div class="qty-Selector">
                <button type="button" data-action="dec" data-id="${item.id}" aria-label="Giảm số lượng">−</button>
                <input type="text" value="${item.quantity}" readonly aria-label="Số lượng">
                <button type="button" data-action="inc" data-id="${item.id}" aria-label="Tăng số lượng">+</button>
              </div>
              <button type="button" class="remove-item-btn" data-action="remove" data-id="${item.id}">Xóa</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");

    const subtotal = getCartSubtotal();
    const subtotalEl = document.getElementById("cartSubtotalValue");
    const totalEl = document.getElementById("cartTotalValue");
    const itemTotalCountEl = document.getElementById("cartTotalItemsText");

    if (subtotalEl) subtotalEl.textContent = formatVND(subtotal);
    if (totalEl) totalEl.textContent = formatVND(subtotal);
    if (itemTotalCountEl) itemTotalCountEl.textContent = `${count} sản phẩm`;
  }

  // Hiển thị danh sách sản phẩm trên trang chủ
  function getFilteredAndSortedProducts() {
    let list = [...PRODUCTS_DATA];

    if (state.selectedCategory !== "ALL") {
      list = list.filter((p) => p.category === state.selectedCategory);
    }

    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.shortDesc.toLowerCase().includes(q)
      );
    }

    if (state.sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (state.sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    } else if (state.sortBy === "name-desc") {
      list.sort((a, b) => b.name.localeCompare(a.name, "vi"));
    }

    return list;
  }

  function renderCatalog() {
    const gridEl = document.getElementById("productsGrid");
    if (!gridEl) return;

    const filtered = getFilteredAndSortedProducts();

    document.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.category === state.selectedCategory);
    });

    document.querySelectorAll(".category-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.category === state.selectedCategory);
    });

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div class="empty-catalog-state">
          <h3>Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác nhé!</h3>
          <p>Bạn có thể xóa bộ lọc hiện tại để xem lại toàn bộ 6 sản phẩm tại Gay Tech Store.</p>
          <button type="button" class="btn btn-primary btn-sm" id="resetCatalogFilterBtn">XEM TẤT CẢ SẢN PHẨM</button>
        </div>
      `;
      const resetBtn = document.getElementById("resetCatalogFilterBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          state.searchQuery = "";
          state.selectedCategory = "ALL";
          state.sortBy = "default";
          syncSearchInputs();
          const sortSelect = document.getElementById("sortSelect");
          if (sortSelect) sortSelect.value = "default";
          renderCatalog();
        });
      }
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
              <div class="product-price">${formatVND(product.price)}</div>
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

    if (headerInput && headerInput.value !== state.searchQuery) {
      headerInput.value = state.searchQuery;
    }
    if (catalogInput && catalogInput.value !== state.searchQuery) {
      catalogInput.value = state.searchQuery;
    }
    if (headerClear) {
      headerClear.classList.toggle("visible", state.searchQuery.length > 0);
    }
    if (catalogClear) {
      catalogClear.classList.toggle("visible", state.searchQuery.length > 0);
    }
  }

  // Modal Chi tiết sản phẩm
  function openProductModal(productId) {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) return;

    state.activeModalProduct = product;
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
          <div class="product-price" style="font-size:1.6rem; margin-bottom:14px;">${formatVND(product.price)}</div>
          <p style="color:var(--text-secondary); font-size:0.95rem;">${product.description}</p>
          <ul class="modal-highlights">
            ${product.highlights.map((h) => `<li>${h}</li>`).join("")}
          </ul>
          <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
            <div class="qty-Selector">
              <button type="button" id="modalQtyDec">−</button>
              <input type="text" id="modalQtyInput" value="1" readonly>
              <button type="button" id="modalQtyInc">+</button>
            </div>
            <button type="button" class="btn btn-primary" id="modalAddToCartBtn">THÊM VÀO GIỎ HÀNG</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("open");
    const qtyInput = document.getElementById("modalQtyInput");
    document.getElementById("modalQtyDec").addEventListener("click", () => {
      const current = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = Math.max(1, current - 1);
    });
    document.getElementById("modalQtyInc").addEventListener("click", () => {
      const current = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = current + 1;
    });
    document.getElementById("modalAddToCartBtn").addEventListener("click", () => {
      addToCart(product.id, parseInt(qtyInput.value, 10) || 1);
      closeProductModal();
      openCartDrawer();
    });
  }

  function closeProductModal() {
    const modal = document.getElementById("productDetailModal");
    if (modal) modal.classList.remove("open");
  }

  // Cart Drawer
  function openCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const backdrop = document.getElementById("globalBackdrop");
    if (drawer) drawer.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
  }

  function closeCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const backdrop = document.getElementById("globalBackdrop");
    if (drawer) drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
  }

  // Checkout Modal
  function openCheckoutModal() {
    if (state.cart.length === 0) {
      showToast("Giỏ hàng đang trống. Vui lòng chọn sản phẩm trước!");
      return;
    }
    closeCartDrawer();
    const modal = document.getElementById("checkoutModal");
    const formView = document.getElementById("checkoutFormView");
    const successView = document.getElementById("checkoutSuccessView");
    if (!modal) return;

    if (formView) formView.style.display = "block";
    if (successView) successView.style.display = "none";

    renderCheckoutSummary();
    modal.classList.add("open");
  }

  function closeCheckoutModal() {
    const modal = document.getElementById("checkoutModal");
    if (modal) modal.classList.remove("open");
  }

  function renderCheckoutSummary() {
    const listEl = document.getElementById("checkoutOrderItems");
    const subtotalEl = document.getElementById("checkoutSubtotal");
    const totalEl = document.getElementById("checkoutFinalTotal");
    if (!listEl) return;

    const subtotal = getCartSubtotal();
    listEl.innerHTML = state.cart
      .map(
        (item) => `
        <div style="display:flex; justify-content:space-between; gap:10px; font-size:0.88rem; margin-bottom:8px;">
          <span>${item.name} <strong>(×${item.quantity})</strong></span>
          <span style="color:var(--yellow-primary); font-weight:700;">${formatVND(item.price * item.quantity)}</span>
        </div>
      `
      )
      .join("");

    if (subtotalEl) subtotalEl.textContent = formatVND(subtotal);
    if (totalEl) totalEl.textContent = formatVND(subtotal);
  }

  function setupSharedModalsAndDrawer() {
    // Cart trigger
    document.querySelectorAll(".js-open-cart").forEach((btn) => {
      btn.addEventListener("click", openCartDrawer);
    });

    const closeDrawerBtn = document.getElementById("closeCartDrawerBtn");
    if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeCartDrawer);

    const continueBtn = document.getElementById("continueShoppingBtn");
    if (continueBtn) continueBtn.addEventListener("click", closeCartDrawer);

    const backdrop = document.getElementById("globalBackdrop");
    if (backdrop) backdrop.addEventListener("click", closeCartDrawer);

    const drawerBody = document.getElementById("cartDrawerBody");
    if (drawerBody) {
      drawerBody.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (action === "inc") updateCartQty(id, 1);
        if (action === "dec") updateCartQty(id, -1);
        if (action === "remove") removeFromCart(id);
      });
    }

    const proceedCheckoutBtn = document.getElementById("proceedToCheckoutBtn");
    if (proceedCheckoutBtn) {
      proceedCheckoutBtn.addEventListener("click", openCheckoutModal);
    }

    const closeProductModalBtn = document.getElementById("closeProductModalBtn");
    if (closeProductModalBtn) {
      closeProductModalBtn.addEventListener("click", closeProductModal);
    }

    const closeCheckoutModalBtn = document.getElementById("closeCheckoutModalBtn");
    if (closeCheckoutModalBtn) {
      closeCheckoutModalBtn.addEventListener("click", closeCheckoutModal);
    }

    // Điền nhanh thông tin giả phục vụ buổi chấm Poster
    const fillDemoBtn = document.getElementById("fillDemoDataBtn");
    if (fillDemoBtn) {
      fillDemoBtn.addEventListener("click", () => {
        document.getElementById("custName").value = "Sinh Viên Thử Nghiệm (Demo)";
        document.getElementById("custPhone").value = "0900123456";
        document.getElementById("custAddress").value = "Phòng Poster CSC00004 - ĐH Khoa học Tự nhiên";
        document.getElementById("custNote").value = "Đơn hàng thử nghiệm tại buổi trình bày poster.";
        showToast("Đã điền thông tin mẫu (Demo)!");
      });
    }

    // Xử lý chọn phương thức thanh toán
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const paymentDescEl = document.getElementById("paymentMethodDesc");
    const paymentMessages = {
      "Thanh toán khi nhận hàng (Demo)":
        "Mô phỏng: Khách hàng kiểm tra sản phẩm khi nhận và thanh toán giả lập (Không thu tiền thật).",
      "Chuyển khoản ngân hàng (Mô phỏng)":
        "Mô phỏng: Hệ thống ghi nhận trạng thái chuyển khoản thử nghiệm mà không yêu cầu số tài khoản hay giao dịch thật.",
      "Ví điện tử (Demo)":
        "Mô phỏng: Trải nghiệm luồng chọn ví điện tử dành cho sinh viên (Không kết nối ví thật, không yêu cầu OTP)."
    };

    paymentRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        document.querySelectorAll(".payment-option").forEach((opt) => {
          opt.classList.remove("selected");
        });
        radio.closest(".payment-option").classList.add("selected");
        if (paymentDescEl) {
          paymentDescEl.textContent = paymentMessages[radio.value] || "";
        }
      });
    });

    // Submit Checkout Form
    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameInput = document.getElementById("custName");
        const phoneInput = document.getElementById("custPhone");
        const addrInput = document.getElementById("custAddress");

        let isValid = true;

        const validateField = (input, condition) => {
          const group = input.closest(".form-group");
          if (!condition) {
            group.classList.add("invalid");
            isValid = false;
          } else {
            group.classList.remove("invalid");
          }
        };

        validateField(nameInput, nameInput.value.trim().length >= 2);
        validateField(phoneInput, /^[0-9]{9,11}$/.test(phoneInput.value.trim()));
        validateField(addrInput, addrInput.value.trim().length >= 5);

        if (!isValid) {
          showToast("Vui lòng kiểm tra lại các trường thông tin được đánh dấu đỏ.");
          return;
        }

        const selectedPayment =
          document.querySelector('input[name="paymentMethod"]:checked')?.value ||
          "Thanh toán khi nhận hàng (Demo)";

        const orderId = "GTS-" + Math.floor(100000 + Math.random() * 900000);
        const orderedItemsSnapshot = [...state.cart];
        const finalTotal = getCartSubtotal();

        // Hiển thị màn hình Xác nhận đơn hàng
        const formView = document.getElementById("checkoutFormView");
        const successView = document.getElementById("checkoutSuccessView");
        const successContent = document.getElementById("orderConfirmationDetails");

        if (successContent) {
          successContent.innerHTML = `
            <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:18px; margin:18px 0; text-align:left;">
              <p><strong>Mã đơn hàng:</strong> <span style="color:var(--yellow-primary);">${orderId}</span></p>
              <p><strong>Trạng thái:</strong> <span style="color:var(--success); font-weight:700;">Đơn hàng mô phỏng</span></p>
              <p><strong>Người nhận (Giả lập):</strong> ${nameInput.value.trim()}</p>
              <p><strong>Số điện thoại (Giả lập):</strong> ${phoneInput.value.trim()}</p>
              <p><strong>Địa chỉ nhận mẫu:</strong> ${addrInput.value.trim()}</p>
              <p><strong>Phương thức thanh toán:</strong> ${selectedPayment}</p>
              <hr style="border:none; border-top:1px solid var(--border-color); margin:12px 0;">
              <div style="margin-bottom:10px;">
                ${orderedItemsSnapshot
                  .map(
                    (i) =>
                      `<div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:4px;">
                        <span>${i.name} × ${i.quantity}</span>
                        <span>${formatVND(i.price * i.quantity)}</span>
                      </div>`
                  )
                  .join("")}
              </div>
              <div style="display:flex; justify-content:space-between; font-size:1.1rem; font-weight:800; color:var(--yellow-primary); padding-top:8px; border-top:1px solid var(--border-color);">
                <span>Tổng thanh toán (Mô phỏng):</span>
                <span>${formatVND(finalTotal)}</span>
              </div>
            </div>
          `;
        }

        // Xóa giỏ hàng sau khi hoàn tất
        state.cart = [];
        saveCartToStorage();
        renderCartUI();
        checkoutForm.reset();

        if (formView) formView.style.display = "none";
        if (successView) successView.style.display = "block";
        showToast("Đặt hàng mô phỏng thành công!");
      });
    }
  }

  function initPageEvents() {
    // Đọc query URL nếu chuyển từ trang khác sang
    const params = new URLSearchParams(window.location.search);
    if (params.get("category")) {
      state.selectedCategory = params.get("category");
    }
    if (params.get("search")) {
      state.searchQuery = params.get("search");
    }

    syncSearchInputs();
    renderCatalog();
    renderCartUI();
    setupSharedModalsAndDrawer();

    // Sự kiện trên Grid sản phẩm
    const gridEl = document.getElementById("productsGrid");
    if (gridEl) {
      gridEl.addEventListener("click", (e) => {
        const target = e.target.closest("[data-action]");
        if (!target) return;
        const id = target.dataset.id;
        const action = target.dataset.action;

        if (action === "detail") openProductModal(id);
        if (action === "add-cart") addToCart(id, 1);
      });
    }

    // Mini cards trên Hero
    document.querySelectorAll(".hero-mini-card[data-id]").forEach((card) => {
      card.addEventListener("click", () => {
        openProductModal(card.dataset.id);
      });
    });

    // Tìm kiếm trên Header & Catalog
    const handleSearchInput = (val) => {
      state.searchQuery = val;
      syncSearchInputs();
      const grid = document.getElementById("productsGrid");
      if (grid) {
        renderCatalog();
      }
    };

    const headerSearchInput = document.getElementById("headerSearchInput");
    if (headerSearchInput) {
      headerSearchInput.addEventListener("input", (e) => handleSearchInput(e.target.value));
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

    const catalogSearchInput = document.getElementById("catalogSearchInput");
    if (catalogSearchInput) {
      catalogSearchInput.addEventListener("input", (e) => handleSearchInput(e.target.value));
    }

    ["headerSearchClear", "catalogSearchClear"].forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => handleSearchInput(""));
      }
    });

    // Bộ lọc danh mục
    document.querySelectorAll(".filter-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        state.selectedCategory = pill.dataset.category;
        renderCatalog();
      });
    });

    document.querySelectorAll(".category-card").forEach((card) => {
      card.addEventListener("click", () => {
        state.selectedCategory = card.dataset.category;
        renderCatalog();
        const catalogEl = document.getElementById("catalog");
        if (catalogEl) catalogEl.scrollIntoView({ behavior: "smooth" });
      });
    });

    // Sắp xếp
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        state.sortBy = e.target.value;
        renderCatalog();
      });
    }

    // Mobile Menu
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const mainNav = document.getElementById("mainNav");
    if (mobileBtn && mainNav) {
      mobileBtn.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");
        mobileBtn.setAttribute("aria-expanded", String(isOpen));
      });
    }

    // Back to top
    const backToTopBtn = document.getElementById("backToTopBtn");
    if (backToTopBtn) {
      window.addEventListener("scroll", () => {
        backToTopBtn.classList.toggle("visible", window.scrollY > 360);
      });
      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // Contact Form Validation
    const contactForm = document.getElementById("contactDemoForm");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameEl = document.getElementById("contactName");
        const emailEl = document.getElementById("contactEmail");
        const subjectEl = document.getElementById("contactSubject");
        const msgEl = document.getElementById("contactMessage");

        let valid = true;
        const check = (el, cond) => {
          const grp = el.closest(".form-group");
          if (!cond) {
            grp.classList.add("invalid");
            valid = false;
          } else {
            grp.classList.remove("invalid");
          }
        };

        check(nameEl, nameEl.value.trim().length >= 2);
        check(emailEl, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim()));
        check(subjectEl, subjectEl.value.trim().length >= 3);
        check(msgEl, msgEl.value.trim().length >= 10);

        if (!valid) {
          showToast("Vui lòng điền đầy đủ thông tin hợp lệ vào biểu mẫu liên hệ.");
          return;
        }

        const successBox = document.getElementById("contactSuccessBanner");
        if (successBox) {
          successBox.style.display = "block";
        }
        contactForm.reset();
        showToast("Đã gửi lời nhắn (Mô phỏng) thành công!");
      });
    }

    // Đóng modal bằng phím Escape
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeProductModal();
        closeCheckoutModal();
        closeCartDrawer();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initPageEvents);
})();