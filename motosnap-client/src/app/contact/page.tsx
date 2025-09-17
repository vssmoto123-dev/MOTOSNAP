'use client';

import { Button } from '@/components/ui/Button';

export default function ContactPage() {

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-text mb-6">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Get in touch with our team for support, inquiries, or partnership opportunities
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

        {/* Contact Form */}
        <div className="bg-surface rounded-3xl p-12 border border-border shadow-lg mb-16">
          <h2 className="text-3xl font-bold text-text mb-8 text-center">Send us a Message</h2>

          <div className="max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
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

            <div className="mb-6">
              <label className="block text-sm font-medium text-text mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text"
                placeholder="Enter your email address"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text mb-2">Subject</label>
              <select className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text">
                <option value="">Select a subject</option>
                <option value="support">Technical Support</option>
                <option value="sales">Sales Inquiry</option>
                <option value="partnership">Partnership</option>
                <option value="general">General Question</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text mb-2">Message</label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text resize-none"
                placeholder="Tell us how we can help you..."
              ></textarea>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => alert('Thank you for your message! We\'ll get back to you soon.')}
            >
              Send Message
            </Button>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-surface rounded-3xl p-12 border border-border text-center">
          <h2 className="text-3xl font-bold text-text mb-8">Business Hours</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Support Hours</h3>
              <div className="space-y-2 text-text-muted">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 2:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Emergency Support</h3>
              <div className="space-y-2 text-text-muted">
                <p>24/7 available for premium customers</p>
                <p>Response time: Within 2 hours</p>
                <p className="text-primary font-medium">Call: +60 12-345 6789</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}