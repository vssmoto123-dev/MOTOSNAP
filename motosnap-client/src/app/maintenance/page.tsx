import React from 'react';
import { MAINTENANCE_MESSAGE, MAINTENANCE_CONTACT } from '@/config/maintenance';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-2 tracking-tight">
            MOTO<span className="text-primary">SNAP</span>
          </h1>
        </div>

        {/* Maintenance Content */}
        <div className="bg-surface p-12 rounded-2xl border border-border shadow-xl">
          {/* Maintenance Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>

          {/* Title and Subtitle */}
          <h2 className="text-3xl font-bold text-text mb-3">
            {MAINTENANCE_MESSAGE.title}
          </h2>
          <p className="text-xl text-text-muted mb-6">
            {MAINTENANCE_MESSAGE.subtitle}
          </p>

          {/* Description */}
          <p className="text-text-muted mb-8 leading-relaxed">
            {MAINTENANCE_MESSAGE.description}
          </p>

          {/* Estimated Time */}
          <div className="bg-secondary/50 p-4 rounded-lg border border-border/30 mb-8">
            <p className="text-text font-medium">
              {MAINTENANCE_MESSAGE.estimatedTime}
            </p>
          </div>

          {/* Contact Information */}
          <div className="border-t border-border pt-8">
            <h3 className="text-lg font-semibold text-text mb-4">Need Assistance?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`mailto:${MAINTENANCE_CONTACT.email}`}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email Support
              </a>
              <a
                href={`tel:${MAINTENANCE_CONTACT.phone}`}
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-text rounded-lg hover:bg-secondary/80 transition-colors border border-border"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call Us
              </a>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-text-muted">
              Thank you for your patience and understanding.
            </p>
            <p className="text-xs text-text-muted mt-2">
              © 2024 MotoSnap. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}