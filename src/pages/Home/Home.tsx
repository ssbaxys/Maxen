import { Link } from 'react-router-dom';
import { Server, Shield, ChevronRight, Cpu, HardDrive, Zap, Terminal, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const Home = () => {
    return (
        <div className="flex-1 flex flex-col relative w-full overflow-hidden bg-background">

            {/* Ambient Strict Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* 1. Hero Section */}
            <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center z-10 max-w-5xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-surface border border-border text-foreground shadow-sm mb-12">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-semibold tracking-wider font-mono">AMD RYZEN™ 9 9950X3D DEPLOYED</span>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 text-foreground"
                >
                    Powering the next <br className="hidden md:block" /> generation of servers.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
                >
                    Enterprise-grade hardware meets a beautifully engineered control panel. Deploy blazing fast, DDoS-protected game servers in seconds.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Link to="/register">
                        <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold rounded-md group">
                            Deploy Server
                            <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-medium rounded-md text-foreground">
                            Read Documentation
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* 2. Platform Advantages */}
            <section className="py-24 px-6 w-full relative z-10 border-t border-border bg-surface/30">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-16 md:flex justify-between items-end gap-8">
                        <div className="max-w-xl">
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">Built for absolute reliability.</h2>
                            <p className="text-muted-foreground text-lg">We engineered Maxen from the metal up to eliminate tick lag, simplify complex management, and provide total control over your communities.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Zap, title: "Instant Provisioning", desc: "Your node is spun up and assigned instantly upon payment confirmation. Zero human intervention." },
                            { icon: Shield, title: "L7 DDoS Mitigation", desc: "Enterprise pathway filtering drops malicious traffic before it ever touches your game port." },
                            { icon: Terminal, title: "Custom React Panel", desc: "Manage files, databases, and exact live telemetry in a lightning-fast proprietary SPA interface." }
                        ].map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                                <Card className="h-full p-8 hover:border-foreground/20 transition-colors bg-surface">
                                    <div className="w-10 h-10 rounded-md bg-background border border-border flex items-center justify-center mb-6 text-foreground">
                                        <item.icon size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Infrastructure Highlight */}
            <section className="py-32 px-6 border-t border-border bg-background relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">Hardware that commands respect.</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">We deploy solely on top-tier components ensuring zero tick lag even under the stress of hundreds of concurrent players and heavily modified software.</p>
                            </div>

                            <div className="space-y-8 pt-4">
                                <div className="flex gap-4 items-start">
                                    <div className="mt-1"><Cpu size={20} className="text-foreground" /></div>
                                    <div>
                                        <h4 className="text-base font-semibold text-foreground">AMD Ryzen™ 9 9950X3D</h4>
                                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">16 Cores, 32 Threads, and massive L3 Cache. Flawless IPC performance tailored for single-core dependent game servers.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="mt-1"><HardDrive size={20} className="text-foreground" /></div>
                                    <div>
                                        <h4 className="text-base font-semibold text-foreground">PCIe Gen4 NVMe Arrays</h4>
                                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Redundant enterprise SSD local storage guarantees lightning-fast chunk loading and world saving.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="mt-1"><Server size={20} className="text-foreground" /></div>
                                    <div>
                                        <h4 className="text-base font-semibold text-foreground">DDR5 ECC Memory</h4>
                                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">High frequency error-correcting RAM guarantees ultimate stability during long uptime cycles.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-square md:aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden border border-border shadow-sm bg-surface flex items-center justify-center"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                            <div className="text-center relative z-10">
                                <Server size={64} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Frankfurt Routing Active</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 4. Tariffs */}
            <section className="py-24 px-6 max-w-6xl mx-auto w-full relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">Transparent Pricing</h2>
                    <p className="text-muted-foreground text-lg">Scalable resources to fit your scope. No hidden fees.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Starter */}
                    <Card className="flex flex-col p-8 bg-surface border border-border hover:border-foreground/30 transition-colors">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-foreground mb-2">Starter</h3>
                            <p className="text-sm text-muted-foreground">For small private communities.</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-foreground">$9.99</span>
                            <span className="text-muted-foreground">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-foreground"><Check className="w-4 h-4 text-muted-foreground" /> 4GB DDR5 RAM</li>
                            <li className="flex items-center gap-3 text-sm text-foreground"><Check className="w-4 h-4 text-muted-foreground" /> Unmetered NVMe</li>
                            <li className="flex items-center gap-3 text-sm text-foreground"><Check className="w-4 h-4 text-muted-foreground" /> Standard Priority</li>
                        </ul>
                        <Link to="/register"><Button variant="outline" className="w-full h-10 font-medium text-sm">Deploy Starter</Button></Link>
                    </Card>

                    {/* Professional (Highlighed) */}
                    <Card className="flex flex-col p-8 bg-foreground text-background border-transparent relative scale-100 md:scale-105 z-10 shadow-lg">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                            Most Popular
                        </div>
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Professional</h3>
                            <p className="text-sm text-background/80">Ideal for active modpacks.</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">$18.99</span>
                            <span className="text-background/80">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-background/50" /> 8GB DDR5 RAM</li>
                            <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-background/50" /> Unmetered NVMe</li>
                            <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-background/50" /> High Priority CPU</li>
                            <li className="flex items-center gap-3 text-sm"><Check className="w-4 h-4 text-background/50" /> Premium Routing</li>
                        </ul>
                        <Link to="/register"><Button className="w-full h-10 font-semibold text-sm bg-background text-foreground hover:bg-background/90">Deploy Professional</Button></Link>
                    </Card>

                    {/* Extreme */}
                    <Card className="flex flex-col p-8 bg-surface border border-border hover:border-foreground/30 transition-colors">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-foreground mb-2">Extreme</h3>
                            <p className="text-sm text-muted-foreground">For massive network hubs.</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-foreground">$34.99</span>
                            <span className="text-muted-foreground">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-foreground"><Check className="w-4 h-4 text-muted-foreground" /> 16GB+ DDR5 RAM</li>
                            <li className="flex items-center gap-3 text-sm text-foreground"><Check className="w-4 h-4 text-muted-foreground" /> Unmetered NVMe</li>
                            <li className="flex items-center gap-3 text-sm text-foreground"><Check className="w-4 h-4 text-muted-foreground" /> Dedicated Threads</li>
                            <li className="flex items-center gap-3 text-sm text-foreground"><Check className="w-4 h-4 text-muted-foreground" /> White-glove Support</li>
                        </ul>
                        <Link to="/register"><Button variant="outline" className="w-full h-10 font-medium text-sm">Contact Sales</Button></Link>
                    </Card>
                </div>
            </section>

            {/* 5. FAQ */}
            <section className="py-24 px-6 border-t border-border bg-surface/30">
                <div className="max-w-4xl mx-auto w-full">
                    <h2 className="text-2xl font-bold text-foreground mb-10">Frequently Asked Questions</h2>
                    <div className="grid gap-4">
                        {[
                            { q: "How fast is deployment?", a: "Deployment is completely automated. As soon as your payment is confirmed through Stripe, your server nodes are generated and booted within 15-30 seconds." },
                            { q: "Can I upgrade my RAM later?", a: "Yes. You can upgrade or downgrade your package at any time directly through the Maxen billing panel with zero data loss. Reboots take mere seconds." },
                            { q: "Do you offer MySQL databases?", a: "Every tier includes complimentary high-speed NVMe MySQL databases accessible natively from your control panel." },
                            { q: "What locations do you offer?", a: "Currently, we offer industry-leading routing out of Central Europe (Frankfurt, Germany), with upcoming expansions into North America East." }
                        ].map((faq, i) => (
                            <div key={i} className="pb-6 border-b border-border last:border-0 last:pb-0">
                                <h4 className="text-base font-semibold text-foreground mb-2">{faq.q}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Final CTA */}
            <section className="py-32 px-6 border-t border-border relative overflow-hidden bg-background">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none mask-image:linear-gradient(to_bottom,black,transparent)]" />
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">Build your legacy today.</h2>
                    <p className="text-lg text-muted-foreground mb-10">Join thousands of server owners migrating to next-generation infrastructure.</p>
                    <Link to="/register">
                        <Button size="lg" className="px-10 h-12 text-base font-semibold rounded-md shadow-sm">
                            Create Free Account
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;

