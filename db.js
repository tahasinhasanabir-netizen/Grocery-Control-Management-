const DB_NAME = 'FreshMartDB';
const DB_VERSION = 1;

const DEFAULT_PRODUCTS = [
  { name: 'Miniket Rice', price: 60, cat: 'Staples', icon: 'fa-solid fa-bowl-rice', stock: 100 },
  { name: 'Nazirshail Rice', price: 75, cat: 'Staples', icon: 'fa-solid fa-bowl-rice', stock: 100 },
  { name: 'Sugar', price: 130, cat: 'Staples', icon: 'fa-solid fa-cube', stock: 100 },
  { name: 'Salt', price: 35, cat: 'Staples', icon: 'fa-solid fa-cube', stock: 100 },
  { name: 'Soybean Oil', price: 180, cat: 'Staples', icon: 'fa-solid fa-oil-can', stock: 100 },
  { name: 'Mustard Oil', price: 220, cat: 'Staples', icon: 'fa-solid fa-oil-can', stock: 100 },
  { name: 'Flour (Atta)', price: 50, cat: 'Staples', icon: 'fa-solid fa-wheat-awn', stock: 100 },
  { name: 'Tea', price: 160, cat: 'Staples', icon: 'fa-solid fa-mug-saucer', stock: 100 },
  { name: 'Coffee', price: 350, cat: 'Staples', icon: 'fa-solid fa-mug-hot', stock: 100 },
  { name: 'Moong Dal', price: 110, cat: 'Spices', icon: 'fa-solid fa-seedling', stock: 100 },
  { name: 'Masoor Dal', price: 95, cat: 'Spices', icon: 'fa-solid fa-seedling', stock: 100 },
  { name: 'Turmeric Powder', price: 80, cat: 'Spices', icon: 'fa-solid fa-mortar-pestle', stock: 100 },
  { name: 'Chili Powder', price: 140, cat: 'Spices', icon: 'fa-solid fa-mortar-pestle', stock: 100 },
  { name: 'Cumin Seeds', price: 90, cat: 'Spices', icon: 'fa-solid fa-seedling', stock: 100 },
  { name: 'Garam Masala', price: 120, cat: 'Spices', icon: 'fa-solid fa-mortar-pestle', stock: 100 },
  { name: 'Potato', price: 30, cat: 'Vegetables', icon: 'fa-solid fa-carrot', stock: 100 },
  { name: 'Onion', price: 55, cat: 'Vegetables', icon: 'fa-solid fa-carrot', stock: 100 },
  { name: 'Tomato', price: 80, cat: 'Vegetables', icon: 'fa-solid fa-carrot', stock: 100 },
  { name: 'Eggplant', price: 45, cat: 'Vegetables', icon: 'fa-solid fa-carrot', stock: 100 },
  { name: 'Green Chili', price: 40, cat: 'Vegetables', icon: 'fa-solid fa-carrot', stock: 100 },
  { name: 'Pumpkin', price: 35, cat: 'Vegetables', icon: 'fa-solid fa-carrot', stock: 100 },
  { name: 'Eggs (12)', price: 55, cat: 'Dairy', icon: 'fa-solid fa-egg', stock: 100 },
  { name: 'Milk', price: 90, cat: 'Dairy', icon: 'fa-solid fa-bottle-water', stock: 100 },
  { name: 'Butter', price: 250, cat: 'Dairy', icon: 'fa-solid fa-cheese', stock: 100 },
  { name: 'Cheese', price: 320, cat: 'Dairy', icon: 'fa-solid fa-cheese', stock: 100 },
  { name: 'Coca-Cola', price: 40, cat: 'Beverages', icon: 'fa-solid fa-wine-bottle', stock: 100 },
  { name: 'Sprite', price: 40, cat: 'Beverages', icon: 'fa-solid fa-wine-bottle', stock: 100 },
  { name: 'Water (2L)', price: 25, cat: 'Beverages', icon: 'fa-solid fa-bottle-water', stock: 100 },
  { name: 'Fruit Juice', price: 60, cat: 'Beverages', icon: 'fa-solid fa-wine-glass', stock: 100 },
  { name: 'Chips', price: 20, cat: 'Snacks', icon: 'fa-solid fa-cookie', stock: 100 },
  { name: 'Biscuits', price: 35, cat: 'Snacks', icon: 'fa-solid fa-cookie', stock: 100 },
  { name: 'Noodles', price: 25, cat: 'Snacks', icon: 'fa-solid fa-utensils', stock: 100 },
  { name: 'Bread', price: 50, cat: 'Snacks', icon: 'fa-solid fa-bread-slice', stock: 100 },
  { name: 'Soap', price: 45, cat: 'Personal Care', icon: 'fa-solid fa-soap', stock: 100 },
  { name: 'Shampoo', price: 180, cat: 'Personal Care', icon: 'fa-solid fa-jar', stock: 100 },
  { name: 'Detergent', price: 130, cat: 'Personal Care', icon: 'fa-solid fa-jug-detergent', stock: 100 },
  { name: 'Toothpaste', price: 85, cat: 'Personal Care', icon: 'fa-solid fa-tooth', stock: 100 },
];

