import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </>
  );
}
