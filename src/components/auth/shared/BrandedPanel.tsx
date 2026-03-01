import { StarLogo } from "./AuthIcons"

export function BrandedPanel() {
  return (
    <div className="relative hidden lg:flex lg:flex-col lg:justify-between overflow-hidden rounded-2xl m-3 bg-foreground text-background">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: "url('/images/space-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-foreground/30" />

      {/* Logo */}
      <div className="relative z-10 p-8">
        <StarLogo />
      </div>

      {/* Center text */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-12">
        <h2 className="text-center font-mono text-lg tracking-wide leading-relaxed text-background md:text-xl text-balance">
          {"Discover the Future of Finance from Mars 🌍 to Your Wallet"}
        </h2>
      </div>

      {/* Bottom brand logos */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 px-8 pb-8">
        <span className="text-xs tracking-wider opacity-50 font-sans">Booking.com</span>
        <span className="text-xs tracking-wider opacity-50 font-sans">Spotify</span>
        <span className="text-sm tracking-wider opacity-50 font-sans font-semibold">Google</span>
        <span className="text-xs tracking-wider opacity-50 font-sans">Discord</span>
        <span className="text-xs tracking-wider opacity-50 font-sans">airbnb</span>
      </div>
    </div>
  )
}