import Link from "next/link";
import { FileText, Zap, Award, Target, Mic, BarChart, ArrowRight } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: FileText,
    title: "Upload Resume & JD",
    description: "Upload your resume PDF and paste the job description you're targeting."
  },
  {
    number: 2,
    icon: Zap,
    title: "AI Analyses Your Fit",
    description: "Our AI extracts skills, compares them to the JD, and identifies gaps."
  },
  {
    number: 3,
    icon: Award,
    title: "Prepare & Practice",
    description: "Get actionable suggestions and practice with a personalized AI interviewer."
  }
];

const features = [
  {
    icon: FileText,
    title: "Resume Analysis",
    description: "Get ATS score, skill gaps, and actionable suggestions"
  },
  {
    icon: Target,
    title: "Skill Gap Detection",
    description: "See exactly which skills are missing for your target role"
  },
  {
    icon: Mic,
    title: "AI Mock Interview",
    description: "Voice-based interview tailored to your weak areas"
  },
  {
    icon: BarChart,
    title: "Placement Report",
    description: "Combined score showing your true placement readiness"
  }
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-white)' }}>
      {/* Navbar */}
      <nav 
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: 'var(--bg-white)',
          borderBottom: '1px solid var(--border-default)'
        }}
      >
        <Link 
          href="/"
          className="font-bold text-xl no-underline"
          style={{ color: 'var(--primary-blue)' }}
        >
          PlacementMentor
        </Link>
        <Link href="/auth" className="btn-secondary">
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-6 py-20">
        {/* Badge */}
        <span 
          className="inline-block mb-6"
          style={{
            background: 'var(--primary-blue-light)',
            color: 'var(--primary-blue)',
            borderRadius: '999px',
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          AI-Powered Placement Preparation
        </span>

        {/* Headline */}
        <h1 
          className="mb-6"
          style={{
            fontSize: '52px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.1
          }}
        >
          Ace Your Placement.<br />
          Know Exactly Where You Stand.
        </h1>

        {/* Subheadline */}
        <p 
          className="mb-8"
          style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            lineHeight: 1.6
          }}
        >
          Upload your resume, analyse your fit, and practice with an AI interviewer tailored to your gaps.
        </p>

        {/* CTA Button */}
        <Link 
          href="/auth"
          className="btn-primary"
          style={{ fontSize: '16px', padding: '14px 32px' }}
        >
          Get Started Free
        </Link>
      </section>

      {/* How It Works */}
      <section 
        className="px-6 py-20"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 
            className="text-center mb-12"
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--text-primary)'
            }}
          >
            How It Works
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                {/* Step Card */}
                <div 
                  className="card p-6 text-center"
                  style={{ width: '280px' }}
                >
                  {/* Number Badge */}
                  <div 
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-4"
                    style={{
                      background: 'var(--primary-blue)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <step.icon size={48} style={{ color: 'var(--primary-blue)' }} />
                  </div>

                  {/* Title */}
                  <h3 
                    className="mb-2"
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {step.description}
                  </p>
                </div>

                {/* Arrow (hidden on mobile, hidden after last step) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block mx-4">
                    <ArrowRight size={24} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 
            className="text-center mb-12"
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--text-primary)'
            }}
          >
            Everything You Need to Get Placed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="card p-6">
                <div className="flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 p-3 rounded-lg"
                    style={{ background: 'var(--primary-blue-light)' }}
                  >
                    <feature.icon size={24} style={{ color: 'var(--primary-blue)' }} />
                  </div>
                  <div>
                    <h3 
                      className="mb-2"
                      style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: 'var(--text-primary)'
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="text-center py-8 px-6"
        style={{
          borderTop: '1px solid var(--border-default)',
          color: 'var(--text-muted)',
          fontSize: '14px'
        }}
      >
        © 2025 PlacementMentor. All rights reserved.
      </footer>
    </div>
  );
}
