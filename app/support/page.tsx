"use client";
import Link from "next/link";
import { Mail, MessageCircle, BookOpen } from "lucide-react";
import InfoPage, { InfoH2 } from "../components/InfoPage";

export default function SupportPage() {
  return (
    <InfoPage
      eyebrow="Help"
      title="Support Center"
      subtitle="Need a hand? Here's how to get help with Noor-ul-Quran."
    >
      <div className="grid sm:grid-cols-3 gap-4 not-prose mb-4">
        <a href="mailto:support@noor-ul-quran.com" className="bg-white/5 border border-white/10 hover:border-[#57d996]/40 rounded-2xl p-5 transition-all">
          <Mail size={20} className="text-[#57d996] mb-2" />
          <div className="text-white font-bold text-sm">Email us</div>
          <div className="text-white/40 text-xs mt-1">support@noor-ul-quran.com</div>
        </a>
        <Link href="/#faq" className="bg-white/5 border border-white/10 hover:border-[#57d996]/40 rounded-2xl p-5 transition-all">
          <MessageCircle size={20} className="text-[#57d996] mb-2" />
          <div className="text-white font-bold text-sm">FAQ</div>
          <div className="text-white/40 text-xs mt-1">Answers to common questions</div>
        </Link>
        <Link href="/blog" className="bg-white/5 border border-white/10 hover:border-[#57d996]/40 rounded-2xl p-5 transition-all">
          <BookOpen size={20} className="text-[#57d996] mb-2" />
          <div className="text-white font-bold text-sm">Guides</div>
          <div className="text-white/40 text-xs mt-1">Tips on the blog</div>
        </Link>
      </div>

      <InfoH2>Common topics</InfoH2>
      <p>
        <strong className="text-white">Microphone not working?</strong> The AI recitation feature needs microphone
        permission and works best in Chrome or Edge. Check that you clicked &quot;Allow&quot; when prompted.
      </p>
      <p>
        <strong className="text-white">Audio won&apos;t play?</strong> Try a different reciter from the reader&apos;s
        reciter menu — the app automatically falls back to an alternate source if one is unavailable.
      </p>
      <p>
        <strong className="text-white">Billing &amp; subscriptions?</strong> Manage or cancel your plan from your
        account settings, or email us and we&apos;ll help.
      </p>

      <InfoH2>Still stuck?</InfoH2>
      <p>
        Email{" "}
        <a href="mailto:support@noor-ul-quran.com" className="text-[#57d996] hover:underline">support@noor-ul-quran.com</a>{" "}
        and we&apos;ll get back to you within 1–2 business days.
      </p>
    </InfoPage>
  );
}
