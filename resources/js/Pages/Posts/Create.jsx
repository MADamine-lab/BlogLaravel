import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function CreatePost() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        excerpt: '',
        content: '',
        featured_image: null,
    });

    const [imagePreview, setImagePreview]   = useState(null);
    const [imageChecking, setImageChecking] = useState(false);
    const [imageError, setImageError]       = useState(null);

    const checkImageNSFW = async (file) => {
        setImageChecking(true);
        setImageError(null);

        try {
            const formData = new FormData();
            formData.append('media', file);
            formData.append('models', 'nudity-2.0,offensive');
            formData.append('api_user', import.meta.env.VITE_SIGHTENGINE_USER);
            formData.append('api_secret', import.meta.env.VITE_SIGHTENGINE_SECRET);

            const response = await fetch('https://api.sightengine.com/1.0/check.json', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.status !== 'success') return true; // allow on API error

            const explicit  = result?.nudity?.sexual_explicit ?? 0;
            const display   = result?.nudity?.sexual_display  ?? 0;
            const offensive = result?.offensive?.prob         ?? 0;

            if (explicit > 0.5 || display > 0.5 || offensive > 0.5) {
                return false; // NSFW
            }
            return true; // Safe
        } catch (err) {
            return true; // Allow on network error
        } finally {
            setImageChecking(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isSafe = await checkImageNSFW(file);

        if (!isSafe) {
            setImageError('This image was flagged as inappropriate and cannot be uploaded.');
            setData('featured_image', null);
            setImagePreview(null);
            e.target.value = ''; // reset file input
            return;
        }

        setData('featured_image', file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (imageChecking) return;
        post(route('posts.store'), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Post" />
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
                
                .create-container {
                    min-height: 100vh;
                    background: #f7f5f0;
                    font-family: 'DM Sans', sans-serif;
                    padding: 48px 24px;
                }
                
                .create-wrapper {
                    max-width: 720px;
                    margin: 0 auto;
                }
                
                .create-header {
                    margin-bottom: 32px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid #e2ddd6;
                }
                
                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #6b6b65;
                    text-decoration: none;
                    margin-bottom: 16px;
                    transition: color 0.2s;
                }
                .back-link:hover { color: #c8a96e; }
                
                .create-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 42px;
                    color: #1a1a18;
                    font-weight: 600;
                    margin: 0;
                }
                
                .create-subtitle {
                    font-size: 15px;
                    color: #6b6b65;
                    margin-top: 8px;
                }
                
                .form-card {
                    background: #faf9f6;
                    border-radius: 8px;
                    padding: 40px;
                    border-left: 4px solid #c8a96e;
                    box-shadow: 0 1px 3px rgba(26, 26, 24, 0.04);
                }
                
                .form-group { margin-bottom: 28px; }
                
                .form-label {
                    display: block;
                    font-family: 'Playfair Display', serif;
                    font-size: 16px;
                    color: #1a1a18;
                    font-weight: 600;
                    margin-bottom: 10px;
                }
                .form-label span {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    color: #6b6b65;
                    font-weight: 400;
                    margin-left: 8px;
                }
                
                .form-input, .form-textarea {
                    width: 100%;
                    padding: 14px 18px;
                    border: 1.5px solid #e2ddd6;
                    border-radius: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px;
                    color: #1a1a18;
                    background: #f7f5f0;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }
                .form-input:focus, .form-textarea:focus {
                    outline: none;
                    border-color: #c8a96e;
                    background: #faf9f6;
                    box-shadow: 0 0 0 3px rgba(200, 169, 110, 0.1);
                }
                .form-input::placeholder, .form-textarea::placeholder { color: #6b6b65; }
                .form-textarea { resize: vertical; min-height: 200px; line-height: 1.7; }
                
                .error-message {
                    font-size: 13px;
                    color: #c45c4a;
                    margin-top: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                /* Image upload */
                .image-upload-area {
                    border: 2px dashed #e2ddd6;
                    border-radius: 8px;
                    padding: 28px;
                    text-align: center;
                    transition: all 0.2s;
                    background: #f7f5f0;
                }
                .image-upload-area:hover { border-color: #c8a96e; background: #faf9f6; }
                .image-upload-area input[type="file"] { display: none; }

                .image-upload-label {
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }
                .image-upload-icon { color: #c8a96e; }
                .image-upload-text { font-size: 14px; color: #6b6b65; }
                .image-upload-hint { font-size: 12px; color: #9b9b95; }

                .image-checking {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #c8a96e;
                    margin-top: 10px;
                }

                .image-preview {
                    margin-top: 12px;
                    position: relative;
                    display: inline-block;
                }
                .image-preview img {
                    max-height: 180px;
                    border-radius: 6px;
                    border: 1.5px solid #e2ddd6;
                    object-fit: cover;
                }
                .image-preview-remove {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #c45c4a;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 22px;
                    height: 22px;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    padding-top: 8px;
                }
                
                .btn-primary {
                    padding: 14px 28px;
                    background: #1a1a18;
                    color: #f7f5f0;
                    border: none;
                    border-radius: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-primary:hover:not(:disabled) { background: #2d2d2a; transform: translateY(-2px); }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .btn-secondary {
                    padding: 14px 28px;
                    background: transparent;
                    color: #6b6b65;
                    border: 1.5px solid #e2ddd6;
                    border-radius: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px;
                    font-weight: 500;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                }
                .btn-secondary:hover { color: #1a1a18; border-color: #c8a96e; background: #f7f5f0; }
                
                @media (max-width: 640px) {
                    .create-container { padding: 24px 16px; }
                    .create-title { font-size: 32px; }
                    .form-card { padding: 24px; }
                    .form-actions { flex-direction: column; }
                    .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
                }
            `}</style>

            <div className="create-container">
                <div className="create-wrapper">
                    <div className="create-header">
                        <Link href={route('feed')} className="back-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Back to Feed
                        </Link>
                        <h1 className="create-title">Create Story</h1>
                        <p className="create-subtitle">Share your thoughts with the world</p>
                    </div>

                    <div className="form-card">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter a captivating title..."
                                    className="form-input"
                                    disabled={processing}
                                />
                                {errors.title && <p className="error-message">{errors.title}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Summary <span>(optional)</span></label>
                                <input
                                    type="text"
                                    value={data.excerpt}
                                    onChange={(e) => setData('excerpt', e.target.value)}
                                    placeholder="A brief teaser for your story..."
                                    className="form-input"
                                    disabled={processing}
                                />
                                {errors.excerpt && <p className="error-message">{errors.excerpt}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Your Story</label>
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Begin writing here..."
                                    rows="10"
                                    className="form-textarea"
                                    disabled={processing}
                                />
                                {errors.content && <p className="error-message">{errors.content}</p>}
                            </div>

                            {/* Featured Image with NSFW check */}
                            <div className="form-group">
                                <label className="form-label">
                                    Featured Image <span>(optional)</span>
                                </label>
                                <div className="image-upload-area">
                                    <label className="image-upload-label">
                                        <input
                                            type="file"
                                            accept="image/jpg,image/jpeg,image/png,image/webp"
                                            onChange={handleImageChange}
                                            disabled={processing || imageChecking}
                                        />
                                        <svg className="image-upload-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                        <span className="image-upload-text">Click to upload an image</span>
                                        <span className="image-upload-hint">JPG, PNG, WEBP — max 2MB</span>
                                    </label>
                                </div>

                                {/* Checking spinner */}
                                {imageChecking && (
                                    <div className="image-checking">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:'spin 1s linear infinite'}}>
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                                        </svg>
                                        Checking image for inappropriate content...
                                        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                                    </div>
                                )}

                                {/* NSFW error */}
                                {imageError && (
                                    <p className="error-message">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                        {imageError}
                                    </p>
                                )}

                                {/* Preview */}
                                {imagePreview && !imageError && (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                        <button
                                            type="button"
                                            className="image-preview-remove"
                                            onClick={() => {
                                                setData('featured_image', null);
                                                setImagePreview(null);
                                                setImageError(null);
                                            }}
                                        >×</button>
                                    </div>
                                )}

                                {errors.featured_image && (
                                    <p className="error-message">{errors.featured_image}</p>
                                )}
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    disabled={processing || imageChecking}
                                    className="btn-primary"
                                >
                                    {processing ? 'Publishing...' : imageChecking ? 'Checking image...' : 'Publish Story'}
                                </button>
                                <Link href={route('feed')} className="btn-secondary">
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}