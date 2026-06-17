import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Printer, RefreshCw, 
  Layers, ShoppingBag, Truck, FileText, 
  UserPlus, Info, Save, X, PlusCircle, Award, Database, Lock, ArrowLeft, Check,
  ArrowUp, ArrowDown, Eye, LogIn
} from 'lucide-react';
import { api } from './api';
import AuthPage from './AuthPage';

const MOCK_EMPLOYEES = [];

const QUICK_PRODUCTS = [
  { name: 'Glow-in-the-dark Spark Wand', category: 'Accessories', price: 45.00, tax: 8, discount: 5 },
  { name: 'Self-Stirring Pewter Cauldron', category: 'Furniture', price: 120.00, tax: 10, discount: 10 },
  { name: 'Anti-Gravity Floating Inkwell', category: 'Office Supplies', price: 29.99, tax: 5, discount: 0 },
  { name: 'Midnight Velvet Wizard Cloak', category: 'Apparel', price: 95.00, tax: 6, discount: 15 },
  { name: 'Chrono-Watch Timepiece', category: 'Electronics', price: 249.99, tax: 12, discount: 20 },
];

const PACKAGING_OPTIONS = {
  polybag: { name: 'Standard Polybag', price: 1.50, desc: 'Lightweight waterproof sleeve' },
  ecobox: { name: 'Cardboard Eco-Box', price: 3.00, desc: '100% recycled biodegradable material' },
  giftbox: { name: 'Premium Gift Box', price: 6.00, desc: 'Rigid box with ribbon & card' },
  woodcrate: { name: 'Heavy-Duty Wood Crate', price: 12.00, desc: 'Custom reinforced timber frame' },
};

const SHIPPING_METHODS = {
  standard: { name: 'Standard Ground Owl', price: 0.00, desc: 'Delivery in 3-5 business days' },
  express: { name: 'Express Hippogriff', price: 5.00, desc: 'Delivery in 1-2 business days' },
  overnight: { name: 'Phoenix Air Express', price: 15.00, desc: 'Guaranteed delivery next morning' },
};

