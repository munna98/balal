import MarketingNav from '@/components/marketing/MarketingNav'
import HeroSection from '@/components/marketing/HeroSection'
import FeaturesSection from '@/components/marketing/FeaturesSection'
import PricingSection from '@/components/marketing/PricingSection'
import TestimonialsSection from '@/components/marketing/TestimonialsSection'
import CtaSection from '@/components/marketing/CtaSection'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export default function MarketingPage() {
  return (
    <main className="min-h-screen">
      <MarketingNav />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
      <MarketingFooter />
    </main>
  )
}
