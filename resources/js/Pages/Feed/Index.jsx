import { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { db } from '@/config/firebase';
import { ref, onValue } from 'firebase/database';
import axios from 'axios';

export default function Feed({ posts: initialPosts }) {
    const { auth = {} } = usePage().props;
    const [posts, setPosts] = useState(initialPosts);
    const [newComments, setNewComments] = useState({});
    const [loadingComments, setLoadingComments] = useState({});

    const fetchFreshPosts = async () => {
        try {
            const response = await axios.get('/api/feed');
            if (response.data.posts) {
                setPosts(response.data.posts);
            }
        } catch (error) {
            console.log('Error fetching fresh posts:', error);
        }
    };

    useEffect(() => {
        const postsRef = ref(db, 'posts');
        const unsubscribe = onValue(postsRef, (snapshot) => {
            fetchFreshPosts();
        }, (error) => {
            console.log('Firebase read error:', error);
        });

        const pollInterval = setInterval(fetchFreshPosts, 5000);

        return () => {
            unsubscribe();
            clearInterval(pollInterval);
        };
    }, []);

    const handleAddComment = (postId) => {
        if (!newComments[postId]?.trim()) return;

        setLoadingComments((prev) => ({ ...prev, [postId]: true }));

        axios.post(route('comments.store', postId), {
            content: newComments[postId],
        })
            .then((response) => {
                if (response.data.success) {
                    setPosts((prevPosts) =>
                        prevPosts.map((post) =>
                            post.id === postId
                                ? {
                                    ...post,
                                    comments: [
                                        ...(post.comments || []),
                                        response.data.comment,
                                    ],
                                }
                                : post
                        )
                    );
                    setNewComments((prev) => ({ ...prev, [postId]: '' }));
                }
            })
            .catch((error) => {
                console.error('Error adding comment:', error);
            })
            .finally(() => {
                setLoadingComments((prev) => ({ ...prev, [postId]: false }));
            });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Feed" />
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
                
                .feed-container {
                    min-height: 100vh;
                    background: #f7f5f0;
                    font-family: 'DM Sans', sans-serif;
                    padding: 48px 24px;
                }
                
                .feed-header {
                    max-width: 800px;
                    margin: 0 auto 48px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 24px;
                    border-bottom: 1px solid #e2ddd6;
                }
                
                .feed-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 42px;
                    color: #1a1a18;
                    font-weight: 600;
                    margin: 0;
                }
                
                .create-btn {
                    padding: 12px 24px;
                    background: #1a1a18;
                    color: #f7f5f0;
                    border: none;
                    border-radius: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .create-btn:hover {
                    background: #2d2d2a;
                    transform: translateY(-2px);
                }
                
                .posts-wrapper {
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .empty-state {
                    background: #faf9f6;
                    border-radius: 8px;
                    padding: 64px 48px;
                    text-align: center;
                    border: 1px solid #e2ddd6;
                }
                
                .empty-state p {
                    font-size: 15px;
                    color: #6b6b65;
                    margin: 0;
                }
                
                .post-card {
                    background: #faf9f6;
                    border-radius: 8px;
                    padding: 32px;
                    margin-bottom: 24px;
                    border-left: 4px solid #c8a96e;
                    box-shadow: 0 1px 3px rgba(26, 26, 24, 0.04);
                    transition: all 0.2s;
                }
                
                .post-card:hover {
                    box-shadow: 0 4px 12px rgba(26, 26, 24, 0.08);
                    transform: translateY(-2px);
                }
                
                .post-header {
                    margin-bottom: 20px;
                }
                
                .post-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 28px;
                    color: #1a1a18;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                    line-height: 1.3;
                }
                
                .post-meta {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 14px;
                    color: #6b6b65;
                }
                .delete-btn {
                    padding: 6px 14px;
                    background: transparent;
                    color: #c45c4a;
                    border: 1.5px solid #c45c4a;
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .delete-btn:hover {
                    background: #c45c4a;
                    color: white;
                }

                .post-author {
                    font-weight: 500;
                    color: #1a1a18;
                }
                
                .post-dot {
                    color: #c8a96e;
                }
                
                .post-excerpt {
                    font-size: 15px;
                    color: #6b6b65;
                    font-style: italic;
                    margin-bottom: 16px;
                    padding-left: 16px;
                    border-left: 2px solid #e2ddd6;
                }
                
                .post-featured-image {
                    width: 100%;
                    max-height: 360px;
                    object-fit: cover;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    border: 1px solid #e2ddd6;
                }

                .post-content {
                    font-size: 15px;
                    color: #1a1a18;
                    line-height: 1.7;
                    margin-bottom: 24px;
                    white-space: pre-wrap;
                }
                
                .divider {
                    height: 1px;
                    background: #e2ddd6;
                    margin: 24px 0;
                }
                
                .comments-section {
                    margin-top: 24px;
                }
                
                .comments-header {
                    font-family: 'Playfair Display', serif;
                    font-size: 18px;
                    color: #1a1a18;
                    font-weight: 600;
                    margin-bottom: 16px;
                }
                
                .comment-count {
                    color: #c8a96e;
                    font-weight: 400;
                }
                
                .comment-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                
                .comment-item {
                    background: #f7f5f0;
                    border-radius: 6px;
                    padding: 16px;
                    border-left: 3px solid #c8a96e;
                }
                
                .comment-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }
                
                .comment-author {
                    font-weight: 500;
                    font-size: 14px;
                    color: #1a1a18;
                }
                
                .comment-date {
                    font-size: 12px;
                    color: #6b6b65;
                }
                
                .comment-text {
                    font-size: 14px;
                    color: #1a1a18;
                    line-height: 1.5;
                    margin: 0;
                }
                
                .no-comments {
                    font-size: 14px;
                    color: #6b6b65;
                    font-style: italic;
                    padding: 16px;
                    background: #f7f5f0;
                    border-radius: 6px;
                }
                
                .comment-form {
                    display: flex;
                    gap: 12px;
                    margin-top: 16px;
                }
                
                .comment-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1.5px solid #e2ddd6;
                    border-radius: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    background: #f7f5f0;
                    color: #1a1a18;
                    transition: all 0.2s;
                }
                
                .comment-input:focus {
                    outline: none;
                    border-color: #c8a96e;
                    background: #faf9f6;
                }
                
                .comment-input::placeholder {
                    color: #6b6b65;
                }
                
                .comment-btn {
                    padding: 12px 20px;
                    background: #1a1a18;
                    color: #f7f5f0;
                    border: none;
                    border-radius: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                
                .comment-btn:hover:not(:disabled) {
                    background: #2d2d2a;
                    transform: translateY(-1px);
                }
                
                .comment-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                @media (max-width: 640px) {
                    .feed-container {
                        padding: 24px 16px;
                    }
                    
                    .feed-header {
                        flex-direction: column;
                        gap: 16px;
                        text-align: center;
                    }
                    
                    .feed-title {
                        font-size: 32px;
                    }
                    
                    .post-card {
                        padding: 24px;
                    }
                    
                    .post-title {
                        font-size: 22px;
                    }
                    
                    .comment-form {
                        flex-direction: column;
                    }
                }
            `}</style>

            <div className="feed-container">
                <div className="mb-6">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    👋 Hi {auth.user?.name || 'Guest'}!
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Welcome to your Profile.
                                </p>
                            </div>

                <div className="feed-header">
                    <h1 className="feed-title">Stories Feed</h1>
                    <Link href={route('posts.create')} className="create-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Create Post
                    </Link>
                </div>

                <div className="posts-wrapper">
                    {posts.length === 0 ? (
                        <div className="empty-state">
                            <p>No stories yet. Be the first to share your thoughts with the world.</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="post-card">
                                <div className="post-header">
                                    <h3 className="post-title">{post.title}</h3>
                                    <div className="post-meta">
                                        <span className="post-author">{post.user?.name || 'Anonymous'}</span>
                                        <span className="post-dot">•</span>
                                        <span>
                                            {new Date(post.published_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    {auth.user?.id === post.user_id && (
                                        <Link
                                            href={route('posts.destroy', post.id)}
                                            method="delete"
                                            as="button"
                                            className="delete-btn"
                                            onClick={(e) => {
                                                if (!confirm('Are you sure you want to delete this post?')) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            Delete
                                        </Link>
                                    )}
                                </div>

                                {post.featured_image && (
                                    <img
                                        src={`/storage/${post.featured_image}`}
                                        alt={post.title}
                                        className="post-featured-image"
                                    />
                                )}

                                {post.excerpt && (
                                    <p className="post-excerpt">{post.excerpt}</p>
                                )}
                                
                                <p className="post-content">{post.content}</p>

                                <div className="divider"></div>

                                <div className="comments-section">
                                    <h4 className="comments-header">
                                        Comments <span className="comment-count">({post.comments?.length || 0})</span>
                                    </h4>

                                    {post.comments && post.comments.length > 0 ? (
                                        <div className="comment-list">
                                            {post.comments.map((comment) => (
                                                <div key={comment.id} className="comment-item">
                                                    <div className="comment-header">
                                                        <span className="comment-author">
                                                            {comment.user?.name || 'Anonymous'}
                                                        </span>
                                                        <span className="comment-date">
                                                            {new Date(comment.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="comment-text">{comment.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-comments">No comments yet. Start the conversation.</p>
                                    )}

                                    <div className="comment-form">
                                        <input
                                            type="text"
                                            placeholder="Share your thoughts..."
                                            value={newComments[post.id] || ''}
                                            onChange={(e) =>
                                                setNewComments((prev) => ({
                                                    ...prev,
                                                    [post.id]: e.target.value,
                                                }))
                                            }
                                            disabled={loadingComments[post.id]}
                                            className="comment-input"
                                        />
                                        <button
                                            onClick={() => handleAddComment(post.id)}
                                            disabled={
                                                !newComments[post.id]?.trim() ||
                                                loadingComments[post.id]
                                            }
                                            className="comment-btn"
                                        >
                                            {loadingComments[post.id] ? 'Posting...' : 'Post'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}