import React from 'react';
import { Link } from 'react-router-dom';
import { IconLock } from './Icons';
import { pageAccess } from '../data/permissions';

const RestrictedAccess = ({ role, pageKey, pageTitle }) => {
  const allowedRoles = Object.entries(pageAccess)
    .filter(([, pages]) => pages.includes(pageKey))
    .map(([roleName]) => roleName);

  return (
    <div className="restricted-view">
      <div className="restricted-icon"><IconLock size={28} /></div>
      <h2>Access Restricted</h2>
      <p>
        Your current role, <strong>{role}</strong>, doesn't have permission to view{' '}
        <strong>{pageTitle}</strong>.
      </p>
      {allowedRoles.length > 0 && (
        <p className="restricted-allowed">Available to: {allowedRoles.join(', ')}</p>
      )}
      <Link to="/dashboard" className="btn-dark">Back to Dashboard</Link>
    </div>
  );
};

export default RestrictedAccess;
