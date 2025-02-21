import { useLottie } from "lottie-react";
import hand from "./assets/hand.json";

const Hand = () => {
  const options = {
    animationData: hand,
    autoplay: true,
    loop: true, 
  };
  const { View } = useLottie(options, { height: 800 });

  return <>{View}</>;
};

export default Hand;
