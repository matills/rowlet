import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout'
import {
  HomePage,
  SearchPage,
  MyListPage,
  LoginPage,
  RegisterPage,
  ProfilePage,
  ProfileSettingsPage,
  StatsPage,
  WrappedPage,
  GoogleCallbackPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '@/pages'
import { useThemeStore } from '@/stores'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="browse" element={<SearchPage />} />
              <Route path="movies" element={<SearchPage />} />
              <Route path="tv" element={<SearchPage />} />
              <Route path="anime" element={<SearchPage />} />
              <Route path="my-list" element={<MyListPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/settings" element={<ProfileSettingsPage />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="wrapped" element={<WrappedPage />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<GoogleCallbackPage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
