/**
 * =========================================================
 * MODULE GIỎ HÀNG (js/cart.js)
 * =========================================================
 * Nhiệm vụ:
 * 1. Lưu và đọc giỏ hàng từ bộ nhớ trình duyệt (localStorage)
 * 2. Tính tổng số lượng, thành tiền từng món và tổng tiền
 * 3. Tự động gắn giao diện Ngăn kéo giỏ hàng (Cart Drawer) vào mọi trang
 */

const CartModule = (function () {
  const STORAGE_KEY = "gay_tech_store_cart_v1";
  let cart = loadCart();

  // Hàm định dạng số thành tiền Việt Nam (VD: 1050000 -> "1.050.000đ")
  function formatVND(amount) {
    return Number(amount).toLocaleString("vi-VN") + "đ";
  }

  // Đọc giỏ hàng đã lưu từ localStorage
  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  // Lưu giỏ hàng hiện tại vào localStorage
  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      // Bỏ qua nếu trình duyệt ở chế độ chặn lưu trữ
    }
  }

  // Hiển thị thông báo nhỏ ở góc dưới màn hình (Toast Notification)
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

  function getItems() {
    return [...cart];
  }

  function getCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // Thêm sản phẩm vào giỏ hàng
  function add(productId, qty = 1) {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) return;

    const validQty = Math.max(1, parseInt(qty, 10) || 1);
    const existing = cart.find((item) => item.id === productId);

    if (existing) {
      existing.quantity += validQty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        categoryLabel: product.categoryLabel,
        quantity: validQty
      });
    }

    saveCart();
    render();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
  }

  // Tăng hoặc giảm số lượng sản phẩm trong giỏ
  function updateQty(productId, delta) {
    const item = cart.find((i) => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.id !== productId);
      showToast("Đã xóa sản phẩm khỏi giỏ hàng.");
    } else {
      showToast("Đã cập nhật số lượng sản phẩm.");
    }
    saveCart();
    render();
  }

  // Xóa hẳn 1 sản phẩm khỏi giỏ
  function remove(productId) {
    cart = cart.filter((i) => i.id !== productId);
    saveCart();
    render();
    showToast("Đã xóa sản phẩm khỏi giỏ hàng.");
  }

  // Làm trống toàn bộ giỏ hàng sau khi đặt hàng thành công
  function clear() {
    cart = [];
    saveCart();
    render();
  }

  // Tự động chèn khung HTML của Giỏ hàng vào cuối trang
  function injectCartDrawerHTML() {
    if (document.getElementById("cartDrawer")) return;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="overlay-backdrop" id="globalBackdrop"></div>
      <aside class="cart-drawer" id="cartDrawer" aria-label="Giỏ hàng của bạn">
        <div class="cart-drawer-header">
          <h3>🛒 Giỏ hàng (<span id="cartTotalItemsText">0 sản phẩm</span>)</h3>
          <button type="button" class="modal-close-btn" id="closeCartDrawerBtn" style="position:static;" aria-label="Đóng giỏ hàng">✕</button>
        </div>
        <div class="cart-drawer-body" id="cartDrawerBody"></div>
        <div class="cart-drawer-footer" id="cartDrawerFooter">
          <div class="cart-summary-row">
            <span>Tạm tính:</span>
            <strong id="cartSubtotalValue">0đ</strong>
          </div>
          <div class="cart-summary-row">
            <span>Phí giao hàng (Ưu đãi SV):</span>
            <strong style="color:var(--success);">Miễn phí (0đ)</strong>
          </div>
          <div class="cart-summary-row cart-summary-total">
            <span>Tổng cộng:</span>
            <span id="cartTotalValue">0đ</span>
          </div>
          <div style="display:grid; gap:10px;">
            <button type="button" class="btn btn-primary" id="proceedToCheckoutBtn">TIẾN HÀNH ĐẶT HÀNG</button>
            <button type="button" class="btn btn-secondary btn-sm" id="continueShoppingBtn">Tiếp tục mua sắm</button>
          </div>
        </div>
      </aside>
    `;
    document.body.appendChild(wrapper);
  }

  function openDrawer() {
    document.getElementById("cartDrawer")?.classList.add("open");
    document.getElementById("globalBackdrop")?.classList.add("open");
  }

  function closeDrawer() {
    document.getElementById("cartDrawer")?.classList.remove("open");
    document.getElementById("globalBackdrop")?.classList.remove("open");
  }

  // Cập nhật giao diện Giỏ hàng và số đếm trên Header
  function render() {
    const count = getCount();
    document.querySelectorAll(".js-cart-count").forEach((el) => {
      el.textContent = count;
    });

    const bodyEl = document.getElementById("cartDrawerBody");
    const footerEl = document.getElementById("cartDrawerFooter");
    if (!bodyEl || !footerEl) return;

    if (cart.length === 0) {
      bodyEl.innerHTML = `
        <div class="empty-catalog-state" style="margin:auto 0;">
          <h3>Giỏ hàng của bạn đang trống.</h3>
          <p>Hãy chọn thêm thiết bị gaming phù hợp với góc học tập và giải trí của bạn.</p>
          <button type="button" class="btn btn-primary btn-sm" id="emptyCartExploreBtn">KHÁM PHÁ SẢN PHẨM</button>
        </div>
      `;
      footerEl.style.display = "none";

      document.getElementById("emptyCartExploreBtn")?.addEventListener("click", () => {
        closeDrawer();
        const catalogSec = document.getElementById("catalog");
        if (catalogSec) {
          catalogSec.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.href = "index.html#catalog";
        }
      });
      return;
    }

    footerEl.style.display = "block";
    bodyEl.innerHTML = cart
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

    const subtotal = getSubtotal();
    document.getElementById("cartSubtotalValue").textContent = formatVND(subtotal);
    document.getElementById("cartTotalValue").textContent = formatVND(subtotal);
    document.getElementById("cartTotalItemsText").textContent = `${count} sản phẩm`;
  }

  function init() {
    injectCartDrawerHTML();
    render();

    document.querySelectorAll(".js-open-cart").forEach((btn) => {
      btn.addEventListener("click", openDrawer);
    });

    document.getElementById("closeCartDrawerBtn")?.addEventListener("click", closeDrawer);
    document.getElementById("continueShoppingBtn")?.addEventListener("click", closeDrawer);
    document.getElementById("globalBackdrop")?.addEventListener("click", closeDrawer);

    document.getElementById("cartDrawerBody")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const { id, action } = btn.dataset;
      if (action === "inc") updateQty(id, 1);
      if (action === "dec") updateQty(id, -1);
      if (action === "remove") remove(id);
    });

    document.getElementById("proceedToCheckoutBtn")?.addEventListener("click", () => {
      if (typeof CheckoutModule !== "undefined") {
        CheckoutModule.openModal();
      }
    });
  }

  return {
    init,
    add,
    updateQty,
    remove,
    clear,
    getItems,
    getCount,
    getSubtotal,
    openDrawer,
    closeDrawer,
    formatVND,
    showToast
  };
})();