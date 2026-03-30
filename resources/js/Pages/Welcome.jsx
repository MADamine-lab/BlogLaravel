import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-8">Blog</h1>
                <div className="flex gap-4">
                    {auth?.user ? (
                        <Link href={route('dashboard')}
                            className="px-4 py-2 bg-gray-800 text-white rounded">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')}
                                className="px-4 py-2 bg-gray-800 text-white rounded">
                                Log in
                            </Link>
                            <Link href={route('register')}
                                className="px-4 py-2 border border-gray-800 rounded">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}