const STATES = [
  'Russia', 'India', 'pakistan', 'germany', 'USA', 'japan', 'spain', 'argentina', 
  //'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 
  //'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 
  //'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 
  //'Nevadaew York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 
  //'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 
  //'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

function App() {
  // --- Page Routing State ---
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wizago_user')); }
    catch { return null; }
  });
  const [currentPage, setCurrentPage] = useState(user ? 'dashboard' : 'auth');
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  // --- Employee State ---
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployeeMode, setNewEmployeeMode] = useState(false);
  const [newEmpData, setNewEmpData] = useState({ id: '', name: '', dept: '', role: '' });

  // --- Product State ---
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    qty: '1',
    discount: '0',
    tax: '8'
  });
  const [cartItems, setCartItems] = useState([]);

  // --- Shipping & Logistics State ---
  const [shippingForm, setShippingForm] = useState({
    state: 'California',
    address: '',
    packagingType: 'polybag',
    deliveryMethod: 'standard',
    notes: ''
  });

  // --- Invoice Compile & History State ---
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [isCompiled, setIsCompiled] = useState(false);
  const [invoiceLogs, setInvoiceLogs] = useState([]);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);
  const [employeeOrder, setEmployeeOrder] = useState(() => employees.map(e => e.id));
  const [editingLogId, setEditingLogId] = useState(null);
  const [editLogData, setEditLogData] = useState({});

  // Generate unique Invoice ID and Date on load
  useEffect(() => {
    resetInvoiceMeta();
    api.employees.list().then(setEmployees).catch(() => {});
    api.orders.list().then(setInvoiceLogs).catch(() => {});
  }, []);

  const resetInvoiceMeta = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setInvoiceNumber(`INV-${new Date().getFullYear()}-${randomNum}`);
    
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }) + ' ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    setInvoiceDate(formattedDate);
    setIsCompiled(false);
  };

  // --- Handlers for Employee Section ---
  const handleEmployeeDropdownChange = (e) => {
    const val = e.target.value;
    if (val === 'new') {
      setNewEmployeeMode(true);
      setSelectedEmployee(null);
      setIsCompiled(false);
    } else if (val === '') {
      setSelectedEmployee(null);
      setNewEmployeeMode(false);
      setIsCompiled(false);
    } else {
      const emp = employees.find((x) => x.id === val);
      setSelectedEmployee(emp || null);
      setNewEmployeeMode(false);
      setIsCompiled(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!newEmpData.name || !newEmpData.id) {
      alert('Please enter Employee ID and Name');
      return;
    }
    const newEmp = {
      id: newEmpData.id.toUpperCase(),
      name: newEmpData.name,
      role: newEmpData.role || 'Warlock',
      dept: newEmpData.dept || 'Spells Control',
      status: 'On Duty'
    };
    try {
      const saved = await api.employees.create(newEmp);
      setEmployees(prev => [saved, ...prev]);
      setSelectedEmployee(saved);
    } catch {
      setEmployees(prev => [newEmp, ...prev]);
      setSelectedEmployee(newEmp);
    }
    setNewEmployeeMode(false);
    setNewEmpData({ id: '', name: '', dept: '', role: '' });
    setIsCompiled(false);
  };

  // --- Handlers for Product Section ---
  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
  };

  const addProductToCart = (e) => {
    e.preventDefault();
    if (!selectedEmployee) return; // Locked guard
    if (!productForm.name || !productForm.price) {
      alert('Please fill out Product Name and Unit Price');
      return;
    }

    const price = parseFloat(productForm.price);
    const qty = parseInt(productForm.qty) || 1;
    const discount = parseFloat(productForm.discount) || 0;
    const tax = parseFloat(productForm.tax) || 0;

    const baseTotal = price * qty;
    const discountAmount = baseTotal * (discount / 100);
    const taxableAmount = baseTotal - discountAmount;
    const taxAmount = taxableAmount * (tax / 100);
    const finalTotal = taxableAmount + taxAmount;

    const newItem = {
      id: Date.now(),
      name: productForm.name,
      category: productForm.category,
      price: price,
      qty: qty,
      discount: discount,
      tax: tax,
      total: finalTotal
    };

    setCartItems([...cartItems, newItem]);
    setProductForm({
      name: '',
      category: 'Electronics',
      price: '',
      qty: '1',
      discount: '0',
      tax: '8'
    });
    setIsCompiled(false);
  };

  const quickAddProduct = (prod) => {
    if (!selectedEmployee) return; // Locked guard
    const qty = 1;
    const baseTotal = prod.price * qty;
    const discountAmount = baseTotal * (prod.discount / 100);
    const taxableAmount = baseTotal - discountAmount;
    const taxAmount = taxableAmount * (prod.tax / 100);
    const finalTotal = taxableAmount + taxAmount;

    const newItem = {
      id: Date.now(),
      name: prod.name,
      category: prod.category,
      price: prod.price,
      qty: qty,
      discount: prod.discount,
      tax: prod.tax,
      total: finalTotal
    };

    setCartItems([...cartItems, newItem]);
    setIsCompiled(false);
  };

  const removeCartItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    setIsCompiled(false);
  };

  // --- Handlers for Shipping/Logistics Section ---
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm({ ...shippingForm, [name]: value });
    setIsCompiled(false);
  };

  const handlePackagingSelect = (key) => {
    if (!selectedEmployee) return; // Locked guard
    setShippingForm({ ...shippingForm, packagingType: key });
    setIsCompiled(false);
  };

  // --- Calculations for Invoice ---
  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  };

  const getDiscountTotal = () => {
    return cartItems.reduce((acc, item) => {
      const base = item.price * item.qty;
      return acc + (base * (item.discount / 100));
    }, 0);
  };

  const getTaxTotal = () => {
    return cartItems.reduce((acc, item) => {
      const base = item.price * item.qty;
      const discounted = base - (base * (item.discount / 100));
      return acc + (discounted * (item.tax / 100));
    }, 0);
  };

  const getSurcharge = () => {
    const packPrice = PACKAGING_OPTIONS[shippingForm.packagingType]?.price || 0;
    const shipPrice = SHIPPING_METHODS[shippingForm.deliveryMethod]?.price || 0;
    return packPrice + shipPrice;
  };

  const getGrandTotal = () => {
    return getSubtotal() - getDiscountTotal() + getTaxTotal() + getSurcharge();
  };

  // --- Pipeline Operations ---
  const loadSampleData = () => {
    setSelectedEmployee(employees[0]);
    setNewEmployeeMode(false);
    
    const sampleCart = [
      {
        id: 1,
        name: 'Ultra-Bass Wireless Headphones',
        category: 'Electronics',
        price: 89.99,
        qty: 2,
        discount: 10,
        tax: 8,
        total: 174.94
      },
      {
        id: 2,
        name: 'Stainless Steel Insulated Flask',
        category: 'Accessories',
        price: 24.99,
        qty: 1,
        discount: 0,
        tax: 5,
        total: 26.24
      }
    ];
    setCartItems(sampleCart);

    setShippingForm({
      state: 'California',
      address: '742 Evergreen Terrace, Sector 7G',
      packagingType: 'ecobox',
      deliveryMethod: 'express',
      notes: 'Fragile electronics. Leave at the front doorstep.'
    });
    setIsCompiled(false);
  };

  const handleCompileInvoice = async (e) => {
    if (e) e.preventDefault();
    
    if (!selectedEmployee) {
      alert('Please verify and select a wizard employee first!');
      return;
    }
    if (cartItems.length === 0) {
      alert('Cannot compile an empty manifest! Add at least one magic artifact.');
      return;
    }
    if (!shippingForm.address.trim()) {
      alert('Please provide a delivery street address.');
      return;
    }

    setIsCompiled(true);
    
    const newLog = {
      invoiceNumber,
      date: invoiceDate,
      employee: selectedEmployee,
      items: cartItems,
      itemsCount: cartItems.reduce((acc, item) => acc + item.qty, 0),
      grandTotal: getGrandTotal(),
      subTotal: getSubtotal(),
      discountTotal: getDiscountTotal(),
      taxTotal: getTaxTotal(),
      surcharge: getSurcharge(),
      state: shippingForm.state,
      address: shippingForm.address,
      packaging: PACKAGING_OPTIONS[shippingForm.packagingType].name,
      packagingType: shippingForm.packagingType,
      deliveryMethod: shippingForm.deliveryMethod,
      notes: shippingForm.notes,
    };

    api.orders.create(newLog).catch(() => {});
    setInvoiceLogs(prev => [newLog, ...prev]);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to reset the dispatch station?')) {
      setSelectedEmployee(null);
      setCartItems([]);
      setShippingForm({
        state: 'California',
        address: '',
        packagingType: 'polybag',
        deliveryMethod: 'standard',
        notes: ''
      });
      resetInvoiceMeta();
      setCurrentPage('dashboard');
    }
  };

  const getTotalRevenue = () => {
    return invoiceLogs.reduce((acc, log) => acc + log.grandTotal, 0);
  };

  const isEmployeeSelected = !!selectedEmployee;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteEmployee = async (id) => {
    const emp = employees.find(e => e.id === id);
    if (!window.confirm(`Remove ${emp?.name || id} from the circle?`)) return;
    api.employees.remove(id).catch(() => {});
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    if (selectedEmployee?.id === id) {
      setSelectedEmployee(null);
      setIsCompiled(false);
    }
  };

  const startEditLog = (log) => {
    setEditingLogId(log.invoiceNumber);
    setEditLogData({ state: log.state, packaging: log.packaging, notes: log.notes || '' });
  };

  const cancelEditLog = () => {
    setEditingLogId(null);
    setEditLogData({});
  };

  const handleEditChange = (field, value) => {
    setEditLogData(prev => ({ ...prev, [field]: value }));
  };

  const saveLogEdit = () => {
    if (!editingLogId) return;
    setInvoiceLogs(prev => prev.map(log =>
      log.invoiceNumber === editingLogId ? { ...log, ...editLogData } : log
    ));
    api.orders.update(editingLogId, editLogData).catch(() => {});
    setEditingLogId(null);
    setEditLogData({});
  };

  const handleAuth = (userData, token) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('wizago_token');
    localStorage.removeItem('wizago_user');
    setUser(null);
    setCurrentPage('auth');
  };

  return (
    <div className="app-container">
      
      {/* Header Dashboard Info */}
      {currentPage !== 'auth' && (
      <header className="dashboard-header">
        <div className="brand-section">
          <div className="logo-badge">Wizago Shop</div>
          <div className="brand-title">
            <h1>Spells & Curios Terminal</h1>
            <p>Magical inventory, lightning dispatches, and zero potion spills. Spell-cast your manifests!</p>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-pill">
            <Layers size={16} />
            <span>COMPILED: <strong>{invoiceLogs.length}</strong></span>
          </div>

          {user ? (
            <div className="stat-pill" style={{ gap: '0.4rem', cursor: 'pointer', position: 'relative' }} onClick={() => setShowProfilePopup(prev => !prev)}>
              {user.avatar ? (
                <img src={user.avatar} alt="" style={{ width: 22, height: 22, border: '2px solid var(--border-color)', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 22, height: 22, border: '2px solid var(--border-color)', background: 'var(--color-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.65rem' }}>
                  {user.name?.charAt(0)}
                </div>
              )}
              <span style={{ fontSize: '0.75rem' }}>{user.name}</span>
              {showProfilePopup && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }} onClick={() => setShowProfilePopup(false)} />
                  <div className="profile-popup">
                    <div className="profile-popup-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" />
                      ) : (
                        <div className="profile-popup-avatar-letter">{user.name?.charAt(0)}</div>
                      )}
                    </div>
                    <div className="profile-popup-name">{user.name}</div>
                    <div className="profile-popup-email">{user.email}</div>
                    <button className="neo-btn neo-btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setShowProfilePopup(false); handleLogout(); }}>
                      <LogIn size={12} style={{ transform: 'rotate(180deg)' }} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button className="neo-btn neo-btn-sm" onClick={() => setCurrentPage('auth')}>
              <LogIn size={12} />
              <span>Login</span>
            </button>
          )}
          
          {/* Navigation Toggle button to Receipt Page */}
          <button 
            className={`neo-btn neo-btn-sm ${currentPage === 'receipt' ? 'primary' : 'success'}`} 
            onClick={() => setCurrentPage(currentPage === 'receipt' ? 'dashboard' : 'receipt')}
          >
            <FileText size={14} />
            <span>{currentPage === 'receipt' ? '← Back to Forms' : 'Receipt'}</span>
          </button>

          {/* Inject test data */}
          {currentPage === 'dashboard' && (
            <button className="neo-btn neo-btn-sm info" onClick={loadSampleData} title="Inject test data">
              <Database size={14} />
              <span>Load Demo</span>
            </button>
          )}
        </div>
      </header>
      )}

      {/* Main Pages Switcher */}
      {currentPage === 'auth' ? (
        <AuthPage onAuth={handleAuth} onBack={() => setCurrentPage('dashboard')} />
      ) : currentPage === 'dashboard' ? (
        <>
        <div className="main-workspace main-workspace-dashboard">
          
          {/* COLUMN 1: Step 1 Staff Verification */}
          <div className="neo-card">
            <div className="neo-card-header">
              <h2 className="neo-card-title">
                <span className="badge yellow">01</span>
                Staff Verification
              </h2>
              <span className="card-badge">Step 1 of 3</span>
            </div>

            {!newEmployeeMode ? (
              <div className="form-group">
                <label htmlFor="emp-dropdown">Active Witch/Wizard Employee</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    id="emp-dropdown"
                    className="neo-select"
                    value={selectedEmployee ? selectedEmployee.id : ''}
                    onChange={handleEmployeeDropdownChange}
                  >
                    <option value="">-- Choose Staff to Unlock --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id}) &bull; {emp.role}
                      </option>
                    ))}
                    <option value="new">+ Register New Employee...</option>
                  </select>
                  <button 
                    type="button"
                    className="neo-btn" 
                    onClick={() => setNewEmployeeMode(true)}
                    title="Register New Employee"
                  >
                    <UserPlus size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateEmployee}>
                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label>Staff ID <span style={{color: 'var(--color-red)'}}>*</span></label>
                    <input
                      type="text"
                      className="neo-input"
                      placeholder="e.g. EMP-106"
                      value={newEmpData.id}
                      onChange={(e) => setNewEmpData({...newEmpData, id: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Caster Name <span style={{color: 'var(--color-red)'}}>*</span></label>
                    <input
                      type="text"
                      className="neo-input"
                      placeholder="e.g. Albus D."
                      value={newEmpData.name}
                      onChange={(e) => setNewEmpData({...newEmpData, name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label>Wizard Circle</label>
                    <input
                      type="text"
                      className="neo-input"
                      placeholder="e.g. Owl Dispatch"
                      value={newEmpData.dept}
                      onChange={(e) => setNewEmpData({...newEmpData, dept: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Spell Title</label>
                    <input
                      type="text"
                      className="neo-input"
                      placeholder="e.g. Junior Caster"
                      value={newEmpData.role}
                      onChange={(e) => setNewEmpData({...newEmpData, role: e.target.value})}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="neo-btn primary">Save Circle</button>
                  <button type="button" className="neo-btn" onClick={() => setNewEmployeeMode(false)}>Cancel</button>
                </div>
              </form>
            )}

            {selectedEmployee && (
              <div className="employee-active-card" style={{ marginTop: '1.25rem' }}>
                <div className="employee-info-box">
                  <div className="employee-avatar">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="employee-text">
                    <span className="employee-name">{selectedEmployee.name}</span>
                    <span className="employee-role">{selectedEmployee.id} &bull; {selectedEmployee.role}</span>
                  </div>
                </div>
                <span className="badge green" style={{ padding: '0.25rem 0.5rem' }}>
                  {selectedEmployee.dept}
                </span>
              </div>
            )}
          </div>

          {/* COLUMN 2: Step 2 Product Registry & Cart Manifest */}
          <div className={`neo-card ${!isEmployeeSelected ? 'locked-panel' : ''}`} style={{ height: '100%' }}>
            {!isEmployeeSelected && (
              <div className="locked-panel-message">
                <Lock size={14} /> Step 1 Required
              </div>
            )}
            
            <div className="neo-card-header">
              <h2 className="neo-card-title">
                <span className="badge blue">02</span>
                Product Registry
              </h2>
              <span className="card-badge">Step 2 of 3</span>
            </div>

            {/* Quick Templates List */}
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Quick Spell-kits
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {QUICK_PRODUCTS.map((prod, index) => (
                  <button
                    key={index}
                    type="button"
                    className="neo-btn neo-btn-sm"
                    style={{ textTransform: 'none', background: '#fafafa', padding: '0.25rem 0.5rem' }}
                    onClick={() => quickAddProduct(prod)}
                    disabled={!isEmployeeSelected}
                  >
                    <PlusCircle size={10} style={{ color: 'var(--color-blue)' }} />
                    <span>{prod.name.split(' ').slice(-1)[0]} (${prod.price})</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={addProductToCart} style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '1rem' }}>
              <div className="form-row form-row-custom-1">
                <div className="form-group">
                  <label htmlFor="prod-name">Wizago Artifact Name</label>
                  <input
                    id="prod-name"
                    type="text"
                    name="name"
                    className="neo-input"
                    placeholder="e.g. Cauldron"
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    disabled={!isEmployeeSelected}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prod-cat">Category</label>
                  <select
                    id="prod-cat"
                    name="category"
                    className="neo-select"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                    disabled={!isEmployeeSelected}
                  >
                    <option value="Electronics">Magic Tech</option>
                    <option value="Furniture">Witchcraft Furniture</option>
                    <option value="Apparel">Wizard Apparel</option>
                    <option value="Accessories">Caster Accessories</option>
                    <option value="Office Supplies">Wiz-Office Supplies</option>
                  </select>
                </div>
              </div>

              <div className="form-row form-row-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                <div className="form-group">
                  <label htmlFor="prod-price">Price ($)</label>
                  <input
                    id="prod-price"
                    type="number"
                    step="0.01"
                    name="price"
                    className="neo-input text-right"
                    placeholder="0.00"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    disabled={!isEmployeeSelected}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prod-qty">Qty</label>
                  <input
                    id="prod-qty"
                    type="number"
                    min="1"
                    name="qty"
                    className="neo-input text-right"
                    value={productForm.qty}
                    onChange={handleProductFormChange}
                    disabled={!isEmployeeSelected}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prod-disc">Disc%</label>
                  <input
                    id="prod-disc"
                    type="number"
                    min="0"
                    max="100"
                    name="discount"
                    className="neo-input text-right"
                    value={productForm.discount}
                    onChange={handleProductFormChange}
                    disabled={!isEmployeeSelected}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prod-tax">Tax%</label>
                  <input
                    id="prod-tax"
                    type="number"
                    min="0"
                    max="100"
                    name="tax"
                    className="neo-input text-right"
                    value={productForm.tax}
                    onChange={handleProductFormChange}
                    disabled={!isEmployeeSelected}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="neo-btn info" 
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={!isEmployeeSelected}
              >
                <ShoppingBag size={14} /> Add to Cart
              </button>
            </form>

            {/* Current Cart Itemized Table */}
            {cartItems.length > 0 ? (
              <div className="neo-table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="neo-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="num">Price</th>
                      <th className="num">Qty</th>
                      <th className="num">Total</th>
                      <th style={{ width: '30px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td className="num">${item.price.toFixed(2)}</td>
                        <td className="num">{item.qty}</td>
                        <td className="num">${item.total.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="trash-btn"
                            onClick={() => removeCartItem(item.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ marginTop: '0.75rem', padding: '1rem' }}>
                Cart is empty.
              </div>
            )}
          </div>

          {/* COLUMN 3: Step 3 Address, Packaging & Compile Action */}
          <div className={`neo-card ${!isEmployeeSelected ? 'locked-panel' : ''}`}>
            {!isEmployeeSelected && (
              <div className="locked-panel-message">
                <Lock size={14} /> Step 1 Required
              </div>
            )}

            <div className="neo-card-header">
              <h2 className="neo-card-title">
                <span className="badge purple">03</span>
                Address & Post
              </h2>
              <span className="card-badge">Step 3 of 3</span>
            </div>

            <form onSubmit={handleCompileInvoice}>
              <div className="form-row form-row-custom-2">
                <div className="form-group">
                  <label htmlFor="ship-state">State</label>
                  <select
                    id="ship-state"
                    name="state"
                    className="neo-select"
                    value={shippingForm.state}
                    onChange={handleShippingChange}
                    disabled={!isEmployeeSelected}
                  >
                    {STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ship-address">Street Address</label>
                  <input
                    id="ship-address"
                    type="text"
                    name="address"
                    className="neo-input"
                    placeholder="Enter delivery address..."
                    value={shippingForm.address}
                    onChange={handleShippingChange}
                    disabled={!isEmployeeSelected}
                  />
                </div>
              </div>

              {/* Packaging */}
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>Packaging Classification</label>
                <div className="radio-cards-grid" style={{ gridTemplateColumns: '1fr', gap: '0.4rem' }}>
                  {Object.keys(PACKAGING_OPTIONS).slice(0, 3).map((key) => {
                    const opt = PACKAGING_OPTIONS[key];
                    const isSelected = shippingForm.packagingType === key;
                    return (
                      <div
                        key={key}
                        className={`radio-card ${isSelected ? 'selected' : ''} ${!isEmployeeSelected ? 'disabled' : ''}`}
                        onClick={() => handlePackagingSelect(key)}
                        style={{ padding: '0.5rem', gap: '0.5rem' }}
                      >
                        <input
                          type="radio"
                          name="packagingType"
                          checked={isSelected}
                          disabled={!isEmployeeSelected}
                          onChange={() => {}}
                        />
                        <div className="radio-card-content">
                          <span className="radio-card-title" style={{ fontSize: '0.8rem' }}>{opt.name} (+${opt.price.toFixed(2)})</span>
                          <span className="radio-card-desc" style={{ fontSize: '0.65rem' }}>{opt.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Priority */}
              <div className="form-row form-row-2" style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label htmlFor="ship-method">Post Mode</label>
                  <select
                    id="ship-method"
                    name="deliveryMethod"
                    className="neo-select"
                    value={shippingForm.deliveryMethod}
                    onChange={handleShippingChange}
                    disabled={!isEmployeeSelected}
                  >
                    {Object.keys(SHIPPING_METHODS).map((key) => (
                      <option key={key} value={key}>
                        {SHIPPING_METHODS[key].name.split(' ')[0]} (${SHIPPING_METHODS[key].price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ship-notes">Instructions</label>
                  <input
                    id="ship-notes"
                    type="text"
                    name="notes"
                    className="neo-input"
                    placeholder="Notes..."
                    value={shippingForm.notes}
                    onChange={handleShippingChange}
                    disabled={!isEmployeeSelected}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="neo-btn primary" 
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={!isEmployeeSelected}
              >
                <Save size={16} /> Compile Invoice (Press Enter)
              </button>
            </form>

            {/* Compiled success state banner inside Step 3 Card (Do not force redirect) */}
            {isCompiled && (
              <div className="employee-active-card" style={{ background: 'var(--color-green-light)', border: '2px solid var(--border-color)', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.4rem', boxShadow: 'var(--shadow-flat-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold', fontSize: '0.8rem', color: '#1a5f20' }}>
                  <Check size={14} />
                  <span>Invoice Compiled Successfully!</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  <strong>ID:</strong> {invoiceNumber}<br />
                  <strong>Total:</strong> ${getGrandTotal().toFixed(2)}
                </div>
                <button 
                  type="button" 
                  className="neo-btn neo-btn-sm success" 
                  style={{ width: '100%', marginTop: '0.25rem', padding: '0.25rem' }}
                  onClick={() => setCurrentPage('receipt')}
                >
                  <FileText size={10} /> View Paper Receipt
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Invoice compiling history log summary section */}
        {invoiceLogs.length > 0 && (
          <section className="logs-section">
            <h2 style={{ textTransform: 'uppercase', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} />
              Wizago Logs ({invoiceLogs.length} Compiled Today)
            </h2>
            <div className="logs-grid">
              {invoiceLogs.map((log) => (
                <div 
                  key={log.invoiceNumber} 
                  className="log-mini-card"
                  onClick={() => {
                    alert(`Spell Invoice Details for ${log.invoiceNumber}:\n\nCaster: ${log.employee.name} (${log.employee.id})\nDestination State: ${log.state}\nTotal Items: ${log.itemsCount}\nGrand Total: $${log.grandTotal.toFixed(2)}\nPackaging: ${log.packaging}`);
                  }}
                >
                  <div className="log-mini-header">
                    <span className="mono-text">{log.invoiceNumber}</span>
                    <span className="badge green" style={{ padding: '0.05rem 0.25rem', fontSize: '0.65rem' }}>{log.state}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.25rem' }}>
                    <span className="log-mini-total">${log.grandTotal.toFixed(2)}</span>
                    <span className="log-mini-details">{log.itemsCount} items</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Issued by: {log.employee.name}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Registered Wizards Section */}
        <section className="wizards-section">
          <div className="wizards-header">
            <h2 className="wizards-title">
              <UserPlus size={16} />
              Registered Wizards ({employees.length})
            </h2>
            <div className="wizards-actions">
              <button className="neo-btn neo-btn-sm" onClick={scrollToTop}>
                <ArrowUp size={12} />
                New
              </button>
              <button className="neo-btn neo-btn-sm" onClick={() => setShowOrdersPopup(true)}>
                <Eye size={12} />
                Orders
              </button>
            </div>
          </div>

          {employees.length > 0 ? (
            <div className="wizards-grid">
              {employeeOrder.map((id, index) => {
                const emp = employees.find(e => e.id === id);
                if (!emp) return null;
                return (
                  <div key={emp.id} className={`wizard-card ${selectedEmployee?.id === emp.id ? 'active' : ''}`}>
                    <div className="wizard-card-body" onClick={() => {
                      setSelectedEmployee(emp);
                      setNewEmployeeMode(false);
                      setIsCompiled(false);
                    }}>
                      <div className="wizard-avatar">{emp.name.split(' ').map(n => n[0]).join('')}</div>
                      <div className="wizard-info">
                        <span className="wizard-name">{emp.name}</span>
                        <span className="wizard-id">{emp.id} &middot; {emp.role}</span>
                        <span className="wizard-dept">{emp.dept}</span>
                      </div>
                      <span className={`badge ${emp.status === 'On Duty' ? 'green' : 'yellow'}`}>{emp.status}</span>
                    </div>
                    <button className="wizard-delete-btn" onClick={() => deleteEmployee(emp.id)} title="Remove wizard">
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state wizard-empty">
              <UserPlus size={20} />
              <p>No wizards registered yet. Add one in <strong>Staff Verification</strong>!</p>
            </div>
          )}
        </section>

        {/* Orders Popup Modal */}
        {showOrdersPopup && (
          <div className="popup-overlay" onClick={() => { cancelEditLog(); setShowOrdersPopup(false); }}>
            <div className="popup-modal" onClick={e => e.stopPropagation()}>
              <div className="popup-header">
                <h3><FileText size={16} /> All Compiled Orders ({invoiceLogs.length})</h3>
                <button className="neo-btn neo-btn-sm" onClick={() => { cancelEditLog(); setShowOrdersPopup(false); }}><X size={12} /></button>
              </div>
              <div className="popup-body">
                {invoiceLogs.length > 0 ? (
                  <div className="popup-orders-list">
                    {invoiceLogs.map(log => (
                      <div key={log.invoiceNumber} className={`popup-order-item ${editingLogId === log.invoiceNumber ? 'editing' : ''}`}>
                        {editingLogId === log.invoiceNumber ? (
                          <>
                            <div className="popup-order-top">
                              <span className="mono-text" style={{ fontWeight: 700 }}>{log.invoiceNumber}</span>
                              <span className="badge green" style={{ fontSize: '0.6rem' }}>{log.state}</span>
                            </div>
                            <div className="popup-edit-fields">
                              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.65rem' }}>State</label>
                                <select className="neo-select" value={editLogData.state || log.state} onChange={e => handleEditChange('state', e.target.value)} style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}>
                                  {STATES.map(st => <option key={st} value={st}>{st}</option>)}
                                </select>
                              </div>
                              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.65rem' }}>Packaging</label>
                                <select className="neo-select" value={editLogData.packaging || log.packaging} onChange={e => handleEditChange('packaging', e.target.value)} style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}>
                                  {Object.values(PACKAGING_OPTIONS).map(opt => <option key={opt.name} value={opt.name}>{opt.name}</option>)}
                                </select>
                              </div>
                              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.65rem' }}>Notes</label>
                                <input className="neo-input" type="text" value={editLogData.notes || ''} onChange={e => handleEditChange('notes', e.target.value)} placeholder="Optional delivery notes..." style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }} />
                              </div>
                            </div>
                            <div className="popup-order-edit-actions">
                              <button className="neo-btn neo-btn-sm success" onClick={saveLogEdit}><Save size={11} /> Save</button>
                              <button className="neo-btn neo-btn-sm" onClick={cancelEditLog}>Cancel</button>
                            </div>
                            </>
                          ) : (
                            <>
                            <div className="popup-order-top">
                              <span className="mono-text" style={{ fontWeight: 700 }}>{log.invoiceNumber}</span>
                              <span className="badge green" style={{ fontSize: '0.6rem' }}>{log.state}</span>
                            </div>
                            <div className="popup-order-details">
                              <span>Caster: {log.employee.name}</span>
                              <span className="mono-text" style={{ fontWeight: 700 }}>${log.grandTotal.toFixed(2)}</span>
                            </div>
                            <div className="popup-order-meta">
                              <span>{log.date}</span>
                              <span>{log.itemsCount} items &middot; {log.packaging}</span>
                            </div>
                            <button className="popup-order-edit-btn" onClick={() => startEditLog(log)} title="Edit order details">
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{ margin: '1rem', padding: '2rem' }}>
                    <FileText size={24} />
                    <p>No compiled orders yet. Compile an invoice to see it here!</p>
                  </div>
                )}
              </div>
              <div className="popup-footer">
                <button className="neo-btn" onClick={() => { cancelEditLog(); setShowOrdersPopup(false); }}>Close</button>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Revenue: ${getTotalRevenue().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

      </>
      ) : (
        
        /* ------------------ RECEIPT PAGE ------------------ */
        <div className="receipt-page-container">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="neo-btn" onClick={() => setCurrentPage('dashboard')}>
              <ArrowLeft size={16} /> Back to Forms
            </button>
            <span className="badge yellow">Page: Receipt compiler</span>
          </div>

          {isCompiled ? (
            <div className="receipt-sheet">
              {/* Tear off visual edge */}
              <div className="receipt-tear"></div>

              {/* Simple plain receipt header */}
              <div className="receipt-header">
                <h2 className="receipt-title">Wizago Shop Manifest</h2>
                <p className="receipt-subtitle">Official Wizardry Dispatch Receipt</p>
                <p style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                  [STATUS: SPELLED, COMPILED & FILED]
                </p>
              </div>

              {/* Meta identifiers info */}
              <div className="receipt-meta">
                <div className="receipt-meta-col">
                  <span className="receipt-meta-label">Invoice ID</span>
                  <span className="receipt-meta-val mono-text">{invoiceNumber}</span>
                </div>
                <div className="receipt-meta-col text-right">
                  <span className="receipt-meta-label">Spell-Date</span>
                  <span className="receipt-meta-val">{invoiceDate}</span>
                </div>
              </div>

              {/* Verified Issuer Employee Section */}
              <div style={{ marginBottom: '1rem' }}>
                <h3 className="receipt-section-title">Caster/Issuer</h3>
                <div style={{ fontSize: '0.75rem' }}>
                  <strong>{selectedEmployee?.name}</strong> (ID: {selectedEmployee?.id})<br />
                  Circle: {selectedEmployee?.dept} &bull; Title: {selectedEmployee?.role}
                </div>
              </div>

              {/* Registered Items */}
              <div style={{ marginBottom: '1rem' }}>
                <h3 className="receipt-section-title">Spell Cart Items</h3>
                <table className="receipt-items">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th className="num" style={{ width: '40px' }}>Qty</th>
                      <th className="num" style={{ width: '80px' }}>Unit</th>
                      <th className="num" style={{ width: '90px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {item.name}
                          {item.discount > 0 && ` (-${item.discount}%)`}
                        </td>
                        <td className="num">{item.qty}</td>
                        <td className="num">${item.price.toFixed(2)}</td>
                        <td className="num">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Shipping Logistics */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 className="receipt-section-title">Owl Delivery & Packaging</h3>
                <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                  <strong>Address:</strong> {shippingForm.address}, {shippingForm.state}<br />
                  <strong>Packaging:</strong> {PACKAGING_OPTIONS[shippingForm.packagingType].name}<br />
                  <strong>Priority:</strong> {SHIPPING_METHODS[shippingForm.deliveryMethod].name}
                  {shippingForm.notes && (
                    <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      * Instructions: {shippingForm.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Calculations Totals Block */}
              <div className="receipt-totals">
                <div className="receipt-total-row">
                  <span>Subtotal:</span>
                  <span className="mono-text">${getSubtotal().toFixed(2)}</span>
                </div>
                {getDiscountTotal() > 0 && (
                  <div className="receipt-total-row discount" style={{ color: 'var(--color-red)' }}>
                    <span>Discounts:</span>
                    <span className="mono-text">-${getDiscountTotal().toFixed(2)}</span>
                  </div>
                )}
                <div className="receipt-total-row">
                  <span>Post Surcharges:</span>
                  <span className="mono-text">${getSurcharge().toFixed(2)}</span>
                </div>
                <div className="receipt-total-row">
                  <span>Spell Taxes:</span>
                  <span className="mono-text">${getTaxTotal().toFixed(2)}</span>
                </div>
                <div className="receipt-total-row grand">
                  <span>Grand Total:</span>
                  <span className="val">${getGrandTotal().toFixed(2)}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.65rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                May your spells remain strong. Wizago Compliant.
              </div>
            </div>
          ) : (
            <div className="receipt-placeholder">
              <FileText size={44} style={{ color: 'var(--text-muted)' }} />
              <h3 className="receipt-placeholder-title">No compiled spell-invoice</h3>
              <p className="receipt-placeholder-desc">
                Fill the forms in the dashboard panel and click "Compile Invoice" in Step 3 to generate the invoice copy.
              </p>
              <button className="neo-btn primary" onClick={() => setCurrentPage('dashboard')}>
                Go back to forms
              </button>
            </div>
          )}

          {/* Interactive controls */}
          <div className="receipt-actions">
            {isCompiled && (
              <>
                <button className="neo-btn success" onClick={handlePrint}>
                  <Printer size={16} /> Print Receipt
                </button>
                <button className="neo-btn" onClick={handleClearForm}>
                  <RefreshCw size={16} /> Reset Station
                </button>
              </>
            )}
            
            <button 
              className="neo-btn danger" 
              style={{ gridColumn: 'span 2' }} 
              onClick={() => {
                if (window.confirm('Reset all values and clear log?')) {
                  handleClearForm();
                }
              }}
            >
              <X size={16} /> Clear & Start New Draft
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
