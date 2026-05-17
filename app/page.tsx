import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Services from "@/components/sections/Services";
import AgentNet from "@/components/sections/AgentNet";
import Hosting from "@/components/sections/Hosting";
import Stats from "@/components/sections/Stats";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Manifesto />
      <Services />
      <AgentNet />
      <Hosting />
      <Stats />
      <CTA />
      <Footer />
    </>
  );
}
