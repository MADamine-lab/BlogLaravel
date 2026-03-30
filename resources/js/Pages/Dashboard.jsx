import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { userName, userEmail } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Greeting */}
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    👋 Hi {userName}!
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Welcome to your dashboard.
                                </p>
                            </div>

                            {/* Content */}
                            <div className="text-gray-900">
                                <p className="text-lg">You're successfully logged in!</p>
                                <p className="mt-2 text-gray-600">Email: <span className="font-semibold text-gray-900">{userEmail}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
