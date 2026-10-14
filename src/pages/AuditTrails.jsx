import React, { useState, useEffect, useCallback } from 'react';
import { getAuditTrail, getProducts, getUsers } from '../lib/api';
import { IconSearch } from '../components/Icons';

const typePill = {
  IN:              'pill-green',
  OUT:             'pill-red',
  ADJUSTMENT:      'pill-amber',
  PRODUCT_CREATED: 'pill-blue',
  PRODUCT_UPDATED: 'pill-violet',
  PRODUCT_DELETED: 'pill-slate',
  SETTING_UPDATED: 'pill-amber',
  USER_UPDATED:    'pill-blue',
};

const AuditTrails = () => {
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [pagination, setPagination] = useState(null);

  // Filter state
  const [search, setSearch]       = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterProductId, setFilterProductId] = useState('');
  const [filterUserId, setFilterUserId]       = useState('');
  const [products, setProducts]               = useState([]);
  const [users, setUsers]                     = useState([]);

  const fetchRecords = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAuditTrail(params);
      setRecords(data.data || []);
      setPagination({
        currentPage: data.current_page,
        lastPage:    data.last_page,
        total:       data.total,
        from:        data.from,
        to:          data.to,
      });
    } catch {
      setError('Could not load audit trail.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRecords({ page: 1 });
  }, [fetchRecords]);

  // Load products and users for filter dropdowns
  useEffect(() => {
    getProducts({ per_page: 200 }).then(res => setProducts(res?.data ?? [])).catch(() => {});
    getUsers().then(u => setUsers(u ?? [])).catch(() => {});
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRecords({
      search:      search          || undefined,
      type:        filterType      || undefined,
      date_from:   dateFrom        || undefined,
      date_to:     dateTo          || undefined,
      product_id:  filterProductId || undefined,
      user_id:     filterUserId    || undefined,
      page:        1,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterType('');
    setDateFrom('');
    setDateTo('');
    setFilterProductId('');
    setFilterUserId('');
    setCurrentPage(1);
    fetchRecords({ page: 1 });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchRecords({
      search:      search          || undefined,
      type:        filterType      || undefined,
      date_from:   dateFrom        || undefined,
      date_to:     dateTo          || undefined,
      product_id:  filterProductId || undefined,
      user_id:     filterUserId    || undefined,
      page,
    });
  };

  const activeFilterCount = [search, filterType, dateFrom, dateTo, filterProductId, filterUserId].filter(Boolean).length;

  return (
    <div className="view-container">
      <p className="view-subtitle" style={{ marginBottom: 20 }}>
        Full transaction history for every stock movement — who did it, when, and why. Use the filters
        to trace a discrepancy back to its source.
      </p>

      {/* Filter Bar */}
      <form className="filter-bar" onSubmit={handleFilter}>
        <div className="search-box">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Search by product name or SKU…"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          <option value="IN">Stock In</option>
          <option value="OUT">Stock Out</option>
          <option value="ADJUSTMENT">Adjustment</option>
          <option value="PRODUCT_CREATED">Product Created</option>
          <option value="PRODUCT_UPDATED">Product Updated</option>
          <option value="PRODUCT_DELETED">Product Deleted</option>
          <option value="SETTING_UPDATED">Setting Updated</option>
          <option value="USER_UPDATED">User Updated</option>
        </select>

        <select
          value={filterProductId}
          onChange={(e) => setFilterProductId(e.target.value)}
          className="filter-select"
        >
          <option value="">All Products</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {users.length > 0 && (
          <select
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="filter-select"
          >
            <option value="">All Staff</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}

        <input
          type="date"
          className="date-input"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          title="From date"
        />
        <input
          type="date"
          className="date-input"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          title="To date"
        />

        <button type="submit" className="btn-dark">Filter</button>
        {activeFilterCount > 0 && (
          <>
            <button type="button" className="btn-secondary" onClick={handleClearFilters}>
              Clear
            </button>
            <span style={{ fontSize: 12, color: '#64748b', padding: '0 6px' }}>
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </span>
          </>
        )}
      </form>

      {error && (
        <div className="inline-notice" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fcd34d', marginBottom: 12 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Pagination summary */}
      {pagination && (
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 8px 0' }}>
          Showing {pagination.from ?? 0}–{pagination.to ?? 0} of {pagination.total ?? 0} records
        </p>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Product Name</th>
            <th>Type</th>
            <th>Qty Change</th>
            <th>Staff Name</th>
            <th>Batch</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0' }}>
                Loading audit records…
              </td>
            </tr>
          ) : records.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0' }}>
                No records found for the selected filters.
              </td>
            </tr>
          ) : (
            records.map((item) => (
              <tr key={item.id}>
                <td>{item.timestamp}</td>
                <td><strong>{item.product}</strong></td>
                <td>
                  <span className={`status-pill ${typePill[item.type] || 'pill-blue'}`}>
                    {item.type}
                  </span>
                </td>
                <td
                  style={{
                    fontWeight: 'bold',
                    color: String(item.qty_change).startsWith('+') ? '#16a34a' : '#dc2626',
                  }}
                >
                  {item.qty_change}
                </td>
                <td>{item.staff}</td>
                <td>{item.batch_number || '—'}</td>
                <td>{item.notes || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {pagination && pagination.lastPage > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
          <button
            className="btn-secondary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
          >
            ‹ Prev
          </button>
          <span style={{ padding: '6px 12px', fontSize: 13, color: '#64748b' }}>
            Page {currentPage} / {pagination.lastPage}
          </span>
          <button
            className="btn-secondary"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.lastPage || loading}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditTrails;
