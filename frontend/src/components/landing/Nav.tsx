'use client';

import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#e4e2dd] bg-[#f9f8f6]/88 px-6 md:px-10 backdrop-blur-md">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        Norm<span className="text-[#0f766e]">etta</span>
      </Link>
      <div className="hidden items-center gap-8 md:flex">
        <Link href="#features" className="text-sm text-[#6b7280] hover:text-[#0e1117]">
          Features
        </Link>
        <Link href="#how" className="text-sm text-[#6b7280] hover:text-[#0e1117]">
          How it works
        </Link>
        <Link href="#pricing" className="text-sm text-[#6b7280] hover:text-[#0e1117]">
          Pricing
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-[#0e1117] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f766e]"
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}