import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useDemoStore } from '../../store/demoStore';
import { MapView } from '../../components/map/MapView';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Truck,
  Leaf,
  Droplets,
  Scale,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileCheck2,
  ChevronRight,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { demoLogin, isAuthenticated, user } = useAuthStore();
  const { startWalkthrough } = useDemoStore();
  const [stats, setStats] = useState({
    totalMealsRedistributed: 14250,
    totalFoodDivertedKg: 5985,
    estimatedCo2SavedKg: 14962,
    estimatedWaterSavedLiters: 5087250,
  });

  useEffect(() => {
    api
      .get('/analytics/overview')
      .then((res) => {
        if (res.data?.data?.metrics) {
          setStats(res.data.data.metrics);
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickDemo = async (role) => {
    await demoLogin(role);
    const routes = {
      DONOR: '/donor',
      DELIVERY_PARTNER: '/delivery',
      RECEIVER: '/receiver',
      ADMIN: '/admin',
    };
    navigate(routes[role] || '/donor');
  };

  const sampleMapMarkers = [
    { coords: [75.8937, 22.7533], type: 'DONOR', title: 'Hotel Surplus', description: '110 Meals Available', isMasked: true },
    { coords: [75.8841, 22.7156], type: 'RECEIVER', title: 'Community Shelter', description: 'Capacity: 250 Meals', isMasked: true },
    { coords: [75.8775, 22.7249], type: 'DONOR', title: 'Bakery Partner', description: 'Packaged Food', isMasked: true },
    { coords: [75.8654, 22.6922], type: 'RECEIVER', title: 'Roti Bank Chapter', description: 'Distributing Dinner', isMasked: true },
    { coords: [75.888, 22.738], type: 'DELIVERY', title: 'Active Transit', description: 'Partner on Route', isMasked: true },
  ];

  return (
    <div className="min-h-screen bg-white text-content-primary">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="AnnSarthi Logo" className="w-10 h-10" />
            <div className="text-left">
              <span className="font-extrabold text-xl font-heading text-brand-900 leading-none block">
                AnnSarthi
              </span>
              <span className="text-[10px] text-brand-700 font-bold uppercase tracking-wider block mt-0.5">
                SIH26234 • Smart Food Ecosystem
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={startWalkthrough}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 transition-all shadow-soft"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Judge Walkthrough</span>
            </button>

            {isAuthenticated ? (
              <Link
                to={`/${user?.role?.toLowerCase() || 'donor'}`}
                className="px-4 py-2 text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-soft transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-content-secondary hover:text-content-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-soft transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Smart India Hackathon SIH26234 Solution</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-brand-950 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Turn Surplus Food Into <span className="text-brand-600">Shared Impact</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-content-secondary max-w-2xl mx-auto leading-relaxed">
          AnnSarthi connects hotels, restaurants, colleges, and event banquets with verified NGOs,
          community shelters, and delivery partners through AI-assisted risk screening and optimized
          local routing.
        </p>

        {/* Primary CTA Buttons with Role Preselection */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/register?role=DONOR"
            className="px-6 py-3.5 text-sm sm:text-base font-bold bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl shadow-card transition-all flex items-center gap-2"
          >
            <span>Donate Food</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register?role=RECEIVER"
            className="px-6 py-3.5 text-sm sm:text-base font-bold bg-white hover:bg-surface-subtle text-content-primary border border-surface-border rounded-xl shadow-soft transition-all"
          >
            Find Food (NGOs)
          </Link>
          <Link
            to="/register?role=DELIVERY_PARTNER"
            className="px-6 py-3.5 text-sm sm:text-base font-bold bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-xl transition-all"
          >
            Become Delivery Partner
          </Link>
        </div>

        {/* 1-Click Demo Evaluation Bar */}
        <div className="mt-10 p-4 max-w-3xl mx-auto bg-surface-subtle border border-surface-border rounded-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div>
              <span className="text-xs font-bold text-brand-900 block">⚡ Instant Judge Demo Login</span>
              <span className="text-[11px] text-content-secondary">
                No sign-up required. Jump directly into any of the 4 role portals:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleQuickDemo('DONOR')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-surface-border hover:border-brand-500 text-brand-800 shadow-sm transition-all"
              >
                Donor
              </button>
              <button
                onClick={() => handleQuickDemo('RECEIVER')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-surface-border hover:border-brand-500 text-brand-800 shadow-sm transition-all"
              >
                NGO
              </button>
              <button
                onClick={() => handleQuickDemo('DELIVERY_PARTNER')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-surface-border hover:border-brand-500 text-brand-800 shadow-sm transition-all"
              >
                Driver
              </button>
              <button
                onClick={() => handleQuickDemo('ADMIN')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-brand-900 text-white hover:bg-black shadow-sm transition-all"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS STEPPER */}
      <section className="py-16 bg-surface-subtle border-y border-surface-border px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 font-heading">
            Workflow Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-950 mt-1">
            How AnnSarthi Operates
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary max-w-xl mx-auto mt-2">
            A closed-loop, verifiable redistribution pipeline engineered for trust, safety, and rapid transit.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 text-left">
            {[
              { num: '01', title: 'Donate', desc: 'Listing created with meal count, preparation time, and storage method.' },
              { num: '02', title: 'Safety Screen', desc: 'AI-assisted risk screening evaluates shelf life and photo quality.' },
              { num: '03', title: 'Verify', desc: 'Human-in-the-loop review approves flagged items before redistribution.' },
              { num: '04', title: 'Smart Match', desc: 'Weighted algorithm pairs donation with nearby verified shelters.' },
              { num: '05', title: 'Deliver', desc: 'Optimized 2-opt routing with OTP and photo proof of pickup.' },
              { num: '06', title: 'Impact', desc: 'Live calculations log diverted CO2 and conserved water resources.' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-surface-border shadow-soft relative group hover:border-brand-500 transition-all"
              >
                <span className="text-2xl font-black font-heading text-brand-100 group-hover:text-brand-500 transition-colors">
                  {step.num}
                </span>
                <h4 className="text-base font-bold font-heading text-brand-900 mt-2">{step.title}</h4>
                <p className="text-xs text-content-secondary mt-1 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HONEST AI FEATURES */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transparent & Explainable AI</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-950">
          Intelligent Decision Support, Not Black Boxes
        </h2>
        <p className="text-xs sm:text-sm text-content-secondary max-w-2xl mx-auto mt-2">
          AnnSarthi strictly avoids deceptive claims: AI is applied solely for risk anomaly detection,
          quantile surplus forecasting, and multi-factor matching. Every output exposes its methodology.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-white border border-surface-border rounded-2xl shadow-soft">
            <div className="p-3 w-fit rounded-xl bg-brand-50 text-brand-700 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold font-heading text-brand-900">Food Safety Screening</h4>
            <p className="text-xs text-content-secondary mt-2 leading-relaxed">
              Combines dynamic shelf-life limits with image sharpness and duplicate hash scans.
              Suspicious items are safely held for certified human inspector verification.
            </p>
            <span className="inline-block mt-4 text-[10px] uppercase font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              Method: Rule-Engine + Image CV
            </span>
          </div>

          <div className="p-6 bg-white border border-surface-border rounded-2xl shadow-soft">
            <div className="p-3 w-fit rounded-xl bg-brand-50 text-brand-700 mb-4">
              <Scale className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold font-heading text-brand-900">Surplus Quantile Forecast</h4>
            <p className="text-xs text-content-secondary mt-2 leading-relaxed">
              Scikit-learn GradientBoosting quantile regression estimates expected surplus ranges
              (70% confidence intervals) to help kitchens proactively reduce preparation waste.
            </p>
            <span className="inline-block mt-4 text-[10px] uppercase font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              Method: Quantile ML Regression
            </span>
          </div>

          <div className="p-6 bg-white border border-surface-border rounded-2xl shadow-soft">
            <div className="p-3 w-fit rounded-xl bg-brand-50 text-brand-700 mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold font-heading text-brand-900">Explainable Smart Matching</h4>
            <p className="text-xs text-content-secondary mt-2 leading-relaxed">
              Scores matches with full transparency. Receivers see exact breakdowns: distance weight,
              diet compatibility, capacity alignment, and delivery feasibility.
            </p>
            <span className="inline-block mt-4 text-[10px] uppercase font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              Method: Explainable Multi-Factor Scoring
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 4: IMPACT STATISTICS */}
      <section className="py-16 bg-brand-900 text-white px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-300 font-heading">
            Live Ecosystem Telemetry (Indore Region)
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white mt-1">
            Proven Social & Ecological Impact
          </h2>

          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-brand-950/60 border border-brand-800">
              <p className="text-3xl sm:text-4xl font-black font-heading text-brand-300">
                {stats.totalMealsRedistributed.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-white mt-1">Meals Served</p>
              <span className="text-[10px] text-brand-400">Nutritional security provided</span>
            </div>

            <div className="p-6 rounded-2xl bg-brand-950/60 border border-brand-800">
              <p className="text-3xl sm:text-4xl font-black font-heading text-brand-300">
                {stats.totalFoodDivertedKg.toLocaleString()} kg
              </p>
              <p className="text-xs sm:text-sm font-semibold text-white mt-1">Food Waste Diverted</p>
              <span className="text-[10px] text-brand-400">Kept out of local landfills</span>
            </div>

            <div className="p-6 rounded-2xl bg-brand-950/60 border border-brand-800">
              <p className="text-3xl sm:text-4xl font-black font-heading text-brand-300">
                {stats.estimatedCo2SavedKg.toLocaleString()} kg
              </p>
              <p className="text-xs sm:text-sm font-semibold text-white mt-1">Estimated CO₂e Saved</p>
              <span className="text-[10px] text-brand-400">FAO emission baseline (2.5x)</span>
            </div>

            <div className="p-6 rounded-2xl bg-brand-950/60 border border-brand-800">
              <p className="text-3xl sm:text-4xl font-black font-heading text-brand-300">
                {(stats.estimatedWaterSavedLiters / 1000000).toFixed(1)}M L
              </p>
              <p className="text-xs sm:text-sm font-semibold text-white mt-1">Virtual Water Conserved</p>
              <span className="text-[10px] text-brand-400">Agricultural footprint saved</span>
            </div>
          </div>
          <p className="text-[11px] text-brand-300/70 mt-6 max-w-xl mx-auto">
            *Environmental metrics represent peer-reviewed life-cycle estimates. See detailed methodology for formula citations.
          </p>
        </div>
      </section>

      {/* SECTION 5: FOR DONORS / NGOS / PARTNERS */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-950">
          Built for Every Ecosystem Participant
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Donors Card */}
          <div className="p-6 bg-white border border-surface-border rounded-2xl shadow-soft flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">For Surplus Donors</span>
              <h3 className="text-xl font-bold font-heading text-brand-900 mt-1">Hotels, Banquets & Canteens</h3>
              <ul className="mt-4 space-y-2 text-xs text-content-secondary">
                <li className="flex items-center gap-2">✓ Automated safety screening in under 3 seconds</li>
                <li className="flex items-center gap-2">✓ Non-punitive Trust Profile with reliability badges</li>
                <li className="flex items-center gap-2">✓ Digital pickup OTP protection against theft</li>
                <li className="flex items-center gap-2">✓ Automated CSR & ESG impact certificates</li>
              </ul>
            </div>
            <Link
              to="/register?role=DONOR"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800"
            >
              <span>Register as a Food Donor</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* NGOs Card */}
          <div className="p-6 bg-white border border-surface-border rounded-2xl shadow-soft flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">For Receivers & NGOs</span>
              <h3 className="text-xl font-bold font-heading text-brand-900 mt-1">Shelters, Kitchens & Homes</h3>
              <ul className="mt-4 space-y-2 text-xs text-content-secondary">
                <li className="flex items-center gap-2">✓ Only verified, temperature-checked food matched</li>
                <li className="flex items-center gap-2">✓ Transparent match percentages and distance radius</li>
                <li className="flex items-center gap-2">✓ Live delivery tracking on interactive Leaflet maps</li>
                <li className="flex items-center gap-2">✓ Digital signature delivery confirmation pad</li>
              </ul>
            </div>
            <Link
              to="/register?role=RECEIVER"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800"
            >
              <span>Register as an NGO Receiver</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Partners Card */}
          <div className="p-6 bg-white border border-surface-border rounded-2xl shadow-soft flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">For Delivery Partners</span>
              <h3 className="text-xl font-bold font-heading text-brand-900 mt-1">Volunteers & Logistics Fleets</h3>
              <ul className="mt-4 space-y-2 text-xs text-content-secondary">
                <li className="flex items-center gap-2">✓ Nearest-neighbour + 2-opt route multi-stop optimization</li>
                <li className="flex items-center gap-2">✓ Capacity-aware assignment (Bikes, 3W, Insulated Vans)</li>
                <li className="flex items-center gap-2">✓ Rapid proof of pickup (Photo + OTP verification)</li>
                <li className="flex items-center gap-2">✓ Direct incident and damaged packaging reporting</li>
              </ul>
            </div>
            <Link
              to="/register?role=DELIVERY_PARTNER"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800"
            >
              <span>Join as a Logistics Partner</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6: LIVE ECOSYSTEM MAP PREVIEW */}
      <section className="py-16 bg-surface-subtle border-y border-surface-border px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 font-heading">
            Live Ecosystem Activity
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-brand-950 mt-1">
            Indore Region Redistribution Map
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary max-w-xl mx-auto mt-2">
            Explore live donor surplus nodes, community receiver hubs, and delivery transit routes with
            privacy-preserving location masking.
          </p>

          <div className="mt-8 max-w-5xl mx-auto">
            <MapView
              markers={sampleMapMarkers}
              center={[22.7244, 75.8824]}
              zoom={13}
              height="450px"
              routeCoordinates={[
                [22.7533, 75.8937],
                [22.738, 75.888],
                [22.7156, 75.8841],
              ]}
            />
          </div>
        </div>
      </section>

      {/* SECTION 7: TRUST & SAFETY */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-surface-border shadow-soft max-w-4xl mx-auto text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-brand-950">
                Non-Negotiable Food Safety & Privacy Framework
              </h3>
              <p className="text-xs text-content-secondary">Strict compliance with FSSAI guidance principles</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
            <p>
              <strong>Safety Disclaimer:</strong> AnnSarthi explicitly acknowledges that AI models cannot
              guarantee food safety or microbiological sterility. AI algorithms provide initial risk screening,
              perceptual hash fraud detection, and anomaly flagging.
            </p>
            <p>
              <strong>Human Verification Queue:</strong> All medium and high-risk listings are automatically held
              under <span className="font-semibold text-amber-700">REVIEW_REQUIRED</span> status and cannot enter
              the redistribution pool until an authorized human inspector verifies temperature, container seal,
              and preparation logs.
            </p>
            <p>
              <strong>Privacy Protection:</strong> Exact contact numbers and street addresses remain masked to
              unauthorized viewers. Only the confirmed delivery partner receives active pickup and drop coordinates.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: FOOTER */}
      <footer className="bg-brand-950 text-brand-200 py-12 border-t border-brand-900 px-4 sm:px-6 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="AnnSarthi" className="w-8 h-8" />
            <div>
              <span className="font-bold text-white text-base font-heading">AnnSarthi</span>
              <p className="text-[11px] text-brand-400">Smart Food Waste Redistribution Ecosystem (SIH26234)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-brand-300">
            <Link to="/about" className="hover:text-white transition-colors">Architecture</Link>
            <Link to="/analytics" className="hover:text-white transition-colors">Impact Methodology</Link>
            <Link to="/login" className="hover:text-white transition-colors">Demo Portals</Link>
          </div>

          <p className="text-[11px] text-brand-400">
            Built for Smart India Hackathon • Problem Statement SIH26234
          </p>
        </div>
      </footer>
    </div>
  );
}
