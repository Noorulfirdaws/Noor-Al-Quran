"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "ar" | "fr";

export const translations = {
  en: {
    navFeatures: "Features",
    navDemo: "Try Demo",
    navPricing: "Pricing",
    navCommunity: "Community",
    navBlog: "Blog",
    navSignIn: "Sign in",
    navStartFree: "Start Free",
    blogTitle: "The Blog",
    blogSubtitle: "Stories, research, and guidance for every stage of your Quran memorization journey.",
    blogViewAll: "View All →",
    blogReadMore: "Read article",
    blogBackToBlog: "Back to Blog",
    blogDarkMode: "Dark mode",
    blogLightMode: "Light mode",
    blogReadyToBegin: "Ready to Begin?",
    blogStartMemo: "Start Memorizing with Noor-ul-Quran",
    blogGetStartedFree: "Get Started Free →",
    blogMoreFromBlog: "More from the Blog",
    footerTagline: "AI-powered Quran memorization for the modern Muslim. Available on iOS and Android.",
    footerProduct: "Product",
    footerCompany: "Company",
    footerCommunity: "Community",
    footerLegal: "Legal",
    footerPricing: "Pricing",
    footerGiftCards: "Gift Cards",
    footerFamilyPlan: "Family Plan",
    footerPremiumFeatures: "Premium Features",
    footerBlog: "Blog",
    footerCareers: "Careers",
    footerScholarships: "Scholarships",
    footerSupport: "Support Center",
    footerFeatureReq: "Feature Requests",
    footerPodcast: "re:Verses Podcast",
    footerNetwork: "Hifz Network",
    footerDiscord: "Discord",
    footerRamadan: "Ramadan Hub",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    footerCookies: "Cookie Policy",
    footerCopyright: "© 2026 Noor-ul-Quran, Inc. All rights reserved.",
    catAll: "All",
    catMemorization: "Memorization",
    catTajweed: "Tajweed",
    catTips: "Tips",
    catTech: "Technology",
    catResearch: "Research",
    catCommunity: "Community",
    catRamadan: "Ramadan",
    catAnnouncements: "Announcements",
    catDesign: "Design",
  },
  ar: {
    navFeatures: "الميزات",
    navDemo: "جرب العرض",
    navPricing: "الأسعار",
    navCommunity: "المجتمع",
    navBlog: "المدونة",
    navSignIn: "تسجيل الدخول",
    navStartFree: "ابدأ مجاناً",
    blogTitle: "المدونة",
    blogSubtitle: "قصص وأبحاث وإرشادات في كل مرحلة من رحلة حفظ القرآن.",
    blogViewAll: "عرض الكل ←",
    blogReadMore: "اقرأ المقال",
    blogBackToBlog: "← العودة إلى المدونة",
    blogDarkMode: "الوضع الداكن",
    blogLightMode: "الوضع الفاتح",
    blogReadyToBegin: "هل أنت مستعد للبدء؟",
    blogStartMemo: "ابدأ الحفظ مع نور القرآن",
    blogGetStartedFree: "ابدأ مجاناً ←",
    blogMoreFromBlog: "المزيد من المدونة",
    footerTagline: "حفظ القرآن بالذكاء الاصطناعي للمسلم المعاصر. متاح على iOS وAndroid.",
    footerProduct: "المنتج",
    footerCompany: "الشركة",
    footerCommunity: "المجتمع",
    footerLegal: "القانوني",
    footerPricing: "الأسعار",
    footerGiftCards: "بطاقات الهدايا",
    footerFamilyPlan: "الخطة العائلية",
    footerPremiumFeatures: "الميزات المميزة",
    footerBlog: "المدونة",
    footerCareers: "الوظائف",
    footerScholarships: "المنح الدراسية",
    footerSupport: "مركز الدعم",
    footerFeatureReq: "طلبات الميزات",
    footerPodcast: "بودكاست re:Verses",
    footerNetwork: "شبكة الحفاظ",
    footerDiscord: "ديسكورد",
    footerRamadan: "مركز رمضان",
    footerPrivacy: "سياسة الخصوصية",
    footerTerms: "شروط الخدمة",
    footerCookies: "سياسة الكوكيز",
    footerCopyright: "© 2026 نور القرآن، جميع الحقوق محفوظة.",
    catAll: "الكل",
    catMemorization: "الحفظ",
    catTajweed: "التجويد",
    catTips: "نصائح",
    catTech: "التقنية",
    catResearch: "البحث",
    catCommunity: "المجتمع",
    catRamadan: "رمضان",
    catAnnouncements: "الإعلانات",
    catDesign: "التصميم",
  },
  fr: {
    navFeatures: "Fonctionnalités",
    navDemo: "Essayer la démo",
    navPricing: "Tarifs",
    navCommunity: "Communauté",
    navBlog: "Blog",
    navSignIn: "Connexion",
    navStartFree: "Commencer",
    blogTitle: "Le Blog",
    blogSubtitle: "Articles, recherches et conseils pour chaque étape de votre voyage de mémorisation.",
    blogViewAll: "Voir tout →",
    blogReadMore: "Lire l'article",
    blogBackToBlog: "← Retour au Blog",
    blogDarkMode: "Mode sombre",
    blogLightMode: "Mode clair",
    blogReadyToBegin: "Prêt à commencer ?",
    blogStartMemo: "Commencez la mémorisation avec Noor-ul-Quran",
    blogGetStartedFree: "Commencer gratuitement →",
    blogMoreFromBlog: "Plus du Blog",
    footerTagline: "Mémorisation du Coran assistée par l'IA pour le musulman moderne. Disponible sur iOS et Android.",
    footerProduct: "Produit",
    footerCompany: "Entreprise",
    footerCommunity: "Communauté",
    footerLegal: "Mentions légales",
    footerPricing: "Tarifs",
    footerGiftCards: "Cartes cadeaux",
    footerFamilyPlan: "Forfait familial",
    footerPremiumFeatures: "Fonctionnalités Premium",
    footerBlog: "Blog",
    footerCareers: "Carrières",
    footerScholarships: "Bourses",
    footerSupport: "Centre d'aide",
    footerFeatureReq: "Demandes de fonctionnalités",
    footerPodcast: "Podcast re:Verses",
    footerNetwork: "Réseau Hifz",
    footerDiscord: "Discord",
    footerRamadan: "Hub Ramadan",
    footerPrivacy: "Politique de confidentialité",
    footerTerms: "Conditions d'utilisation",
    footerCookies: "Politique des cookies",
    footerCopyright: "© 2026 Noor-ul-Quran, Inc. Tous droits réservés.",
    catAll: "Tout",
    catMemorization: "Mémorisation",
    catTajweed: "Tajweed",
    catTips: "Conseils",
    catTech: "Technologie",
    catResearch: "Recherche",
    catCommunity: "Communauté",
    catRamadan: "Ramadan",
    catAnnouncements: "Annonces",
    catDesign: "Design",
  },
};

type T = typeof translations.en;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
  isRtl: boolean;
}

const LangContext = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
  isRtl: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("tartib-lang") as Lang | null;
    if (stored && translations[stored]) setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("tartib-lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang], isRtl: lang === "ar" }}>
      <div dir={lang === "ar" ? "rtl" : "ltr"}>{children}</div>
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
