'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white/80 backdrop-blur-md shadow-md py-4'
                    : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                        S
                    </div>
                    <span className={`text-2xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                        Shruthi
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {['Instruments', 'Tuning', 'Classes', 'About'].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className={`text-sm font-medium transition-colors hover:text-amber-500 ${scrolled ? 'text-slate-600' : 'text-slate-200'
                                }`}
                        >
                            {item}
                        </Link>
                    ))}
                    <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 transition-all">
                        Get Started
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2">
                    <div className={`w-6 h-0.5 mb-1.5 rounded-full transition-colors ${scrolled ? 'bg-slate-800' : 'bg-white'}`}></div>
                    <div className={`w-6 h-0.5 mb-1.5 rounded-full transition-colors ${scrolled ? 'bg-slate-800' : 'bg-white'}`}></div>
                    <div className={`w-6 h-0.5 rounded-full transition-colors ${scrolled ? 'bg-slate-800' : 'bg-white'}`}></div>
                </button>
            </div>
        </nav>
    );
}
