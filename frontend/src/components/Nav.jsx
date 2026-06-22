import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Origin", testId: "nav-home" },
  { to: "/explore", label: "Brain Atlas", testId: "nav-explore" },
  { to: "/library", label: "Library", testId: "nav-library" },
];

export default function Nav() {
  const location = useLocation();
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 glass"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      data-testid="site-nav"
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 md:px-10 py-4">
        <Link
          to="/"
          className="flex items-center gap-3"
          data-testid="nav-logo"
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{
              background: "#d4af37",
              boxShadow: "0 0 14px #d4af37",
            }}
          />
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              letterSpacing: "0.32em",
              fontSize: 12,
              textTransform: "uppercase",
              color: "#fafafa",
            }}
          >
            SYNAPSE
          </span>
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 10,
              letterSpacing: "0.28em",
              color: "rgba(250,250,250,0.45)",
              borderLeft: "1px solid rgba(255,255,255,0.15)",
              paddingLeft: 10,
              marginLeft: 4,
              textTransform: "uppercase",
            }}
            className="hidden sm:inline"
          >
            Cosmic Brain Atlas
          </span>
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                data-testid={l.testId}
                className="px-3 md:px-4 py-2"
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: active ? "#d4af37" : "rgba(250,250,250,0.7)",
                  borderBottom: active
                    ? "1px solid #d4af37"
                    : "1px solid transparent",
                  transition: "all 0.3s ease",
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
