import React from 'react';
import { mockStockOutRecords } from '../data/product';

const StockOut = () => {
  return (
    <div className="view-container">
      <h2>Stock-Out & Dispatch</h2>

      <div className="panel" style={{ marginBottom: '30px' }}>
        <div className="form-grid">
          <div className="form-group">
            <label>Select Product</label>
            <input type="text" placeholder="Search product name..." />
          </div>
          <div className="form-group">
            <label>Quantity Issue</label>
            <input type="number" placeholder="0" />
          </div>
        </div>

        <div className="fifo-wireframe-box">
          <h4 style={{ color: '#1e40af', fontSize: '13px' }}>SYSTEM RECOMMENDATION (FIFO Enforced)</h4>
          <p style={{ color: '#3b82f6', fontSize: '12px', margin: '4px 0 10px' }}>
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
          <button className="btn-dark">Confirm Issue</button>
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
              <td><span className="status-pill">{row.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockOut;