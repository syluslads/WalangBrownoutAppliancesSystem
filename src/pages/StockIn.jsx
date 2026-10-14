import React, { useState, useEffect } from 'react';
import { getProducts, stockIn, getStockInHistory } from '../lib/api';
import { IconBarcode, IconStockIn } from '../components/Icons';

const StockIn = () => {
  // Form state
  const [productId,    setProductId]    = useState('');
  const [batchNumber,  setBatchNumber]  = useState('');
  const [quantity,     setQuantity]     = useState('');
  const [location,     setLocation]     = useState('');
  const [mfgDate,      setMfgDate]      = useState('');
  const [expDate,      setExpDate]      = useState('');
  const [unitCost,     setUnitCost]     = useState('');
  const [notes,        setNotes]        = useState('');
  const [skuInput,     setSkuInput]     = useState('');

  const [customBatch, setCustomBatch] = useState(false);
  const [customLoc, setCustomLoc]     = useState(false);

  const suggestedBatches = [
    'BATCH-2026-10-A',
    'BATCH-2026-10-B',
    'BATCH-2026-10-C',
    'LOT-PHIL-2026-01',
    'RESTOCK-Q4-2026',
    'IMPORT-SEA-2026',
  ];

  const warehouseLocations = [
    'Zone A - Rack 01 (Fast-Moving)',
    'Zone A - Rack 02 (High-Value / A Items)',
    'Zone B - Shelf 01 (Air Treatment / B Items)',
    'Zone B - Shelf 02 (Climate-Controlled / Filters)',
    'Zone C - Floor Pallet 01 (Heavy Units / ACs)',
    'Zone C - Rack 04 (Accessories / C Items)',
    'Showroom Demo Floor',
    'Quarantine / Return Bay',
  ];
  const [products,     setProducts]     = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');

  // History panel
  const [history,      setHistory]      = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const selectedProduct = products.find(p => String(p.id) === String(productId));

  // Load products on mount
  useEffect(() => {
    setProductsLoading(true);
    getProducts()
      .then(res => setProducts(res.data || []))
      .catch(() => setError('Could not load product list from server.'))
      .finally(() => setProductsLoading(false));
  }, []);

  // Load history when a product is selected
  useEffect(() => {
    if (!productId) { setHistory([]); return; }
    setHistoryLoading(true);
    getStockInHistory(productId)
      .then(data => setHistory(data.batches || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [productId]);

  // Barcode / SKU lookup: match product by SKU
  const handleSkuLookup = (e) => {
    if (e.key !== 'Enter') return;
    const sku = skuInput.trim();
    if (!sku) return;
    const match = products.find(p => p.sku?.toLowerCase() === sku.toLowerCase());
    if (match) {
      setProductId(String(match.id));
      setError('');
    } else {
      setError(`No product found with SKU "${sku}".`);
    }
  };

  const handleClear = () => {
    setProductId('');
    setBatchNumber('');
    setQuantity('');
    setLocation('');
    setMfgDate('');
    setExpDate('');
    setUnitCost('');
    setNotes('');
    setSkuInput('');
    setError('');
    setSuccess('');
    setHistory([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!productId)                { setError('Please select a product.'); return; }
    if (!quantity || Number(quantity) < 1) { setError('Quantity must be at least 1.'); return; }
    if (selectedProduct?.is_perishable && !expDate) {
      setError('Expiration date is required for perishable products.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await stockIn({
        product_id:      Number(productId),
        quantity:        Number(quantity),
        batch_number:    batchNumber  || undefined,
        location:        location     || undefined,
        received_date:   mfgDate      || new Date().toISOString().split('T')[0],
        expiration_date: expDate      || undefined,
        unit_cost:       unitCost     ? Number(unitCost) : undefined,
        notes:           notes        || undefined,
      });

      const newStock = result.data?.product?.current_stock;
      setSuccess(
        `✓ Stock-in recorded! New stock for "${result.data?.product?.name ?? 'product'}": ${newStock ?? '?'} units.`
      );
      window.dispatchEvent(new CustomEvent('wb:refresh-alerts'));

      // Refresh batch history
      if (productId) {
        getStockInHistory(productId)
          .then(data => setHistory(data.batches || []))
          .catch(() => {});
      }

      // Reset form (keep product selected)
      setBatchNumber('');
      setQuantity('');
      setLocation('');
      setMfgDate('');
      setExpDate('');
      setUnitCost('');
      setNotes('');
      setSkuInput('');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {}).flat()[0] ||
        'Stock-in failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="view-container">
      <p className="view-subtitle" style={{ marginBottom: 20 }}>
        Log an incoming shipment. Batch, manufacturing, and expiration dates are captured here so the
        Expiry &amp; FIFO Alert System can track perishable filters automatically.
      </p>

      <div className="panel">
        {/* Barcode scan row */}
        <div className="scan-row">
          <span className="scan-icon"><IconBarcode size={18} /></span>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Scan Barcode / SKU (press Enter to look up)</label>
            <input
              type="text"
              placeholder="Scan or type SKU and press Enter…"
              value={skuInput}
              onChange={e => { setSkuInput(e.target.value); setError(''); }}
              onKeyDown={handleSkuLookup}
              disabled={submitting || productsLoading}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginTop: 22 }}>
            <div className="form-group">
              <label>Product *</label>
              {productsLoading ? (
                <select disabled><option>Loading products…</option></select>
              ) : (
                <select
                  value={productId}
                  onChange={e => { setProductId(e.target.value); setError(''); setSuccess(''); }}
                  disabled={submitting}
                >
                  <option value="" disabled>Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku || `ID:${p.id}`}) — {p.current_stock ?? 0} in stock
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Batch Number</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, cursor: 'pointer', padding: 0 }}
                  onClick={() => { setCustomBatch(!customBatch); if (!customBatch) setBatchNumber(''); }}
                >
                  {customBatch ? '← Pick from list' : '+ Custom Batch'}
                </button>
              </div>
              {customBatch ? (
                <input
                  type="text"
                  placeholder="e.g. BATCH-2026-X"
                  value={batchNumber}
                  onChange={e => setBatchNumber(e.target.value)}
                  disabled={submitting}
                  autoFocus
                />
              ) : (
                <select
                  value={batchNumber}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setCustomBatch(true);
                      setBatchNumber('');
                    } else {
                      setBatchNumber(e.target.value);
                    }
                  }}
                  disabled={submitting}
                >
                  <option value="">Select or choose suggested batch…</option>
                  {suggestedBatches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="__custom__">+ Enter Custom Batch Number…</option>
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Quantity Received *</label>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={quantity}
                onChange={e => { setQuantity(e.target.value); setError(''); }}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Warehouse Location</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, cursor: 'pointer', padding: 0 }}
                  onClick={() => { setCustomLoc(!customLoc); if (!customLoc) setLocation(''); }}
                >
                  {customLoc ? '← Pick from list' : '+ Custom Location'}
                </button>
              </div>
              {customLoc ? (
                <input
                  type="text"
                  placeholder="e.g. Bin X-12"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  disabled={submitting}
                  autoFocus
                />
              ) : (
                <select
                  value={location}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setCustomLoc(true);
                      setLocation('');
                    } else {
                      setLocation(e.target.value);
                    }
                  }}
                  disabled={submitting}
                >
                  <option value="">Select warehouse location…</option>
                  {warehouseLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                  <option value="__custom__">+ Enter Custom Location…</option>
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Unit Cost (₱)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={unitCost}
                onChange={e => setUnitCost(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Received Date</label>
              <input
                type="date"
                value={mfgDate}
                onChange={e => setMfgDate(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>
                Expiration Date
                {selectedProduct?.is_perishable && (
                  <span style={{ color: '#dc2626', marginLeft: 4 }}>*</span>
                )}
              </label>
              <input
                type="date"
                value={expDate}
                onChange={e => { setExpDate(e.target.value); setError(''); }}
                disabled={submitting}
              />
              <span className="field-hint">
                {selectedProduct?.is_perishable
                  ? '⚠️ Required — this is a perishable product.'
                  : 'Only required for perishable items (e.g. air purifier filters).'}
              </span>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <input
                type="text"
                placeholder="Optional notes…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          {error   && <div className="inline-notice" style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', marginTop: 12 }}>⚠️ {error}</div>}
          {success && <div className="inline-notice" style={{ background: '#dcfce7', color: '#166534', borderColor: '#86efac', marginTop: 12 }}>{success}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={handleClear} disabled={submitting}>Clear</button>
            <button type="submit" className="btn-dark btn-with-icon" disabled={submitting || productsLoading}>
              <IconStockIn size={15} /> {submitting ? 'Saving…' : 'Confirm Receiving'}
            </button>
          </div>
        </form>
      </div>

      {/* Batch History for selected product */}
      {selectedProduct && (
        <div className="panel" style={{ marginTop: 24 }}>
          <h3>BATCH HISTORY — {selectedProduct.name}</h3>
          {historyLoading ? (
            <p className="view-subtitle">Loading history…</p>
          ) : history.length === 0 ? (
            <p className="view-subtitle">No batches received yet for this product.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch #</th>
                  <th>Received Date</th>
                  <th>Expiration Date</th>
                  <th>Qty Received</th>
                  <th>Qty Available</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {history.map(batch => (
                  <tr key={batch.id}>
                    <td><strong>{batch.batch_number || `—`}</strong></td>
                    <td>{batch.received_date || '—'}</td>
                    <td>{batch.expiration_date || '—'}</td>
                    <td>{batch.quantity_received}</td>
                    <td>
                      <span className={`status-pill ${batch.quantity_available > 0 ? 'pill-green' : 'pill-gray'}`}>
                        {batch.quantity_available}
                      </span>
                    </td>
                    <td>{batch.location || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default StockIn;
