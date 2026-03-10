import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="border-t border-white/5 bg-transparent py-8 mt-auto z-10 relative">
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 group">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold group-hover:scale-105 transition-transform">M</div>
                    <span className="text-foreground font-bold tracking-tight">Maxen</span>
                </div>
                <div className="flex gap-6 text-sm text-muted-foreground">
                    <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                    <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                    <a href="https://discord.gg/maxen" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Discord</a>
                </div>
                <div className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Maxen Hosting. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
