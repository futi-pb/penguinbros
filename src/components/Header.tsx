'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CartIcon from './cart/CartIcon';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check in case page is loaded scrolled down
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Desktop Navigation - Left Side */}
          <nav className="hidden md:block w-1/3">
            <ul className="flex space-x-8 justify-end">
              <li>
                <Link href="/catering" className="font-mono uppercase text-sm tracking-wider hover:text-cherry-pink transition-colors">
                  Catering
                </Link>
              </li>
              <li>
                <Link href="/menu" className="font-mono uppercase text-sm tracking-wider hover:text-cherry-pink transition-colors">
                  Menu
                </Link>
              </li>
            </ul>
          </nav>

          {/* Logo - Center */}
          <div className="flex justify-center w-1/3">
            <Link href="/" className="flex items-center">
              <div className="relative w-48 h-24">
                <Image 
                  src="/assets/brand/Logos/Secondary/ThePeguinBrothers-MasterBrandFile_Secondary - Black.png" 
                  alt="Penguin Brothers Logo" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Right Side */}
          <nav className="hidden md:block w-1/3">
            <ul className="flex space-x-8 items-center">
              <li>
                <Link href="/about" className="font-mono uppercase text-sm tracking-wider hover:text-cherry-pink transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="font-mono uppercase text-sm tracking-wider hover:text-cherry-pink transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/order" className="font-mono uppercase text-sm tracking-wider hover:text-cherry-pink transition-colors">
                  Order
                </Link>
              </li>
              <li>
                <CartIcon />
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <CartIcon />
            <button
              type="button"
              className="text-gray-500 hover:text-black"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-md transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
            <nav className="container-custom py-6">
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/catering" 
                    className="block font-mono uppercase text-sm tracking-wider hover:text-cherry-pink transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Catering
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/menu" 
                    className="block font-mono uppercase text-sm tracking-wider hover:text-cherry-pink transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Menu
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about" 
                    className="block font-mono uppercase text-sm tracking-wider hover:text-cherry-pink transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="block font-mono uppercase text-sm tracking-wider hover:text-cherry-pink transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/order" 
                    className="block font-mono uppercase text-sm tracking-wider hover:text-cherry-pink transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Order
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/order/builder" 
                    className="block font-mono uppercase text-sm tracking-wider hover:text-cherry-pink transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Build
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/cart" 
                    className="block font-mono uppercase text-sm tracking-wider hover:text-cherry-pink transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Cart
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
