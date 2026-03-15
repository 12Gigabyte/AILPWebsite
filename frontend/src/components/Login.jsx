import { useState } from 'react';
import '../styles/Login.css';

// 1. We pass 'onNavigate' as a prop so this component knows how to tell App.jsx to change pages
export default function Login({ onNavigate }) {

    // 2. STATE: These act as the memory for our inputs. 
    // Whenever the user types, these update automatically.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 3. SUBMIT HANDLER: This function fires when the user clicks "Sign In"
    const handleLogin = (e) => {
        // e.preventDefault() stops the browser from reloading the page (which is the default HTML form behavior)
        e.preventDefault();
        console.log("Attempting login with:", email);

        // Note for team: We will add the Python FastAPI fetch request here soon!
    };

    return (
        <div className="login-container">

            {/* 4. THE BACK BUTTON: When clicked, it tells App.jsx to switch the view to 'landing' */}
            <button className="back-button" onClick={() => onNavigate('landing')}>
                ← Back to Home
            </button>

            <div className="login-card">
                <div className="login-header">
                    <h2>Welcome to SynapseAI</h2>
                    <p>Sign in to continue your AI learning journey.</p>
                </div>

                {/* 5. THE FORM: We attach the handleLogin function to the onSubmit event */}
                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="name@university.edu"
                            value={email}
                            // onChange fires every time a single keystroke happens, updating the email state
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            // Same here, updating the password state on every keystroke
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <a href="#" className="forgot-password">Forgot password?</a>
                    </div>

                    <button type="submit" className="login-button">
                        Sign In
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <a href="#">Create one</a></p>
                </div>
            </div>
        </div>
    );
}