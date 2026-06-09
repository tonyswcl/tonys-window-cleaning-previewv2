import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { fontFamily } from "../fonts";

const services = [
  {
    icon: "🪟",
    title: "Window Cleaning",
    desc: "Residential & Commercial",
    color: "#38BDF8",
    delay: 20,
  },
  {
    icon: "☀️",
    title: "Solar Panel Cleaning",
    desc: "Purified water · No chemicals · Streak-free",
    color: "#FBBF24",
    delay: 50,
  },
  {
    icon: "🐦",
    title: "Pigeon Proofing",
    desc: "Wire mesh installation · Keeps them out for good",
    color: "#A78BFA",
    delay: 80,
  },
];

const ServiceRow: React.FC<{
  icon: string;
  title: string;
  desc: string;
  color: string;
  delay: number;
  frame: number;
}> = ({ icon, title, desc, color, delay, frame }) => {
  const x = interpolate(frame, [delay, delay + 25], [-120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const opacity = interpolate(frame, [delay, delay + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const checkScale = interpolate(frame, [delay + 20, delay + 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

  return (
    <div
      style={{
        opacity,
        translate: `${x}px 0px`,
        display: "flex",
        alignItems: "center",
        gap: 32,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${color}30`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 20,
        padding: "36px 48px",
        width: "100%",
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: 64, lineHeight: 1 }}>{icon}</div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <div style={{ color: "#94A3B8", fontSize: 34, fontWeight: 400 }}>{desc}</div>
      </div>

      {/* Check badge */}
      <div
        style={{
          scale: String(checkScale),
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#000", fontSize: 32, fontWeight: 900 }}>✓</span>
      </div>
    </div>
  );
};

export const SceneServices: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 20], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
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
        padding: "0 80px",
        gap: 0,
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(56,189,248,0.06) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          translate: "-50% -50%",
        }}
      />

      {/* Section title */}
      <div
        style={{
          opacity: titleOpacity,
          translate: `0px ${titleY}px`,
          marginBottom: 64,
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 600,
            color: "#38BDF8",
            letterSpacing: 5,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          What We Do
        </p>
        <h2
          style={{
            margin: 0,
            fontSize: 88,
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1.05,
            letterSpacing: -1,
          }}
        >
          Full Service.
          <br />
          <span style={{ color: "#38BDF8" }}>One Call.</span>
        </h2>
      </div>

      {/* Service rows */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
          width: "100%",
        }}
      >
        {services.map((s) => (
          <ServiceRow key={s.title} {...s} frame={frame} />
        ))}
      </div>

      {/* Bottom note */}
      <p
        style={{
          marginTop: 56,
          color: "#64748B",
          fontSize: 32,
          textAlign: "center",
          opacity: interpolate(frame, [110, 130], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Licensed · Insured · Locally Owned
      </p>
    </AbsoluteFill>
  );
};
