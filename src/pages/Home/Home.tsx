import { Link } from 'react-router-dom';
import { Server, Shield, ChevronRight, Cpu, HardDrive, Globe, Zap, Clock, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const Home = () => {
    return (
        <div className="flex-1 flex flex-col relative w-full overflow-hidden w-full">
            {/* Ambient Background blur blobs */}
            <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute top-[40%] right-[-10%] w-[40%] h-[60%] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[0%] left-[20%] w-[60%] h-[40%] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

            {/* 1. Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center z-10 max-w-7xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface border border-primary/30 text-primary shadow-sm mb-8">
                        <Cpu size={18} className="animate-pulse" />
                        <span className="text-xs md:text-sm font-bold tracking-widest uppercase">Powered by AMD Ryzen™ 9 9950X3D</span>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/40 drop-shadow-2xl max-w-5xl"
                >
                    Premium Game Hosting <br className="hidden md:block" /> Reimagined
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
                >
                    Experience the absolute pinnacle of server performance. Maxen provides unmetered DDoS protection, instant NVMe storage, and the most advanced custom control panel on the market.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Link to="/register">
                        <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl group">
                            Deploy Server
                            <ChevronRight size={24} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl">
                            Dashboard Login
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* 2. Brief & Advantages Grid */}
            <section className="py-24 px-6 max-w-7xl mx-auto w-full relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Why Choose Maxen?</h2>
                    <p className="text-muted-foreground text-lg">We built Maxen from the ground up to eliminate tick lag, simplify management, and give you total control over your communities.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                        <Card className="h-full p-8 group hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Instant Setup</h3>
                            <p className="text-muted-foreground leading-relaxed">Your server is provisioned and online within seconds of payment. No waiting. No manual reviews.</p>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                        <Card className="h-full p-8 group hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform">
                                <Shield size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Pathero© DDoS Protection</h3>
                            <p className="text-muted-foreground leading-relaxed">Included on every node, our L7 mitigation stops attacks before they ever reach your game server ports.</p>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                        <Card className="h-full p-8 group hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
                                <Terminal size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Custom Built Panel</h3>
                            <p className="text-muted-foreground leading-relaxed">Say goodbye to generic panels. Our proprietary React dashboard offers live telemetry, fast console routing, and a beautiful UI.</p>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* 3. Hardware Highlight */}
            <section className="py-24 border-y border-white/5 bg-surface-hover/30 relative z-10">
                <div className="max-w-7xl mx-auto px-6 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Hardware That Dominates</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">We don't cut corners. Every single node in our fleet runs on industry-leading components ensuring absolute zero tick lag even with hundreds of players and heavy modpacks.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-surface border border-border rounded-xl text-primary"><Cpu size={24} /></div>
                                    <div>
                                        <h4 className="text-xl font-bold text-foreground">AMD Ryzen 9 9950X3D</h4>
                                        <p className="text-sm text-muted-foreground mt-1">16 Cores, 32 Threads, 144MB V-Cache powering through single-core monolithic threads effortlessly.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-surface border border-border rounded-xl text-secondary"><HardDrive size={24} /></div>
                                    <div>
                                        <h4 className="text-xl font-bold text-foreground">PCIe Gen4 NVMe RAID</h4>
                                        <p className="text-sm text-muted-foreground mt-1">World-saving lag is a thing of the past with our extreme throughput SSD storage arrays.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-surface border border-border rounded-xl text-emerald-500"><Server size={24} /></div>
                                    <div>
                                        <h4 className="text-xl font-bold text-foreground">DDR5 ECC Memory</h4>
                                        <p className="text-sm text-muted-foreground mt-1">High frequency error-correcting RAM ensures absolute stability for long-running sessions.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                            <img
                                src="https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800"
                                alt="Server Hardware"
                                className="relative z-10 rounded-[2rem] shadow-glass-xl border border-white/10 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 4. Pricing */}
            <section className="py-24 px-6 max-w-7xl mx-auto w-full relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-4xl font-extrabold text-foreground mb-4">Transparent Pricing</h2>
                    <p className="text-muted-foreground text-lg">Pay only for what you need. No hidden fees. Instant setup included on all tiers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Starter */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                        <Card className="p-8 h-full">
                            <h3 className="text-2xl font-bold text-foreground mb-2">Starter</h3>
                            <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">Perfect for small communities of friends.</p>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-5xl font-black text-foreground">$9.99</span>
                                <span className="text-muted-foreground">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-foreground"><Server className="text-primary w-5 h-5" /> <b>4GB</b> DDR5 RAM</li>
                                <li className="flex items-center gap-3 text-foreground"><HardDrive className="text-primary w-5 h-5" /> <b>Unlimited</b> NVMe</li>
                                <li className="flex items-center gap-3 text-foreground"><Cpu className="text-primary w-5 h-5" /> Standard CPU Priority</li>
                            </ul>
                            <Link to="/register"><Button variant="outline" className="w-full h-12">Select Plan</Button></Link>
                        </Card>
                    </motion.div>

                    {/* Professional (Highlighed) */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="md:-mt-8 md:mb-8 z-10 relative">
                        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                        <Card className="p-8 h-full border-primary/50 shadow-glow-lg bg-surface/80 backdrop-blur-xl relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                                Most Popular
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">Professional</h3>
                            <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">Ideal for modpacks and medium-sized servers.</p>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-5xl font-black text-foreground">$18.99</span>
                                <span className="text-muted-foreground">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-foreground"><Server className="text-primary w-5 h-5" /> <b>8GB</b> DDR5 RAM</li>
                                <li className="flex items-center gap-3 text-foreground"><HardDrive className="text-primary w-5 h-5" /> <b>Unlimited</b> NVMe</li>
                                <li className="flex items-center gap-3 text-foreground"><Cpu className="text-primary w-5 h-5" /> <b>High</b> CPU Priority</li>
                                <li className="flex items-center gap-3 text-foreground"><Globe className="text-primary w-5 h-5" /> Premium Uplink</li>
                            </ul>
                            <Link to="/register"><Button variant="default" className="w-full h-12 text-md">Select Plan</Button></Link>
                        </Card>
                    </motion.div>

                    {/* Extreme */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                        <Card className="p-8 h-full">
                            <h3 className="text-2xl font-bold text-foreground mb-2">Extreme</h3>
                            <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">Unleash full power for massive network hubs.</p>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-5xl font-black text-foreground">$34.99</span>
                                <span className="text-muted-foreground">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-foreground"><Server className="text-primary w-5 h-5" /> <b>16GB+</b> DDR5 RAM</li>
                                <li className="flex items-center gap-3 text-foreground"><HardDrive className="text-primary w-5 h-5" /> <b>Unlimited</b> NVMe</li>
                                <li className="flex items-center gap-3 text-foreground"><Cpu className="text-primary w-5 h-5" /> <b>Dedicated</b> Threads</li>
                                <li className="flex items-center gap-3 text-foreground"><Shield className="text-primary w-5 h-5" /> Custom Network ACL</li>
                            </ul>
                            <Link to="/register"><Button variant="outline" className="w-full h-12">Contact Sales</Button></Link>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* 5. FAQ */}
            <section className="py-24 px-6 max-w-4xl mx-auto w-full relative z-10 border-t border-white/5">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-foreground mb-4">Frequently Asked Questions</h2>
                </div>
                <div className="grid gap-4">
                    {[
                        { q: "How fast will my server be online?", a: "Deployment is completely automated. As soon as your payment is confirmed, your server nodes are generated and booted within 15-30 seconds." },
                        { q: "Can I upgrade my RAM later?", a: "Yes. You can upgrade or downgrade your package at any time directly through the Maxen billing panel with zero data loss. Required reboots take mere seconds." },
                        { q: "Do you offer MySQL databases?", a: "Every tier includes complimentary high-speed NVMe MySQL databases accessible natively from your control panel." },
                        { q: "What locations do you offer?", a: "Currently, we offer industry-leading routing out of Central Europe (Germany), with upcoming expansions into North America East." }
                    ].map((faq, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                            <Card className="p-6">
                                <h4 className="flex items-center gap-3 text-lg font-bold text-foreground mb-2">
                                    <Clock size={18} className="text-primary" /> {faq.q}
                                </h4>
                                <p className="text-muted-foreground ml-8">{faq.a}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 6. Final CTA */}
            <section className="py-24 px-6 max-w-7xl mx-auto w-full relative z-10 text-center">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-surface border border-border p-12 md:p-20 rounded-[3rem] relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-primary/5 blur-3xl pointer-events-none" />
                    <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6 relative z-10">Ready to elevate your game?</h2>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto relative z-10">Join thousands of server owners who have already made the switch to Maxen Hosting's next-generation infrastructure.</p>
                    <Link to="/register" className="relative z-10">
                        <Button size="lg" className="px-12 h-16 text-lg rounded-2xl shadow-glow-lg">
                            Create Free Account
                        </Button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
