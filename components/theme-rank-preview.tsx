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

      <div className="relative z-10 p-3 sm:p-4 md:p-5">
        <div
          className="rounded-[20px] border shadow-[0_18px_40px_-24px_rgba(0,0,0,0.18)] backdrop-blur sm:rounded-[24px]"
          style={{
            borderColor: `${primary}28`,
            background: premium
              ? `linear-gradient(135deg, rgba(255,255,255,0.72), ${primary}08, rgba(255,255,255,0.82))`
              : `linear-gradient(135deg, rgba(255,255,255,0.74), ${primary}05, ${secondary}07)`,
          }}
        >
          <div className="flex h-[120px] items-center gap-3 px-4 sm:h-[138px] sm:gap-4 sm:px-5 md:h-[152px] md:grid md:grid-cols-[72px_minmax(0,1fr)] md:gap-5 md:px-6">
            <div className={`flex shrink-0 items-center ${circleAlign === "end" ? "justify-end md:order-2" : "justify-start"}`}>
              <div
                className="leaderboard-rank-bob relative flex h-12 w-12 items-center justify-center rounded-full border shadow-[0_12px_28px_-18px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105 md:h-14 md:w-14"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${secondary}, ${primary})`,
                  borderColor: `${tertiary}66`,
                }}
              >
                <div className="absolute inset-[3px] rounded-full border border-white/25" />
                <div className="absolute h-2 w-2 rounded-full bg-white/30 top-2 right-2" />
              </div>
            </div>

            <div className={`min-w-0 ${circleAlign === "end" ? "md:order-1" : ""}`}>
              <div className={`flex ${circleAlign === "end" ? "justify-end" : "justify-start"}`}>
                <div
                  className="h-4 rounded-full md:h-5"
                  style={{
                    width: "clamp(7rem, 58%, 14rem)",
                    background: `linear-gradient(to right, ${tertiary}, ${primary})`,
                    opacity: 0.95,
                  }}
                />
              </div>

              <div className={`mt-3 flex ${circleAlign === "end" ? "justify-end" : "justify-start"}`}>
                <div
                  className="h-3 rounded-full md:h-4"
                  style={{
                    width: "clamp(4.5rem, 34%, 8rem)",
                    backgroundColor: `${secondary}70`,
                  }}
                />
              </div>

              <div className={`mt-3 flex gap-2 ${circleAlign === "end" ? "justify-end" : "justify-start"}`}>
                <div
                  className="h-5 rounded-full border md:h-6"
                  style={{
                    width: "3.3rem",
                    borderColor: `${primary}22`,
                    backgroundColor: "rgba(255,255,255,0.7)",
                  }}
                />
                <div
                  className="h-5 rounded-full border md:h-6"
                  style={{
                    width: "4.2rem",
                    borderColor: `${secondary}22`,
                    backgroundColor: premium ? `${primary}12` : `${secondary}10`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
