export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 block"></span>
                            Shruthi
                        </h3>
                        <p className="text-slate-400 leading-relaxed">
                            Preserving the heritage of Indian Classical music through modern technology. Tune, learn, and master your instruments.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-colors cursor-pointer">
                                    <span className="text-xs">IG</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Explore</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-amber-400 transition-colors">Instruments</a></li>
                            <li><a href="#" className="hover:text-amber-400 transition-colors">Tuner Tool</a></li>
                            <li><a href="#" className="hover:text-amber-400 transition-colors">Raaga Library</a></li>
                            <li><a href="#" className="hover:text-amber-400 transition-colors">Artists</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-amber-400 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-amber-400 transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-amber-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-amber-400 transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Newsletter</h4>
                        <p className="text-sm text-slate-400 mb-4">Subscribe for weekly practice tips.</p>
                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 focus-within:border-amber-500 transition-colors">
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className="bg-transparent px-4 py-2 w-full outline-none text-white text-sm"
                            />
                            <button className="bg-amber-500 text-slate-900 px-4 py-2 rounded font-bold text-sm hover:bg-amber-400 transition-colors">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>© 2025 Shruthi App. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
