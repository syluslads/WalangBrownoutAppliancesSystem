import React from 'react';
import { mockAuditTrails } from '../data/product';
import { IconSearch } from '../components/Icons';

const typePill = { IN: 'pill-green', OUT: 'pill-red', ADJUSTMENT: 'pill-amber' };

const AuditTrails = () => {
  return (
    <div className="view-container">
      <p className="view-subtitle" style={{ marginBottom: 20 }}>
        Full transaction history for every stock movement — who did it, when, and why. This is what lets
        the team trace a discrepancy back to its source.
      </p>

      <div className="filter-bar">
        <div className="search-box">
          <IconSearch size={16} />
          <input type="text" placeholder="Search log records..." className="search-input" />
        </div>
        <input type="date" className="date-input" />
        <input type="date" className="date-input" />
        <button className="btn-dark">Filter</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Product Name</th>
            <th>Type</th>
            <th>Qty Change</th>
            <th>Staff Name</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {mockAuditTrails.map((item, idx) => (
            <tr key={idx}>
              <td>{item.timestamp}</td>
              <td><strong>{item.product}</strong></td>
              <td><span className={`status-pill ${typePill[item.type] || 'pill-blue'}`}>{item.type}</span></td>
              <td style={{ fontWeight: 'bold', color: item.qtyChange.startsWith('+') ? '#16a34a' : '#dc2626' }}>
                {item.qtyChange}
              </td>
              <td>{item.staff}</td>
              <td>{item.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTrails;
