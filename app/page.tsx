import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { PrivacyDialog } from "@/components/home/privacy-dialog";
import { TermsDialog } from "@/components/home/terms-dialog";
import { CodeAnimation } from "@/components/home/code-animation";
import { FeatureCards } from "@/components/home/featured-cards";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative">
      <CodeAnimation />
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-800 relative z-10">
        <Link href="/" className="flex flex-col justify-center">
          <div className="flex items-center">
            <Zap className="h-6 w-6 text-yellow-400 mr-2" />
            <span className="font-bold text-xl">Flash</span>
          </div>
          <span className="text-xs text-gray-400 ml-8">by QuantHive</span>
        </Link>
        <nav className="ml-8 flex gap-8 sm:gap-10">
          <span className="text-sm font-medium text-gray-300">
            Next-Gen Investment Analytics
          </span>
        </nav>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4 text-white"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium hover:underline underline-offset-4 text-white"
          >
            Register
          </Link>
        </nav>
      </header>
      <main className="flex-1 relative z-10">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black bg-opacity-60">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Advanced Financial Analysis Platform
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  Enter your investment ideas, select tickers, and see how your
                  ideas would have performed.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button className="inline-flex h-10 items-center justify-center rounded-md bg-yellow-400 text-black px-8 hover:bg-yellow-500">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900">
          <div className="container px-4 md:px-6">
            <FeatureCards />
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-800 relative z-10">
        <p className="text-xs text-gray-400">
          © 2025 QuantHive. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <TermsDialog
            trigger={
              <button className="text-xs text-gray-400 hover:underline underline-offset-4">
                Terms of Service
              </button>
            }
          />
          <PrivacyDialog
            trigger={
              <button className="text-xs text-gray-400 hover:underline underline-offset-4">
                Privacy
              </button>
            }
          />
        </nav>
      </footer>
    </div>
  );
}
