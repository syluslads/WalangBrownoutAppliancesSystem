import React from 'react';
import { mockAuditTrails } from '../data/product';

const AuditTrails = () => {
  return (
    <div className="view-container">
      <h2>System Audit Trails</h2>

      <div className="filter-bar">
        <div className="search-box">
          <span>🔍</span>
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
              <td><span className="status-pill">{item.type}</span></td>
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