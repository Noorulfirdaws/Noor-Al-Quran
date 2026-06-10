import AIRecitationDemo from "../components/AIRecitationDemo";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Live AI Demo — Noor-ul-Quran",
  description: "Try Noor-ul-Quran's real-time Quran recitation mistake detection live in your browser.",
};

export default function DemoPage() {
  return (
    <>
      <Navbar />
      <AIRecitationDemo />
    </>
  );
}
