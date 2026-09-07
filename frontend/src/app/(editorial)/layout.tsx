'use client';

import '@/components/editorial/editorial.css';

export default function EditorialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: '#070707',
        color: '#E0E0E0',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        padding: '4rem 2rem',
        overflowX: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
