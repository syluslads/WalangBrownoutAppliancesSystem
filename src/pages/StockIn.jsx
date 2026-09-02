import React from 'react';
import { mockProducts } from '../data/product';
import { IconBarcode, IconStockIn } from '../components/Icons';

const StockIn = () => {
  return (
    <div className="view-container">
      <p className="view-subtitle" style={{ marginBottom: 20 }}>
        Log an incoming shipment. Batch, manufacturing, and expiration dates are captured here so the
        Expiry &amp; FIFO Alert System can track perishable filters automatically.
      </p>

      <div className="panel">
        <div className="scan-row">
          <span className="scan-icon"><IconBarcode size={18} /></span>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Scan Barcode / SKU</label>
            <input type="text" placeholder="Scan or type barcode here..." />
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: 22 }}>
          <div className="form-group">
            <label>Product</label>
            <select defaultValue="">
              <option value="" disabled>Select product</option>
              {mockProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Batch Number</label>
            <input type="text" placeholder="e.g. BATCH-2026-A" />
          </div>
          <div className="form-group">
            <label>Quantity Received</label>
            <input type="number" placeholder="0" />
          </div>
          <div className="form-group">
            <label>Warehouse Location</label>
            <input type="text" placeholder="e.g. Rack A-1" />
          </div>
          <div className="form-group">
            <label>Manufacturing Date</label>
            <input type="date" />
          </div>
          <div className="form-group">
            <label>Expiration Date</label>
            <input type="date" />
            <span className="field-hint">Only required for perishable items (e.g. air purifier filters).</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
          <button className="btn-secondary">Clear</button>
          <button className="btn-dark btn-with-icon"><IconStockIn size={15} /> Confirm Receiving</button>
        </div>
      </div>
    </div>
  );
};

export default StockIn;
