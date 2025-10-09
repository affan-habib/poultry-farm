
import { MainLayout } from "@/components/main-layout"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <MainLayout>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </MainLayout>
  )
}
