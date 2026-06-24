/* ==================== STATE ==================== */
let billItems = {};
let currentCategory = 'All';
let currentStockFilter = 'all';

/* ==================== INIT ==================== */
document.addEventListener('DOMContentLoaded', () => {
  DB.open(() => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    renderCategories();
    renderProducts();
    updateBill();
    updateTodayStats();
    renderStockFilter();
    updateStockAlert();
    updateRestoreBar();
    document.getElementById('totalProducts').textContent = DB.getProducts().length;
  });
});

/* ==================== DATE/TIME ==================== */
function updateDateTime() {
  const now = new Date();
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-BD', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-BD', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

/* ==================== CATEGORY ICON ==================== */
function getCategoryIcon(cat) {
  const icons = {
    'All': 'fa-solid fa-border-all', 'Staples': 'fa-solid fa-bowl-rice',
    'Spices': 'fa-solid fa-mortar-pestle', 'Vegetables': 'fa-solid fa-carrot',
    'Dairy': 'fa-solid fa-cheese', 'Beverages': 'fa-solid fa-wine-bottle',
    'Snacks': 'fa-solid fa-cookie', 'Personal Care': 'fa-solid fa-soap',
  };
  return icons[cat] || 'fa-solid fa-tag';
}

/* ==================== CATEGORIES ==================== */
function renderCategories() {
  const all = DB.getProducts();
  const cats = ['All', ...new Set(all.map(p => p.cat))];
  document.getElementById('categoryTabs').innerHTML = cats.map(c =>
    `<button class="category-tab${c === currentCategory ? ' active' : ''}" onclick="setCategory('${c}')">
      <i class="${getCategoryIcon(c)}"></i> ${c}
    </button>`
  ).join('');
}

function setCategory(cat) {
  currentCategory = cat;
  renderCategories();
  renderProducts();
}

/* ==================== PRODUCTS ==================== */
function renderProducts() {
  const search = document.getElementById('productSearch').value.toLowerCase();
  const all = DB.getProducts();
  const filtered = all.filter(p => {
    const matchCat = currentCategory === 'All' || p.cat === currentCategory;
    const matchSearch = p.name.toLowerCase().includes(search);
    const status = getStockStatus(p);
    const matchStock = currentStockFilter === 'all' || status === currentStockFilter;
    return matchCat && matchSearch && matchStock;
  });
  const container = document.getElementById('productsGrid');
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-bill" style="grid-column:1/-1;padding:30px 10px;"><i class="fas fa-search"></i><p>No products found</p></div>';
    return;
  }
  container.innerHTML = filtered.map(p => {
    const stock = p.stock || 0;
    const status = getStockStatus(p);
    const statusLabel = { in: 'In Stock', low: 'Low (' + stock + ')', out: 'Out (' + stock + ')' };
    const outOfStock = status === 'out';
    const showEdit = !p.isDefault;
    return `<div class="product-card-wrapper">
      <div class="product-card${outOfStock ? ' out-of-stock' : ''}" onclick="${outOfStock ? 'showToast(\'' + p.name + ' is out of stock!\', \'error\')' : 'addToBill(' + p.id + ')'}">
        <span class="stock-badge ${status}"><span class="stock-dot ${status}"></span> ${statusLabel[status]}</span>
        <div class="product-card-actions">
          ${showEdit ? `<button class="product-card-btn edit" onclick="event.stopPropagation();openEditProductModal(${p.id})" title="Edit"><i class="fas fa-pen"></i></button>` : ''}
          <button class="product-card-btn del" onclick="event.stopPropagation();deleteProduct(${p.id})" title="Delete"><i class="fas fa-times"></i></button>
        </div>
        <i class="${p.icon} product-icon"></i>
        <span class="product-name">${p.name}</span>
        <span class="product-price">&#2547;${p.price}</span>
      </div>
    </div>`;
  }).join('');
}

/* ==================== STOCK ==================== */
function getStockStatus(p) {
  const qty = p.stock || 0;
  if (qty <= 0) return 'out';
  if (qty < LOW_STOCK_THRESHOLD) return 'low';
  return 'in';
}

function getLowStockCount() {
  return DB.getProducts().filter(p => getStockStatus(p) === 'low').length;
}

