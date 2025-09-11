import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Services', href: '/services' },
    { name: 'Packages', href: '/packages' },
    { name: 'Work', href: '/demos' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-black border-b border-gray-800">
      <nav className="w-full max-w-7xl mx-auto px-8">
        <div className="flex justify-center items-center h-20 relative">
          {/* Logo - positioned absolute left */}
          <Link href="/" className="absolute left-0 text-white text-2xl font-light">
            Upface
          </Link>

          {/* Desktop Navigation - centered */}
          <div className="hidden md:flex items-center space-x-12">
            <Link
              href="/services"
              className="text-gray-400 hover:text-white transition-colors font-light text-lg"
            >
              Services
            </Link>
            <Link
              href="/packages"
              className="text-gray-400 hover:text-white transition-colors font-light text-lg"
            >
              Packages
            </Link>
            <Link
              href="/demos"
              className="text-gray-400 hover:text-white transition-colors font-light text-lg"
            >
              Work
            </Link>
            <Link
              href="/about"
              className="text-gray-400 hover:text-white transition-colors font-light text-lg"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-400 hover:text-white transition-colors font-light text-lg"
            >
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-400 hover:text-white transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-b border-gray-800"
          >
            <div className="px-8 py-8 space-y-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-400 hover:text-white transition-colors font-light text-lg"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
