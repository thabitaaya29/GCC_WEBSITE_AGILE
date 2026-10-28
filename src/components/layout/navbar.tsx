import { useState } from "react";
import { NavLink, Link } from "react-router";
import { Menu, X } from "lucide-react";
import { navigation } from "../../data/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-xl font-bold text-gray-900"
          onClick={() => setIsOpen(false)}
        >
          GCC
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-emerald-700"
                  : "text-gray-600 hover:text-emerald-700"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="rounded-lg p-2 md:hidden"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile navigation */}
      {isOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-gray-200 bg-white px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "font-semibold text-emerald-700"
                    : "text-gray-600 hover:text-emerald-700"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}