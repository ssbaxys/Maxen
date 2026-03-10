import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const NotFound = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-8xl font-black text-primary mb-4 drop-shadow-glow">404</h1>
            <h2 className="text-2xl font-bold text-foreground mb-6">Page Not Found</h2>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link to="/">
                <Button size="lg">Return Home</Button>
            </Link>
        </div>
    );
};

export default NotFound;
