import "./index.css";
import { Composition } from "remotion";
import { WindowCleaningAd } from "./WindowCleaningAd";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WindowCleaningAd"
        component={WindowCleaningAd}
        durationInFrames={585}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
