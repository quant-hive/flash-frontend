import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="mt-4 mr-4">
      <nav className="flex flex-row justify-end">
        <ul className="flex flex-row gap-6 text-secondary text-[12px] font-light">
          <li className="inline-block">
            <Link href="#" className="hover:text-primary">
              Cookies Policy
            </Link>
          </li>
          <li className="inline-block">
            <Link href="#" className="hover:text-primary">
              License
            </Link>
          </li>
          <li className="inline-block">
            <Link href="#" className="hover:text-primary">
              Terms of Use
            </Link>
          </li>
          <li className="inline-block">
            <Link href="#" className="hover:text-primary">
              Privacy Policy
            </Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
