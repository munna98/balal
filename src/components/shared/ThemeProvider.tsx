'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'theme'
const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
  })
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === 'undefined') return 'light'
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const syncTheme = (nextTheme: Theme) => {
      const nextResolved = nextTheme === 'system' ? getSystemTheme() : nextTheme
      setThemeState(nextTheme)
      setResolvedTheme(nextResolved)
      applyTheme(nextResolved)
    }

    const storedTheme = window.localStorage.getItem(STORAGE_KEY)
    const initialTheme: Theme =
      storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
        ? storedTheme
        : 'system'

    syncTheme(initialTheme)

    const handleMediaChange = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      const currentTheme: Theme =
        stored === 'light' || stored === 'dark' || stored === 'system' ? stored : initialTheme

      if (currentTheme === 'system') {
        syncTheme('system')
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return

      const nextTheme: Theme =
        event.newValue === 'light' || event.newValue === 'dark' || event.newValue === 'system'
          ? event.newValue
          : 'system'

      syncTheme(nextTheme)
    }

    mediaQuery.addEventListener('change', handleMediaChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (nextTheme) => {
        window.localStorage.setItem(STORAGE_KEY, nextTheme)
        const nextResolved = nextTheme === 'system' ? getSystemTheme() : nextTheme
        setThemeState(nextTheme)
        setResolvedTheme(nextResolved)
        applyTheme(nextResolved)
      },
    }),
    [theme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
