import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { GoalsSection } from "@/components/goals-section"
import { AboutSection } from "@/components/about-section"
import { VisionSection } from "@/components/vision-section"
import { Footer } from "@/components/footer"
import { SESSION_COOKIE_NAME, verifySignedSessionToken } from "@/lib/auth/session"

export default async function Home() {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value
  const session = await verifySignedSessionToken(sessionCookie)

  if (session?.role === "teacher" || session?.role === "deputy_teacher") {
    redirect("/teacher/dashboard")
  }

  if (session?.role === "student") {
    redirect("/profile")
  }

  if (session?.role === "admin" || session?.role === "supervisor") {
    redirect("/admin/profile")
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">
      <Header />
      <main>
        <HeroSection />
        <div className="bg-white min-h-screen">
          <GoalsSection />
          <AboutSection />
          <VisionSection />
        </div>
      </main>
      <Footer />
    </div>
  )
}
