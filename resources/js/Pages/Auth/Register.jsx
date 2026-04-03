import { useRef, useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import * as faceapi from 'face-api.js';

export default function Register() {
    const videoRef = useRef(null);

    const [modelsReady, setModelsReady] = useState(false);
    const [useFaceId,   setUseFaceId]   = useState(false);
    const [cameraOpen,  setCameraOpen]  = useState(false);
    const [captured,    setCaptured]    = useState(false);
    const [status,      setStatus]      = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name:                  '',
        email:                 '',
        password:              '',
        password_confirmation: '',
        face_descriptor:       null,
    });

    useEffect(() => {
        if (!useFaceId || modelsReady) return;
        setStatus('Loading face models…');
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]).then(() => {
            setModelsReady(true);
            setStatus('Ready — click Open Camera.');
        });
    }, [useFaceId]);

    async function openCamera() {
        if (!modelsReady) { setStatus('Please wait — models still loading…'); return; }
        try {
            setStatus('Requesting camera…');
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 320 }, height: { ideal: 240 } } });
            setCameraOpen(true);
            await new Promise(resolve => setTimeout(resolve, 50));
            if (!videoRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
            videoRef.current.srcObject = stream;
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Video timeout')), 5000);
                const onCanPlay = () => { clearTimeout(timeout); videoRef.current?.removeEventListener('canplay', onCanPlay); resolve(); };
                videoRef.current.addEventListener('canplay', onCanPlay);
                videoRef.current.play().catch(e => { clearTimeout(timeout); reject(e); });
            });
            setStatus('Position your face and click Capture.');
        } catch (err) { setCameraOpen(false); setStatus(`Camera error: ${err.message}`); }
    }

    async function captureFace() {
        setStatus('Detecting face…');
        if (!videoRef.current || videoRef.current.readyState < 2) { setStatus('Video not ready — try again.'); return; }
        try {
            const detection = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
            if (!detection) { setStatus('No face detected — try again.'); return; }
            setData('face_descriptor', Array.from(detection.descriptor));
            setCaptured(true);
            setStatus('Face captured!');
            if (videoRef.current?.srcObject) { videoRef.current.srcObject.getTracks().forEach(t => t.stop()); videoRef.current.srcObject = null; }
            setCameraOpen(false);
        } catch (err) { setStatus('Capture failed — try again.'); }
    }

    function submit(e) {
        e.preventDefault();
        post(route('register'));
    }

    return (
        <>
            <Head title="Create account" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #f7f5f0; }
                .reg-wrap {
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    font-family: 'DM Sans', sans-serif;
                }
                @media (max-width: 768px) {
                    .reg-wrap { grid-template-columns: 1fr; }
                    .reg-left { display: none; }
                }
                .reg-left {
                    background: #1a1a18;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 48px;
                    position: relative;
                    overflow: hidden;
                }
                .reg-left::before {
                    content: '';
                    position: absolute;
                    top: -80px; right: -80px;
                    width: 320px; height: 320px;
                    border-radius: 50%;
                    background: #c8a96e22;
                    pointer-events: none;
                }
                .reg-left-brand {
                    font-family: 'Playfair Display', serif;
                    font-size: 22px;
                    color: #c8a96e;
                    letter-spacing: 0.02em;
                }
                .reg-left-quote {
                    font-family: 'Playfair Display', serif;
                    font-size: 36px;
                    line-height: 1.3;
                    color: #f0ece4;
                    font-weight: 400;
                }
                .reg-left-quote em { color: #c8a96e; font-style: normal; }
                .reg-left-sub {
                    font-size: 14px;
                    color: #6b6b65;
                    line-height: 1.6;
                }
                .reg-right {
                    background: #f7f5f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 40px;
                }
                .reg-form-wrap {
                    width: 100%;
                    max-width: 420px;
                }
                .reg-heading {
                    font-family: 'Playfair Display', serif;
                    font-size: 30px;
                    color: #1a1a18;
                    font-weight: 600;
                    margin-bottom: 6px;
                }
                .reg-sub {
                    font-size: 14px;
                    color: #6b6b65;
                    margin-bottom: 32px;
                }
                .reg-sub a {
                    color: #c8a96e;
                    text-decoration: none;
                    font-weight: 500;
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
                    transition: border-color 0.2s;
                    outline: none;
                }
                .field input:focus { border-color: #c8a96e; }
                .field input::placeholder { color: #b0aca5; }
                .field-error {
                    font-size: 12px;
                    color: #c0392b;
                    margin-top: 4px;
                }
                .divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 24px 0;
                }
                .divider-line { flex: 1; height: 1px; background: #e2ddd6; }
                .divider-text { font-size: 12px; color: #9e9a93; letter-spacing: 0.06em; text-transform: uppercase; }
                .face-box {
                    border: 1.5px dashed #d4cfc7;
                    border-radius: 12px;
                    padding: 20px;
                    background: #faf9f6;
                    margin-bottom: 20px;
                }
                .face-toggle {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    user-select: none;
                }
                .face-toggle input[type=checkbox] { display: none; }
                .face-toggle-track {
                    width: 36px; height: 20px;
                    background: #d4cfc7;
                    border-radius: 10px;
                    position: relative;
                    transition: background 0.2s;
                    flex-shrink: 0;
                }
                .face-toggle-track.on { background: #c8a96e; }
                .face-toggle-track::after {
                    content: '';
                    position: absolute;
                    top: 3px; left: 3px;
                    width: 14px; height: 14px;
                    background: #fff;
                    border-radius: 50%;
                    transition: transform 0.2s;
                }
                .face-toggle-track.on::after { transform: translateX(16px); }
                .face-toggle-label { font-size: 14px; font-weight: 500; color: #1a1a18; }
                .face-toggle-sub { font-size: 12px; color: #9e9a93; margin-top: 2px; }
                .face-status {
                    margin-top: 14px;
                    font-size: 13px;
                    padding: 8px 12px;
                    border-radius: 6px;
                    background: #f0ece4;
                    color: #6b6b65;
                }
                .face-status.success { background: #edf7ed; color: #2d6a2d; }
                .face-status.error { background: #fdf0ef; color: #c0392b; }
                video.face-video {
                    width: 100%;
                    border-radius: 8px;
                    margin-top: 12px;
                    border: 1.5px solid #e2ddd6;
                }
                .btn-row {
                    display: flex;
                    gap: 10px;
                    margin-top: 12px;
                }
                .btn-camera {
                    flex: 1;
                    padding: 10px 16px;
                    border: none;
                    border-radius: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .btn-camera:hover { opacity: 0.85; }
                .btn-open { background: #1a1a18; color: #fff; }
                .btn-capture { background: #c8a96e; color: #fff; }
                .face-success {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 14px;
                    font-size: 13px;
                    color: #2d6a2d;
                    font-weight: 500;
                }
                .face-success::before {
                    content: '✓';
                    width: 20px; height: 20px;
                    background: #2d6a2d;
                    color: #fff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    flex-shrink: 0;
                }
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
                    margin-top: 8px;
                }
                .btn-submit:hover { background: #2d2d2a; }
                .btn-submit:active { transform: scale(0.99); }
                .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
                .global-errors {
                    background: #fdf0ef;
                    border: 1.5px solid #f5c6c2;
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin-bottom: 20px;
                    font-size: 13px;
                    color: #c0392b;
                }
            `}</style>

            <div className="reg-wrap">
                {/* Left panel */}
                <div className="reg-left">
                    <div className="reg-left-brand">The Blog</div>
                    <div>
                        <div className="reg-left-quote">
                            Share your <em>ideas</em> with the world — one story at a time.
                        </div>
                    </div>
                    <div className="reg-left-sub">
                        Join thousands of writers and readers.<br />
                        Your voice belongs here.
                    </div>
                </div>

                {/* Right panel */}
                <div className="reg-right">
                    <div className="reg-form-wrap">
                        <h1 className="reg-heading">Create account</h1>
                        <p className="reg-sub">
                            Already a member?{' '}
                            <Link href={route('login')}>Sign in</Link>
                        </p>

                        {Object.keys(errors).length > 0 && (
                            <div className="global-errors">
                                {Object.values(errors).map((msg, i) => (
                                    <div key={i}>{msg}</div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="field">
                                <label htmlFor="name">Full name</label>
                                <input id="name" type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Your Name" required autoFocus />
                                {errors.name && <div className="field-error">{errors.name}</div>}
                            </div>

                            <div className="field">
                                <label htmlFor="email">Email address</label>
                                <input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="you@example.com" required />
                                {errors.email && <div className="field-error">{errors.email}</div>}
                            </div>

                            <div className="field">
                                <label htmlFor="password">Password</label>
                                <input id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Min. 8 characters" required autoComplete="new-password" />
                                {errors.password && <div className="field-error">{errors.password}</div>}
                            </div>

                            <div className="field">
                                <label htmlFor="password_confirmation">Confirm password</label>
                                <input id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} placeholder="Repeat your password" required autoComplete="new-password" />
                            </div>

                            <div className="divider">
                                <div className="divider-line" />
                                <span className="divider-text">Optional</span>
                                <div className="divider-line" />
                            </div>

                            {/* Face ID */}
                            <div className="face-box">
                                <label className="face-toggle" onClick={() => setUseFaceId(v => !v)}>
                                    <div className={`face-toggle-track ${useFaceId ? 'on' : ''}`} />
                                    <div>
                                        <div className="face-toggle-label">Enable Face ID login</div>
                                        <div className="face-toggle-sub">Log in with your face instead of your password</div>
                                    </div>
                                </label>

                                {useFaceId && (
                                    <>
                                        {status && !captured && (
                                            <div className={`face-status ${status.includes('error') || status.includes('failed') ? 'error' : ''}`}>
                                                {status}
                                            </div>
                                        )}

                                        <video
                                            ref={videoRef}
                                            className="face-video"
                                            style={{ display: cameraOpen ? 'block' : 'none' }}
                                            muted autoPlay playsInline
                                            width={320} height={240}
                                        />

                                        {captured ? (
                                            <div className="face-success">
                                                Face saved — you can use Face ID after registering
                                            </div>
                                        ) : (
                                            <div className="btn-row">
                                                {modelsReady && !cameraOpen && (
                                                    <button type="button" className="btn-camera btn-open" onClick={openCamera}>
                                                        Open Camera
                                                    </button>
                                                )}
                                                {cameraOpen && (
                                                    <button type="button" className="btn-camera btn-capture" onClick={captureFace}>
                                                        Capture Face
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <button type="submit" className="btn-submit" disabled={processing}>
                                {processing ? 'Creating account…' : 'Create account'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}