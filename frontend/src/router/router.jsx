import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import Home from '../features/home/components/Home';
import ProfileComplete from '../pages/ProfileComplete';
import PageNotFound from '../pages/pageNotFound';
import HomeLayout from '../components/layouts/HomeLayout';
import { AuthPage } from '../features/auth';
import DirectMessage from '../features/chat/pages/DirectMessage';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <AuthLayout authentication={true}>
                <HomeLayout /> {/* This will render the HomeLayout and its nested routes */}
            </AuthLayout>
        ),
        children: [
            {
                index: true,
                element: (
                    <Home />
                ),
            },
            {
                path: '/:directMsgId',
                element: (
                    <DirectMessage />
                ),
            },

        ],
    },
    {
        path: "/direct-chat",
        element: (
            <AuthLayout authentication={true}>
                <HomeLayout />
            </AuthLayout>
        ),
        children: [
            {
                path: ":directChatId",
                element: (
                    <DirectMessage />
                ),
            },
        ]
    },
    {
        path: '/login',
        element: (
            <AuthLayout authentication={false}>
                <AuthPage />
            </AuthLayout>
        )
    },
    {
        path: '/profile-complete',
        element: (
            <AuthLayout authentication={true}>
                <ProfileComplete />
            </AuthLayout>
        )
    },
    {
        path: '*',
        element: (
            <AuthLayout authentication={false}>
                <PageNotFound />
            </AuthLayout>
        )
    },


])

export default router;