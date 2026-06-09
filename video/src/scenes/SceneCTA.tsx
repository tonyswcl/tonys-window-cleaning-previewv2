import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { fontFamily } from "../fonts";

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();

  // Background pulse glow
  const glowScale = interpolate(
    frame,
    [0, 45, 90, 135],
    [1, 1.12, 1, 1.12],
    { extrapolateRight: "clamp" }
  );

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const logoY = interpolate(frame, [0, 20], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const ctaTextOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const ctaTextY = interpolate(frame, [20, 40], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const phoneOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const phoneScale = interpolate(frame, [40, 60], [0.85, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

  const buttonOpacity = interpolate(frame, [65, 85], [0, 1], { extrapolateRight: "clamp" });
  const buttonY = interpolate(frame, [65, 85], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Button pulse
  const buttonPulse = interpolate(
    frame,
    [90, 105, 120, 135, 150],
    [1, 1.03, 1, 1.03, 1],
    { extrapolateRight: "clamp" }
  );

  const orOpacity = interpolate(frame, [85, 100], [0, 1], { extrapolateRight: "clamp" });

  const socialOpacity = interpolate(frame, [100, 120], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #060E1E 0%, #0A1628 50%, #060E1E 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        overflow: "hidden",
      }}
    >
      {/* Pulsing background glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 65%)",
          top: "50%",
          left: "50%",
          translate: "-50% -50%",
          scale: String(glowScale),
        }}
      />

      {/* Corner accents */}
      {[
        { top: 80, left: 80 },
        { top: 80, right: 80 },
        { bottom: 80, left: 80 },
        { bottom: 80, right: 80 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            borderTop: i < 2 ? "3px solid rgba(56,189,248,0.3)" : "none",
            borderBottom: i >= 2 ? "3px solid rgba(56,189,248,0.3)" : "none",
            borderLeft: i % 2 === 0 ? "3px solid rgba(56,189,248,0.3)" : "none",
            borderRight: i % 2 === 1 ? "3px solid rgba(56,189,248,0.3)" : "none",
            ...pos,
            opacity: interpolate(frame, [5 + i * 5, 20 + i * 5], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        />
      ))}

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          width: "100%",
          zIndex: 1,
        }}
      >
        {/* Brand name */}
        <div
          style={{
            opacity: logoOpacity,
            translate: `0px ${logoY}px`,
            textAlign: "center",
            marginBottom: 56,
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #38BDF8, #0EA5E9)",
              borderRadius: 16,
              padding: "16px 40px",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Tony's Window Cleaning
            </span>
          </div>
          <p
            style={{
              margin: 0,
              color: "#94A3B8",
              fontSize: 36,
              fontWeight: 400,
            }}
          >
            High Desert & Inland Empire
          </p>
        </div>

        {/* CTA text */}
        <div
          style={{
            opacity: ctaTextOpacity,
            translate: `0px ${ctaTextY}px`,
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 58,
              fontWeight: 700,
              color: "#E2E8F0",
              lineHeight: 1.2,
            }}
          >
            Call or Text for a
            <br />
            <span style={{ color: "#38BDF8" }}>Free Quote</span>
          </h2>
        </div>

        {/* Phone number */}
        <div
          style={{
            opacity: phoneOpacity,
            scale: String(phoneScale),
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              fontSize: 116,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            714-559-0300
          </div>
        </div>

        {/* CTA Button */}
        <div
          style={{
            opacity: buttonOpacity,
            translate: `0px ${buttonY}px`,
            scale: String(buttonPulse),
            width: "100%",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
              borderRadius: 24,
              padding: "44px 0",
              textAlign: "center",
              boxShadow: "0 0 60px rgba(56,189,248,0.3)",
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 56,
                fontWeight: 900,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              GET A FREE QUOTE
            </span>
          </div>
        </div>

        {/* Or divider */}
        <div
          style={{
            opacity: orOpacity,
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginTop: 36,
            marginBottom: 36,
            width: "100%",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ color: "#64748B", fontSize: 32, fontWeight: 600 }}>or reach us on</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Social platforms */}
        <div
          style={{
            opacity: socialOpacity,
            display: "flex",
            gap: 32,
            justifyContent: "center",
          }}
        >
          {["Facebook", "Yelp"].map((platform) => (
            <div
              key={platform}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 16,
                padding: "20px 48px",
              }}
            >
              <span style={{ color: "#94A3B8", fontSize: 34, fontWeight: 600 }}>
                {platform}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
