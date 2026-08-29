import React from 'react';

const StockIn = () => {
  return (
    <div className="view-container">
      <h2>Stock-In Operations</h2>

      <div className="panel">
        <div className="form-group">
          <label>Scan Barcode / SKU</label>
          <input type="text" placeholder="Scan or type barcode here..." />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Batch Number</label>
            <input type="text" placeholder="e.g. BATCH-2026-A" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input type="text" placeholder="Category" />
          </div>
          <div className="form-group">
            <label>Quantity Received</label>
            <input type="number" placeholder="0" />
          </div>
          <div className="form-group">
            <label>Manufacturing Date</label>
            <input type="date" />
          </div>
          <div className="form-group">
            <label>Warehouse Location</label>
            <input type="text" placeholder="e.g. Rack A-1" />
          </div>
          <div className="form-group">
            <label>Expiration Date</label>
            <input type="date" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <button className="btn-secondary">Clear</button>
          <button className="btn-dark">Confirm Receiving</button>
        </div>
      </div>
    </div>
  );
};

export default StockIn;