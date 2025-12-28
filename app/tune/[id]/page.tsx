'use client';
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

type Instrument = {
    id: number;
    name: string;
    tuning_frequency: string;
    description: string;
};

export default function TunerPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const [instrument, setInstrument] = useState<Instrument | null>(null);
    const [loading, setLoading] = useState(true);
    const [listening, setListening] = useState(false);

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

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-100 selection:text-amber-900 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-slate-500 hover:text-amber-600 mb-8 transition-colors group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Instruments
                    </Link>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500">Loading Tuner...</p>
                        </div>
                    ) : instrument ? (
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                            <div className="bg-slate-900 p-8 md:p-12 text-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:24px_24px]"></div>
                                <div className="relative z-10">
                                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{instrument.name} Tuner</h1>
                                    <p className="text-amber-400 font-mono text-xl">Target Frequency: {instrument.tuning_frequency || '440Hz'}</p>
                                </div>
                            </div>

                            <div className="p-8 md:p-16 flex flex-col items-center">

                                {/* Visual Tuner Mockup */}
                                <div className="w-full max-w-lg mb-12 relative">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 px-1">
                                        <span>FLAT</span>
                                        <span>SHARP</span>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative">
                                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300"></div>
                                        {listening && (
                                            <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50 animate-pulse transition-all duration-300" style={{ transform: 'translateX(-50%)' }}></div>
                                        )}
                                    </div>

                                    {/* Frequency Display */}
                                    <div className="mt-8 text-center">
                                        <div className="text-6xl font-bold text-slate-800 font-mono tabular-nums tracking-tight">
                                            {listening ? '441.2' : '--.-'}
                                            <span className="text-2xl text-slate-400 ml-2">Hz</span>
                                        </div>
                                        <div className={`mt-2 font-bold uppercase tracking-widest text-sm ${listening ? 'text-green-600' : 'text-slate-400'}`}>
                                            {listening ? 'In Tune' : 'Waiting for sound...'}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setListening(!listening)}
                                    className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl shadow-2xl transition-all duration-300 ${listening
                                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                            : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:scale-110 hover:shadow-orange-500/40'
                                        }`}
                                >
                                    <i className={`fas ${listening ? 'fa-stop' : 'fa-microphone'}`}></i>
                                    {listening ? '⬛' : '🎤'}
                                </button>
                                <p className="mt-6 text-slate-500 text-sm">
                                    {listening ? 'Listening to your instrument...' : 'Tap the microphone to start tuning'}
                                </p>

                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h2 className="text-2xl font-bold text-slate-900">Instrument not found</h2>
                            <Link href="/" className="text-amber-600 hover:underline mt-4 inline-block">Go Home</Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
