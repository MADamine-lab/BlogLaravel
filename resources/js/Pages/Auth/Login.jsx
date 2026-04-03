import { useRef, useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import * as faceapi from 'face-api.js';

export default function Login({ status, canResetPassword }) {
    const videoRef = useRef(null);

    const [mode,        setMode]        = useState('password');
    const [faceStatus,  setFaceStatus]  = useState('');
    const [modelsReady, setModelsReady] = useState(false);
    const [scanning,    setScanning]    = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '', password: '', remember: false,
    });
    
    useEffect(() => {
    // Check URL params for status message
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status === 'pending') {
        setFaceStatus('Account pending approval. Check your email for updates.');
    } else if (status === 'suspended') {
        setFaceStatus('Account suspended. Contact administrator for details.');
    }
}, []);

    useEffect(() => {
        if (mode !== 'face' || modelsReady) return;
        setFaceStatus('Loading face models…');
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]).then(() => {
            setModelsReady(true);
            setFaceStatus('Click Start Scan to log in with your face.');
        });
    }, [mode]);

    async function startFaceScan() {
        try {
            setFaceStatus('Requesting camera…');
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 320 }, height: { ideal: 240 } } });
            setScanning(true);
            await new Promise(resolve => setTimeout(resolve, 50));
            if (!videoRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
            videoRef.current.srcObject = stream;
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Video timeout')), 5000);
                const onCanPlay = () => { clearTimeout(timeout); videoRef.current?.removeEventListener('canplay', onCanPlay); resolve(); };
                videoRef.current.addEventListener('canplay', onCanPlay);
                videoRef.current.play().catch(e => { clearTimeout(timeout); reject(e); });
            });
            setFaceStatus('Look at the camera, then click Verify.');
        } catch (err) { setScanning(false); setFaceStatus(`Camera error: ${err.message}`); }
    }

    async function verifyFace() {
        setFaceStatus('Scanning…');
        if (!videoRef.current || videoRef.current.readyState < 2) { setFaceStatus('Video not ready — try again.'); return; }
        try {
            const detection = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
            if (!detection) { setFaceStatus('No face detected — try again.'); return; }
            if (videoRef.current?.srcObject) { videoRef.current.srcObject.getTracks().forEach(t => t.stop()); videoRef.current.srcObject = null; }
            setScanning(false);
            setFaceStatus('Matching…');
            const response = await axios.post(route('login.face'), { descriptor: Array.from(detection.descriptor) });
            if (response.data.success) {
                window.location.href = response.data.redirect;
            } else {
                setFaceStatus('Face not recognised. Try password login.');
            }
        } catch (err) { setFaceStatus('Server error — try password login.'); }
    }

    function submitPassword(e) {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    }

    return (
        <>
            <Head title="Sign in" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #f7f5f0; }
                .login-wrap {
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    font-family: 'DM Sans', sans-serif;
                }
                @media (max-width: 768px) {
                    .login-wrap { grid-template-columns: 1fr; }
                    .login-left { display: none; }
                }
                .login-left {
                    background: #1a1a18;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 48px;
                    position: relative;
                    overflow: hidden;
                }
                .login-left::before {
                    content: '';
                    position: absolute;
                    bottom: -60px; left: -60px;
                    width: 280px; height: 280px;
                    border-radius: 50%;
                    background: #c8a96e18;
                    pointer-events: none;
                }
                .login-left-brand {
                    font-family: 'Playfair Display', serif;
                    font-size: 22px;
                    color: #c8a96e;
                    letter-spacing: 0.02em;
                }
                .login-left-quote {
                    font-family: 'Playfair Display', serif;
                    font-size: 34px;
                    line-height: 1.35;
                    color: #f0ece4;
                    font-weight: 400;
                }
                .login-left-quote em { color: #c8a96e; font-style: normal; }
                .login-left-sub { font-size: 14px; color: #6b6b65; }
                .login-right {
                    background: #f7f5f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 40px;
                }
                .login-form-wrap { width: 100%; max-width: 400px; }
                .login-heading {
                    font-family: 'Playfair Display', serif;
                    font-size: 30px;
                    color: #1a1a18;
                    font-weight: 600;
                    margin-bottom: 6px;
                }
                .login-sub { font-size: 14px; color: #6b6b65; margin-bottom: 28px; }
                .login-sub a { color: #c8a96e; text-decoration: none; font-weight: 500; }
                .mode-tabs {
                    display: flex;
                    border: 1.5px solid #e2ddd6;
                    border-radius: 10px;
                    overflow: hidden;
                    margin-bottom: 28px;
                }
                .mode-tab {
                    flex: 1;
                    padding: 10px 16px;
                    border: none;
                    background: transparent;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    color: #9e9a93;
                    cursor: pointer;
                    letter-spacing: 0.03em;
                    transition: all 0.2s;
                }
                .mode-tab.active {
                    background: #1a1a18;
                    color: #f7f5f0;
                }
                .field { margin-bottom: 18px; }
                .field label {
                    display: block;
                    font-size: 12px;
                    font-weight: 500;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #4a4a45;
                    margin-bottom: 6px;
                }
                .field input {
                    width: 100%;
                    padding: 12px 16px;
                    background: #fff;
                    border: 1.5px solid #e2ddd6;
                    border-radius: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px;
                    color: #1a1a18;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .field input:focus { border-color: #c8a96e; }
                .field input::placeholder { color: #b0aca5; }
                .field-error { font-size: 12px; color: #c0392b; margin-top: 4px; }
                .remember-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    font-size: 13px;
                }
                .remember-label { display: flex; align-items: center; gap: 8px; color: #6b6b65; cursor: pointer; }
                .remember-label input { accent-color: #c8a96e; }
                .forgot-link { color: #c8a96e; text-decoration: none; font-size: 13px; }
                .forgot-link:hover { text-decoration: underline; }
                .btn-submit {
                    width: 100%;
                    padding: 14px;
                    background: #1a1a18;
                    color: #f7f5f0;
                    border: none;
                    border-radius: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px;
                    font-weight: 500;
                    cursor: pointer;
                    letter-spacing: 0.02em;
                    transition: background 0.2s, transform 0.1s;
                }
                .btn-submit:hover { background: #2d2d2a; }
                .btn-submit:active { transform: scale(0.99); }
                .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
                .status-bar {
                    background: #f0ece4;
                    border-radius: 6px;
                    padding: 10px 14px;
                    font-size: 13px;
                    color: #6b6b65;
                    margin-bottom: 20px;
                }
                .status-bar.success { background: #edf7ed; color: #2d6a2d; }
                .face-panel { display: flex; flex-direction: column; gap: 14px; }
                .face-hint {
                    font-size: 13px;
                    color: #9e9a93;
                    padding: 12px 16px;
                    background: #faf9f6;
                    border: 1.5px dashed #d4cfc7;
                    border-radius: 8px;
                    line-height: 1.5;
                }
                video.face-video {
                    width: 100%;
                    border-radius: 10px;
                    border: 1.5px solid #e2ddd6;
                }
                .face-actions { display: flex; gap: 10px; }
                .btn-scan {
                    flex: 1;
                    padding: 12px 16px;
                    border: none;
                    border-radius: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .btn-scan:hover { opacity: 0.85; }
                .btn-scan-start { background: #1a1a18; color: #fff; }
                .btn-scan-verify { background: #c8a96e; color: #fff; }
                .face-loading {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    color: #9e9a93;
                    padding: 16px 0;
                }
                .spinner {
                    width: 16px; height: 16px;
                    border: 2px solid #e2ddd6;
                    border-top-color: #c8a96e;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    flex-shrink: 0;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="login-wrap">
                {/* Left panel */}
                <div className="login-left">
                    <div className="login-left-brand">The Blog</div>
                    <div>
                        <div className="login-left-quote">
                            Welcome <em>back</em> — your next story is waiting.
                        </div>
                    </div>
                    <div className="login-left-sub">Continue where you left off.</div>
                </div>

                {/* Right panel */}
                <div className="login-right">
                    <div className="login-form-wrap">
                        <h1 className="login-heading">Sign in</h1>
                        <p className="login-sub">
                            New here?{' '}
                            <Link href={route('register')}>Create an account</Link>
                        </p>

                        {status && (
                            <div className="status-bar success">{status}</div>
                        )}

                        {/* Mode tabs */}
                        <div className="mode-tabs">
                            <button
                                type="button"
                                className={`mode-tab ${mode === 'password' ? 'active' : ''}`}
                                onClick={() => setMode('password')}
                            >
                                Email & Password
                            </button>
                            <button
                                type="button"
                                className={`mode-tab ${mode === 'face' ? 'active' : ''}`}
                                onClick={() => setMode('face')}
                            >
                                Face ID
                            </button>
                        </div>

                        {/* Password login */}
                        {mode === 'password' && (
                            <form onSubmit={submitPassword}>
                                <div className="field">
                                    <label htmlFor="email">Email address</label>
                                    <input
                                        id="email" type="email" value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="you@example.com"
                                        autoFocus autoComplete="username"
                                    />
                                    {errors.email && <div className="field-error">{errors.email}</div>}
                                </div>

                                <div className="field">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        id="password" type="password" value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Your password"
                                        autoComplete="current-password"
                                    />
                                    {errors.password && <div className="field-error">{errors.password}</div>}
                                </div>

                                <div className="remember-row">
                                    <label className="remember-label">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={e => setData('remember', e.target.checked)}
                                        />
                                        Remember me
                                    </label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="forgot-link">
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>

                                <button type="submit" className="btn-submit" disabled={processing}>
                                    {processing ? 'Signing in…' : 'Sign in'}
                                </button>
                            </form>
                        )}

                        {/* Face ID login */}
                        {mode === 'face' && (
                            <div className="face-panel">
                                {!modelsReady && (
                                    <div className="face-loading">
                                        <div className="spinner" />
                                        Loading face recognition models…
                                    </div>
                                )}

                                {faceStatus && modelsReady && (
                                    <div className="face-hint">{faceStatus}</div>
                                )}

                                <video
                                    ref={videoRef}
                                    className="face-video"
                                    style={{ display: scanning ? 'block' : 'none' }}
                                    muted autoPlay playsInline
                                    width={320} height={240}
                                />

                                <div className="face-actions">
                                    {modelsReady && !scanning && (
                                        <button type="button" className="btn-scan btn-scan-start" onClick={startFaceScan}>
                                            Start Face Scan
                                        </button>
                                    )}
                                    {scanning && (
                                        <button type="button" className="btn-scan btn-scan-verify" onClick={verifyFace}>
                                            Verify Face
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}