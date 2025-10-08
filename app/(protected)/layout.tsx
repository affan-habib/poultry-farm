
import { MainLayout } from "@/components/main-layout"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <MainLayout>{children}</MainLayout>
  )
}
