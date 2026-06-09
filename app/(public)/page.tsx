'use client'
import { useState } from 'react'
import { SplashIntro } from '@/components/landing/SplashIntro'
import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { USPSection } from '@/components/landing/USPSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { PortfolioSection } from '@/components/landing/PortfolioSection'
import { EcoSection } from '@/components/landing/EcoSection'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <>
      {!splashDone && <SplashIntro onComplete={() => setSplashDone(true)} />}
      <Navbar />
      <main>
        <HeroSection />
        <USPSection />
        <HowItWorks />
        <PortfolioSection />
        <EcoSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
