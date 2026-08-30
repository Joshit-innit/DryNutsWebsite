"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email address required"),
  phone: z.string().min(10, "Valid phone number required"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    await new Promise((res) => setTimeout(res, 600));
    toast.success("Message Sent Successfully!", {
      description: "A NutriNation harvest concierge will get in touch within 2-4 business hours.",
    });
    reset();
  };

  const faqs = [
    {
      q: "Where do you source your dry fruits from?",
      a: "Our almonds and walnuts are sourced directly from certified organic groves in Pulwama and Pahalgam, Kashmir. Our King W-180 cashews come from Mangalore, while Medjool dates and Afghani figs are imported under strict temperature controls from Jordan and Afghanistan.",
    },
    {
      q: "How does NutriNation guarantee zero rancidity?",
      a: "All our products are packed in clean-room nitrogen-flushed tins and multilayer oxygen-barrier pouches. This seals in the delicate natural oils and keeps moisture and oxidation completely out.",
    },
    {
      q: "Do you offer corporate and wedding gifting packages?",
      a: "Yes! We specialize in bespoke handcrafted wooden caskets, brass filigree hampers, and customized gift sleeves for corporate milestones and luxury wedding celebrations.",
    },
    {
      q: "What is your standard delivery timeline?",
      a: "Standard ground/air delivery takes 2-3 business days across India. Priority next-day air express is also available at checkout for major metro cities.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="eyebrow">Concierge & support</p>
        <h1 className="font-serif font-medium text-4xl sm:text-5xl text-brand-dark">
          We&apos;d love to hear from you
        </h1>
        <p className="text-sm text-brand-muted font-sans leading-relaxed">
          Whether you have inquiries about bulk corporate gifting, origin traceability, or custom dietary boxes, our specialists are here to assist.
        </p>
      </div>

      {/* Main Grid: Info + Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
            <h3 className="font-serif font-bold text-xl text-brand-dark border-b border-brand-border pb-3">
              Corporate Headquarters
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">NutriNation Foods Pvt. Ltd.</h4>
                  <p className="text-brand-muted leading-relaxed">
                    Level 5, Signature Tower, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-saffron/10 text-brand-saffron flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">Direct Support Helpline</h4>
                  <p className="text-brand-muted">+91 80 4920 1800 / +91 98765 43210</p>
                  <p className="text-[10px] text-brand-muted">Monday - Saturday, 9:00 AM - 7:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">Email Concierge</h4>
                  <p className="text-brand-muted">care@nutrination.in | corporate@nutrination.in</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-dark text-white rounded-3xl p-6 sm:p-8 space-y-3 relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-saffron">
              BESPOKE CORPORATE HAMPERS
            </span>
            <h4 className="font-serif font-bold text-lg text-white">
              Planning Diwali or Executive Gifting?
            </h4>
            <p className="text-xs text-white/70 leading-relaxed font-sans">
              We offer personalized wooden caskets engraved with your company logo, satin linings, and gold-foil greeting sleeves.
            </p>
          </div>
        </div>

        {/* Right Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-card space-y-6">
          <div>
            <h3 className="font-serif font-bold text-2xl text-brand-dark">
              Send us a Message
            </h3>
            <p className="text-xs text-brand-muted mt-1">
              Fill in the details below and we will respond promptly.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Your Full Name</label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  className="w-full text-xs p-3 bg-brand-cream/30 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Email Address</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="priya@example.com"
                  className="w-full text-xs p-3 bg-brand-cream/30 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Phone Number</label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="9876543210"
                  className="w-full text-xs p-3 bg-brand-cream/30 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">Inquiry Subject</label>
                <input
                  {...register("subject")}
                  type="text"
                  placeholder="e.g. Bulk Order / Order Inquiry"
                  className="w-full text-xs p-3 bg-brand-cream/30 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Message</label>
              <textarea
                {...register("message")}
                rows={4}
                placeholder="How can we assist you with our harvest collection?"
                className="w-full text-xs p-3 bg-brand-cream/30 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
              {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Sending..." : "Send message"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* FAQs Section */}
      <div id="faqs" className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-subtle space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs uppercase font-bold tracking-widest text-brand-green">
            COMMON INQUIRIES
          </span>
          <h3 className="font-serif font-bold text-2xl text-brand-dark">
            Harvest FAQs & Sourcing Standards
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-brand-cream/40 border border-brand-border space-y-2">
              <h4 className="font-serif font-bold text-sm text-brand-dark flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed pl-6 font-sans">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
