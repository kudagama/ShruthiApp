'use client';
import { useEffect, useState, use, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';

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
    const [frequency, setFrequency] = useState<number>(0);

    const [note, setNote] = useState<string>('--');
    const [octave, setOctave] = useState<number>(0);
    const [swara, setSwara] = useState<string>('--');
    const [solfege, setSolfege] = useState<string>('--');

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordedNotes, setRecordedNotes] = useState<{ note: string, swara: string, solfege: string, timestamp: number }[]>([]);
    const lastNoteRef = useRef<string>('--');
    const lastNoteTimeRef = useRef<number>(0);
    const isRecordingRef = useRef(false);

    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    // Simplified Swara mapping assuming C as Sa (Key of C)
    const swaraStrings = ["Sa", "ri", "Re", "ga", "Ga", "ma", "Ma", "Pa", "da", "Dha", "ni", "Ni"];
    // Solfege mapping (Fixed Do)
    const solfegeStrings = ["Do", "Di", "Re", "Ri", "Mi", "Fa", "Fi", "Sol", "Si", "La", "Li", "Ti"];

    const getNote = (frequency: number) => {
        const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2)) + 69;
        return Math.round(noteNum);
    };

    const getFrequencyFromNoteNum = (note: number) => {
        return 440 * Math.pow(2, (note - 69) / 12);
    };

    const getCents = (frequency: number, note: number) => {
        return Math.floor(1200 * Math.log(frequency / getFrequencyFromNoteNum(note)) / Math.log(2));
    };

    useEffect(() => {
        if (frequency > 0) {
            const noteNum = getNote(frequency);
            const noteIndex = noteNum % 12;
            const noteName = noteStrings[noteIndex];
            const swaraName = swaraStrings[noteIndex];
            const solfegeName = solfegeStrings[noteIndex];
            const oct = Math.floor(noteNum / 12) - 1;

            setNote(noteName);
            setSwara(swaraName);
            setSolfege(solfegeName);
            setOctave(oct);
        } else {
            setNote('--');
            setSwara('--');
            setSolfege('--');
        }
    }, [frequency]);


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

    // Auto-correlation algorithm for pitch detection
    const autoCorrelate = (buf: Float32Array, sampleRate: number) => {
        let SIZE = buf.length;
        let MAX_SAMPLES = Math.floor(SIZE / 2);
        let best_offset = -1;
        let best_correlation = 0;
        let rms = 0;
        let foundGoodCorrelation = false;
        let correlations = new Array(MAX_SAMPLES);

        for (let i = 0; i < SIZE; i++) {
            let val = buf[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.01) return -1; // Not enough signal

        let lastCorrelation = 1;
        for (let offset = 0; offset < MAX_SAMPLES; offset++) {
            let correlation = 0;

            for (let i = 0; i < MAX_SAMPLES; i++) {
                correlation += Math.abs((buf[i] - buf[i + offset]));
            }
            correlation = 1 - (correlation / MAX_SAMPLES);
            correlations[offset] = correlation;

            if ((correlation > 0.9) && (correlation > lastCorrelation)) {
                foundGoodCorrelation = true;
                if (correlation > best_correlation) {
                    best_correlation = correlation;
                    best_offset = offset;
                }
            } else if (foundGoodCorrelation) {
                let shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / Math.max(correlations[best_offset], 1);
                return sampleRate / (best_offset + (8 * shift));
            }
            lastCorrelation = correlation;
        }
        if (best_correlation > 0.01) {
            return sampleRate / best_offset;
        }
        return -1;
    };


    const startListening = async () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            let animationFrameId: number;

            let historyBuffer: number[] = [];

            // Smoothing buffer to stabilize frequency readings
            const smoothingBuffer: number[] = [];
            const BUFFER_SIZE = 5;

            const updatePitch = () => {
                const buffer = new Float32Array(analyser.fftSize);
                analyser.getFloatTimeDomainData(buffer);
                const ac = autoCorrelate(buffer, audioCtx.sampleRate);

                if (ac > -1) {
                    // Add new reading to valid readings buffer
                    smoothingBuffer.push(ac);
                    if (smoothingBuffer.length > BUFFER_SIZE) {
                        smoothingBuffer.shift();
                    }

                    // Calculate average frequency from buffer
                    const smoothedFreq = smoothingBuffer.reduce((a, b) => a + b, 0) / smoothingBuffer.length;

                    // Standard Note Locking (Quantization)
                    // If frequency is very close to a standard note (within 3Hz), snap to it visually
                    // This reduces visual jitter for the user who wants "standard hz"
                    const noteNum = 12 * (Math.log(smoothedFreq / 440) / Math.log(2)) + 69;
                    const nearestNote = Math.round(noteNum);
                    const standardFreq = 440 * Math.pow(2, (nearestNote - 69) / 12);

                    let finalFreq = smoothedFreq;
                    if (Math.abs(smoothedFreq - standardFreq) < 3) {
                        finalFreq = standardFreq;
                    }

                    setFrequency(finalFreq);
                    historyBuffer.push(finalFreq);

                    // RECORDING LOGIC
                    if (isRecordingRef.current) {
                        const noteNum = 12 * (Math.log(finalFreq / 440) / Math.log(2)) + 69;
                        const noteIndex = Math.round(noteNum) % 12;
                        const validIndex = Math.abs(noteIndex); // Handle negative indexing just in case

                        if (validIndex >= 0 && validIndex < 12) {
                            const currentNoteName = noteStrings[validIndex];
                            const now = Date.now();

                            // Record if note changed AND significant time passed (avoid flutter)
                            if (currentNoteName && currentNoteName !== lastNoteRef.current) {
                                // Simple debounce: 200ms
                                if (now - lastNoteTimeRef.current > 200) {
                                    const swaraName = swaraStrings[validIndex];
                                    const solfegeName = solfegeStrings[validIndex];

                                    // Use functional update to ensure we don't lose notes due to closure
                                    setRecordedNotes(prev => [...prev, {
                                        note: currentNoteName,
                                        swara: swaraName,
                                        solfege: solfegeName,
                                        timestamp: now
                                    }]);

                                    lastNoteRef.current = currentNoteName;
                                    lastNoteTimeRef.current = now;
                                }
                            }
                        }
                    }
                } else {
                    // If no signal, slowly clear buffer or just hold
                    if (historyBuffer.length > 0) {
                        // Decay signal value for graph continuity instead of drop to 0
                        historyBuffer.push(historyBuffer[historyBuffer.length - 1] * 0.98);
                    } else {
                        historyBuffer.push(0);
                    }

                    // Clear smoothing buffer if silence persists
                    if (smoothingBuffer.length > 0 && Math.random() > 0.8) smoothingBuffer.shift();
                }

                if (historyBuffer.length > 100) historyBuffer.shift();

                if (historyBuffer.length > 100) historyBuffer.shift();

                // Draw Graph
                const canvas = document.getElementById('freq-graph') as HTMLCanvasElement;
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        // Style
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = '#f59e0b'; // Amber-500
                        ctx.beginPath();

                        const sliceWidth = canvas.width / 100;
                        let x = 0;

                        // Normalize graph around target freq or just show raw movement
                        // Simple auto-scaling logic
                        const min = Math.min(...historyBuffer.filter(f => f > 0));
                        const max = Math.max(...historyBuffer.filter(f => f > 0));
                        const range = (max - min) || 50;
                        const mid = (max + min) / 2 || 440;

                        for (let i = 0; i < historyBuffer.length; i++) {
                            const f = historyBuffer[i];
                            // specialized scaling: center around mid, scale range
                            const y = f === 0 ? canvas.height : canvas.height / 2 - ((f - mid) / range) * (canvas.height - 20);

                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                            x += sliceWidth;
                        }
                        ctx.stroke();
                    }
                }

                animationFrameId = requestAnimationFrame(updatePitch);
            };

            updatePitch();
            setListening(true);

            // @ts-ignore
            window.tunerCleanup = () => {
                cancelAnimationFrame(animationFrameId);
                source.disconnect();
                analyser.disconnect();
                audioCtx.close();
                stream.getTracks().forEach(track => track.stop());
            };

        } catch (err) {
            console.error("Microphone access denied", err);
            alert("Please allow microphone access to tune your instrument.");
            setListening(false);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
        } else {
            setRecordedNotes([]);
            lastNoteRef.current = '--';
            lastNoteTimeRef.current = 0;
            setIsRecording(true);
            if (!listening) startListening();
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(255, 183, 77); // Amber-300 like color
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text(`${instrument?.name || 'Instrument'} Session`, 20, 25);

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Recorded on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 50);

        let y = 70;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        // Grid-like layout for notes
        let x = 20;
        const marginX = 20;
        const cardWidth = 40;
        const cardHeight = 25;
        const gap = 5;
        const maxWidth = 210 - marginX;

        recordedNotes.forEach((n, i) => {
            // Draw Box
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(250, 250, 250);
            doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');

            // Note Text
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 41, 59); // Slate-800
            doc.text(n.note, x + 5, y + 10);

            // Swara/Solfege
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 116, 139); // Slate-500
            doc.text(`${n.swara} / ${n.solfege}`, x + 5, y + 20);

            x += cardWidth + gap;

            if (x + cardWidth > maxWidth) {
                x = marginX;
                y += cardHeight + gap;
            }

            if (y > 270) {
                doc.addPage();
                y = 20;
                x = marginX;
            }
        });

        if (recordedNotes.length === 0) {
            doc.text("No notes recorded.", 20, 70);
        }

        doc.save(`${instrument?.name}_notes.pdf`);
    };

    const stopListening = () => {
        // @ts-ignore
        if (window.tunerCleanup) {
            // @ts-ignore
            window.tunerCleanup();
        }
        setListening(false);
        setIsRecording(false);
        setFrequency(0);
    };

    const toggleTuner = () => {
        if (listening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopListening();
        };
    }, []);

    // Calculate tuning status
    const targetFreq = instrument ? parseFloat(instrument.tuning_frequency) || 440 : 440;
    const diff = frequency - targetFreq;
    const isClose = Math.abs(diff) < 2; // Within 2Hz
    const status = frequency === 0 ? 'Waiting...' : isClose ? 'Perfect' : diff > 0 ? 'Too Sharp' : 'Too Flat';
    const color = frequency === 0 ? 'text-slate-400' : isClose ? 'text-green-500' : 'text-red-500';
    const needleRotation = frequency === 0 ? 0 : Math.max(-45, Math.min(45, diff * 2)); // Clamp rotation


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
                                    {/* Note Display */}
                                    <div className="absolute -top-16 left-0 right-0 text-center">
                                        <div className="inline-flex flex-col items-center bg-slate-100 px-8 py-3 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                            {swara !== '--' && (
                                                <div className="absolute inset-0 bg-amber-500/10"></div>
                                            )}
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 relative z-10">Detected Note</span>
                                            <div className="flex items-baseline gap-4 relative z-10 transition-all duration-300">
                                                <span className="text-4xl font-bold text-slate-900">
                                                    {note !== '--' ? note : '--'}
                                                    <span className="text-xl text-slate-500 align-super ml-1">{note !== '--' ? octave : ''}</span>
                                                </span>
                                                {swara !== '--' && (
                                                    <>
                                                        <span className="h-8 w-px bg-slate-300"></span>
                                                        <span className="text-4xl font-serif font-bold text-amber-600">
                                                            {swara}
                                                        </span>
                                                    </>
                                                )}
                                                {solfege !== '--' && (
                                                    <>
                                                        <span className="h-8 w-px bg-slate-300"></span>
                                                        <span className="text-2xl font-medium text-slate-600">
                                                            {solfege}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 px-1 pt-10">
                                        <span>FLAT (♭)</span>
                                        <span>SHARP (♯)</span>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300 transform -translate-x-1/2"></div>

                                        {/* Dynamic Needle */}
                                        <div
                                            className={`absolute top-0 bottom-0 left-1/2 w-2 rounded-full shadow-lg transition-all duration-100 ease-out ${isClose ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}
                                            style={{
                                                transform: `translateX(-50%) translateX(${needleRotation * 3}px)`, // Move needle based on diff
                                                opacity: frequency > 0 ? 1 : 0
                                            }}
                                        ></div>
                                    </div>

                                    {/* Frequency Graph */}
                                    <div className="mt-6 mb-8 w-full h-32 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden">
                                        <canvas
                                            id="freq-graph"
                                            className="w-full h-full"
                                            width={500}
                                            height={128}
                                        />
                                        <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-mono">LIVE VARIATION</div>
                                    </div>

                                    {/* Frequency Display */}
                                    <div className="text-center">
                                        <div className="text-6xl font-bold text-slate-800 font-mono tabular-nums tracking-tight min-h-[5rem]">
                                            {frequency > 0 ? frequency.toFixed(1) : '--.-'}
                                            <span className="text-2xl text-slate-400 ml-2">Hz</span>
                                        </div>
                                        <div className={`mt-2 font-bold uppercase tracking-widest text-sm ${color} transition-colors min-h-[1.5rem]`}>
                                            {status} {isClose && '✨'}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={toggleTuner}
                                    className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl shadow-2xl transition-all duration-300 transform ${listening
                                        ? 'bg-slate-800 hover:bg-slate-900 scale-100 ring-4 ring-red-500/30'
                                        : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:scale-110 hover:shadow-orange-500/40'
                                        }`}
                                >
                                    {listening ? (
                                        <span className="animate-pulse text-red-500 text-base font-bold tracking-widest">STOP</span>
                                    ) : (
                                        '🎤'
                                    )}
                                </button>
                                <p className="mt-6 text-slate-500 text-sm mb-8">
                                    {listening ? 'Listening... Play a note!' : 'Tap the microphone to start tuning'}
                                </p>

                                {/* Recording Controls */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={toggleRecording}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${isRecording
                                            ? 'bg-red-100 text-red-600 border border-red-200 animate-pulse'
                                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-600' : 'bg-slate-400'}`}></div>
                                        {isRecording ? 'Recording...' : 'Record Notes'}
                                    </button>

                                    {recordedNotes.length > 0 && !isRecording && (
                                        <button
                                            onClick={downloadPDF}
                                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all animate-slide-up"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            Download PDF ({recordedNotes.length})
                                        </button>
                                    )}
                                </div>

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
