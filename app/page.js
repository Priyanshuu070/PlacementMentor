"use client";

import Link from "next/link";
import {
  Upload,
  Zap,
  Mic,
  Award,
  TrendingUp,
  FileText,
  CheckCircle,
  ArrowRight,
} from "lucide-react";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-transparent transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Wordmark */}
          <div className="flex items-center">
            <span className="text-2xl font-bold" style={{ color: "var(--primary-blue)" }}>
              PlacementMentor
            </span>
          </div>

          {/* Sign In Button */}
          <Link href="/auth">
            <button className="btn-secondary">Sign In</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block mb-6">
            <span
              className="px-3 py-1 text-sm font-medium rounded-full"
              style={{
                backgroundColor: "var(--primary-blue-light)",
                color: "var(--primary-blue)",
              }}
            >
              AI-Powered Placement Preparation
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl font-bold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Ace Your Placement.
            <br />
            Know Exactly Where You Stand.
          </h1>

          {/* Subheadline */}
          <p
            className="text-xl mb-10"
            style={{ color: "var(--text-secondary)" }}
          >
            Master resume analysis and mock interviews with AI-powered insights.
            Get detailed feedback on your skills and placement readiness.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <button className="btn-primary flex items-center gap-2">
                Analyze My Resume
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/auth">
              <button className="btn-secondary flex items-center gap-2">
                Try Mock Interview
                <Mic className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl font-bold text-center mb-16"
            style={{ color: "var(--text-primary)" }}
          >
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 md:gap-4">
            {/* Step 1 */}
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "var(--primary-blue-light)" }}
              >
                <Upload
                  className="w-8 h-8"
                  style={{ color: "var(--primary-blue)" }}
                />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Upload Resume & JD
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Share your resume and the job description you're targeting.
              </p>
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:flex items-center justify-center">
              <div
                className="w-12 h-1"
                style={{ backgroundColor: "var(--border-default)" }}
              />
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "var(--primary-blue-light)" }}
              >
                <TrendingUp
                  className="w-8 h-8"
                  style={{ color: "var(--primary-blue)" }}
                />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                AI Analysis & Score
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Get detailed insights on skill gaps and ATS compatibility.
              </p>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:flex items-center justify-center">
              <div
                className="w-12 h-1"
                style={{ backgroundColor: "var(--border-default)" }}
              />
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "var(--primary-blue-light)" }}
              >
                <Mic
                  className="w-8 h-8"
                  style={{ color: "var(--primary-blue)" }}
                />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Practice & Prepare
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Take realistic mock interviews tailored to your role.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl font-bold text-center mb-16"
            style={{ color: "var(--text-primary)" }}
          >
            Powerful Features
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="card p-6">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--primary-blue-light)" }}
              >
                <FileText
                  className="w-6 h-6"
                  style={{ color: "var(--primary-blue)" }}
                />
              </div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Resume Analysis
              </h3>
              <ul style={{ color: "var(--text-secondary)" }} className="text-sm space-y-2">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <span>ATS Compatibility Score</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <span>Keyword Optimization</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <span>Professional Feedback</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="card p-6">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--primary-blue-light)" }}
              >
                <TrendingUp
                  className="w-6 h-6"
                  style={{ color: "var(--primary-blue)" }}
                />
              </div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Skill Gap Report
              </h3>
              <ul style={{ color: "var(--text-secondary)" }} className="text-sm space-y-2">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <span>Identify Missing Skills</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <span>Match Score Calculation</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <span>Learning Resources</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="card p-6">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--primary-blue-light)" }}
              >
                <Mic
                  className="w-6 h-6"
                  style={{ color: "var(--primary-blue)" }}
                />
              </div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Mock Interviews
              </h3>
              <ul style={{ color: "var(--text-secondary)" }} className="text-sm space-y-2">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <span>Real-Time Voice Practice</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <span>Role-Specific Questions</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <span>Instant AI Feedback</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="card p-6">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--primary-blue-light)" }}
              >
                <Award
                  className="w-6 h-6"
                  style={{ color: "var(--primary-blue)" }}
                />
              </div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Placement Report
              </h3>
              <ul style={{ color: "var(--text-secondary)" }} className="text-sm space-y-2">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <span>Readiness Score</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <span>Performance Analytics</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  <span>Actionable Recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t"
        style={{ borderColor: "var(--border-default)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p style={{ color: "var(--text-muted)" }} className="text-sm">
            © 2024 PlacementMentor. All rights reserved. •{" "}
            <a href="#" className="hover:underline">
              Privacy
            </a>{" "}
            •{" "}
            <a href="#" className="hover:underline">
              Terms
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}