import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.jsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import {Provider} from "react-redux" 
import store from './store/store.js'
import AuthLayout from './components/AuthLayout.jsx'
import LoginSignup from './pages/LoginSignup.jsx'
import ProfileComplete from './pages/ProfileComplete.jsx'
import PageNotFound from './pages/pageNotFound.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    // element: <App />,
    children: [
      {
        path: '/',
        element: (
          <AuthLayout authentication={false}>
            <Home />
          </AuthLayout>
        ),
      },
      {
        path: '/login',
        element: (
          <AuthLayout authentication={false}>
            <LoginSignup />
          </AuthLayout>
        )
      },
      {
        path: '/profile-complete',
        element: (
          <AuthLayout authentication={false}>
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
    ],
  },
])



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
    {/* <App /> */}
  </StrictMode>,
)
