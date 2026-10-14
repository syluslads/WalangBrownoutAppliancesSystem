import React, { useState, useEffect, useCallback } from 'react';
import { getAuditTrail } from '../lib/api';
import { mockAuditTrails } from '../data/product';
import { IconSearch } from '../components/Icons';

const typePill = {
  IN:  'pill-green',
  OUT: 'pill-red',
  ADJUSTMENT: 'pill-amber',
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
      setError('Could not load audit trail. Showing demo data.');
      setRecords(
        mockAuditTrails.map((item, idx) => ({
          id:          idx + 1,
          timestamp:   item.timestamp,
          product:     item.product,
          type:        item.type,
          qty_change:  item.qtyChange,
          staff:       item.staff,
          notes:       item.remarks,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRecords({ page: 1 });
  }, [fetchRecords]);

  const handleFilter = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRecords({
      search:    search   || undefined,
      type:      filterType || undefined,
      date_from: dateFrom || undefined,
      date_to:   dateTo   || undefined,
      page:      1,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterType('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    fetchRecords({ page: 1 });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchRecords({
      search:    search    || undefined,
      type:      filterType || undefined,
      date_from: dateFrom  || undefined,
      date_to:   dateTo    || undefined,
      page,
    });
  };

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
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </select>

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
        {(search || filterType || dateFrom || dateTo) && (
          <button type="button" className="btn-secondary" onClick={handleClearFilters}>
            Clear
          </button>
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
