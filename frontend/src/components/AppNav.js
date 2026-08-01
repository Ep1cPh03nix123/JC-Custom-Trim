import React from 'react';

const AppNav = ({ page, onNavigate }) => (
  <nav style={styles.nav}>
    <span style={styles.brand}>JC Custom Trim</span>
    <div style={styles.links}>
      <button
        type="button"
        onClick={() => onNavigate('home')}
        style={{ ...styles.link, ...(page === 'home' ? styles.linkActive : {}) }}
      >
        Time Tracker
      </button>
      <button
        type="button"
        onClick={() => onNavigate('saved')}
        style={{ ...styles.link, ...(page === 'saved' ? styles.linkActive : {}) }}
      >
        Saved Timesheets
      </button>
    </div>
  </nav>
);

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '10px 16px',
    background: '#fff',
    borderBottom: '1px solid #e4e7ec',
  },
  brand: {
    fontWeight: 700,
    fontSize: 16,
  },
  links: {
    display: 'flex',
    gap: 8,
  },
  link: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #e4e7ec',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
  linkActive: {
    background: '#e8f0ff',
    borderColor: '#c7dbff',
  },
};

export default AppNav;
