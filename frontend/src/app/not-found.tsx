export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-[var(--text-strong)] mb-4">404</h2>
        <p className="text-[var(--text-muted)] mb-6">Page not found</p>
        <a href="/login" className="text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium">Go to Login</a>
      </div>
    </div>
  );
}
