import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { RoadmapSection } from './components/RoadmapSection';
import { Footer } from './components/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <PageContainer>
        <HeroSection />
        <FeaturesSection />
        <RoadmapSection />
      </PageContainer>
      <Footer />
    </>
  );
}
