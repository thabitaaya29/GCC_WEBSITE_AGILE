import { useState } from "react";
import { NavLink, Link } from "react-router";
import { Menu, X } from "lucide-react";
import { navigation } from "../../data/navigation";
import logoTransparent from "../../assets/brand/logo-transparent.png";
import Button from "../UI/button";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center rounded-lg px-2 text-base transition-colors duration-150 ${isActive ? "font-semibold text-brand-red underline underline-offset-8" : "text-muted hover:text-brand-red"}`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white" onKeyDown={(event) => { if (event.key === "Escape") setIsOpen(false); }}>
      <nav aria-label="Navigasi utama" className="page-container flex items-center justify-between gap-4 py-3">
        <Link
          to="/"
          className="brand-logo rounded-lg"
          onClick={() => setIsOpen(false)}
        >
          <img src={logoTransparent} alt="Growth Consulting — Beranda" />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={navLinkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="px-2 md:hidden"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </Button>
      </nav>

      {/* Mobile navigation */}
        <nav
          id="mobile-navigation"
          aria-label="Navigasi mobile"
          hidden={!isOpen}
          className="border-t border-line bg-white md:hidden"
        >
          <div className="page-container flex flex-col gap-2 py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setIsOpen(false)}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
    </header>
  );
}
