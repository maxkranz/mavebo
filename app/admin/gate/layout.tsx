// The gate page is public — no auth check here, the gate component handles it
export default function AdminGateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
