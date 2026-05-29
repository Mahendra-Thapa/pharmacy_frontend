'use client'

import Link from 'next/link'
import {
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react'

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
} from 'react-icons/fa6'

export function ModernFooter() {
  return (
    <footer className="mt-20 border-t bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14">
        {/* Top */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-auto object-contain"
            />

            <p className="mt-5 text-sm leading-7 text-gray-500">
              Trusted healthcare and pharmacy services with
              fast delivery and quality medicines for your
              daily needs.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {[FaFacebookF, FaInstagram, FaTwitter].map(
                (Icon, i) => (
                  <button
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-100"
                  >
                    <Icon size={16} />
                  </button>
                )
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Quick Links
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              {[
                'Home',
                'Categories',
                'About',
                'Contact',
              ].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-sm text-gray-500 transition hover:text-black"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Services
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              {[
                'Home Delivery',
                '24/7 Support',
                'Health Checkup',
                'Online Consultation',
              ].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-sm text-gray-500 transition hover:text-black"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Contact
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    +977-9800000000
                  </p>

                  <p className="text-xs text-gray-500">
                    Call anytime
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    care@smartpharma.com
                  </p>

                  <p className="text-xs text-gray-500">
                    Email support
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Kathmandu, Nepal
                  </p>

                  <p className="text-xs text-gray-500">
                    Our location
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Smart Pharma. All
            rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
              <ShieldCheck
                size={16}
                className="text-emerald-600"
              />

              <span className="text-xs text-gray-600">
                Secure Payments
              </span>
            </div>

            <Link
              href="#"
              className="text-sm text-gray-500 hover:text-black"
            >
              Privacy Policy
            </Link>

            <Link
              href="#"
              className="text-sm text-gray-500 hover:text-black"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}