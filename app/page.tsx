'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

// 1. Instrument Type Definition
type Instrument = {
  id: number;
  name: string;
  description: string;
  category: string;
  image_url: string;
  tuning_frequency: string;
};

export default function Home() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstruments = async () => {
      const { data, error } = await supabase.from('instruments').select('*');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setInstruments(data || []);
      }
      setLoading(false);
    };

    fetchInstruments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-100 selection:text-amber-900">
      <Navbar />

      <main>
        {/* Hero Section */}
        <div className="relative hero-gradient text-white pt-40 pb-24 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
            <span className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-amber-200 text-sm font-medium mb-8 animate-slide-up">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Experience Pure Sound
            </span>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-1.1 drop-shadow-sm">
              The Soul of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-200 to-amber-100">
                Indian Classical
              </span>
            </h1>

            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10 opacity-90">
              Discover the divine frequencies of the East. Tune, learn, and master the art of sacred instrumentation.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1 transition-all">
                Explore Instruments
              </button>
              <button className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full font-semibold hover:bg-white/10 transition-all">
                Learn Tuning
              </button>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="bg-slate-900 border-b border-white/5 py-8">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Active Learners', value: '2k+' },
              { label: 'Raagas', value: '500+' },
              { label: 'Instruments', value: '15+' },
              { label: 'Masterclasses', value: '50+' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Section */}
        <div id="instruments" className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Master Collection</h2>
              <p className="text-slate-500 text-lg">Hand-picked instruments for the discerning artist</p>
            </div>
            <div className="flex gap-2">
              <span className="h-1 w-20 bg-amber-500 rounded-full"></span>
              <span className="h-1 w-4 bg-slate-200 rounded-full"></span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {instruments.map((item, index) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-slate-100/50 animate-slide-up flex flex-col h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden bg-slate-100" style={{ height: '280px' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <Image
                      src={(
                        item.name.toLowerCase().includes('bansuri') ? '/instruments/bansuri.png' :
                          item.name.toLowerCase().includes('tabla') ? '/instruments/tabla.png' :
                            item.name.toLowerCase().includes('sitar') ? '/instruments/sitar.png' :
                              item.name.toLowerCase().includes('violin') ? '/instruments/violin.png' :
                                item.image_url
                      )}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="bg-white/95 backdrop-blur-md text-slate-900 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm border border-white/50">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                      {item.name}
                    </h3>

                    <p className="text-slate-600 mb-8 line-clamp-3 leading-relaxed flex-grow">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-auto">
                      <Link
                        href={`/instrument/${item.id}`}
                        className="flex-1 bg-white border border-slate-200 text-slate-700 hover:border-amber-500 hover:text-amber-600 px-4 py-3 rounded-xl text-sm font-bold transition-all text-center"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/tune/${item.id}`}
                        className="flex-[2] group/btn flex items-center justify-center gap-2 bg-slate-900 hover:bg-amber-500 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-slate-200 hover:shadow-amber-200/50 hover:-translate-y-0.5"
                      >
                        Tune
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}