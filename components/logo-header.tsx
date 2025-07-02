import Link from "next/link";
import { Zap } from "lucide-react";

/**
 * LogoHeader component for authentication pages.
 */
export function LogoHeader() {
  return (
    <Link href="/" className="flex flex-col items-start text-white">
      <div className="flex items-center">
        <Zap className="h-6 w-6 text-yellow-400 mr-2" />
        <span className="font-bold text-xl">Flash</span>
      </div>
      <span className="text-xs text-gray-400 ml-8">by QuantHive</span>
    </Link>
  );
}