function getOutOfStockCount() {
  return DB.getProducts().filter(p => getStockStatus(p) === 'out').length;
}

/* ==================== BILL ==================== */
function addToBill(productId) {
  const p = DB.getProduct(productId);
  if (!p) return;
  const stock = p.stock || 0;
  const currentQty = billItems[productId] ? billItems[productId].qty : 0;
  if (currentQty + 1 > stock) {
    showToast('Insufficient stock for ' + p.name + ' (available: ' + stock + ')', 'error');
    return;
  }
  if (billItems[productId]) {
    billItems[productId].qty += 1;
  } else {
    billItems[productId] = { ...p, qty: 1 };
  }
  updateBill();
}

function removeFromBill(productId) {
  delete billItems[productId];
  updateBill();
}

function updateQty(productId, qty) {
  const num = parseInt(qty);
  if (isNaN(num) || num < 1) {
    removeFromBill(productId);
    return;
  }
  const p = DB.getProduct(productId);
  const stock = p ? p.stock || 0 : 0;
  if (num > stock) {
    showToast('Only ' + stock + ' in stock!', 'error');
    updateBill();
    return;
  }
  if (billItems[productId]) {
    billItems[productId].qty = num;
    updateBill();
  }
}

function getDiscount() {
  const val = parseFloat(document.getElementById('discountValue').value) || 0;
  const type = document.getElementById('discountType').value;
  return { value: val, type };
}

