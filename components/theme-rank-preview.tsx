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
      dir="ltr"
      className="relative aspect-[1.22/1] w-full overflow-hidden rounded-[22px] border-2 sm:aspect-[1.3/1]"
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

      <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between">
        <div
          className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] shadow-sm"
          style={{
            color: tertiary,
            borderColor: `${primary}33`,
            backgroundColor: premium ? `${primary}10` : "rgba(255,255,255,0.78)",
          }}
        >
          Theme
        </div>

        <div
          className="rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm"
          style={{
            color: primary,
            borderColor: `${secondary}44`,
            backgroundColor: "rgba(255,255,255,0.76)",
          }}
        >
          #1
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-6 top-4 h-24 w-24 rounded-full blur-3xl sm:h-20 sm:w-20" style={{ backgroundColor: `${primary}22` }} />
        <div className="absolute -left-8 bottom-0 h-20 w-20 rounded-full blur-3xl sm:h-16 sm:w-16" style={{ backgroundColor: `${secondary}18` }} />
        <div
          className="absolute inset-x-4 bottom-5 h-12 rounded-[18px] border blur-[0.2px]"
          style={{
            borderColor: `${primary}12`,
            background: `linear-gradient(135deg, ${primary}08, rgba(255,255,255,0.5), ${secondary}08)`,
          }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-4">
        <div className="h-7" />

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div
              className="h-3 rounded-full"
              style={{
                width: "72%",
                background: `linear-gradient(to right, ${tertiary}, ${primary})`,
                opacity: 0.92,
              }}
            />
            <div
              className="h-2.5 rounded-full"
              style={{
                width: "48%",
                backgroundColor: `${secondary}66`,
              }}
            />
            <div className="flex items-center gap-2 pt-1">
              <div
                className="h-7 min-w-[3.2rem] rounded-full border px-2"
                style={{
                  borderColor: `${primary}22`,
                  backgroundColor: "rgba(255,255,255,0.72)",
                }}
              />
              <div
                className="h-7 min-w-[4.5rem] rounded-full border px-2"
                style={{
                  borderColor: `${secondary}22`,
                  backgroundColor: premium ? `${primary}12` : `${secondary}10`,
                }}
              />
            </div>
          </div>

          <div
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-[0_12px_28px_-18px_rgba(0,0,0,0.35)] sm:h-12 sm:w-12 ${circleAlign === "end" ? "order-last" : "order-first"}`}
            style={{
              background: `radial-gradient(circle at 30% 30%, ${secondary}, ${primary})`,
              borderColor: `${tertiary}66`,
            }}
          >
            <div className="absolute inset-[3px] rounded-full border border-white/25" />
            <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-white/30" />
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-[18px] border px-3 py-2.5 shadow-sm"
          style={{
            borderColor: `${primary}18`,
            backgroundColor: "rgba(255,255,255,0.82)",
          }}
        >
          <div className="space-y-1.5">
            <div
              className="h-2.5 rounded-full"
              style={{ width: "3.8rem", backgroundColor: `${tertiary}85` }}
            />
            <div
              className="h-2 rounded-full"
              style={{ width: "2.8rem", backgroundColor: `${secondary}55` }}
            />
          </div>

          <div
            className="rounded-full px-3 py-1 text-[10px] font-black tracking-[0.18em]"
            style={{
              color: premium ? tertiary : primary,
              background: premium ? `linear-gradient(135deg, ${primary}18, ${secondary}20)` : `${primary}10`,
            }}
          >
            LIVE
          </div>
        </div>
      </div>
    </div>
  )
}
