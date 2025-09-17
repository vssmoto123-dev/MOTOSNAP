'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-text mb-6">
            About <span className="text-primary">MotoSnap</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Professional motorcycle workshop management system designed to streamline your business operations
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="bg-surface rounded-3xl p-12 border border-border shadow-lg">
            <h2 className="text-3xl font-bold text-text mb-6">Our Mission</h2>
            <p className="text-lg text-text-muted leading-relaxed mb-8">
              At MotoSnap, we&apos;re dedicated to empowering motorcycle workshops with cutting-edge technology
              that simplifies inventory management, service booking, and customer relations. Our platform
              is built by workshop owners, for workshop owners, ensuring every feature addresses real-world challenges.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">5000+</div>
                <div className="text-text-muted">Parts Managed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                <div className="text-text-muted">Services Booked</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-text-muted">Workshops Served</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-text mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-surface p-8 rounded-2xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-4">Quality First</h3>
              <p className="text-text-muted">
                We prioritize quality in every aspect of our service, from inventory management to customer support.
              </p>
            </div>
            <div className="bg-surface p-8 rounded-2xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-4">Innovation</h3>
              <p className="text-text-muted">
                Constantly evolving our platform to meet the changing needs of modern motorcycle workshops.
              </p>
            </div>
            <div className="bg-surface p-8 rounded-2xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-4">Customer Success</h3>
              <p className="text-text-muted">
                Your success is our success. We&apos;re committed to providing tools that help your business thrive.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-text mb-12 text-center">Our Team</h2>
          <div className="bg-surface rounded-3xl p-12 border border-border">
            <p className="text-lg text-text-muted text-center mb-8">
              Founded by motorcycle enthusiasts and technology experts, MotoSnap brings together
              decades of experience in both workshop management and software development.
            </p>
            <div className="text-center">
              <p className="text-text-muted">
                Our team of dedicated professionals works tirelessly to ensure MotoSnap meets the evolving
                needs of motorcycle workshops across the region.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-text mb-6">Ready to Transform Your Workshop?</h2>
          <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied workshop owners who have streamlined their operations with MotoSnap.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/register')}
              className="min-w-[200px]"
            >
              Get Started
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/dashboard/parts')}
              className="min-w-[200px]"
            >
              Browse Products
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}