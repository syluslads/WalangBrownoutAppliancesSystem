import React from 'react';
import { mockKPIs, mockAlerts, mockRecentTransactions } from '../data/product';

const Dashboard = () => {
  return (
    <div className="view-container">
      <h2>Dashboard Overview</h2>

      <div className="kpi-grid">
        {mockKPIs.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <h3>{kpi.value}</h3>
            <p>{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-columns">
        <div className="panel">
          <h3>SYSTEM ALERTS</h3>
          <ul className="alerts-list">
            {mockAlerts.map((alert, index) => (
              <li key={index} className="alert-item">
                <span>⚠️</span>
                <span>{alert}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3>RECENT TRANSACTIONS</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Product</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Staff</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentTransactions.map((tx, index) => (
                <tr key={index}>
                  <td>{tx.date}</td>
                  <td>{tx.product}</td>
                  <td>{tx.type}</td>
                  <td>{tx.qty}</td>
                  <td>{tx.staff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;