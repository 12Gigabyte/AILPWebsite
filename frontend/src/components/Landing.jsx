import '../styles/landing.css';

export default function Landing({ onNavigate }) {
    return (
        <div className="custom-landing">
            {/* Minimalist Navbar */}
            <nav className="custom-nav">
                <div className="nav-brand">
                    <span className="brand-icon">⚡</span> SynapseAI
                </div>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#team">Our Team</a>
                </div>
            </nav>

            {/* Clean Hero Section */}
            <main className="custom-hero">
                <div className="hero-text-content">
                    <div className="status-pill">v1.0 is now live</div>
                    <h1 className="display-title">
                        Master complex concepts <br />
                        <span className="text-accent">without the burnout.</span>
                    </h1>
                    <p className="lead-text">
                        SynapseAI breaks down your lectures, builds your flashcards, and tests your knowledge in real-time. Built by students, for students.
                    </p>

                    <div className="hero-actions">
                        <button className="btn-primary-custom" onClick={() => onNavigate('login')}>
                            Log in to SynapseAI
                        </button>
                        <button className="btn-outline-custom">
                            View Documentation
                        </button>
                    </div>
                </div>

                {/* Abstract/Clean Visual Placeholder instead of a generic image */}
                <div className="hero-abstract-visual">
                    <div className="bento-box large"></div>
                    <div className="bento-group">
                        <div className="bento-box small"></div>
                        <div className="bento-box small accent"></div>
                    </div>
                </div>
            </main>
        </div>
    );
}