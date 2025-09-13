import Link from 'next/link';

export default function Footer() {

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="section-container">
        <div className="py-8 text-center">
          <Link href="/" className="header-logo mb-3 block text-center">
            Upface
          </Link>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Modern websites and applications for local businesses.
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center mb-8">
            <Link href="/services" className="header-menu-link">
              Services
            </Link>
            <Link href="/packages" className="header-menu-link">
              Packages
            </Link>
            <Link href="/about" className="header-menu-link">
              About
            </Link>
            <Link href="/faq" className="header-menu-link">
              FAQ
            </Link>
            <Link href="/contact" className="header-menu-link">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="pt-4 pb-6 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Upface. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
