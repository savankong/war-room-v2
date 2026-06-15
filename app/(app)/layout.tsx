import Nav from '@/components/Nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root">
      <Nav />
      <div className="main">{children}</div>
    </div>
  );
}
