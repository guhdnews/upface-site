import Link from 'next/link';

export default function Footer() {

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="section-container">
        <div className="py-16 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
          <div className="flex-1">
            <Link href="/" className="text-white text-xl font-medium mb-6 block">
              Upface
            </Link>
            <p className="text-gray-400 font-light max-w-sm mx-auto md:mx-0">
              Modern websites and applications for local businesses.
            </p>
          </div>
          
          <div className="flex gap-12 justify-center">
            <Link href="/services" className="text-gray-400 hover:text-white transition-colors font-light">
              Services
            </Link>
            <Link href="/packages" className="text-gray-400 hover:text-white transition-colors font-light">
              Packages
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors font-light">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="py-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm font-light">
            © 2025 Upface. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
