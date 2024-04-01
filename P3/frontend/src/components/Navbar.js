import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={styles.navbar}>
      <ul style={styles.navList}>
        <li style={styles.navItem}>
          <Link to="/" style={styles.navLink}>Home</Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/contacts" style={styles.navLink}>Contacts</Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/calendars" style={styles.navLink}>Calendars</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;

const styles = {
  navbar: {
    backgroundColor: '#333',
    overflow: 'hidden',
  },
  navList: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
  },
  navItem: {
    float: 'left',
  },
  navLink: {
    display: 'block',
    color: 'white',
    textAlign: 'center',
    padding: '14px 16px',
    textDecoration: 'none',
  },
};
