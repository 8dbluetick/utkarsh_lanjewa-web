import React from 'react';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import BioSection from './components/BioSection/BioSection';
import ContentHub from './components/ContentHub/ContentHub';
import StoreSection from './components/StoreSection/StoreSection';
import ContactFooter from './components/ContactFooter/ContactFooter';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <BioSection />
        <ContentHub />
        <StoreSection />
      </main>
      <ContactFooter />
    </>
  );
}

export default App;
