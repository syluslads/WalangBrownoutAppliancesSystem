import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockProducts, mockCategories } from '../data/product';
import { canManageProducts } from '../data/permissions';
import { IconSearch, IconPlus, IconEdit, IconTrash, IconLock } from '../components/Icons';

const classPill = { A: 'pill-blue', B: 'pill-violet', C: 'pill-slate' };

const Products = () => {
  const { user } = useOutletContext() || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const canManage = canManageProducts(user?.role);

  const blocked = () => {
    setNotice(`🔒 Only Admin & Purchasing Manager can edit the catalog. You're signed in as ${user?.role}.`);
    clearTimeout(blocked._t);
    blocked._t = setTimeout(() => setNotice(''), 3000);
  };

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

      <div className="table-actions">
        <div className="search-box">
          <IconSearch size={16} />
          <input type="text" placeholder="Search product by name or SKU..." className="search-input" />
        </div>
        <select className="filter-select" defaultValue="">
          <option value="">All Categories</option>
          {mockCategories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        {canManage ? (
          <button className="btn-dark btn-with-icon" onClick={() => setIsModalOpen(true)}>
            <IconPlus size={15} /> Add Product
          </button>
        ) : (
          <button className="btn-secondary btn-with-icon" onClick={blocked}>
            <IconLock size={14} /> Add Product
          </button>
        )}
      </div>

      {notice && <div className="inline-notice">{notice}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Class</th>
            <th>Classification</th>
            <th>Current Stock</th>
            <th>Reorder Point</th>
            <th>Safety Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockProducts.map((prod) => (
            <tr key={prod.id}>
              <td><strong>{prod.id}</strong></td>
              <td>
                {prod.name}
                {prod.isPerishable && <span className="mini-tag">FIFO</span>}
              </td>
              <td>{prod.category}</td>
              <td><span className={`status-pill ${classPill[prod.abcClass]}`}>Class {prod.abcClass}</span></td>
              <td><span className="status-pill pill-outline">{prod.classification}</span></td>
              <td className={prod.currentStock <= prod.reorderPoint ? 'stock-low' : ''}>
                {prod.currentStock} units
              </td>
              <td>{prod.reorderPoint} units</td>
              <td>{prod.safetyStock} units</td>
              <td>
                {canManage ? (
                  <>
                    <button className="btn-micro"><IconEdit size={13} /></button>
                    <button className="btn-micro danger"><IconTrash size={13} /></button>
                  </>
                ) : (
                  <button className="btn-micro" disabled title="View-only for your role">
                    <IconLock size={13} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && canManage && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" placeholder="e.g. Portable AC Unit 1.0HP" />
                </div>
                <div className="form-group">
                  <label>Product ID / SKU</label>
                  <input type="text" placeholder="e.g. SKU-1005" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select defaultValue="">
                    <option value="" disabled>Select category</option>
                    {mockCategories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>ABC Class</label>
                  <select defaultValue="">
                    <option value="" disabled>Select class</option>
                    <option value="A">A — High value, high sales</option>
                    <option value="B">B — Moderate value & demand</option>
                    <option value="C">C — Low value, slow-moving</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reorder Point</label>
                  <input type="number" placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Safety Stock</label>
                  <input type="number" placeholder="0" />
                </div>
              </div>

              <label className="checkboxLabelPlain">
                <input type="checkbox" />
                This product is perishable (enforce FIFO picking)
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-dark">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
