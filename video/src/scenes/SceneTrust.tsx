import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { fontFamily } from "../fonts";

const TrustBadge: React.FC<{
  label: string;
  value: string;
  color: string;
  frame: number;
  delay: number;
}> = ({ label, value, color, frame, delay }) => {
  const scale = interpolate(frame, [delay, delay + 20], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        scale: String(scale),
        opacity,
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${color}40`,
        borderRadius: 24,
        padding: "40px 48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        flex: 1,
      }}
    >
      <div style={{ color, fontSize: 72, fontWeight: 900, lineHeight: 1 }}>{value}</div>
      <div
        style={{
          color: "#94A3B8",
          fontSize: 30,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const quotes = [
  { text: "Best window cleaners in the High Desert!", author: "Happy Homeowner" },
  { text: "Solar panels look brand new. Worth every penny.", author: "Satisfied Client" },
];

export const SceneTrust: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 20], [50, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Alternate between quotes every ~55 frames after frame 60
  const activeQuote = frame < 90 ? 0 : 1;
  const quoteOpacity = interpolate(
    frame,
    activeQuote === 0 ? [60, 75] : [105, 120],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #091530 0%, #0B1E3D 50%, #0D1A38 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,139,250,0.07) 0%, transparent 70%)",
          top: "40%",
          left: "50%",
          translate: "-50% -50%",
        }}
      />

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          translate: `0px ${titleY}px`,
          textAlign: "center",
          marginBottom: 60,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 600,
            color: "#A78BFA",
            letterSpacing: 5,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Trusted in the Community
        </p>
        <h2
          style={{
            margin: 0,
            fontSize: 96,
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1.0,
            letterSpacing: -1,
          }}
        >
          Why Tony's?
        </h2>
      </div>

      {/* Trust badges grid */}
      <div style={{ display: "flex", gap: 24, width: "100%", marginBottom: 48 }}>
        <TrustBadge
          label="Locally Owned & Operated"
          value="Local"
          color="#38BDF8"
          frame={frame}
          delay={25}
        />
        <TrustBadge
          label="Licensed & Insured"
          value="✓✓"
          color="#4ADE80"
          frame={frame}
          delay={40}
        />
      </div>

      <div style={{ display: "flex", gap: 24, width: "100%", marginBottom: 64 }}>
        <TrustBadge
          label="Years Serving High Desert & IE"
          value="Years"
          color="#FBBF24"
          frame={frame}
          delay={55}
        />
        <TrustBadge
          label="5-Star Yelp & Google Reviews"
          value="★ 5.0"
          color="#FBBF24"
          frame={frame}
          delay={70}
        />
      </div>

      {/* Testimonial */}
      <div
        style={{
          opacity: quoteOpacity,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          padding: "44px 52px",
          width: "100%",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#E2E8F0",
            fontSize: 40,
            lineHeight: 1.5,
            fontWeight: 400,
            marginBottom: 20,
          }}
        >
          "{quotes[activeQuote].text}"
        </p>
        <p
          style={{
            margin: 0,
            color: "#38BDF8",
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          — {quotes[activeQuote].author}
        </p>
      </div>
    </AbsoluteFill>
  );
};