const ICON_OPTIONS = [
  'fa-solid fa-cube', 'fa-solid fa-bowl-rice', 'fa-solid fa-oil-can', 'fa-solid fa-wheat-awn',
  'fa-solid fa-mug-saucer', 'fa-solid fa-mug-hot', 'fa-solid fa-seedling', 'fa-solid fa-mortar-pestle',
  'fa-solid fa-carrot', 'fa-solid fa-egg', 'fa-solid fa-bottle-water', 'fa-solid fa-cheese',
  'fa-solid fa-wine-bottle', 'fa-solid fa-wine-glass', 'fa-solid fa-cookie', 'fa-solid fa-utensils',
  'fa-solid fa-bread-slice', 'fa-solid fa-soap', 'fa-solid fa-jar', 'fa-solid fa-jug-detergent',
  'fa-solid fa-tooth', 'fa-solid fa-apple-whole', 'fa-solid fa-fish', 'fa-solid fa-drumstick-bite',
  'fa-solid fa-pepper-hot', 'fa-solid fa-lemon', 'fa-solid fa-box-open', 'fa-solid fa-box',
];

const TAX_RATE = 0.05;
const LOW_STOCK_THRESHOLD = 10;

const DB = {
  db: null,
  products: [],
  bills: [],
  billCounter: 1,
  callbacks: [],

  open(callback) {
    this.callbacks.push(callback);
    if (this.db) { this._runCallbacks(); return; }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('products')) {
        const store = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
        store.createIndex('cat', 'cat', { unique: false });
        store.createIndex('hidden', 'hidden', { unique: false });
      }
      if (!db.objectStoreNames.contains('bills')) {
        db.createObjectStore('bills', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    req.onsuccess = (e) => {
      this.db = e.target.result;
      this.db.onerror = (ev) => console.error('DB error:', ev.target.error);
      this._loadOrSeed(() => { this._runCallbacks(); });
    };

    req.onerror = (e) => {
      console.error('Failed to open DB:', e.target.error);
      fallbackToLocalStorage();
      this._runCallbacks();
    };
  },

  _loadOrSeed(done) {
    const tx = this.db.transaction(['products', 'bills', 'meta'], 'readonly');
    const pStore = tx.objectStore('products');
    const pReq = pStore.getAll();

    pReq.onsuccess = () => {
      if (pReq.result.length > 0) {
        this.products = pReq.result;
        this._migrateIcons(() => {
          this._loadBillsAndMeta(done);
        });
      } else {
        this._seedDefaults(done);
      }
    };
    pReq.onerror = () => { fallbackToLocalStorage(); done(); };
  },

  _seedDefaults(done) {
    const tx = this.db.transaction(['products', 'meta'], 'readwrite');
    const store = tx.objectStore('products');
    DEFAULT_PRODUCTS.forEach(p => {
      store.add({ ...p, hidden: false, isDefault: true });
    });
    const metaStore = tx.objectStore('meta');
    metaStore.add({ key: 'billCounter', value: 1 });

    tx.oncomplete = () => {
      this._loadOrSeed(done);
    };
    tx.onerror = () => { fallbackToLocalStorage(); done(); };
  },

  _loadBillsAndMeta(done) {
    const tx = this.db.transaction(['bills', 'meta'], 'readonly');
    const bReq = tx.objectStore('bills').getAll();
    bReq.onsuccess = () => { this.bills = bReq.result || []; };

    const mReq = tx.objectStore('meta').get('billCounter');
    mReq.onsuccess = () => {
      if (mReq.result) this.billCounter = mReq.result.value;
      done();
    };
    mReq.onerror = () => { done(); };
  },

  _runCallbacks() {
    const cbs = this.callbacks.slice();
    this.callbacks = [];
    cbs.forEach(fn => fn());
  },

  getProducts(includeHidden) {
    if (includeHidden) return this.products.slice();
    return this.products.filter(p => !p.hidden);
  },

  getProduct(id) {
    return this.products.find(p => p.id === id);
  },

  _fixIcon(p) {
    const broken = {
      'fa-solid fa-juice': 'fa-solid fa-wine-glass',
      'fa-solid fa-can-food': 'fa-solid fa-box-open',
    };
    const fixed = broken[p.icon];
    if (fixed) {
      p.icon = fixed;
      return true;
    }
    return false;
  },

  _migrateIcons(done) {
    let changed = false;
    this.products.forEach(p => { if (this._fixIcon(p)) changed = true; });
    if (!changed) { if (done) done(); return; }
    const tx = this.db.transaction(['products'], 'readwrite');
    const store = tx.objectStore('products');
    this.products.forEach(p => store.put(p));
    tx.oncomplete = () => { if (done) done(); };
    tx.onerror = () => { if (done) done(); };
  },

  addProduct(data, callback) {
    const tx = this.db.transaction(['products'], 'readwrite');
    const product = {
      name: data.name, price: data.price, cat: data.cat,
      icon: data.icon,
      stock: data.stock != null ? data.stock : 100,
      hidden: false, isDefault: false
    };
    const req = tx.objectStore('products').add(product);
    req.onsuccess = (e) => {
      const newId = e.target.result;
      product.id = newId;
      this.products.push(product);
      if (callback) callback(newId);
    };
    req.onerror = () => { showToast('Database error adding product.', 'error'); };
  },

  updateProduct(id, updates, callback) {
    const tx = this.db.transaction(['products'], 'readwrite');
    const store = tx.objectStore('products');
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) return;
      Object.assign(existing, updates);
      store.put(existing);
      const cached = this.products.find(p => p.id === id);
      if (cached) Object.assign(cached, updates);
      if (callback) callback();
    };
  },

  deleteProduct(id, callback) {
    const p = this.products.find(x => x.id === id);
    if (!p) return;
    if (p.isDefault) {
      this.updateProduct(id, { hidden: true }, callback);
    } else {
      const tx = this.db.transaction(['products'], 'readwrite');
      tx.objectStore('products').delete(id);
      this.products = this.products.filter(x => x.id !== id);
      if (callback) callback();
    }
  },

  restoreHidden(callback) {
    const hidden = this.products.filter(p => p.hidden);
    if (hidden.length === 0) return;
    let done = 0;
    hidden.forEach(p => {
      this.updateProduct(p.id, { hidden: false }, () => {
        done++;
        if (done === hidden.length && callback) callback();
      });
    });
  },

  addBill(data, callback) {
    const record = {
      billNumber: String(this.billCounter).padStart(3, '0'),
      customer: data.customer, phone: data.phone, payment: data.payment,
      items: data.items, subtotal: data.subtotal, discount: data.discount,
      discountType: data.discountType, discountVal: data.discountVal,
      tax: data.tax, total: data.total,
      date: data.date, dateStr: data.dateStr, timeStr: data.timeStr
    };
    const tx = this.db.transaction(['bills', 'meta'], 'readwrite');
    const bReq = tx.objectStore('bills').add(record);
    bReq.onsuccess = (e) => {
      record.id = e.target.result;
      this.bills.unshift(record);
    };
    tx.objectStore('meta').put({ key: 'billCounter', value: this.billCounter + 1 });
    tx.oncomplete = () => {
      this.billCounter++;
      if (callback) callback(record);
    };
  },

  getBills() { return this.bills.slice(); },

  clearBills(callback) {
    const tx = this.db.transaction(['bills'], 'readwrite');
    tx.objectStore('bills').clear();
    tx.oncomplete = () => {
      this.bills = [];
      if (callback) callback();
    };
  },

  updateStock(productId, delta) {
    const p = this.products.find(x => x.id === productId);
    if (!p) return;
    const newStock = Math.max(0, (p.stock || 0) - delta);
    this.updateProduct(productId, { stock: newStock });
  }
};

function fallbackToLocalStorage() {
  console.warn('IndexedDB not available, using localStorage fallback.');
  const stored = localStorage.getItem('fallback_products');
  if (stored) {
    DB.products = JSON.parse(stored);
    let changed = false;
    DB.products.forEach(p => { if (DB._fixIcon(p)) changed = true; });
    if (changed) lsSaveProducts();
  } else {
    DB.products = DEFAULT_PRODUCTS.map((p, i) => ({ ...p, id: i + 1, hidden: false, isDefault: true }));
    DB.products.forEach(p => DB._fixIcon(p));
    localStorage.setItem('fallback_products', JSON.stringify(DB.products));
  }
  DB.bills = JSON.parse(localStorage.getItem('fallback_bills') || '[]');
  DB.billCounter = parseInt(localStorage.getItem('billCounter') || '1');
}

function lsSaveProducts() {
  localStorage.setItem('fallback_products', JSON.stringify(DB.products));
}
function lsSaveBills() {
  localStorage.setItem('fallback_bills', JSON.stringify(DB.bills));
}
