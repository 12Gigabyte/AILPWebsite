import '../styles/landing.css';

export default function Landing({ onNavigate }) {
    return (
        <div className="landing-wrapper">

            {/* HEADER: Gradient logo and Login button */}
            <nav className="landing-nav">
                <div className="brand-logo">SynapseAI</div>
                <button className="login-btn" onClick={() => onNavigate('login')}>
                    Log in
                </button>
            </nav>

            {/* HERO: Centered text with tight spacing */}
            <header className="hero-section">
                <h1 className="hero-title">Learn smarter, not harder</h1>
                <p className="hero-description">
                    SynapseAI uses cutting-edge artificial intelligence to create personalized
                    learning paths that adapt to your unique style. Experience education that
                    evolves with you.
                </p>
            </header>

            {/* FEATURES: Grid of 3 cards with custom SVG icons */}
            <section className="feature-grid">

                {/* Card 1: Adaptive Learning */}
                <div className="feature-card">
                    <div className="icon-circle icon-blue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                    </div>
                    <h3>Adaptive Learning</h3>
                    <p>AI that adjusts to your pace and learning preferences in real-time</p>
                </div>

                {/* Card 2: Track Progress */}
                <div className="feature-card">
                    <div className="icon-circle icon-purple">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h3>Track Progress</h3>
                    <p>Visualize your growth with detailed analytics and insights</p>
                </div>

                {/* Card 3: Vast Library */}
                <div className="feature-card">
                    <div className="icon-circle icon-pink">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                    </div>
                    <h3>Vast Library</h3>
                    <p>Access thousands of courses across every subject imaginable</p>
                </div>

            </section>
        </div>
    );
}