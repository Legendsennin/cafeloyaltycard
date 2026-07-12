"use client"; // Required for interactive elements like buttons and alerts
import { useState } from "react"; // add state variable to track punched stamps. its the primary way to manage data that changes over time in a React component. when the state changes, the component re-renders to reflect the new data. import { Html5QrcodeScanner} } from "html5-qrcode";
import { Html5Qrcode } from "html5-qrcode";
import {motion} from "framer-motion"
import PakInchikLogo from "@/components/PakInchikLogo";


export default function PunchCard() {

  //LOGICS FOR STAMPING , QR SCANNING, AND MODAL CONTROL

// 'stamps' is the current value (starting at 2)
  // 'setStamps' is the function we use to change that value
  const [stamps, setStamps] = useState(0); // Start with 0 stamps punched
const [isScanning , setIsScanning] = useState(false); // Track if the QR scanner is active
  const addStamp = () => {
    if (stamps < 7) {
      setStamps(stamps + 1);
    } else {
      alert("Congratulations! You've earned a free Americano! 🎁 Thank you for your continuous support!");
      setStamps(0); // Reset after winning
    }
  };

  //Show modal state to control the visibility of the QR scanner modal
const [isModalOpen, setIsModalOpen] = useState(false);


  const handleOpenScanner = () => {
  setIsModalOpen(true);
  
  setTimeout(() => {
    // 1. Create a new instance of the Camera (not the UI scanner)
    const html5QrCode = new Html5Qrcode("reader");

    const config = { 
      fps: 10, 
      qrbox: { width: 300, height: 300 },
      // 2. FORCE the "environment" (back) camera
      videoConstraints: { facingMode: "environment" } 
    };

    // 3. Start the live stream
    html5QrCode.start(
      { facingMode: "environment" }, 
      config,
      (decodedText) => {
        // SUCCESS LOGIC
        if (decodedText === "PAK_INCHIK_COFFEE_2026") {
          addStamp();
          html5QrCode.stop().then(() => {
            setIsModalOpen(false);
          });
        }
      },
      (errorMessage) => {
        // Scanning... (ignore constant "No QR found" errors)
      }
    ).catch((err) => {
      console.error("Camera start error:", err);
      alert("Could not start camera. Check permissions or use HTTPS.");
    });
  }, 300);
};

// UI DESIGN AND LAYERING   
  return (



    
    <main className="min-h-dvh w-full overflow-y-auto bg-radial from-[#ecb176] via-[#A67B5B] to-[#2C1810] flex justify-center items-center px-4 py-6 sm:py-10">
      {/* LAYER 1: THE RESPONSIVE FRAME */}
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl
                      bg-white/5 backdrop-blur-sm
                      rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
        
        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex flex-col p-5 pt-8 sm:p-8 sm:pt-12 md:p-10 overflow-y-auto no-scrollbar">
          
          {/* LAYER 2: THE HEADER */}
          <header className="flex items-center w-full max-w-xl mx-auto mb-6 sm:mb-8 gap-3">
            <div className="justify-items-center">
              <PakInchikLogo className="w-28 sm:w-40 h-auto mb-3 sm:mb-4" />
              </div>

            
          </header>

          {/* --- LAYER 3: GLASS LOYALTY CARD --- */}
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{duration:0.5}}
            className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 p-5 sm:p-8 shadow-2xl relative overflow-hidden mt-4 sm:mt-6"
          >
            
            {/* Decorative Glow inside the card */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-600/10 blur-3xl rounded-full"></div>

            {/* 1. CARD HEADER */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#3D2B1F] to-[#1A0F0A] rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                  <span className="text-2xl">☕</span>
                </div>
                <div>
                  <h2 className="text-white font-extrabold text-xl tracking-tight">Hello, User!</h2>
                  <p className="text-white text-xs font-medium uppercase tracking-wider">Loyalty Member</p>
                </div>
              </div>
              
            </div>

            {/* 2. DIVIDER */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

            {/* 3. PROMO MESSAGE */}
            <p className="text-center text-stone-300 text-sm font-medium mb-8">
              Collect 8 stamps for a free brew!
            </p>

            {/* --- LAYER 4: STAMP GRID --- */}
            <div className="grid grid-cols-4 gap-y-6 gap-x-4 px-2">
              {[...Array(8)].map((_, index) => {
                const isPunched = index < stamps; 
                const isLast = index === 7;

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={`
                        aspect-square w-full rounded-full flex items-center justify-center transition-all duration-500 shadow-lg
                        ${isPunched 
                          ? 'bg-white scale-100' 
                          : 'border-2 border-dashed border-white/20 bg-white/5 scale-90'}
                        ${isLast && !isPunched ? 'border-amber-500/50 bg-amber-500/10' : ''}
                      `}
                    >
                      {isPunched ? (
                        <span className="text-xl">☕</span>
                      ) : isLast ? (
                        <span className="text-xl opacity-40">🎁</span>
                      ) : (
                        <span className="text-[10px] font-bold text-white/10">{index + 1}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- LAYER 5: INTERACTIVE ACTION AREA --- */}
            <div className="mt-10">
              {/* Divider */}
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>
              
              {/* Primary Scan Button */}
              <button 
                onClick={handleOpenScanner}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-2xl 
                           flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-amber-900/40"
              >
                <span className="text-xl">📷</span>
                <span className="tracking-tight">Scan QR </span>
              </button>

              <p className="text-center text-white text-[10px] font-bold uppercase tracking-[0.2em] mt-4">
                Ask staff to scan your code after purchase 
              </p>
            </div>





          </motion.section>
          

        </div>
      </div>

{/* --- QR SCANNER MODAL OVERLAY --- */}
{isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
    {/* 1. The Backdrop (click to close) */}
    <div 
      className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      onClick={() => setIsModalOpen(false)}
    />

    {/* 2. The Modal Card */}
    <div className="relative w-full max-w-sm bg-[#1A0F0A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-8">
        <h3 className="text-white text-center font-bold text-xl mb-2">Scan Staff QR</h3>
        <p className="text-stone-400 text-center text-xs mb-6">
          Please allow camera access to collect your stamp
        </p>

        {/* The Viewfinder Box */}
        <div className="w-full bg-black rounded-3xl border-2 border-amber-600/50 overflow-hidden relative">
          <div id="reader" className="w-full h-full"></div>
          
          {/* Decorative Corner Borders */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-500 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-500 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-500 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-500 rounded-br-lg"></div>
        </div>

        <button 
          onClick={() => setIsModalOpen(false)}
          className="w-full mt-6 py-3 text-stone-400 font-bold text-sm hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </main>
  );
}
