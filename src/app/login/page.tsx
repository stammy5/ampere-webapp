'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Lock, Mail, Eye, EyeOff, Users } from 'lucide-react'
import { useAuth, DEMO_CREDENTIALS } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showDemo, setShowDemo] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.emailOrUsername || !formData.password) {
      setError('Please enter both username/email and password')
      return
    }
    
    const result = await login(formData.emailOrUsername, formData.password)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  const handleDemoLogin = (emailOrUsername: string, password: string) => {
    setFormData({ emailOrUsername, password })
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ampere-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <img src="/images/ampere-logo.png" alt="Ampere Engineering" className="h-16 w-auto" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your project management dashboard
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Email/Username Field */}
            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500 focus:z-10 sm:text-sm"
                  placeholder="Enter username or email"
                  value={formData.emailOrUsername}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailOrUsername: e.target.value }))}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-ampere-500 focus:border-ampere-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-ampere-600 hover:bg-ampere-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ampere-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Demo Credentials Toggle */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="text-sm text-ampere-600 hover:text-ampere-700 font-medium flex items-center justify-center w-full"
            >
              <Users className="h-4 w-4 mr-1" />
              {showDemo ? 'Hide' : 'Show'} Demo Credentials
            </button>
          </div>

          {/* Demo Credentials */}
          {showDemo && (
            <div className="bg-ampere-50 border border-ampere-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-ampere-900 mb-3">Demo Login Credentials:</h3>
              <div className="space-y-2">
                {DEMO_CREDENTIALS.map((cred, index) => (
                  <div key={index} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleDemoLogin(cred.email, cred.password)}
                      className="w-full text-left p-2 rounded bg-white border border-ampere-200 hover:bg-ampere-100 transition-colors duration-150"
                    >
                      <div className="text-xs font-medium text-ampere-900">{cred.role}</div>
                      <div className="text-xs text-ampere-600">Email: {cred.email}</div>
                      <div className="text-xs text-gray-500">Password: {cred.password}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin(cred.username, cred.password)}
                      className="w-full text-left p-2 rounded bg-white border border-ampere-200 hover:bg-ampere-100 transition-colors duration-150 ml-0"
                    >
                      <div className="text-xs font-medium text-ampere-900">{cred.role} (Username)</div>
                      <div className="text-xs text-ampere-600">Username: {cred.username}</div>
                      <div className="text-xs text-gray-500">Password: {cred.password}</div>
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ampere-600 mt-2">
                Click any credential above to auto-fill the login form
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 Ampere Engineering Pte Ltd. All rights reserved.
          </p>
          <div className="flex justify-center mt-2 space-x-4">
            <img src="/images/bizsafe-logo.png" alt="BizSafe Star Accredited" className="h-8" />
            <img src="/images/iso45001-logo.png" alt="ISO 45001 Certified" className="h-8" />
          </div>
        </div>
      </div>
    </div>
  )
}