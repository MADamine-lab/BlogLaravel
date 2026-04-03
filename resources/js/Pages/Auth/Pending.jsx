// resources/js/Pages/Auth/Pending.jsx
import { Head, Link } from '@inertiajs/react';

export default function Pending() {
    return (
        <>
            <Head title="Pending Approval" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #f7f5f0; }
                .pending-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'DM Sans', sans-serif;
                    padding: 24px;
                }
                .pending-card {
                    background: white;
                    max-width: 500px;
                    width: 100%;
                    padding: 48px 40px;
                    border-radius: 16px;
                    text-align: center;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02);
                }
                .icon-wrapper {
                    width: 80px;
                    height: 80px;
                    background: #fef3c7;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                }
                .icon {
                    font-size: 48px;
                }
                .title {
                    font-family: 'Playfair Display', serif;
                    font-size: 28px;
                    color: #1a1a18;
                    margin-bottom: 16px;
                }
                .message {
                    color: #6b6b65;
                    line-height: 1.6;
                    margin-bottom: 24px;
                }
                .highlight {
                    background: #f7f5f0;
                    padding: 16px;
                    border-radius: 12px;
                    margin: 24px 0;
                    color: #c8a96e;
                    font-weight: 500;
                }
                .btn-home {
                    display: inline-block;
                    padding: 12px 24px;
                    background: #1a1a18;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: background 0.2s;
                }
                .btn-home:hover {
                    background: #2d2d2a;
                }
                .footer {
                    margin-top: 32px;
                    font-size: 13px;
                    color: #9e9a93;
                }
                .footer a {
                    color: #c8a96e;
                    text-decoration: none;
                }
            `}</style>
            
            <div className="pending-container">
                <div className="pending-card">
                    <div className="icon-wrapper">
                        <div className="icon">⏳</div>
                    </div>
                    
                    <h1 className="title">Account Pending Approval</h1>
                    
                    <div className="message">
                        Thank you for registering! Your account has been created and is awaiting 
                        administrator approval.
                    </div>
                    
                    <div className="highlight">
                        ✨ You'll receive access within 24 hours ✨
                    </div>
                    
                    <div className="message">
                        Once approved, you'll be able to log in and start using the platform. 
                        You will receive an email notification when your account is activated.
                    </div>
                    
                    <Link href="/" className="btn-home">
                        Return to Homepage
                    </Link>
                    
                    <div className="footer">
                        Need help? <a href="mailto:support@example.com">Contact support</a>
                    </div>
                </div>
            </div>
        </>
    );
}