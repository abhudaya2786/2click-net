import React from 'react';
import { Building2, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-xs">
      {/* Top Part */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Col 1: Services */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">{t('services', 'Services')}</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#construction" className="hover:text-teal-400 transition">{t('civilBoq', 'Civil BOQ Calculator')}</a></li>
              <li><a href="#ca_gst" className="hover:text-teal-400 transition">{t('ca_gst', 'CA & GST Compliance')}</a></li>
              <li><a href="#solar" className="hover:text-teal-400 transition">{t('solar', 'PM Surya Ghar Solar Engine')}</a></li>
              <li><a href="#dukandar_market" className="hover:text-teal-400 transition">{t('dukandar_market', 'Dukandar B2B Marketplace')}</a></li>
              <li><a href="#tiles_marble" className="hover:text-teal-400 transition">{t('tiles_marble', 'Tiles & Marble Studio')}</a></li>
            </ul>
          </div>

          {/* Col 2: Pages & Engineering */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">{t('groupEng', 'Engineering')}</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#water_etp_stp" className="hover:text-teal-400 transition">{t('water_etp_stp', 'Water & ETP/STP Design')}</a></li>
              <li><a href="#electrical_elv" className="hover:text-teal-400 transition">{t('electrical_elv', 'Electrical MEP Studio')}</a></li>
              <li><a href="#naksha_vastu" className="hover:text-teal-400 transition">{t('naksha_vastu', 'Naksha & Vastu Studio')}</a></li>
              <li><a href="#lidar" className="hover:text-teal-400 transition">{t('lidar', 'LiDAR 3D Point Cloud')}</a></li>
              <li><a href="#vr" className="hover:text-teal-400 transition">{t('vr', '360° VR Spatial Tour')}</a></li>
            </ul>
          </div>

          {/* Col 3: Account & B2B */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">{t('groupSupply', 'Account & B2B')}</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#vendors_binding" className="hover:text-teal-400 transition">{t('vendors_binding', 'Bidding System & Escrow')}</a></li>
              <li><a href="#crm_khatabook" className="hover:text-teal-400 transition">{t('crm_khatabook', 'KhataBook & CRM ERP')}</a></li>
              <li><a href="#bank_loans" className="hover:text-teal-400 transition">{t('bank_loans', 'Bank Loans & KYC Hub')}</a></li>
              <li><a href="#logistics" className="hover:text-teal-400 transition">{t('logistics', 'Logistics & Fleet Hub')}</a></li>
              <li><a href="#dashboard" className="hover:text-teal-400 transition">{t('dashboard', 'Executive Dashboard')}</a></li>
            </ul>
          </div>

          {/* Col 4: Follow Us */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Follow Us</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <i className="fab fa-facebook text-teal-400 w-4"></i>
                <a href="#" className="hover:text-teal-400 transition">Facebook</a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fab fa-twitter text-teal-400 w-4"></i>
                <a href="#" className="hover:text-teal-400 transition">Twitter / X</a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fab fa-instagram text-teal-400 w-4"></i>
                <a href="#" className="hover:text-teal-400 transition">Instagram</a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fab fa-youtube text-teal-400 w-4"></i>
                <a href="#" className="hover:text-teal-400 transition">YouTube</a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fab fa-linkedin text-teal-400 w-4"></i>
                <a href="#" className="hover:text-teal-400 transition">LinkedIn</a>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Us & Regd Office */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Contact Us</h3>
            <div className="flex items-center gap-2 text-teal-400 font-black text-base">
              <Building2 className="w-5 h-5 text-teal-400" />
              <span>2click.in</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Gorakhpur | Lucknow | Gurugram, India
            </p>
            <p className="text-xs font-bold text-white">
              Phone: +91 70072 54932
            </p>
            <a href="mailto:admin@2click.in" className="text-teal-400 underline font-bold block text-xs">
              Email: admin@2click.in
            </a>
          </div>

        </div>
      </div>

      {/* Bottom Part */}
      <div className="py-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Copyright & Legal */}
          <div className="text-center md:text-left space-y-2">
            <p className="text-slate-400 font-medium text-xs">
              &copy; {new Date().getFullYear()} <span className="font-extrabold text-white">2click.in</span>. All rights reserved. ISO 9001:2026 Certified Platform for Indian Civil Developers.
            </p>
            <ul className="flex justify-center md:justify-start space-x-4 text-[11px] text-slate-500">
              <li><a href="#" className="hover:text-teal-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-teal-400 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-teal-400 transition">FAQ &amp; IS Codes</a></li>
            </ul>
          </div>

          {/* Payment & Security Badges */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Secure B2B Escrow:</span>
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-[11px] font-extrabold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>UPI • Razorpay • Net Banking</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

