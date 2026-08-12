import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, ChevronDown, FileText, HeartPulse, Lock, MessageCircleQuestion, Shield, Sparkles, Stethoscope, Upload } from 'lucide-react';
import { useState } from 'react';
import { AppFooter } from '@/components/AppFooter';
import { Logo } from '@/components/AppHeader';

const FEATURES = [
  { icon: Brain, title: 'AI-Powered Explanations', description: 'Our AI breaks down complex medical jargon into plain, easy-to-understand language.' },
  { icon: FileText, title: 'Upload or Paste', description: 'Upload your medical report as a PDF or image, or simply paste the text directly.' },
  { icon: MessageCircleQuestion, title: 'Questions for Your Doctor', description: 'Get a list of smart, relevant questions to ask at your next appointment.' },
  { icon: BookOpen, title: 'Medical Terms Explained', description: 'Every difficult term is defined in simple words so you never feel lost.' },
  { icon: Shield, title: 'Private & Secure', description: 'Your reports are encrypted and only accessible to you. We never share your data.' },
  { icon: Sparkles, title: 'Trusted Resources', description: 'Links to official health organizations like MedlinePlus, WHO, and more.' },
];

const STEPS = [
  { icon: Upload, title: 'Upload Your Report', description: 'Drop a PDF, image, or paste the text of your medical report into MedFluent.' },
  { icon: Brain, title: 'AI Analyzes It', description: 'Our AI reads the report and explains everything in plain, simple language.' },
  { icon: Stethoscope, title: 'Understand & Prepare', description: 'Review the explanation, learn the terms, and get questions to ask your doctor.' },
];

const FAQS = [
  { q: 'Does MedFluent diagnose diseases?', a: 'No. MedFluent does not diagnose, prescribe, or replace a healthcare professional. It explains medical reports in plain language for educational purposes only.' },
  { q: 'Is my medical data safe?', a: 'Yes. Your reports are stored securely with row-level security — only you can access your own data. We never share your information with third parties.' },
  { q: 'What file formats can I upload?', a: 'You can upload PDF files, images (PNG, JPG, WebP), or paste text directly. After uploading, paste the relevant text for analysis.' },
  { q: 'Can I use MedFluent in my language?', a: 'Yes. You can set a preferred explanation language in your profile, and the AI will respond in that language when possible.' },
  { q: 'How accurate are the explanations?', a: 'MedFluent uses AI to simplify medical language, but it is not a substitute for professional medical advice. Always discuss your results with a qualified doctor.' },
  { q: 'Is MedFluent free to use?', a: 'You can create an account and start using MedFluent right away. Check our pricing page for plan details.' },
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">Sign in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
  <div className="absolute top-0 right-0 w-72 h-72 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
  <div className="absolute bottom-0 left-0 w-72 h-72 bg-slate-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-primary-100 text-sm font-medium text-primary-700 mb-6 shadow-sm">
              <HeartPulse className="w-4 h-4" />
              AI-powered health literacy
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Understand your medical reports in <span className="text-primary-600">
  plain language
</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
              MedFluent turns complex lab results and medical documents into clear explanations, helps you learn the
              terms, and prepares you with the right questions to ask your doctor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-base px-7 py-3.5">
                Analyze your first report <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="btn-secondary text-base px-7 py-3.5">See how it works</a>
            </div>
            <p className="text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" /> Private & secure. For educational purposes only.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Everything you need to understand your health</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">MedFluent gives you the tools to make sense of medical documents and feel confident at your next appointment.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="card p-6 hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">How it works</h2>
            <p className="text-slate-600">Three simple steps from confusion to clarity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-200 mb-5">
                    <step.icon className="w-9 h-9 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-primary-100 flex items-center justify-center text-sm font-bold text-primary-600">{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-2xl bg-primary-600 p-10 sm:p-16 text-center">
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to understand your health?</h2>
            <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">Create a free account and analyze your first medical report in minutes.</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-primary-50 transition shadow-lg">
              Get started free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Frequently asked questions</h2>
            <p className="text-slate-600">Everything you need to know about MedFluent.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-semibold text-slate-800">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed animate-fade-in">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}
