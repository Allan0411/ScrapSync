import { useLottie } from "lottie-react";
import trophy from "./assets/trophy.json";

const Trophy = () => {
  const options = {
    animationData: trophy,
    autoplay: true,
    loop: true, 
  };
  const { View } = useLottie(options, { height: 50 });

  return <>{View}</>;
};

export default Trophy;
