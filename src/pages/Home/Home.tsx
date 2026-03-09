import { Link } from 'react-router-dom';
import { Server, Zap, Shield, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="flex-1 flex flex-col relative w-full overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />

            <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-20 lg:py-32 w-full flex flex-col items-center text-center z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-primary/30 bg-primary/5 text-primary">
                        <Zap size={16} />
                        <span className="text-sm font-semibold tracking-wide uppercase">Powered by AMD Ryzen™ 9 9950X3D</span>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500"
                >
                    Ultimate Performance <br className="hidden md:block" /> for Your Dream Server
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-textMuted max-w-2xl mb-12 leading-relaxed"
                >
                    Experience blazing fast speeds, unmetered DDoS protection, and a beautifully designed control panel. Built for communities that demand the best.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Link to="/register" className="px-8 py-4 bg-primary hover:bg-primaryHover text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all">
                        Get Started Now
                        <ChevronRight size={20} />
                    </Link>
                    <a href="#features" className="px-8 py-4 bg-surface/50 hover:bg-surface border border-white/10 text-white font-semibold rounded-2xl flex items-center justify-center transition-all backdrop-blur-md">
                        View Features
                    </a>
                </motion.div>
            </main>

            {/* Stats / Features Grid */}
            <div id="features" className="max-w-7xl mx-auto px-6 md:px-12 py-24 w-full relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="glass-panel p-8 rounded-3xl"
                >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <Server className="text-primary w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Enterprise Hardware</h3>
                    <p className="text-textMuted leading-relaxed">All our nodes are equipped with exactly AMD Ryzen 9 9950X3D processors and Gen4 NVMe SSDs for instant chunk loading and zero lag.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="glass-panel p-8 rounded-3xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl transform group-hover:scale-150 transition-transform duration-500" />
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 relative z-10">
                        <Shield className="text-secondary w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 relative z-10">Real-Time Control</h3>
                    <p className="text-textMuted leading-relaxed relative z-10">Our custom dashboard gives you instant, real-time insights into your server's RAM, CPU, and Network usage.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="glass-panel p-8 rounded-3xl"
                >
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                        <Zap className="text-accent w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Instant Setup</h3>
                    <p className="text-textMuted leading-relaxed">No waiting. Once ordered, your server is provisioned and ready to start in under 10 seconds.</p>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
