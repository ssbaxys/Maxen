import { Link } from 'react-router-dom';
import { Server, Shield, ChevronRight, Cpu, HardDrive, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="flex-1 flex flex-col relative w-full overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Hero Section */}
            <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 py-20 lg:py-32 w-full flex flex-col items-center text-center z-10 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-panel mb-8 border-primary/40 bg-primary/10 text-primary shadow-lg shadow-primary/20">
                        <Cpu size={18} className="animate-pulse" />
                        <span className="text-sm font-bold tracking-widest uppercase">Powered by AMD Ryzen™ 9 9950X3D</span>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-100 to-gray-500 drop-shadow-2xl"
                >
                    Uncompromising <br className="hidden md:block" /> Game Hosting
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-textMuted max-w-2xl mb-12 leading-relaxed"
                >
                    Experience the absolute pinnacle of server performance. Maxen provides unmetered DDoS protection, instant NVMe storage, and the most advanced custom control panel on the market.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-6"
                >
                    <Link to="/register" className="px-10 py-5 bg-primary hover:bg-primaryHover text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_50px_rgba(99,102,241,0.8)] transition-all transform hover:-translate-y-1 text-lg">
                        Deploy Server
                        <ChevronRight size={24} />
                    </Link>
                    <a href="#hardware" className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center transition-all backdrop-blur-md transform hover:-translate-y-1 text-lg">
                        Explore Hardware
                    </a>
                </motion.div>
            </main>

            {/* Premium Hardware Section */}
            <div id="hardware" className="max-w-7xl mx-auto px-6 md:px-12 py-24 w-full relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Hardware That Dominates</h2>
                    <p className="text-textMuted text-lg max-w-2xl mx-auto">We don't cut corners. Every single node runs on industry-leading components for zero tick lag.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass-panel p-10 rounded-[2rem] relative overflow-hidden group"
                    >
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                        <Cpu className="text-primary w-12 h-12 mb-6" />
                        <h3 className="text-3xl font-bold text-white mb-4">AMD Ryzen 9 9950X3D</h3>
                        <p className="text-textMuted text-lg leading-relaxed mb-6">
                            Featuring 16 cores, 32 threads, and massive 3D V-Cache technology. This processor delivers extreme single-thread performance, ensuring your Minecraft server stays at exactly 20.0 TPS even under massive load.
                        </p>
                        <div className="flex gap-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold">16 Cores</span>
                            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold">144MB Cache</span>
                            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold">5.7 GHz Boost</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass-panel p-10 rounded-[2rem] relative overflow-hidden group"
                    >
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                        <HardDrive className="text-secondary w-12 h-12 mb-6" />
                        <h3 className="text-3xl font-bold text-white mb-4">NVMe Gen4 Storage</h3>
                        <p className="text-textMuted text-lg leading-relaxed mb-6">
                            Forget about world saving lag. Our RAID array of PCIe Gen 4.0 NVMe SSDs guarantees extremely fast chunk generation, immediate plugin loading, and instantaneous backups.
                        </p>
                        <div className="flex gap-4">
                            <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-sm font-semibold">PCIe 4.0</span>
                            <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-sm font-semibold">RAID 10</span>
                            <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-sm font-semibold">Uncapped I/O</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 w-full relative z-10 border-t border-white/5">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Transparent Pricing</h2>
                    <p className="text-textMuted text-lg max-w-2xl mx-auto">Pay only for what you need. No hidden fees. Instant setup included.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: 'Starter', ram: '4GB', price: '$9.99', desc: 'Perfect for small communities of friends.', color: 'gray' },
                        { name: 'Professional', ram: '8GB', price: '$18.99', desc: 'Ideal for modpacks and medium-sized servers.', color: 'primary', popular: true },
                        { name: 'Extreme', ram: '16GB', price: '$34.99', desc: 'Unleash full power for massive networks.', color: 'accent' }
                    ].map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={`glass-panel p-8 rounded-3xl border flex flex-col ${plan.popular ? 'border-primary/50 shadow-[0_0_30px_rgba(99,102,241,0.2)] scale-105 z-10' : 'border-white/10'}`}
                        >
                            {plan.popular && <div className="bg-primary text-white text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full self-start mb-4">Most Popular</div>}
                            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-textMuted mb-6 h-12">{plan.desc}</p>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-5xl font-black text-white">{plan.price}</span>
                                <span className="text-textMuted">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-white"><Server className="text-primary w-5 h-5" /> <b>{plan.ram}</b> DDR5 ECC RAM</li>
                                <li className="flex items-center gap-3 text-white"><Cpu className="text-primary w-5 h-5" /> Ryzen 9 9950X3D Cores</li>
                                <li className="flex items-center gap-3 text-white"><HardDrive className="text-primary w-5 h-5" /> Unlimited NVMe Storage</li>
                                <li className="flex items-center gap-3 text-white"><Shield className="text-primary w-5 h-5" /> Premium DDoS Protection</li>
                                <li className="flex items-center gap-3 text-white"><Globe className="text-primary w-5 h-5" /> 1 Gbps Uplink</li>
                            </ul>
                            <Link to="/register" className={`w-full py-4 rounded-xl font-bold flex justify-center items-center transition-all ${plan.popular ? 'bg-primary hover:bg-primaryHover text-white shadow-lg shadow-primary/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                                Select Plan
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer CTA */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 w-full relative z-10 text-center">
                <div className="glass-panel p-12 md:p-20 rounded-[3rem] border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to elevate your game?</h2>
                    <p className="text-xl text-textMuted mb-10 max-w-2xl mx-auto">Join thousands of server owners who have already made the switch to Maxen Hosting.</p>
                    <Link to="/register" className="px-12 py-5 bg-white text-black font-extrabold rounded-2xl inline-flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-1 text-lg">
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
