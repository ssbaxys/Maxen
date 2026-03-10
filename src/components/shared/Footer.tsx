import { Link } from 'react-router-dom';
import { Github, Twitter, Disc as Discord } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-background border-t border-border pt-16 pb-8 px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                    <div className="col-span-2 lg:col-span-2">
                        <Link to="/" className="flex items-center gap-3 group mb-4">
                            <div className="w-8 h-8 rounded-md bg-foreground flex items-center justify-center transform group-hover:scale-105 transition-all">
                                <span className="font-bold text-background text-sm">M</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">Maxen</span>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                            Enterprise-grade game server hosting engineered for latency-free experiences and absolute reliability.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter size={18} /></a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Github size={18} /></a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Discord size={18} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Product</h4>
                        <ul className="space-y-3">
                            <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                            <li><Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                            <li><Link to="/infrastructure" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Infrastructure</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Resources</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Reference</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Company</h4>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                            <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                            <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
                            <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        &copy; {currentYear} Maxen Hosting. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        All systems operational
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
