import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  Cpu,
  FileText,
  Flame,
  GraduationCap,
  LogIn,
  Moon,
  Ruler,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, SplitText);

interface LandingPageProps {
  onGoToLogin: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

type NavSectionId = 'hero' | 'about-fractureai' | 'features' | 'cta';

interface FeatureItem {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  details: string[];
  badge: string;
}

const HERO_SPECIALTIES = [
  'الذكاء الاصطناعي القابل للتفسير (Explainable AI)',
  'الكشف الدقيق عن كسور العظام بالأشعة السينية',
  'توليد الخرائط الحرارية التوضيحية (Grad-CAM)',
  'أدوات قياس طبية وتقارير تشخيصية فورية',
];

const FEATURES: FeatureItem[] = [
  {
    id: 'detection',
    icon: ScanLine,
    title: 'الكشف الآلي السريع عن الكسور',
    description:
      'الكشف الآلي السريع عن الكسور وتحديد مواضعها بدقة متناهية عبر نماذج الرؤية الحاسوبية المتقدمة مع تحديد صناديق الاكتشاف ونسب الثقة.',
    details: [
      'رسم صناديق التحديد الموجهة (Bounding Boxes) حول موضع الكسر بدقة.',
      'حساب نسبة الثقة التشخيصية (Confidence Score) لكل اشتباه.',
      'دعم معالجة صور الأشعة السينية بمختلف مناطق الجسم.',
    ],
    badge: 'Computer Vision',
  },
  {
    id: 'gradcam',
    icon: Flame,
    title: 'الذكاء الاصطناعي القابل للتفسير',
    description:
      'الذكاء الاصطناعي القابل للتفسير عبر خرائط الانتباه الحرارية (Grad-CAM / Heatmap) لإبراز مناطق الاشتباه وتعزيز ثقة الطبيب في القرار.',
    details: [
      'عرض خريطة حرارية توضح المناطق الأكثر تأثيراً في قرار النموذج.',
      'إمكانية التبديل بين الصورة الأصلية والخريطة الحرارية والتباين العظمي.',
      'دعم اتخاذ القرار السريري بشفافية كاملة أمام الأطباء.',
    ],
    badge: 'Explainable AI',
  },
  {
    id: 'reports',
    icon: Ruler,
    title: 'أدوات قياس وتقارير فورية',
    description:
      'أدوات قياس طبية مدمجة لقياس المسافات والزوايا وتوليد تقارير تشخيصية فورية قابلة للطباعة والحفظ لدعم القرار السريري.',
    details: [
      'أدوات Caliper لقياس المسافات و Angle لقياس الزوايا العظمية.',
      'توليد تقارير سريرية متكاملة متعددة الصفحات جاهزة للطباعة أو الحفظ كـ PDF.',
      'حفظ سجل الحالات والمراجعات الطبية بأمان عبر قاعدة البيانات السحابية.',
    ],
    badge: 'Clinical Workflow',
  },
];

const NAV_LINKS: { id: NavSectionId; label: string }[] = [
  { id: 'hero', label: 'الرئيسية' },
  { id: 'about-fractureai', label: 'عن المشروع' },
  { id: 'features', label: 'المميزات' },
  { id: 'cta', label: 'ابدأ الآن' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToLogin,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const [activeNav, setActiveNav] = useState<NavSectionId>('hero');
  const [specialtyIndex, setSpecialtyIndex] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);

  // Rotate Hero specialty text smoothly with AnimatePresence
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSpecialtyIndex((prev) => (prev + 1) % HERO_SPECIALTIES.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  // Pause Lenis background scrolling when a detail modal is open
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (selectedFeature) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [selectedFeature]);

  // Lenis + GSAP ScrollTrigger + SplitText setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Top scroll progress bar (scrub)
      if (progressBarRef.current) {
        gsap.fromTo(
          progressBarRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
            },
          },
        );
      }

      // Hero visual card subtle parallax on scroll
      if (heroVisualRef.current) {
        gsap.to(heroVisualRef.current, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Track active nav section on scroll
      (['hero', 'about-fractureai', 'features', 'cta'] as NavSectionId[]).forEach((sectionId) => {
        const el = document.getElementById(sectionId);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 45%',
          end: 'bottom 45%',
          onEnter: () => setActiveNav(sectionId),
          onEnterBack: () => setActiveNav(sectionId),
        });
      });

      // GSAP SplitText for h1 and h2 headings (words preserve Arabic connected script)
      const headings = gsap.utils.toArray<HTMLElement>('[data-split-heading]');
      headings.forEach((heading, index) => {
        SplitText.create(heading, {
          type: 'words',
          aria: 'auto',
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.words, {
              y: 24,
              opacity: 0,
              duration: 0.7,
              stagger: 0.045,
              ease: 'power3.out',
              delay: index === 0 ? 0.1 : 0,
              scrollTrigger: {
                trigger: heading,
                start: 'top 88%',
                once: true,
              },
            });
          },
        });
      });
    }, containerRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollToSection = (sectionId: NavSectionId) => {
    setActiveNav(sectionId);
    const target = document.getElementById(sectionId);
    if (!target) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -76 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className={`min-h-screen transition-colors duration-300 relative overflow-x-hidden font-[Tajawal,Poppins,sans-serif] ${
        isLight ? 'bg-[#f1f5f9] text-slate-900' : 'bg-[#060f18] text-slate-100'
      }`}
    >
      {/* Top Scroll Progress Bar (GSAP ScrollTrigger scrub) */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none bg-transparent">
        <div
          ref={progressBarRef}
          style={{ transformOrigin: 'right center' }}
          className={`h-full w-full ${
            isLight
              ? 'bg-gradient-to-l from-[#0284c7] to-cyan-400'
              : 'bg-gradient-to-l from-[#4cd6fe] to-blue-500 shadow-[0_0_10px_#4cd6fe]'
          }`}
        />
      </div>

      {/* Decorative Ambient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute -top-32 -right-32 w-[460px] h-[460px] rounded-full blur-[130px] ${
            isLight ? 'bg-sky-300/35' : 'bg-[#4cd6fe]/10'
          }`}
        />
        <div
          className={`absolute -bottom-32 -left-32 w-[460px] h-[460px] rounded-full blur-[130px] ${
            isLight ? 'bg-cyan-200/40' : 'bg-blue-600/10'
          }`}
        />
      </div>

      {/* 1. HEADER */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
          isLight
            ? 'bg-white/85 border-slate-200/80 shadow-sm'
            : 'bg-[#060f18]/85 border-[#1e3a5f]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
          {/* Right Side: Logo & System Name */}
          <div
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm ${
                isLight
                  ? 'bg-[#f0f9ff] border-[#bae6fd]'
                  : 'bg-[#0b1929] border-[#1e3a5f]'
              }`}
            >
              <img
                src="/logo.png"
                alt="FractureAI Logo"
                className="w-8 h-8 object-contain"
              />
            </div>

            <div>
              <span
                dir="ltr"
                className={`block font-bold text-base sm:text-lg tracking-tight ${
                  isLight ? 'text-[#0284c7]' : 'text-[#4cd6fe]'
                }`}
              >
                FractureAI - Diagnostic Station
              </span>
              <span
                className={`block text-[11px] font-medium ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                منصة التشخيص الطبي بالذكاء الاصطناعي
              </span>
            </div>
          </div>

          {/* Center: Section Links with Motion activeNavUnderline */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'text-[#0284c7]'
                        : 'text-[#4cd6fe]'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeNavUnderline"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className={`absolute bottom-0 right-2 left-2 h-0.5 rounded-full ${
                        isLight ? 'bg-[#0284c7]' : 'bg-[#4cd6fe]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Left Side: Theme Switcher + Login Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onToggleTheme}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isLight
                  ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7] hover:bg-sky-100'
                  : 'bg-[#0f2338] border-[#1e3a5f] text-[#4cd6fe] hover:border-[#4cd6fe]/60'
              }`}
              title={isLight ? 'التبديل إلى الوضع الليلي' : 'التبديل إلى الوضع النهاري'}
            >
              {isLight ? <Moon size={15} /> : <Sun size={15} className="text-amber-400" />}
              <span className="hidden sm:inline">
                {isLight ? 'ليلي' : 'نهاري'}
              </span>
            </button>

            <button
              type="button"
              onClick={onGoToLogin}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isLight
                  ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sky-600/20'
                  : 'bg-[#4cd6fe] hover:bg-[#22d3ee] text-[#060f18] shadow-[#4cd6fe]/20'
              }`}
            >
              <LogIn size={16} />
              <span>تسجيل الدخول</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <main className="relative z-10">
        <section
          id="hero"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 lg:pt-20 lg:pb-28"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-right">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold min-h-[34px] overflow-hidden ${
                  isLight
                    ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]'
                    : 'bg-[#0f2338] border-[#1e3a5f] text-[#4cd6fe]'
                }`}
              >
                <Sparkles size={14} className="shrink-0" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={specialtyIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {HERO_SPECIALTIES[specialtyIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>

              <h1
                data-split-heading
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.3] tracking-tight"
              >
                كشف دقيق وفوري لكسور العظام في صور{' '}
                <span className={isLight ? 'text-[#0284c7]' : 'text-[#4cd6fe]'}>
                  الأشعة السينية (X-Ray)
                </span>{' '}
                بقوة الذكاء الاصطناعي
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`text-base sm:text-lg leading-relaxed max-w-2xl ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                محطة تشخيصية طبية متكاملة تساعد الأطباء وأخصائيي الأشعة على تحليل صور الأشعة السينية، وتحديد مواضع الكسور بدقة، وتفسير نتائج النموذج عبر خرائط الحرارة التوضيحية وإصدار التقارير السريرية في ثوانٍ معدودة.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <button
                  type="button"
                  onClick={() => scrollToSection('about-fractureai')}
                  className={`px-6 py-3.5 rounded-xl border text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    isLight
                      ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7] hover:bg-sky-100'
                      : 'bg-[#0f2338] border-[#1e3a5f] text-[#4cd6fe] hover:border-[#4cd6fe]'
                  }`}
                >
                  <span>تعرّف على المشروع</span>
                  <ArrowDown size={17} className="animate-bounce" />
                </button>

                <button
                  type="button"
                  onClick={onGoToLogin}
                  className={`px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isLight
                      ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sky-600/25'
                      : 'bg-[#4cd6fe] hover:bg-[#22d3ee] text-[#060f18] shadow-[#4cd6fe]/25'
                  }`}
                >
                  <span>الدخول إلى محطة التشخيص</span>
                  <ArrowLeft size={17} />
                </button>
              </motion.div>
            </div>

            {/* Hero Visual Card (with GSAP Parallax) */}
            <div ref={heroVisualRef} className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className={`rounded-3xl border p-6 sm:p-7 backdrop-blur-md transition-colors ${
                  isLight
                    ? 'bg-white/90 border-slate-200/80 shadow-xl shadow-slate-200/60'
                    : 'bg-[#0b1929] border-[#1e3a5f] shadow-2xl shadow-black/40'
                }`}
              >
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-current/10">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                        isLight ? 'bg-[#0284c7]' : 'bg-[#4cd6fe]'
                      }`}
                    />
                    <span className="text-xs font-bold">
                      معاينة مسار التشخيص الذكي
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isLight
                        ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]'
                        : 'bg-[#0f2338] border-[#1e3a5f] text-[#4cd6fe]'
                    }`}
                  >
                    X-Ray AI Pipeline
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: Cpu,
                      step: '01',
                      title: 'تحليل صورة الأشعة بالرؤية الحاسوبية',
                      desc: 'فحص فوري للصورة وتحديد مناطق الاشتباه بدقة.',
                    },
                    {
                      icon: Activity,
                      step: '02',
                      title: 'تفسير بصري عبر Grad-CAM',
                      desc: 'خرائط حرارية توضح مواضع تركيز النموذج الطبي.',
                    },
                    {
                      icon: FileText,
                      step: '03',
                      title: 'تقرير طبي معتمد وقابل للطباعة',
                      desc: 'مراجعة الطبيب واعتماد التشخيص النهائي بسهولة.',
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.step}
                        className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-colors ${
                          isLight
                            ? 'bg-slate-50/90 border-slate-200/80'
                            : 'bg-[#060f18]/70 border-[#1e3a5f]/70'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isLight
                              ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]'
                              : 'bg-[#0f2338] border-[#1e3a5f] text-[#4cd6fe]'
                          }`}
                        >
                          <Icon size={19} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold font-mono ${
                                isLight ? 'text-[#0284c7]' : 'text-[#4cd6fe]'
                              }`}
                            >
                              {item.step}
                            </span>
                            <h3 className="text-sm font-bold">{item.title}</h3>
                          </div>
                          <p
                            className={`text-xs mt-1 leading-relaxed ${
                              isLight ? 'text-slate-600' : 'text-slate-400'
                            }`}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. ABOUT FRACTUREAI & FEATURES */}
        <section
          id="about-fractureai"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 space-y-14"
        >
          {/* About FractureAI Card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className={`rounded-3xl border p-7 sm:p-10 backdrop-blur-md transition-colors ${
              isLight
                ? 'bg-white/90 border-slate-200/90 shadow-lg shadow-slate-200/50'
                : 'bg-[#0b1929] border-[#1e3a5f] shadow-2xl'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-current/10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                    isLight
                      ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]'
                      : 'bg-[#0f2338] border-[#1e3a5f] text-[#4cd6fe]'
                  }`}
                >
                  <GraduationCap size={22} />
                </div>
                <div>
                  <span
                    className={`text-xs font-bold block ${
                      isLight ? 'text-[#0284c7]' : 'text-[#4cd6fe]'
                    }`}
                  >
                    نبذة عن المشروع
                  </span>
                  <h2 data-split-heading className="text-xl sm:text-2xl font-extrabold">
                    About FractureAI
                  </h2>
                </div>
              </div>

              <span
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 ${
                  isLight
                    ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]'
                    : 'bg-[#0f2338] border-[#1e3a5f] text-[#4cd6fe]'
                }`}
              >
                <ShieldCheck size={15} />
                <span>جامعة الرازي • 2026</span>
              </span>
            </div>

            <div
              className={`space-y-4 text-base sm:text-lg leading-loose ${
                isLight ? 'text-slate-700' : 'text-slate-200'
              }`}
            >
              <p>
                FractureAI هو نظام تشخيصي طبي ذكي يعتمد على تقنيات الذكاء الاصطناعي القابل للتفسير (Explainable AI) والرؤية الحاسوبية لتحليل صور الأشعة السينية (X-Ray) واكتشاف كسور العظام بدقة عالية، وتوليد خرائط حرارية توضيحية (Grad-CAM) وتقارير طبية فورية تدعم القرار السريري للأطباء والمختصين.
              </p>
              <p
                className={`font-semibold ${
                  isLight ? 'text-slate-800' : 'text-white'
                }`}
              >
                تم تصميم وتطوير هذا النظام بالكامل في عام 2026 كمشروع تخرج في قسم تقنية المعلومات بـ جامعة الرازي (Al-Razi University)، على يد فريق طلابي بقيادة حسام محمد مهدي عبدالله.
              </p>
            </div>
          </motion.div>

          {/* 3 Main Feature Cards */}
          <div id="features">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-[#0284c7]' : 'text-[#4cd6fe]'
                }`}
              >
                المميزات الرئيسية
              </span>
              <h2 data-split-heading className="text-2xl sm:text-3xl font-extrabold mt-2">
                قدرات متكاملة لدعم التشخيص الطبي
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: idx * 0.12 }}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedFeature(feature)}
                    className={`rounded-2xl border p-6 sm:p-7 backdrop-blur-md flex flex-col justify-between cursor-pointer transition-colors ${
                      isLight
                        ? 'bg-white/90 border-slate-200/90 shadow-md hover:shadow-xl hover:border-[#bae6fd]'
                        : 'bg-[#0b1929] border-[#1e3a5f] shadow-lg hover:border-[#4cd6fe]/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                            isLight
                              ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]'
                              : 'bg-[#0f2338] border-[#1e3a5f] text-[#4cd6fe]'
                          }`}
                        >
                          <Icon size={23} />
                        </div>

                        <span
                          dir="ltr"
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            isLight
                              ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]'
                              : 'bg-[#0f2338] border-[#1e3a5f] text-[#4cd6fe]'
                          }`}
                        >
                          {feature.badge}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold mb-2.5">{feature.title}</h3>

                      <p
                        className={`text-sm leading-relaxed ${
                          isLight ? 'text-slate-600' : 'text-slate-300'
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>

                    <div
                      className={`mt-5 pt-4 border-t border-current/10 text-xs font-bold flex items-center gap-1.5 ${
                        isLight ? 'text-[#0284c7]' : 'text-[#4cd6fe]'
                      }`}
                    >
                      <span>عرض التفاصيل</span>
                      <ArrowLeft size={14} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. CTA SECTION */}
        <section id="cta" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6 }}
            className={`rounded-3xl border p-8 sm:p-12 text-center relative overflow-hidden backdrop-blur-md ${
              isLight
                ? 'bg-white/95 border-[#bae6fd] shadow-xl shadow-sky-100/80'
                : 'bg-[#0b1929] border-[#1e3a5f] shadow-2xl'
            }`}
          >
            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <h2 data-split-heading className="text-2xl sm:text-3xl font-extrabold">
                جاهز لبدء استخدام محطة التشخيص الذكية؟
              </h2>
              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                ادخل الآن إلى حسابك للوصول إلى لوحة التحكم، رفع صور الأشعة السينية، واستعراض نتائج الذكاء الاصطناعي والتقارير الطبية الفورية.
              </p>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className={`px-8 py-4 rounded-2xl text-base font-extrabold flex items-center gap-3 transition-all cursor-pointer shadow-xl hover:scale-[1.02] active:scale-[0.99] ${
                    isLight
                      ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sky-600/30'
                      : 'bg-[#4cd6fe] hover:bg-[#22d3ee] text-[#060f18] shadow-[#4cd6fe]/30'
                  }`}
                >
                  <LogIn size={20} />
                  <span>سجّل دخولك الآن</span>
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        className={`relative z-10 border-t py-6 text-center text-xs sm:text-sm ${
          isLight
            ? 'bg-white/70 border-slate-200 text-slate-600'
            : 'bg-[#060f18]/90 border-[#1e3a5f]/60 text-slate-400'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          تطوير فريق مشروع التخرج بقيادة حسام محمد مهدي عبدالله – قسم تقنية المعلومات، جامعة الرازي © 2026
        </div>
      </footer>

      {/* FEATURE DETAILS MODAL (Motion AnimatePresence + pauses Lenis) */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFeature(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-lg w-full rounded-3xl border p-6 sm:p-7 shadow-2xl ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-[#0b1929] border-[#1e3a5f] text-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                      isLight
                        ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]'
                        : 'bg-[#0f2338] border-[#1e3a5f] text-[#4cd6fe]'
                    }`}
                  >
                    <selectedFeature.icon size={22} />
                  </div>
                  <div>
                    <span
                      dir="ltr"
                      className={`text-[10px] font-bold uppercase ${
                        isLight ? 'text-[#0284c7]' : 'text-[#4cd6fe]'
                      }`}
                    >
                      {selectedFeature.badge}
                    </span>
                    <h3 className="text-lg font-extrabold">{selectedFeature.title}</h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFeature(null)}
                  className="p-1.5 rounded-lg opacity-70 hover:opacity-100 cursor-pointer"
                  aria-label="إغلاق"
                >
                  <X size={18} />
                </button>
              </div>

              <p
                className={`text-sm leading-relaxed mb-4 ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                {selectedFeature.description}
              </p>

              <ul className="space-y-2.5 mb-6">
                {selectedFeature.details.map((detail, i) => (
                  <li
                    key={i}
                    className={`text-xs sm:text-sm p-3 rounded-xl border flex items-start gap-2.5 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-[#060f18]/80 border-[#1e3a5f]/70 text-slate-200'
                    }`}
                  >
                    <ShieldCheck
                      size={16}
                      className={`shrink-0 mt-0.5 ${
                        isLight ? 'text-[#0284c7]' : 'text-[#4cd6fe]'
                      }`}
                    />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFeature(null)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    isLight
                      ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0284c7]'
                      : 'bg-[#0f2338] border-[#1e3a5f] text-[#4cd6fe]'
                  }`}
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFeature(null);
                    onGoToLogin();
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    isLight
                      ? 'bg-[#0284c7] text-white'
                      : 'bg-[#4cd6fe] text-[#060f18]'
                  }`}
                >
                  تسجيل الدخول
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
