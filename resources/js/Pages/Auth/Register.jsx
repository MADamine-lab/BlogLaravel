import { useRef, useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import * as faceapi from 'face-api.js';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

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
        if (!modelsReady) {
            setStatus('Please wait — models still loading…');
            return;
        }
        try {
            setStatus('Requesting camera access…');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: { ideal: 320 }, height: { ideal: 240 } }
            });
            setCameraOpen(true);

            // Wait for next render cycle for video element to appear
            await new Promise(resolve => setTimeout(resolve, 50));

            if (!videoRef.current) {
                setStatus('Video element not found');
                stream.getTracks().forEach(t => t.stop());
                return;
            }

            videoRef.current.srcObject = stream;

            // Wait for video to actually play
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
                videoRef.current.play().catch(e => {
                    clearTimeout(timeout);
                    reject(e);
                });
            });

            setStatus('Position your face and click Capture.');
        } catch (err) {
            setCameraOpen(false);
            console.error('Camera error:', err);
            setStatus(`Camera error: ${err.message}`);
        }
    }

    async function captureFace() {
        setStatus('Detecting face…');

        if (!videoRef.current) {
            setStatus('Camera not ready — try again.');
            return;
        }

        try {
            // Ensure video is ready
            if (videoRef.current.readyState < 2) {
                setStatus('Video not ready — try again.');
                return;
            }

            const detection = await faceapi
                .detectSingleFace(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                setStatus('No face detected — try again.');
                return;
            }

            const descriptor = Array.from(detection.descriptor);
            setData('face_descriptor', descriptor);
            setCaptured(true);
            setStatus('Face captured successfully!');

            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
                videoRef.current.srcObject = null;
            }
            setCameraOpen(false);

        } catch (err) {
            console.error('Capture error:', err);
            setStatus('Capture failed — try again.');
        }
    }

    function submit(e) {
        e.preventDefault();
        
        // Log what we're sending
        console.log('Submitting registration form with data:', {
            name: data.name,
            email: data.email,
            password: data.password ? '***' : undefined,
            password_confirmation: data.password_confirmation ? '***' : undefined,
            face_descriptor: data.face_descriptor ? `Array of ${data.face_descriptor.length} values` : null,
        });
        
        // Add loading feedback
        setStatus('Creating account...');
        
        post(route('register'), {
            onSuccess: () => {
                setStatus('Registration successful! Redirecting...');
                console.log('Registration successful');
            },
            onError: (errors) => {
                console.error('Registration errors:', errors);
                const errorMessages = Object.values(errors).flat().join(', ');
                setStatus(`Registration failed: ${errorMessages}`);
            },
            onFinish: () => {
                // Form processing is complete, but don't clear status
            },
        });
    }

    return (
        <GuestLayout>
            <Head title="Register" />
            <form onSubmit={submit}>

                {/* Status messages */}
                {processing && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">Creating your account...</p>
                    </div>
                )}
                {status && !processing && (
                    <div className={`mb-4 p-4 rounded-lg border ${
                        status.includes('successful') 
                            ? 'bg-green-50 border-green-200' 
                            : status.includes('Camera error') || status.includes('failed')
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <p className={`text-sm ${
                            status.includes('successful')
                                ? 'text-green-700'
                                : status.includes('Camera error') || status.includes('failed')
                                ? 'text-red-700'
                                : 'text-gray-700'
                        }`}>
                            {status}
                        </p>
                    </div>
                )}

                {/* Show all validation errors */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-semibold text-red-700 mb-2">Errors found:</p>
                        <ul className="text-sm text-red-700 list-disc list-inside">
                            {Object.entries(errors).map(([field, messages]) => (
                                <li key={field}>{field}: {Array.isArray(messages) ? messages.join(', ') : messages}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Name */}
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name" name="name" value={data.name}
                        className="mt-1 block w-full"
                        onChange={e => setData('name', e.target.value)}
                        required autoFocus
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Email */}
                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email" type="email" name="email" value={data.email}
                        className="mt-1 block w-full"
                        onChange={e => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password" type="password" name="password" value={data.password}
                        className="mt-1 block w-full"
                        onChange={e => setData('password', e.target.value)}
                        required autoComplete="new-password"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password */}
                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                        id="password_confirmation" type="password"
                        name="password_confirmation" value={data.password_confirmation}
                        className="mt-1 block w-full"
                        onChange={e => setData('password_confirmation', e.target.value)}
                        required autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* Face ID section */}
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={useFaceId}
                            onChange={e => setUseFaceId(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Enable Face ID login{' '}
                            <span className="text-gray-400 font-normal">(optional)</span>
                        </span>
                    </label>
                    <p className="text-xs text-gray-400 mt-1 ml-6">
                        Lets you log in with your face instead of your password.
                    </p>

                    {useFaceId && (
                        <div className="mt-4 space-y-3">

                            {status && (
                                <p className={`text-sm ${captured ? 'text-green-600' : 'text-gray-500'}`}>
                                    {status}
                                </p>
                            )}

                            {cameraOpen && (
                              <video
                                ref={videoRef}
                                width={320}
                                height={240}
                                muted
                                autoPlay
                                playsInline
                                className="rounded border border-gray-200"
                              />
                            )}
                            {modelsReady && !cameraOpen && !captured && (
                                <button
                                    type="button"
                                    onClick={openCamera}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                    Open Camera
                                </button>
                            )}

                            {cameraOpen && (
                                <button
                                    type="button"
                                    onClick={captureFace}
                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                >
                                    Capture Face
                                </button>
                            )}

                            {captured && (
                                <p className="text-green-600 text-sm font-medium">
                                    ✓ Face saved — you can use Face ID after registering.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end mt-4">
                    <Link href={route('login')} className="underline text-sm text-gray-600 hover:text-gray-900">
                        Already registered?
                    </Link>
                    <PrimaryButton className="ms-4" disabled={processing}>
                        {processing ? 'Creating account...' : 'Register'}
                    </PrimaryButton>
                </div>

            </form>
        </GuestLayout>
    );
}