import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, getSuppliers } from '../lib/api';
import { canManageProducts } from '../data/permissions';
import { IconSearch, IconPlus, IconEdit, IconTrash, IconLock } from '../components/Icons';

const classPill = { A: 'pill-blue', B: 'pill-violet', C: 'pill-slate' };

// ---------------------------------------------------------------------------
// Add / Edit Product Modal
// ---------------------------------------------------------------------------
const ProductModal = ({ product, categories, suppliers, onClose, onSaved }) => {
  const isEdit = Boolean(product);
  const [customUnit, setCustomUnit] = useState(false);
  const [form, setForm] = useState({
    sku:           product?.sku           ?? '',
    name:          product?.name          ?? '',
    description:   product?.description   ?? '',
    category_id:   product?.category?.id  ?? (categories[0]?.id ? String(categories[0].id) : ''),
    supplier_id:   product?.supplier?.id  ?? (suppliers[0]?.id ? String(suppliers[0].id) : ''),
    unit:          product?.unit          ?? 'unit',
    unit_price:    product?.unit_price    ?? '',
    reorder_point: product?.reorder_point ?? '',
    safety_stock:  product?.safety_stock  ?? '',
    is_perishable: product?.is_perishable ?? false,
    abc_class:     product?.abc_class     ?? 'C',
    is_active:     product?.is_active     ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const unitChoices = [
    'unit',
    'box (10 pcs)',
    'box (20 pcs)',
    'set',
    'carton (24 pcs)',
    'roll',
    'pallet',
    'kg',
  ];

  const skuPatterns = [
    'SKU-AC-1003',
    'SKU-TH-2003',
    'SKU-AP-3003',
    'SKU-FL-4003',
    'SKU-SOL-5003',
    'SKU-APP-6001',
    'SKU-ELEC-7001',
  ];

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleGenerateSku = () => {
    const selectedCat = categories.find(c => String(c.id) === String(form.category_id));
    const prefix = selectedCat?.name?.includes('AC') ? 'SKU-AC'
      : selectedCat?.name?.includes('Thermo') ? 'SKU-TH'
      : selectedCat?.name?.includes('Purif') ? 'SKU-AP'
      : selectedCat?.name?.includes('Filter') ? 'SKU-FL'
      : selectedCat?.name?.includes('Solar') ? 'SKU-SOL'
      : 'SKU-WB';
    const rand = Math.floor(1000 + Math.random() * 9000);
    set('sku', `${prefix}-${rand}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.sku.trim())         { setError('SKU is required.'); return; }
    if (!form.name.trim())        { setError('Product name is required.'); return; }
    if (!form.category_id)        { setError('Please select a category.'); return; }
    if (!form.supplier_id)        { setError('Please select a supplier.'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        category_id:   Number(form.category_id),
        supplier_id:   Number(form.supplier_id),
        unit_price:    form.unit_price    !== '' ? Number(form.unit_price)    : null,
        reorder_point: form.reorder_point !== '' ? Number(form.reorder_point) : null,
        safety_stock:  form.safety_stock  !== '' ? Number(form.safety_stock)  : null,
      };
      if (isEdit) {
        const res = await updateProduct(product.id, payload);
        onSaved(res.data, 'update');
      } else {
        const res = await createProduct(payload);
        onSaved(res.data, 'create');
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {}).flat()[0]
        || 'Failed to save product.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {error && (
          <div className="inline-notice" style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', marginBottom: 12 }}>
            ⚠️ {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input type="text" placeholder="e.g. Portable AC Unit 1.0HP" value={form.name} onChange={e => set('name', e.target.value)} disabled={saving} />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>SKU *</label>
                {!isEdit && (
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, cursor: 'pointer', padding: 0 }}
                    onClick={handleGenerateSku}
                  >
                    ⚡ Auto-Generate
                  </button>
                )}
              </div>
              <input type="text" placeholder="e.g. SKU-1005" value={form.sku} onChange={e => set('sku', e.target.value)} disabled={saving || isEdit} />
              {!isEdit && (
                <div style={{ marginTop: 4 }}>
                  <select
                    style={{ fontSize: 12, padding: '4px 8px' }}
                    value=""
                    onChange={e => { if (e.target.value) set('sku', e.target.value); }}
                    disabled={saving}
                  >
                    <option value="">Or choose SKU template…</option>
                    {skuPatterns.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)} disabled={saving}>
                <option value="" disabled>Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Supplier *</label>
              <select value={form.supplier_id} onChange={e => set('supplier_id', e.target.value)} disabled={saving}>
                <option value="" disabled>Select supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Unit</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, cursor: 'pointer', padding: 0 }}
                  onClick={() => { setCustomUnit(!customUnit); if (!customUnit) set('unit', ''); }}
                >
                  {customUnit ? '← Choose from list' : '+ Custom Unit'}
                </button>
              </div>
              {customUnit ? (
                <input
                  type="text"
                  placeholder="e.g. pack, barrel"
                  value={form.unit}
                  onChange={e => set('unit', e.target.value)}
                  disabled={saving}
                  autoFocus
                />
              ) : (
                <select
                  value={form.unit}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setCustomUnit(true);
                      set('unit', '');
                    } else {
                      set('unit', e.target.value);
                    }
                  }}
                  disabled={saving}
                >
                  {unitChoices.map(u => <option key={u} value={u}>{u}</option>)}
                  <option value="__custom__">+ Custom Unit…</option>
                </select>
              )}
            </div>
            <div className="form-group">
              <label>Unit Price (₱)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.unit_price} onChange={e => set('unit_price', e.target.value)} disabled={saving} />
            </div>
            <div className="form-group">
              <label>Reorder Point</label>
              <input type="number" min="0" placeholder="0" value={form.reorder_point} onChange={e => set('reorder_point', e.target.value)} disabled={saving} />
            </div>
            <div className="form-group">
              <label>Safety Stock</label>
              <input type="number" min="0" placeholder="0" value={form.safety_stock} onChange={e => set('safety_stock', e.target.value)} disabled={saving} />
            </div>
            <div className="form-group">
              <label>ABC Classification</label>
              <select value={form.abc_class} onChange={e => set('abc_class', e.target.value)} disabled={saving}>
                <option value="A">Class A (High Value &amp; Sales)</option>
                <option value="B">Class B (Moderate Demand)</option>
                <option value="C">Class C (Low Value / Slow)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Product Status</label>
              <select value={form.is_active ? 'active' : 'inactive'} onChange={e => set('is_active', e.target.value === 'active')} disabled={saving}>
                <option value="active">Active (Available for Operations)</option>
                <option value="inactive">Inactive (Archived)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 4 }}>
            <label>Description</label>
            <input type="text" placeholder="Optional description or model specifications" value={form.description} onChange={e => set('description', e.target.value)} disabled={saving} />
          </div>

          <div className="modal-checkbox-row">
            <label className="checkbox-toggle-card">
              <input type="checkbox" checked={form.is_perishable} onChange={e => set('is_perishable', e.target.checked)} disabled={saving} />
              <div className="checkbox-toggle-text">
                <span className="checkbox-toggle-label">Perishable Inventory</span>
                <span className="checkbox-toggle-desc">Enforce FIFO picking &amp; track expiration dates</span>
              </div>
            </label>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-dark" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Update Product' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Products Component
// ---------------------------------------------------------------------------
const Products = () => {
  const { user }         = useOutletContext() || {};
  const [searchParams]   = useSearchParams();
  const canManage        = canManageProducts(user?.role);

  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [notice, setNotice]         = useState('');

  // Filters
  const [search, setSearch]         = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const res = await getProducts(params);
      setProducts(res.data || []);
    } catch {
      setError('Could not load products from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load categories + suppliers once
  useEffect(() => {
    Promise.all([getCategories(), getSuppliers()])
      .then(([cats, sups]) => {
        setCategories(cats || []);
        setSuppliers(sups || []);
      })
      .catch(() => {});
  }, []);

  // Initial product load (including search from URL params)
  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearch(query);
    const initialParams = {};
    if (query) initialParams.search = query;
    fetchProducts(initialParams);
  }, [fetchProducts, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts({
      search:      search      || undefined,
      category_id: categoryFilter || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    fetchProducts({});
  };

  const handleSaved = (savedProduct, action) => {
    if (action === 'create') {
      setProducts(prev => [savedProduct, ...prev]);
      showNotice('✓ Product added successfully.');
    } else {
      setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
      showNotice('✓ Product updated successfully.');
    }
    window.dispatchEvent(new CustomEvent('wb:refresh-alerts'));
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone (or the product will be deactivated if it has inventory records).`)) return;
    try {
      const res = await deleteProduct(product.id);
      if (res.data) {
        // Was deactivated instead of deleted
        setProducts(prev => prev.map(p => p.id === product.id ? res.data : p));
        showNotice('ℹ️ Product has inventory records — it was deactivated instead of deleted.');
      } else {
        setProducts(prev => prev.filter(p => p.id !== product.id));
        showNotice('✓ Product deleted.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete product.';
      showNotice(`⚠️ ${msg}`);
    }
  };

  const blocked = () => {
    showNotice(`🔒 Only Admin & Purchasing Manager can edit the catalog. You're signed in as ${user?.role}.`);
  };

  const showNotice = (msg) => {
    setNotice(msg);
    clearTimeout(showNotice._t);
    showNotice._t = setTimeout(() => setNotice(''), 4000);
  };

  const openAdd  = () => { setEditingProduct(null); setModalOpen(true); };
  const openEdit = (p) => { setEditingProduct(p);   setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingProduct(null); };

  return (
    <div className="view-container">
      <div className="panel-header-row" style={{ marginBottom: 4 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Product Catalog</h2>
          <p className="view-subtitle" style={{ marginBottom: 20 }}>
            Every item's ABC class, seasonal/perishable classification, and reorder settings in one place.
            {!canManage && ' Your role has view-only access to this catalog.'}
          </p>
        </div>
      </div>

      <form className="table-actions" onSubmit={handleSearch}>
        <div className="search-box">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Search by name or SKU…"
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" className="btn-secondary">Filter</button>
        {(search || categoryFilter) && (
          <button type="button" className="btn-secondary" onClick={handleClearFilters}>Clear</button>
        )}
        {canManage ? (
          <button type="button" className="btn-dark btn-with-icon" onClick={openAdd}>
            <IconPlus size={15} /> Add Product
          </button>
        ) : (
          <button type="button" className="btn-secondary btn-with-icon" onClick={blocked}>
            <IconLock size={14} /> Add Product
          </button>
        )}
      </form>

      {notice && (
        <div className="inline-notice" style={{
          background: notice.startsWith('✓') ? '#dcfce7' : notice.startsWith('ℹ') ? '#e0f2fe' : notice.startsWith('⚠') ? '#fee2e2' : undefined,
          color:      notice.startsWith('✓') ? '#166534' : notice.startsWith('ℹ') ? '#0369a1' : notice.startsWith('⚠') ? '#991b1b' : undefined,
          borderColor: notice.startsWith('✓') ? '#86efac' : notice.startsWith('ℹ') ? '#7dd3fc' : notice.startsWith('⚠') ? '#fca5a5' : undefined,
        }}>
          {notice}
        </div>
      )}
      {error && (
        <div className="inline-notice" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' }}>
          ⚠️ {error}
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Supplier</th>
            <th>ABC</th>
            <th>Current Stock</th>
            <th>Reorder Point</th>
            <th>Safety Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={10} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0' }}>Loading products…</td></tr>
          ) : products.length === 0 ? (
            <tr><td colSpan={10} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0' }}>No products found.</td></tr>
          ) : products.map(prod => (
            <tr key={prod.id}>
              <td><strong>{prod.sku}</strong></td>
              <td>
                {prod.name}
                {prod.is_perishable && <span className="mini-tag">FIFO</span>}
              </td>
              <td>{prod.category?.name || '—'}</td>
              <td>{prod.supplier?.name || '—'}</td>
              <td>
                {prod.abc_class
                  ? <span className={`status-pill ${classPill[prod.abc_class] || 'pill-slate'}`}>Class {prod.abc_class}</span>
                  : '—'
                }
              </td>
              <td className={prod.current_stock <= prod.reorder_point ? 'stock-low' : ''}>
                {prod.current_stock ?? 0} units
              </td>
              <td>{prod.reorder_point ?? '—'}</td>
              <td>{prod.safety_stock ?? '—'}</td>
              <td>
                <span className={`status-pill ${prod.is_active ? 'pill-green' : 'pill-gray'}`}>
                  {prod.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                {canManage ? (
                  <>
                    <button className="btn-micro" onClick={() => openEdit(prod)} title="Edit"><IconEdit size={13} /></button>
                    <button className="btn-micro danger" onClick={() => handleDelete(prod)} title="Delete"><IconTrash size={13} /></button>
                  </>
                ) : (
                  <button className="btn-micro" disabled title="View-only for your role"><IconLock size={13} /></button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          suppliers={suppliers}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default Products;
