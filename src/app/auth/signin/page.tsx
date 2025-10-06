'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function SignInContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for OAuth callback with token from Django
  useEffect(() => {
    const token = searchParams.get('token')
    const oauthError = searchParams.get('error')
    const emailParam = searchParams.get('email')
    const nameParam = searchParams.get('name')

    if (token) {
      // Sign in with Django token using NextAuth
      const signInWithToken = async () => {
        try {
          const result = await signIn('django-token', {
            token,
            email: emailParam,
            name: nameParam,
            redirect: false,
          })

          if (result?.ok) {
            setSuccess(true)
            setTimeout(() => {
              router.push('/dashboard')
            }, 1000)
          } else {
            setError('Authentication failed. Please try again.')
          }
        } catch (error) {
          setError('Connection error. Please try again.')
        }
      }

      signInWithToken()
    } else if (oauthError) {
      setError(`Google authentication failed: ${oauthError}`)
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error) {
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignin = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Call Django backend to get Google OAuth URL
      const response = await fetch(
        `${API_URL}/api/auth/google/init/?redirect_uri=${encodeURIComponent(
          window.location.origin + '/auth/signin'
        )}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (response.ok && data.authorization_url) {
        // Redirect to Google OAuth
        window.location.href = data.authorization_url
      } else {
        setError(data.error || 'Failed to initialize Google authentication')
        setIsLoading(false)
      }
    } catch (error) {
      setError('Failed to connect to authentication server')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-neon-green/20 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-neon-green rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-gray-400">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-neon-green/20 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-emerald-400 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-neon-green via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              NevoChat
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-colors pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-neon-green to-emerald-400 text-black font-bold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-neon-green/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        {/* OR Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black/80 text-gray-400">OR</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <motion.button
          type="button"
          onClick={handleGoogleSignin}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-3 hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </motion.button>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-neon-green hover:text-emerald-400 font-semibold transition-colors">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-neon-green transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
