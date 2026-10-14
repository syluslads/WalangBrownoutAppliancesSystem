import React, { useState, useEffect } from 'react';
import { stockOut, getStockOutRecords, getProducts } from '../lib/api';
import { mockStockOutRecords, mockProducts } from '../data/product';
import { IconStockOut, IconLayers } from '../components/Icons';

const StockOut = () => {
  // Form state
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity]   = useState('');
  const [reason, setReason]       = useState('');
  const [customReason, setCustomReason] = useState(false);
  const [notes, setNotes]         = useState('');

  const reasonChoices = [
    'Customer Order Fulfillment',
    'Store Branch Replenishment',
    'Damaged / Defective Stock Return',
    'Expired Batch Removal (FIFO)',
    'Cycle Count Discrepancy Adjustment',
    'Showroom Demo Unit',
    'Supplier Return / Warranty',
  ];

  // Page state
  const [products, setProducts]   = useState([]);
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // Selected product details (for the FIFO preview)
  const selectedProduct = products.find((p) => String(p.id) === String(productId));

  // Load products and existing stock-out records on mount.
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    Promise.all([getProducts(), getStockOutRecords()])
      .then(([productRes, recordRes]) => {
        if (cancelled) return;
        setProducts(productRes.data || []);
        // paginated response: recordRes is the paginated object
        setRecords(recordRes.data || []);
      })
      .catch(() => {
        if (!cancelled) {
          // Fall back to mock data if API is unavailable.
          setProducts(mockProducts.map((p, i) => ({ id: i + 1, name: p.name, sku: p.id, current_stock: p.currentStock, is_perishable: p.isPerishable })));
          setRecords(mockStockOutRecords.map((r, i) => ({
            id: r.id,
            product: { name: r.product },
            quantity_fulfilled: r.qty,
            allocations: [{ batch: { batch_number: r.batch } }],
            created_at: r.date,
          })));
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!productId) { setError('Please select a product.'); return; }
    if (!quantity || Number(quantity) < 1) { setError('Please enter a valid quantity (at least 1).'); return; }

    setSubmitting(true);
    try {
      const result = await stockOut({
        product_id: Number(productId),
        quantity:   Number(quantity),
        reason:     reason || undefined,
        notes:      notes  || undefined,
      });

      setSuccess(
        `Stock-out recorded. ${result.data?.product?.current_stock ?? ''} unit(s) now available for ${result.data?.product?.name ?? 'this product'}.`
      );
      window.dispatchEvent(new CustomEvent('wb:refresh-alerts'));

      // Refresh records list
      const updated = await getStockOutRecords();
      setRecords(updated.data || []);

      // Reset form
      setProductId('');
      setQuantity('');
      setReason('');
      setNotes('');
    } catch (err) {
      const apiMsg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {}).flat()[0];
      setError(apiMsg || 'Stock-out failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setProductId('');
    setQuantity('');
    setReason('');
    setNotes('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="view-container">
      <p className="view-subtitle" style={{ marginBottom: 20 }}>
        Reserve and release stock for outgoing orders. The system uses FIFO — it automatically
        consumes the oldest eligible batch first so perishable filters never expire on the shelf.
      </p>

      {/* Stock-Out Form */}
      <div className="panel" style={{ marginBottom: '30px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="so-product">Select Product</label>
              <select
                id="so-product"
                value={productId}
                onChange={(e) => { setProductId(e.target.value); setError(''); setSuccess(''); }}
                disabled={submitting}
              >
                <option value="" disabled>Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku || `ID:${p.id}`}) — {p.current_stock ?? '?'} in stock
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="so-qty">Quantity to Issue</label>
              <input
                id="so-qty"
                type="number"
                min="1"
                placeholder="0"
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); setError(''); setSuccess(''); }}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="so-reason">Reason</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, cursor: 'pointer', padding: 0 }}
                  onClick={() => { setCustomReason(!customReason); if (!customReason) setReason(''); }}
                >
                  {customReason ? '← Pick from list' : '+ Custom Reason'}
                </button>
              </div>
              {customReason ? (
                <input
                  id="so-reason"
                  type="text"
                  placeholder="e.g. Warranty swap or emergency replacement"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={submitting}
                  autoFocus
                />
              ) : (
                <select
                  id="so-reason"
                  value={reason}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setCustomReason(true);
                      setReason('');
                    } else {
                      setReason(e.target.value);
                    }
                  }}
                  disabled={submitting}
                >
                  <option value="">Select dispatch / issue reason…</option>
                  {reasonChoices.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  <option value="__custom__">+ Enter Custom Reason…</option>
                </select>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="so-notes">Notes (optional)</label>
              <input
                id="so-notes"
                type="text"
                placeholder="Additional notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          {/* FIFO info box */}
          {selectedProduct && (
            <div className="fifo-wireframe-box">
              <h4 className="fifo-title"><IconLayers size={15} /> FIFO ENFORCEMENT ACTIVE</h4>
              <p className="fifo-desc">
                The system will automatically consume the oldest available batch first
                {selectedProduct.is_perishable
                  ? ' — ordered by earliest expiration date for this perishable product.'
                  : ' — ordered by earliest received date.'}
              </p>
              <div className="batch-card">
                <div>
                  <span className="tag">SELECTED PRODUCT</span>
                  <div style={{ fontWeight: '700', marginTop: '4px' }}>{selectedProduct.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>SKU: {selectedProduct.sku}</div>
                </div>
                <div>
                  <strong>Available:</strong>{' '}
                  <span style={{ color: selectedProduct.current_stock > 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                    {selectedProduct.current_stock ?? '?'} units
                  </span>
                </div>
                {selectedProduct.is_perishable && (
                  <div><span className="mini-tag">FIFO</span> Perishable — expiry-first picking</div>
                )}
              </div>
            </div>
          )}

          {error   && <div className="inline-notice" style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', marginTop: 12 }}>⚠️ {error}</div>}
          {success && <div className="inline-notice" style={{ background: '#dcfce7', color: '#166534', borderColor: '#86efac', marginTop: 12 }}>✓ {success}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 16 }}>
            <button type="button" className="btn-secondary" onClick={handleCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-dark btn-with-icon" disabled={submitting}>
              <IconStockOut size={15} /> {submitting ? 'Processing…' : 'Confirm Issue'}
            </button>
          </div>
        </form>
      </div>

      {/* Stock-Out Records Table */}
      <h3>STOCK-OUT RECORDS</h3>
      {loading ? (
        <p className="view-subtitle">Loading records…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Qty Requested</th>
              <th>Qty Fulfilled</th>
              <th>Reason</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0' }}>
                  No stock-out records yet.
                </td>
              </tr>
            ) : (
              records.map((row) => (
                <tr key={row.id}>
                  <td><strong>SO-{String(row.id).padStart(4, '0')}</strong></td>
                  <td>{row.product?.name ?? row.product ?? '—'}</td>
                  <td>{row.quantity_requested}</td>
                  <td>
                    <span className={`status-pill ${row.quantity_fulfilled === row.quantity_requested ? 'pill-green' : 'pill-amber'}`}>
                      {row.quantity_fulfilled}
                    </span>
                  </td>
                  <td>{row.reason || '—'}</td>
                  <td>{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StockOut;
