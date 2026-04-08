type ThemeRankPreviewProps = {
  primary: string
  secondary: string
  tertiary: string
  premium?: boolean
  circleAlign?: "start" | "end"
}

export function ThemeRankPreview({
  primary,
  secondary,
  tertiary,
  premium = false,
  circleAlign = "start",
}: ThemeRankPreviewProps) {
  return (
    <div
      className="group relative w-full overflow-hidden rounded-2xl border-2 shadow-lg sm:rounded-3xl"
      style={{
        backgroundColor: premium ? "rgba(250, 248, 245, 0.98)" : "rgba(255, 255, 255, 0.95)",
        borderColor: primary,
        borderWidth: premium ? "3px" : "2px",
        backgroundImage: premium
          ? `linear-gradient(90deg, ${primary}08 1px, transparent 1px), linear-gradient(${primary}08 1px, transparent 1px), radial-gradient(circle at 10% 20%, ${primary}05 0%, transparent 50%)`
          : `radial-gradient(circle at 20% 80%, ${primary}08 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${secondary}06 0%, transparent 50%)`,
        backgroundSize: premium ? "20px 20px, 20px 20px, 100% 100%" : undefined,
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-1.5"
        style={{
          backgroundImage: premium
            ? `linear-gradient(to right, ${primary}, ${secondary}, ${primary})`
            : `linear-gradient(to right, ${primary}, ${secondary})`,
        }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-8 top-5 h-28 w-28 rounded-full blur-3xl" style={{ backgroundColor: `${primary}22` }} />
        <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full blur-3xl" style={{ backgroundColor: `${secondary}18` }} />
        <div
          className="absolute inset-3 rounded-[18px] sm:inset-4 sm:rounded-[22px]"
          style={{
            background: premium
              ? `linear-gradient(135deg, ${primary}08, rgba(255,255,255,0.6), ${secondary}10)`
              : `linear-gradient(135deg, rgba(255,255,255,0.55), ${primary}06, ${secondary}08)`,
            border: `1px solid ${primary}18`,
          }}
        />
      </div>

      <div className="relative z-10 flex h-[132px] items-center justify-center p-3 sm:h-[160px] sm:p-4 md:h-[188px] md:p-6">
        <div
          className={`leaderboard-rank-bob relative flex h-12 w-12 items-center justify-center rounded-full border shadow-[0_12px_28px_-18px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105 md:h-16 md:w-16 ${circleAlign === "end" ? "mr-auto" : "ml-auto"}`}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${secondary}, ${primary})`,
            borderColor: `${tertiary}66`,
          }}
        >
          <div className="absolute inset-[4px] rounded-full border border-white/25" />
          <div className="absolute h-2 w-2 rounded-full bg-white/30 top-2.5 right-2.5" />
        </div>
      </div>
    </div>
  )
}
