import { useRef, useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';

export default function Login({ status, canResetPassword }) {
    const videoRef = useRef(null);

    const [mode,        setMode]        = useState('password');
    const [faceStatus,  setFaceStatus]  = useState('');
    const [modelsReady, setModelsReady] = useState(false);
    const [scanning,    setScanning]    = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email:    '',
        password: '',
        remember: false,
    });

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
            setFaceStatus('Requesting camera access…');
            
            // Get camera stream BEFORE rendering video element
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: { ideal: 320 }, height: { ideal: 240 } }
            });

            // NOW set scanning to true (this renders the video element)
            setScanning(true);

            // Wait for next render cycle for video element to appear
            await new Promise(resolve => setTimeout(resolve, 50));

            if (!videoRef.current) {
                setFaceStatus('Video element not found');
                stream.getTracks().forEach(t => t.stop());
                return;
            }

            videoRef.current.srcObject = stream;

            // Wait for video to actually start playing
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Video failed to load'));
                }, 5000);

                const onCanPlay = () => {
                    clearTimeout(timeout);
                    videoRef.current?.removeEventListener('canplay', onCanPlay);
                    resolve();
                };

                videoRef.current.addEventListener('canplay', onCanPlay);
                
                // Try to play immediately
                videoRef.current.play().catch(e => {
                    clearTimeout(timeout);
                    reject(e);
                });
            });

            setFaceStatus('Look at the camera, then click Verify.');
        } catch (err) {
            setScanning(false);
            console.error('Camera error:', err);
            setFaceStatus(`Camera error: ${err.message}`);
        }
    }

    async function verifyFace() {
        setFaceStatus('Scanning…');

        if (!videoRef.current) {
            setFaceStatus('Camera not ready — try again.');
            return;
        }

        try {
            // Ensure video is playing and has content
            if (videoRef.current.readyState < 2) {
                setFaceStatus('Video not ready — try again.');
                return;
            }

            const detection = await faceapi
                .detectSingleFace(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                setFaceStatus('No face detected — try again.');
                return;
            }

            // Stop the video stream
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
                videoRef.current.srcObject = null;
            }
            setScanning(false);
            setFaceStatus('Matching…');

            const response = await axios.post(route('login.face'), {
                descriptor: Array.from(detection.descriptor),
            });

            if (response.data.success) {
                window.location.href = response.data.redirect;
            } else {
                setFaceStatus('Face not recognised. Try password login.');
            }
        } catch (err) {
            console.error('Face login error:', err);
            setFaceStatus('Error — try again.');
        }
    }

    function submitPassword(e) {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    }

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">{status}</div>
            )}

            {/* Mode toggle */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-6">
                <button
                    type="button"
                    onClick={() => setMode('password')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        mode === 'password'
                            ? 'bg-gray-800 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    Email & Password
                </button>
                <button
                    type="button"
                    onClick={() => setMode('face')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        mode === 'face'
                            ? 'bg-gray-800 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    Face ID
                </button>
            </div>

            {/* Password login */}
            {mode === 'password' && (
                <form onSubmit={submitPassword}>
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email" type="email" name="email" value={data.email}
                            className="mt-1 block w-full"
                            onChange={e => setData('email', e.target.value)}
                            autoFocus autoComplete="username"
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password" type="password" name="password" value={data.password}
                            className="mt-1 block w-full"
                            onChange={e => setData('password', e.target.value)}
                            autoComplete="current-password"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-4 block">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                            />
                            <span className="ms-2 text-sm text-gray-600">Remember me</span>
                        </label>
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        {canResetPassword && (
                            <Link href={route('password.request')}
                                className="underline text-sm text-gray-600 hover:text-gray-900">
                                Forgot your password?
                            </Link>
                        )}
                        <PrimaryButton className="ms-4" disabled={processing}>
                            Log in
                        </PrimaryButton>
                    </div>
                </form>
            )}

            {/* Face ID login */}
            {mode === 'face' && (
                <div className="space-y-4">
                    {faceStatus && (
                        <p className="text-sm text-gray-500">{faceStatus}</p>
                    )}

                    {scanning && (
                        <video
                            ref={videoRef}
                            width={320}
                            height={240}
                            muted
                            autoPlay
                            playsInline
                            className="rounded border border-gray-200 mx-auto block"
                        />
                    )}

                    {modelsReady && !scanning && (
                        <button
                            type="button"
                            onClick={startFaceScan}
                            className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                        >
                            Start Scan
                        </button>
                    )}

                    {scanning && (
                        <button
                            type="button"
                            onClick={verifyFace}
                            className="w-full py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
                        >
                            Verify Face
                        </button>
                    )}
                </div>
            )}

        </GuestLayout>
    );
}