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

        {/* Contact Section */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text mb-6">Get in <span className="text-primary">Touch</span></h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto">
              We're here to help with any questions, support needs, or partnership opportunities
            </p>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-surface p-8 rounded-2xl border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Email</h3>
              <p className="text-text-muted">support@motosnap.com</p>
              <p className="text-text-muted">info@motosnap.com</p>
            </div>

            <div className="bg-surface p-8 rounded-2xl border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Phone</h3>
              <p className="text-text-muted">+60 12-345 6789</p>
              <p className="text-text-muted">Mon-Fri 9AM-6PM</p>
            </div>

            <div className="bg-surface p-8 rounded-2xl border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Address</h3>
              <p className="text-text-muted">123 Workshop Street</p>
              <p className="text-text-muted">Kuala Lumpur, Malaysia</p>
            </div>
          </div>

          {/* Contact Form & Business Hours */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-surface rounded-3xl p-8 border border-border shadow-lg">
              <h3 className="text-2xl font-bold text-text mb-6">Send us a Message</h3>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Subject</label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 focus:outline-none transition-colors">
                    <option value="">Select a subject</option>
                    <option value="support">Technical Support</option>
                    <option value="sales">Sales Inquiry</option>
                    <option value="partnership">Partnership</option>
                    <option value="general">General Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text resize-none"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>

                <Button
                  onClick={() => alert('Thank you for your message! We\'ll get back to you soon.')}
                  className="w-full"
                >
                  Send Message
                </Button>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-surface rounded-3xl p-8 border border-border">
              <h3 className="text-2xl font-bold text-text mb-6">Business Hours</h3>

              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold text-text mb-4">Support Hours</h4>
                  <div className="space-y-2 text-text-muted">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 2:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-text mb-4">Emergency Support</h4>
                  <div className="space-y-2 text-text-muted">
                    <p>24/7 available for premium customers</p>
                    <p>Response time: Within 2 hours</p>
                    <p className="text-primary font-medium">Call: +60 12-345 6789</p>
                  </div>
                </div>
              </div>
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