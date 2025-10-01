

import Navbar from "./component/Navbar";
import Hero from "./component/Hero";
import FeaturesSection from "./component/Feature";
// import AstGraph from "./component/astgraph";
export default function Home() {
  return (
   <>
   <div className="bg-gradient-to-b from-teal-800 to-teal-950  min-h-screen flex flex-col items-center  text-white">
   <Navbar/>
   <Hero/>
   <FeaturesSection/>
   <div style={{ height: '100vh', margin: 0, background: '#0b1220' }}>
      {/* <AstGraph /> */}
    </div>
   </div>
   </>
  );
}
