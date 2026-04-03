import Navbar from "./_components/Navbar";
import { Toaster } from "sonner";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main 
        style={{ 
          minHeight: 'calc(100vh - 64px)',
          background: 'var(--bg-surface)'
        }}
      >
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </>
  );
}
