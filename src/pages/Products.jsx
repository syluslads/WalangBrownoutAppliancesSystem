import React, { useState } from 'react';
import { mockProducts } from '../data/product';

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="view-container">
      <h2>Product Catalog</h2>

      <div className="table-actions">
        <div className="search-box">
          <span>🔍</span>
          <input type="text" placeholder="Search product by name or SKU..." className="search-input" />
        </div>
        <button className="btn-dark" onClick={() => setIsModalOpen(true)}>+ Add Product</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Current Stock</th>
            <th>ROP Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockProducts.map((prod, index) => (
            <tr key={index}>
              <td><strong>{prod.id}</strong></td>
              <td>{prod.name}</td>
              <td>{prod.category}</td>
              <td>{prod.currentStock}</td>
              <td><span className="status-pill">{prod.ropType}</span></td>
              <td>
                <button className="btn-micro">Edit</button>
                <button className="btn-micro" style={{ color: '#ef4444' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" placeholder="e.g. Inverter Generator" />
              </div>
              <div className="form-group">
                <label>Product ID / SKU</label>
                <input type="text" placeholder="e.g. SKU-9021" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select defaultValue="">
                  <option value="" disabled>Select category</option>
                  <option value="generators">Generators</option>
                  <option value="batteries">Batteries</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
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