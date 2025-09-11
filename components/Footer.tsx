import Link from 'next/link';

export default function Footer() {

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="section-container">
        <div className="py-2xl flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-lg">
          <div className="flex-1">
            <Link href="/" className="header-logo mb-md block">
              Upface
            </Link>
            <p className="text-gray-400 max-w-sm mx-auto md:mx-0">
              Modern websites and applications for local businesses.
            </p>
          </div>
          
          <div className="flex gap-xl justify-center">
            <Link href="/services" className="header-menu-link">
              Services
            </Link>
            <Link href="/packages" className="header-menu-link">
              Packages
            </Link>
            <Link href="/contact" className="header-menu-link">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="pt-lg pb-xl border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Upface. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
