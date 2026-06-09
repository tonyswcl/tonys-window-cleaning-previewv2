import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { fontFamily } from "../fonts";

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();

  const headlineY = interpolate(frame, [0, 20], [80, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const headlineOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subY = interpolate(frame, [18, 38], [50, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const subOpacity = interpolate(frame, [18, 38], [0, 1], {
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(frame, [35, 60], [0, 420], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const tagOpacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateRight: "clamp",
  });
  const tagY = interpolate(frame, [55, 75], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Shimmer sweep across headline
  const shimmerX = interpolate(frame, [40, 90], [-200, 1300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0B1426 0%, #0F2044 60%, #091530 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
          top: "30%",
          left: "50%",
          translate: "-50% -50%",
        }}
      />

      {/* Decorative top dots */}
      <div style={{ position: "absolute", top: 160, left: 90, display: "flex", gap: 14 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#38BDF8",
              opacity: interpolate(frame, [10 + i * 8, 28 + i * 8], [0, 0.6], {
                extrapolateRight: "clamp",
              }),
            }}
          />
        ))}
      </div>

      {/* Main content column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          paddingLeft: 80,
          paddingRight: 80,
          width: "100%",
        }}
      >
        {/* Eyebrow label */}
        <div
          style={{
            opacity: tagOpacity,
            translate: `0px ${tagY}px`,
            background: "rgba(56,189,248,0.15)",
            border: "1px solid rgba(56,189,248,0.4)",
            borderRadius: 40,
            paddingLeft: 32,
            paddingRight: 32,
            paddingTop: 12,
            paddingBottom: 12,
            marginBottom: 48,
          }}
        >
          <span
            style={{
              color: "#38BDF8",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            High Desert & Inland Empire
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            position: "relative",
            opacity: headlineOpacity,
            translate: `0px ${headlineY}px`,
            overflow: "hidden",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 148,
              fontWeight: 900,
              color: "#FFFFFF",
              lineHeight: 1.0,
              textAlign: "center",
              letterSpacing: -2,
              textTransform: "uppercase",
            }}
          >
            STREAK-
            <br />
            FREE
          </h1>
          {/* Shimmer sweep */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: shimmerX,
              width: 120,
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
              transform: "skewX(-20deg)",
            }}
          />
        </div>

        {/* Blue accent line */}
        <div
          style={{
            width: lineWidth,
            height: 6,
            background: "linear-gradient(90deg, #38BDF8, #0EA5E9)",
            borderRadius: 3,
            marginTop: 32,
            marginBottom: 40,
          }}
        />

        {/* Subheadline */}
        <div
          style={{
            opacity: subOpacity,
            translate: `0px ${subY}px`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 56,
              fontWeight: 700,
              color: "#94A3B8",
              textAlign: "center",
              letterSpacing: 1,
            }}
          >
            Windows · Solar Panels · Pigeon Proofing
          </p>
        </div>
      </div>

      {/* Bottom badge */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" }),
          translate: `0px ${interpolate(frame, [80, 100], [20, 0], { extrapolateRight: "clamp" })}px`,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {["★", "★", "★", "★", "★"].map((star, i) => (
          <span
            key={i}
            style={{
              fontSize: 52,
              color: "#FBBF24",
              opacity: interpolate(frame, [85 + i * 4, 100 + i * 4], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            {star}
          </span>
        ))}
        <span style={{ color: "#94A3B8", fontSize: 34, marginLeft: 8, fontWeight: 400 }}>
          Yelp & Google Reviews
        </span>
      </div>
    </AbsoluteFill>
  );
};
