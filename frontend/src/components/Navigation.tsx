import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/showcase', label: 'Animations' },
    { path: '/pipeline', label: 'Pipeline Test' }
  ];

  return (
    <motion.nav
      className="nav"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <Link to="/" className="nav-brand">
          WordWeave
        </Link>

        <ul className="nav-links">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </motion.nav>
  );
};

export default Navigation;
