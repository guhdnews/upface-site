import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Services', href: '/services' },
    { name: 'Packages', href: '/packages' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="site-header">
      <div className="section-container">
        <nav className="header-nav">
          {/* Logo */}
          <Link href="/" className="header-logo">
            Upface
          </Link>

          {/* Desktop Navigation */}
          <ul className="header-menu">
            <li>
              <Link href="/services" className="header-menu-link">
                Services
              </Link>
            </li>
            <li>
              <Link href="/packages" className="header-menu-link">
                Packages
              </Link>
            </li>
            <li>
              <Link href="/about" className="header-menu-link">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="header-menu-link">
                Contact
              </Link>
            </li>
          </ul>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mobile-menu-toggle"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mobile-menu"
          >
            <div className="section-container">
              <nav className="mobile-menu-list">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="mobile-menu-link"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
