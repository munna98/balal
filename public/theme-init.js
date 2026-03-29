(() => {
  try {
    const stored = localStorage.getItem('theme')
    const theme =
      stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
    const resolved =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme
    const root = document.documentElement
    root.classList.toggle('dark', resolved === 'dark')
    root.style.colorScheme = resolved
  } catch {}
})()