function updateBill() {
  const container = document.getElementById('billItems');
  const items = Object.values(billItems);
  const count = items.length;
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  document.getElementById('itemCount').textContent = count > 0 ? count + ' items (' + totalQty + ' pcs)' : '0';
  document.getElementById('billNumber').textContent = String(DB.billCounter).padStart(3, '0');

  if (count === 0) {
    container.innerHTML = '<div class="empty-bill"><i class="fas fa-cart-plus"></i><p>Click products to add to bill</p><span>Use search or browse categories</span></div>';
    setSummary(0, 0, 0);
    return;
  }

  container.innerHTML = items.map(item => {
    const total = item.price * item.qty;
    return '<div class="bill-row">' +
      '<span class="col-item">' + item.name + '</span>' +
      '<span class="col-price">\u09F3' + item.price.toFixed(2) + '</span>' +
      '<span class="col-qty"><input type="number" value="' + item.qty + '" min="1" onchange="updateQty(' + item.id + ', this.value)"></span>' +
      '<span class="col-total">\u09F3' + total.toFixed(2) + '</span>' +
      '<span class="col-action"><button class="btn-remove" onclick="removeFromBill(' + item.id + ')" title="Remove"><i class="fas fa-times"></i></button></span>' +
      '</div>';
  }).join('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const { value, type } = getDiscount();
  const discount = type === 'percent' ? subtotal * (value / 100) : Math.min(value, subtotal);
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * TAX_RATE;
  const total = afterDiscount + tax;

  setSummary(subtotal, discount, total);
  document.getElementById('paymentLabel').textContent = document.getElementById('paymentMethod').value;
}

function setSummary(subtotal, discount, total) {
  const discountRow = document.getElementById('discountRow');
  if (discount > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('discountAmount').textContent = '-\u09F3 ' + discount.toFixed(2);
  } else {
    discountRow.style.display = 'none';
  }
  document.getElementById('subtotal').textContent = '\u09F3 ' + subtotal.toFixed(2);
  const tax = Math.max(0, total - (subtotal - discount));
  document.getElementById('taxAmount').textContent = '\u09F3 ' + tax.toFixed(2);
  document.getElementById('totalAmount').textContent = '\u09F3 ' + total.toFixed(2);
}

/* ==================== CLEAR ==================== */
function clearBill() {
  if (Object.keys(billItems).length === 0) return;
  if (!confirm('Clear the current bill?')) return;
  billItems = {};
  updateBill();
}

/* ==================== TOAST ==================== */
function showToast(message, type) {
  if (!type) type = 'success';
  const container = document.getElementById('toastContainer');
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i> ' + message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = '.3s'; }, 2500);
  setTimeout(() => toast.remove(), 3000);
}

/* ==================== GENERATE BILL ==================== */
function generateBill() {
  const items = Object.values(billItems);
  if (items.length === 0) {
    showToast('Please add items to the bill first.', 'error');
    return;
  }

  const customerName = document.getElementById('customerName').value.trim() || 'Walk-in Customer';
  const customerPhone = document.getElementById('customerPhone').value.trim() || '';
  const paymentMethod = document.getElementById('paymentMethod').value;
  const now = new Date();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const { value: discountVal, type: discountType } = getDiscount();
  const discount = discountType === 'percent' ? subtotal * (discountVal / 100) : Math.min(discountVal, subtotal);
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * TAX_RATE;
  const total = afterDiscount + tax;

  const billData = {
    customer: customerName,
    phone: customerPhone,
    payment: paymentMethod,
    items: items.map(i => ({ name: i.name, qty: i.qty, price: i.price, total: i.price * i.qty })),
    subtotal, discount, discountType, discountVal, tax, total,
    date: now.toISOString(),
    dateStr: now.toLocaleDateString('en-BD'),
    timeStr: now.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
  };

  items.forEach(i => DB.updateStock(i.id, i.qty));

  DB.addBill(billData, (record) => {
    showInvoice(record);
    billItems = {};
    updateBill();
    updateTodayStats();
    updateStockAlert();
    renderProducts();
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
  });
}

/* ==================== INVOICE ==================== */
function showInvoice(bill) {
  const itemsHTML = bill.items.map(i =>
    '<tr><td>' + i.name + '</td><td class="qty">' + i.qty + '</td><td class="amt">\u09F3' + i.price.toFixed(2) + '</td><td class="amt">\u09F3' + i.total.toFixed(2) + '</td></tr>'
  ).join('');

  const discountLine = bill.discount > 0
    ? '<div>Discount (' + (bill.discountType === 'percent' ? bill.discountVal + '%' : '\u09F3' + bill.discountVal) + '): -\u09F3' + bill.discount.toFixed(2) + '</div>'
    : '';

  const html = '<div class="invoice">' +
    '<div class="invoice-header"><h2>FreshMart</h2><p>Grocery Shop</p><p>123 Main Street, Dhaka</p><p>Phone: +880-1700-000000</p></div>' +
    '<div class="invoice-info"><div><strong>Bill #:</strong> ' + bill.billNumber + '<br><strong>Date:</strong> ' + bill.dateStr + ' ' + bill.timeStr + '</div>' +
    '<div style="text-align:right;"><strong>Customer:</strong> ' + bill.customer + (bill.phone ? '<br><strong>Phone:</strong> ' + bill.phone : '') + '<br><strong>Payment:</strong> ' + bill.payment + '</div></div>' +
    '<table class="invoice-table"><tr><th style="width:46%;">Item</th><th class="qty" style="width:14%;">Qty</th><th class="amt" style="width:18%;">Price</th><th class="amt" style="width:22%;">Total</th></tr>' +
    itemsHTML +
    '</table>' +
    '<div class="invoice-totals"><div>Subtotal: \u09F3' + bill.subtotal.toFixed(2) + '</div>' +
    discountLine +
    '<div>Tax (5%): \u09F3' + bill.tax.toFixed(2) + '</div>' +
    '<div class="grand-total">Total: \u09F3' + bill.total.toFixed(2) + '</div></div>' +
    '<div class="invoice-footer"><p>Thank you for shopping at FreshMart!</p><p>Goods once sold will not be taken back.</p></div>' +
    '</div>';

  document.getElementById('invoiceBody').innerHTML = html;
  document.getElementById('invoiceModal').classList.add('show');
}

function closeInvoice() {
  document.getElementById('invoiceModal').classList.remove('show');
}

function printInvoice() {
  window.print();
}

function printBill() {
  if (Object.values(billItems).length === 0) {
    showToast('Please add items first.', 'error');
    return;
  }
  generateBill();
}

/* ==================== RESTORE BAR ==================== */
function updateRestoreBar() {
  const bar = document.getElementById('restoreBar');
  const hidden = DB.getProducts(true).filter(p => p.hidden);
  if (hidden.length > 0) {
    bar.style.display = 'flex';
    document.getElementById('hiddenCount').textContent = hidden.length;
  } else {
    bar.style.display = 'none';
  }
}

/* ==================== STOCK FILTER ==================== */
function renderStockFilter() {
  document.querySelectorAll('.stock-filter-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.filter === currentStockFilter)
  );
}

function setStockFilter(filter) {
  currentStockFilter = filter;
  renderStockFilter();
  renderProducts();
}

function updateStockAlert() {
  const low = getLowStockCount();
  const out = getOutOfStockCount();
  const total = low + out;
  const badge = document.getElementById('totalProducts');
  if (total > 0) {
    badge.innerHTML = '<span class="stock-dot ' + (out > 0 ? 'out' : 'low') + '"></span> ' + total + ' alert';
    badge.style.background = out > 0 ? '#fee2e2' : '#fef7e0';
    badge.style.color = out > 0 ? '#b91c1c' : '#92400e';
  } else {
    badge.innerHTML = DB.getProducts().length;
    badge.style.background = '';
    badge.style.color = '';
  }
}

/* ==================== TODAY STATS ==================== */
function updateTodayStats() {
  const today = new Date().toDateString();
  const bills = DB.getBills();
  const todayBills = bills.filter(b => new Date(b.date).toDateString() === today);
  document.getElementById('todayBills').textContent = todayBills.length;
  document.getElementById('todaySales').textContent = '\u09F3 ' + todayBills.reduce((s, b) => s + b.total, 0).toFixed(0);
}

/* ==================== HISTORY ==================== */
function toggleHistory() {
  const modal = document.getElementById('historyModal');
  if (modal.classList.contains('show')) {
    modal.classList.remove('show');
    return;
  }
  renderHistory();
  modal.classList.add('show');
}

function renderHistory() {
  const container = document.getElementById('historyBody');
  const bills = DB.getBills();
  if (bills.length === 0) {
    container.innerHTML = '<div class="empty-bill"><i class="fas fa-receipt"></i><p>No bills generated yet</p></div>';
    return;
  }
  container.innerHTML = bills.map(b =>
    '<div class="history-item" onclick="viewHistoryBill(' + b.id + ')">' +
    '<div class="history-item-left">' +
    '<span class="history-item-bill"><i class="fas fa-receipt"></i> Bill #' + b.billNumber + '</span>' +
    '<span class="history-item-meta"><span><i class="far fa-calendar"></i> ' + b.dateStr + ' ' + b.timeStr + '</span><span><i class="fas fa-user"></i> ' + b.customer + '</span></span>' +
    '</div>' +
    '<div class="history-item-right"><div class="history-item-total">\u09F3' + b.total.toFixed(2) + '</div><div class="history-item-payment"><i class="fas fa-credit-card"></i> ' + b.payment + '</div></div>' +
    '</div>'
  ).join('');
}

function viewHistoryBill(id) {
  const bill = DB.getBills().find(b => b.id === id);
  if (bill) {
    toggleHistory();
    showInvoice(bill);
  }
}

function clearAllHistory() {
  if (DB.getBills().length === 0) return;
  if (!confirm('Delete all bill history? This cannot be undone.')) return;
  DB.clearBills(() => {
    renderHistory();
    updateTodayStats();
    showToast('Bill history cleared.', 'info');
  });
}

/* ==================== PRODUCT MANAGEMENT ==================== */
function openAddProductModal() {
  document.getElementById('editProductId').value = '';
  document.getElementById('productModalTitle').textContent = 'Add Product';
  document.getElementById('productName').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productStock').value = '100';
  document.getElementById('productCategory').value = '';
  document.getElementById('productCategoryNew').value = '';
  document.getElementById('productCategoryNew').style.display = 'none';
  document.getElementById('productCategory').style.display = '';
  populateCategoryDropdown();
  populateIconPicker();
  document.getElementById('productModal').classList.add('show');
}

function openEditProductModal(id) {
  const p = DB.getProduct(id);
  if (!p) return;
  document.getElementById('editProductId').value = id;
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('productName').value = p.name;
  document.getElementById('productPrice').value = p.price;
  document.getElementById('productStock').value = p.stock || 0;
  document.getElementById('productCategoryNew').style.display = 'none';
  document.getElementById('productCategory').style.display = '';
  populateCategoryDropdown(p.cat);
  populateIconPicker(p.icon);
  document.getElementById('productModal').classList.add('show');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('show');
}

function onCategoryChange() {
  const sel = document.getElementById('productCategory');
  const inp = document.getElementById('productCategoryNew');
  if (sel.value === '__new__') {
    sel.style.display = 'none';
    inp.style.display = '';
    inp.focus();
  }
}

function populateIconPicker(selected) {
  const container = document.getElementById('iconPicker');
  container.innerHTML = ICON_OPTIONS.map(icon => {
    const name = icon.split(' ').pop();
    return '<div class="icon-option' + (icon === (selected || 'fa-solid fa-cube') ? ' selected' : '') + '" onclick="selectIcon(this,\'' + icon + '\')">' +
      '<i class="' + icon + '"></i><span class="icon-label">' + name + '</span></div>';
  }).join('');
}

function selectIcon(el, icon) {
  document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('productIcon').value = icon;
}

function populateCategoryDropdown(selected) {
  const all = DB.getProducts();
  const cats = [...new Set(all.map(p => p.cat))].sort();
  const sel = document.getElementById('productCategory');
  sel.innerHTML = '<option value="">-- Select Category --</option>' +
    cats.map(c => '<option value="' + c + '"' + (c === selected ? ' selected' : '') + '>' + c + '</option>').join('') +
    '<option value="__new__">+ Add new category...</option>';
}

function saveProduct() {
  const editId = document.getElementById('editProductId').value;
  const name = document.getElementById('productName').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const stockQty = parseInt(document.getElementById('productStock').value);
  let cat = document.getElementById('productCategory').value;
  const catNew = document.getElementById('productCategoryNew').value.trim();
  const icon = document.getElementById('productIcon').value;

  if (!name) { showToast('Please enter a product name.', 'error'); return; }
  if (!price || price <= 0) { showToast('Please enter a valid price.', 'error'); return; }
  if (cat === '__new__' && catNew) cat = catNew;
  if (!cat) { showToast('Please select or enter a category.', 'error'); return; }

  function afterSave() {
    closeProductModal();
    renderCategories();
    renderProducts();
    updateStockAlert();
    updateRestoreBar();
    document.getElementById('totalProducts').textContent = DB.getProducts().length;
  }

  if (editId) {
    DB.updateProduct(parseInt(editId), {
      name, price, cat, icon,
      stock: (!isNaN(stockQty) && stockQty >= 0) ? stockQty : undefined
    }, afterSave);
    showToast('Product updated.', 'success');
  } else {
    DB.addProduct({
      name, price, cat, icon, stock: (!isNaN(stockQty) && stockQty >= 0) ? stockQty : 100
    }, afterSave);
    showToast('Product added.', 'success');
  }
}

function deleteProduct(id) {
  const p = DB.getProduct(id);
  if (!p) return;
  const msg = p.isDefault
    ? 'Hide "' + p.name + '" from the product list? You can restore it later.'
    : 'Permanently delete "' + p.name + '"?';
  if (!confirm(msg)) return;

  DB.deleteProduct(id, () => {
    renderCategories();
    renderProducts();
    updateStockAlert();
    updateRestoreBar();
    document.getElementById('totalProducts').textContent = DB.getProducts().length;
    showToast('"' + p.name + '" ' + (p.isDefault ? 'hidden' : 'deleted') + '.', 'info');
  });
}

function restoreAllHidden() {
  const hidden = DB.getProducts(true).filter(p => p.hidden);
  if (hidden.length === 0) return;
  if (!confirm('Restore all hidden products?')) return;
  DB.restoreHidden(() => {
    renderCategories();
    renderProducts();
    updateStockAlert();
    updateRestoreBar();
    document.getElementById('totalProducts').textContent = DB.getProducts().length;
    showToast('All products restored.', 'success');
  });
}

/* ==================== KEYBOARD SHORTCUTS ==================== */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeInvoice();
    document.getElementById('historyModal').classList.remove('show');
    document.getElementById('productModal').classList.remove('show');
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    if (document.getElementById('invoiceModal').classList.contains('show')) {
      printInvoice();
      e.preventDefault();
    }
  }
});
