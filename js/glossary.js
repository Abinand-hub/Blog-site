// SYNAPSE TECH JOURNAL - Core Concept Glossary & Deep Knowledge Store
const CONCEPT_GLOSSARY = {
  "topological-qubits": {
    term: "Topological Majorana Qubits",
    category: "Quantum Physics",
    badge: "FUNDAMENTAL PHYSICS",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
    summary: "Qubits that store quantum information non-locally in pairs of Majorana zero modes, making them immune to local thermal noise and physical disturbances.",
    mechanism: "Instead of storing state in the excitation of a single electron or superconducting loop, topological qubits braid quasi-particles in 2D space. Information is encoded in the topological order of the braids, which cannot be destroyed without tearing the entire physical manifold.",
    metrics: [
      { label: "Error Suppression", value: "10^-6 per gate operation" },
      { label: "Operating Temperature", value: "15 mK (Cryogenic sub-Kelvin)" },
      { label: "Coherence Lifetime", value: "> 1,200 microseconds" }
    ],
    relatedArticleId: "ai-1"
  },
  "backside-power": {
    term: "Backside Power Delivery (PowerVia)",
    category: "Semiconductor Architecture",
    badge: "SILICON ENGINEERING",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    summary: "A revolutionary silicon fabrication method that routes power supply lines beneath the active transistor layer on the reverse of the wafer.",
    mechanism: "Traditional silicon chips route both power lines and data signals on the frontside interconnect layers above the transistors, creating severe routing congestion, resistance (IR drop), and signal degradation. Backside power flips power delivery to the bottom side using through-silicon vias (TSVs), reducing voltage drop by 30% and freeing 100% of frontside metal for signal routing.",
    metrics: [
      { label: "Voltage Drop Reduction", value: "30% Lower IR Drop" },
      { label: "Standard Cell Density Uplift", value: "+20% to +35%" },
      { label: "Target Process Nodes", value: "Intel 20A / 18A, TSMC A16" }
    ],
    relatedArticleId: "silicon-1"
  },
  "liquid-neural-networks": {
    term: "Liquid Neural Networks (LNNs)",
    category: "Artificial Intelligence",
    badge: "NEURAL COMPUTING",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    summary: "Continuous-time neural networks based on non-linear ordinary differential equations that dynamically adapt their parameters during live inference.",
    mechanism: "Unlike standard transformers with frozen static weight matrices, LNNs continuously solve differential equations modeling synaptic transmission. This allows the model to interpret continuous streaming inputs (like video feeds, flight telemetry, or medical sensors) with extreme parameter efficiency and zero catastrophic forgetting.",
    metrics: [
      { label: "Parameter Reduction", value: "90% fewer weights vs Transformers" },
      { label: "Inference Latency", value: "< 2.1 ms on microcontrollers" },
      { label: "Robustness Score", value: "4.8x higher noise tolerance" }
    ],
    relatedArticleId: "ai-5"
  },
  "stellarator-fusion": {
    term: "Stellarator Magnetic Confinement",
    category: "Clean Energy & Plasma Physics",
    badge: "FUSION POWER",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80",
    summary: "A complex twisted magnetic bottle designed with supercomputers to continuously confine high-temperature fusion plasma without net plasma current.",
    mechanism: "Tokamaks rely on driving an internal electric current through the plasma itself to maintain stability, leading to sudden disruptive plasma collapses. Stellarators use 3D twisted external high-temperature superconducting (HTS) coils that create a naturally stable magnetic geometry, enabling continuous 24/7 plasma operations for thousands of hours.",
    metrics: [
      { label: "Core Plasma Temperature", value: "150 Million °C" },
      { label: "Continuous Burn Record", value: "1,000+ Hours" },
      { label: "Net Thermal Output", value: "450 MW Grid Equivalent" }
    ],
    relatedArticleId: "space-1"
  },
  "magnetoencephalography": {
    term: "Non-Invasive Magnetoencephalography (MEG)",
    category: "Neurotechnology",
    badge: "BRAIN-COMPUTER INTERFACES",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
    summary: "Ultra-sensitive quantum optically pumped magnetometers (OPMs) capable of detecting femtotesla magnetic fields produced by cortical neural firing through the skull.",
    mechanism: "Every time neurons fire action potentials, tiny ionic currents produce microscopic magnetic fields that pass uninhibited through human bone and scalp tissue. By placing high-density vapor-cell magnetometers against the scalp, neural intent is reconstructed with millisecond temporal resolution and sub-millimeter spatial localization.",
    metrics: [
      { label: "Decoding Speed", value: "140 Words Per Minute" },
      { label: "Sensor Sensitivity", value: "5 fT / sqrt(Hz)" },
      { label: "Invasiveness", value: "0% (Zero surgical risk)" }
    ],
    relatedArticleId: "robotics-2"
  },
  "solid-state-batteries": {
    term: "Sulfide-Based Solid-State Electrolytes",
    category: "Energy Storage",
    badge: "BATTERY MATERIALS",
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80",
    summary: "Non-flammable solid ceramic-sulfide electrolytes replacing volatile liquid solvents in next-generation lithium-metal electric vehicle cells.",
    mechanism: "Liquid electrolytes suffer from dendritic lithium metal shorts and catastrophic thermal runaway above 60°C. Solid sulfide crystal lattices conduct lithium ions at room temperature faster than liquid electrolytes while physically blocking dendrites, unlocking pure silicon or lithium-metal anodes for 2x energy density.",
    metrics: [
      { label: "Gravimetric Energy Density", value: "520 Wh / kg" },
      { label: "Charge Rate (10% to 80%)", value: "8.2 Minutes" },
      { label: "Operating Temperature Range", value: "-40°C to +80°C" }
    ],
    relatedArticleId: "gadgets-2"
  },
  "spatial-micro-oled": {
    term: "8K Micro-OLED Silicon Backplane Optics",
    category: "Optoelectronics",
    badge: "SPATIAL COMPUTING",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format&fit=crop&q=80",
    summary: "Ultra-high-density micro-displays manufactured directly on silicon wafer backplanes, achieving 4,000+ pixels per inch with sub-millisecond response.",
    mechanism: "Unlike glass-substrate phone panels, micro-OLEDs deposit organic light-emitting diodes on top of custom CMOS drive transistors on monocrystalline silicon. This packs millions of pixels into the size of a postage stamp, completely eliminating the 'screen-door effect' in spatial computing pancake optics.",
    metrics: [
      { label: "Pixel Density", value: "4,200 PPI" },
      { label: "Peak Luminance", value: "5,000 Nits" },
      { label: "Motion-to-Photon Latency", value: "< 4.5 milliseconds" }
    ],
    relatedArticleId: "gadgets-1"
  },
  "zero-knowledge-proofs": {
    term: "zk-SNARKs (Zero-Knowledge Cryptography)",
    category: "Cybersecurity & Cryptography",
    badge: "PRIVACY TECH",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    summary: "Cryptographic mathematical proofs that allow one party to prove the truth of a statement to another without revealing any underlying data.",
    mechanism: "Using elliptic curve pairings and arithmetic circuit constraint systems (R1CS), a prover generates a succinct proof of knowledge. The verifier can check validity in milliseconds without ever seeing the private keys, biometrics, or sensitive identity attributes.",
    metrics: [
      { label: "Verification Time", value: "< 3 milliseconds" },
      { label: "Proof Size", value: "~256 bytes" },
      { label: "Mathematical Security", value: "Post-Quantum 128-bit+" }
    ],
    relatedArticleId: "culture-3"
  }
};
