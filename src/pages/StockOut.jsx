import React from 'react';
import { mockStockOutRecords, mockProducts } from '../data/product';
import { IconStockOut, IconLayers } from '../components/Icons';

const statusPill = { Shipped: 'pill-green', Pending: 'pill-amber', Cancelled: 'pill-red' };

const StockOut = () => {
  return (
    <div className="view-container">
      <p className="view-subtitle" style={{ marginBottom: 20 }}>
        Reserve and release stock for outgoing orders. The system recommends the oldest available batch
        first so perishable filters never expire on the shelf.
      </p>

      <div className="panel" style={{ marginBottom: '30px' }}>
        <div className="form-grid">
          <div className="form-group">
            <label>Select Product</label>
            <select defaultValue="">
              <option value="" disabled>Select product</option>
              {mockProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Quantity to Issue</label>
            <input type="number" placeholder="0" />
          </div>
        </div>

        <div className="fifo-wireframe-box">
          <h4 className="fifo-title"><IconLayers size={15} /> SYSTEM RECOMMENDATION (FIFO Enforced)</h4>
          <p className="fifo-desc">
            System automatically selects the oldest available stock batch to reduce holding risk.
          </p>
          <div className="batch-card">
            <div>
              <span className="tag">RECOMMENDED BATCH</span>
              <div style={{ fontWeight: '700', marginTop: '4px' }}>Batch #B-1234</div>
            </div>
            <div><strong>Received:</strong> Jan 2025</div>
            <div><strong>Qty Available:</strong> 67 units</div>
            <button className="btn-dark">Use This Batch</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-secondary">Cancel</button>
          <button className="btn-dark btn-with-icon"><IconStockOut size={15} /> Confirm Issue</button>
        </div>
      </div>

      <h3>STOCK-OUT RECORDS</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Batch Used</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockStockOutRecords.map((row) => (
            <tr key={row.id}>
              <td><strong>{row.id}</strong></td>
              <td>{row.product}</td>
              <td>{row.qty}</td>
              <td>{row.batch}</td>
              <td>{row.date}</td>
              <td><span className={`status-pill ${statusPill[row.status] || 'pill-blue'}`}>{row.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockOut;
