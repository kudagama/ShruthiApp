'use client';
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

type InstrumentDetails = {
    id: number;
    name: string;
    description: string;
    category: string;
    image_url: string;
    tuning_frequency: string;
    history?: string;
    origin?: string;
    construction?: string;
    playing_style?: string;
    famous_artists?: string;
};

export default function InstrumentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const [instrument, setInstrument] = useState<InstrumentDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstrument = async () => {
            const { data, error } = await supabase
                .from('instruments')
                .select('*')
                .eq('id', unwrappedParams.id)
                .single();

            if (data) setInstrument(data);
            setLoading(false);
        };
        fetchInstrument();
    }, [unwrappedParams.id]);

    const sections = [
        { title: 'History & Origins', content: instrument?.history, icon: '🏛️' },
        { title: 'Construction', content: instrument?.construction, icon: '🔨' },
        { title: 'Playing Technique', content: instrument?.playing_style, icon: '🎼' },
        { title: 'Famous Exponents', content: instrument?.famous_artists, icon: '🌟' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-100 selection:text-amber-900 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-20 px-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 h-screen">
                        <div className="w-16 h-16 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500">Loading Instrument Details...</p>
                    </div>
                ) : instrument ? (
                    <div className="max-w-6xl mx-auto animate-fade-in">
                        {/* Header / Hero */}
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-8">
                            <div className="flex flex-col md:flex-row">
                                {/* Image Side */}
                                <div className="md:w-1/2 relative h-96 md:h-auto bg-slate-900">
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-transparent z-10"></div>
                                    <Image
                                        src={(
                                            instrument.name.toLowerCase().includes('bansuri') ? '/instruments/bansuri.png' :
                                                instrument.name.toLowerCase().includes('tabla') ? '/instruments/tabla.png' :
                                                    instrument.name.toLowerCase().includes('sitar') ? '/instruments/sitar.png' :
                                                        instrument.name.toLowerCase().includes('violin') ? '/instruments/violin.png' :
                                                            instrument.image_url
                                        )}
                                        alt={instrument.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Info Side */}
                                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl font-serif font-bold text-amber-500 pointer-events-none transform translate-x-10 -translate-y-10">
                                        {instrument.name[0]}
                                    </div>

                                    <span className="inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                                        {instrument.category}
                                    </span>

                                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{instrument.name}</h1>

                                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                        {instrument.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="text-xs text-slate-400 uppercase font-bold">Origin</div>
                                            <div className="font-semibold text-slate-800">{instrument.origin || 'India'}</div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="text-xs text-slate-400 uppercase font-bold">Standard Tuning</div>
                                            <div className="font-semibold text-slate-800 font-mono">{instrument.tuning_frequency || 'Variable'}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <Link
                                            href={`/tune/${instrument.id}`}
                                            className="flex-1 bg-slate-900 text-white text-center py-4 rounded-xl font-bold hover:bg-amber-500 transition-colors shadow-lg hover:shadow-amber-500/30 text-sm md:text-base"
                                        >
                                            Open Tuner
                                        </Link>
                                        <Link
                                            href="/"
                                            className="flex-1 border border-slate-200 text-slate-600 text-center py-4 rounded-xl font-bold hover:border-slate-800 hover:text-slate-900 transition-colors text-sm md:text-base"
                                        >
                                            Back to Gallery
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sections.map((section, idx) => (
                                section.content && (
                                    <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-2xl">{section.icon}</span>
                                            <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                            {section.content}
                                        </p>
                                    </div>
                                )
                            ))}
                        </div>

                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-slate-900">Instrument Not Found</h2>
                        <Link href="/" className="text-amber-600 hover:underline mt-4 inline-block">Return Home</Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
