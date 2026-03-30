// resources/js/Pages/Admin/Dashboard.jsx

import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Dashboard({ stats, userRegistrations, postsByDay, topUsers, postsByCategory, recentPosts }) {
    // User registration chart data
    const userRegistrationData = {
        labels: userRegistrations.map(item => item.date),
        datasets: [
            {
                label: 'New Users',
                data: userRegistrations.map(item => item.count),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Posts by day chart data
    const postsByDayData = {
        labels: postsByDay.map(item => item.date),
        datasets: [
            {
                label: 'Posts Created',
                data: postsByDay.map(item => item.count),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Posts by category pie chart
    const categoryData = {
        labels: postsByCategory.map(cat => cat.name),
        datasets: [
            {
                data: postsByCategory.map(cat => cat.posts_count),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                ],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
        },
    };

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Admin!</h1>
                        <p className="text-gray-600 mt-1">Here's what's happening with your blog today.</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Total Users</div>
                                    <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {stats.totalAdmins} Admins
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Total Posts</div>
                                    <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPosts}</div>
                                    <div className="text-xs text-green-600 mt-1">
                                        {stats.publishedPosts} Published
                                    </div>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Comments</div>
                                    <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalComments}</div>
                                    <div className="text-xs text-yellow-600 mt-1">
                                        {stats.pendingComments} Pending
                                    </div>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Categories</div>
                                    <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCategories}</div>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">User Registrations (Last 30 Days)</h3>
                            <div className="h-80">
                                <Line data={userRegistrationData} options={chartOptions} />
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Posts Created (Last 30 Days)</h3>
                            <div className="h-80">
                                <Line data={postsByDayData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Posts per Category</h3>
                            <div className="h-80">
                                {postsByCategory.length > 0 ? (
                                    <Pie data={categoryData} options={pieOptions} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        No categories with posts yet
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Posts</h3>
                            <div className="space-y-3">
                                {recentPosts.map((post) => (
                                    <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{post.title}</div>
                                            <div className="text-sm text-gray-500">by {post.author} • {post.created_at}</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                post.is_published 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {post.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Contributors */}
                    {topUsers.length > 0 && (
                        <div className="mt-8 bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Top Contributors</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {topUsers.map((user, index) => (
                                    <div key={user.id} className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600 mb-2">{user.posts_count}</div>
                                        <div className="font-medium text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">posts</div>
                                        {index === 0 && (
                                            <div className="mt-2 text-yellow-500 text-sm">🏆 Top Contributor</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}