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
      </div>

      <div className="relative z-10 flex items-center gap-3 p-3 sm:gap-4 sm:p-4 md:grid md:grid-cols-[84px_minmax(0,1fr)_132px] md:items-center md:gap-5 md:p-6">
        <div className={`flex shrink-0 items-center ${circleAlign === "end" ? "justify-end md:order-3" : "justify-center md:justify-start"}`}>
          <div className="leaderboard-rank-bob mt-4 md:mt-5">
            <div
              className="relative flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_12px_28px_-18px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105 md:h-16 md:w-16"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${secondary}, ${primary})`,
                borderColor: `${tertiary}66`,
              }}
            >
              <div className="absolute inset-[4px] rounded-full border border-white/25" />
              <div className="absolute h-2 w-2 rounded-full bg-white/30 top-2.5 right-2.5" />
              <div className="text-center" style={{ color: "#ffffff" }}>
                <div className="text-lg font-black leading-none md:text-2xl">1</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`min-w-0 flex-1 ${circleAlign === "end" ? "text-left md:order-1" : "text-right"}`}>
          <div className={`flex items-center gap-2 md:gap-3 ${circleAlign === "end" ? "justify-end" : "justify-start"}`}>
            <div
              className="h-4 rounded-full md:h-7"
              style={{
                width: "clamp(6.5rem, 46%, 11rem)",
                background: `linear-gradient(to right, ${tertiary}, ${primary})`,
                opacity: 0.95,
              }}
            />
            <div
              className="h-5 w-5 rounded-full border md:h-7 md:w-7"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${secondary}, ${primary})`,
                borderColor: `${tertiary}55`,
              }}
            />
          </div>

          <div className={`mt-1.5 flex flex-wrap gap-1 md:mt-3 md:gap-2 ${circleAlign === "end" ? "justify-end" : "justify-start"}`}>
            <div
              className="h-5 rounded-full border md:h-7"
              style={{
                width: "3.25rem",
                borderColor: `${primary}22`,
                backgroundColor: "rgba(255,255,255,0.72)",
              }}
            />
            <div
              className="h-5 rounded-full border md:h-7"
              style={{
                width: "4.5rem",
                borderColor: `${secondary}22`,
                backgroundColor: premium ? `${primary}12` : `${secondary}10`,
              }}
            />
          </div>
        </div>

        <div
          className={`flex shrink-0 ${circleAlign === "end" ? "justify-start md:order-2" : "justify-end"}`}
        >
          <div
            className="min-w-[76px] rounded-[18px] border bg-white/90 px-3 py-2 text-center shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)] backdrop-blur sm:min-w-[88px] sm:px-3.5 sm:py-2.5 md:min-w-[104px] md:rounded-[22px] md:px-4 md:py-3"
            style={{ borderColor: `${primary}88` }}
          >
            <div
              className="text-lg font-black leading-none text-[#20335f] sm:text-xl md:text-3xl"
            >
              1000
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
