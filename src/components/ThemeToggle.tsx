'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      /* localStorage 不可でも切替は機能させる */
    }
    setDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="ライト/ダーク表示切替"
      title="ライト/ダーク表示切替"
      className="flex h-7 w-7 items-center justify-center rounded-full border border-rule text-[13px] leading-none text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {dark === null ? '◐' : dark ? '☀' : '☾'}
    </button>
  );
}
