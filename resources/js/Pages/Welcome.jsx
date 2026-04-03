import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #f7f5f0; }
                .welcome-wrap {
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    font-family: 'DM Sans', sans-serif;
                }
                @media (max-width: 768px) {
                    .welcome-wrap { grid-template-columns: 1fr; }
                    .welcome-left { display: none; }
                }
                .welcome-left {
                    background: #1a1a18;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 48px;
                    position: relative;
                    overflow: hidden;
                }
                .welcome-left::before {
                    content: '';
                    position: absolute;
                    bottom: -60px; left: -60px;
                    width: 280px; height: 280px;
                    border-radius: 50%;
                    background: #c8a96e18;
                    pointer-events: none;
                }
                .welcome-left-brand {
                    font-family: 'Playfair Display', serif;
                    font-size: 22px;
                    color: #c8a96e;
                    letter-spacing: 0.02em;
                }
                .welcome-left-quote {
                    font-family: 'Playfair Display', serif;
                    font-size: 40px;
                    line-height: 1.35;
                    color: #f0ece4;
                    font-weight: 400;
                }
                .welcome-left-quote em { color: #c8a96e; font-style: normal; }
                .welcome-left-sub { font-size: 14px; color: #6b6b65; }
                .welcome-right {
                    background: #f7f5f0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 40px;
                    text-align: center;
                }
                .welcome-content {
                    max-width: 400px;
                }
                .welcome-heading {
                    font-family: 'Playfair Display', serif;
                    font-size: 42px;
                    color: #1a1a18;
                    font-weight: 600;
                    margin-bottom: 12px;
                }
                .welcome-description {
                    font-size: 15px;
                    color: #6b6b65;
                    margin-bottom: 32px;
                    line-height: 1.6;
                }
                .welcome-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                }
                .welcome-btn {
                    padding: 14px 28px;
                    border: none;
                    border-radius: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px;
                    font-weight: 500;
                    cursor: pointer;
                    letter-spacing: 0.02em;
                    text-decoration: none;
                    transition: all 0.2s;
                    display: inline-block;
                }
                .welcome-btn-primary {
                    background: #1a1a18;
                    color: #f7f5f0;
                }
                .welcome-btn-primary:hover {
                    background: #2d2d2a;
                    transform: translateY(-2px);
                }
                .welcome-btn-secondary {
                    background: #f7f5f0;
                    color: #1a1a18;
                    border: 1.5px solid #e2ddd6;
                }
                .welcome-btn-secondary:hover {
                    background: #faf9f6;
                    border-color: #c8a96e;
                    transform: translateY(-2px);
                }
                .welcome-btn-outline {
                    background: transparent;
                    color: #c8a96e;
                    border: 1.5px solid #c8a96e;
                }
                .welcome-btn-outline:hover {
                    background: #c8a96e;
                    color: #1a1a18;
                    transform: translateY(-2px);
                }
            `}</style>

            <div className="welcome-wrap">
                {/* Left panel */}
                <div className="welcome-left">
                    <div className="welcome-left-brand">The Blog</div>
                    <div>
                        <div className="welcome-left-quote">
                            Share your <em>stories</em> with the world.
                        </div>
                    </div>
                    <div className="welcome-left-sub">A beautiful space for your thoughts and ideas.</div>
                </div>

                {/* Right panel */}
                <div className="welcome-right">
                    <div className="welcome-content">
                        <h1 className="welcome-heading">Welcome</h1>
                        <p className="welcome-description">
                            Discover inspiring stories and share your own. Join our community of writers today.
                        </p>

                        <div className="welcome-actions">
                            {auth?.user ? (
                                <Link href="/feed" className="welcome-btn welcome-btn-primary">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="welcome-btn welcome-btn-primary">
                                        Sign In
                                    </Link>
                                    <Link href={route('register')} className="welcome-btn welcome-btn-outline">
                                        Create Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}