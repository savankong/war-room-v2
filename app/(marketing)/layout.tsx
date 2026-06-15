import MarketingNav from '@/components/MarketingNav';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mkt-root">
      <MarketingNav />
      {children}
    </div>
  );
}
