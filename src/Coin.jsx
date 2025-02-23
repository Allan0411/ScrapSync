import { useLottie } from "lottie-react";
import coin from "./assets/coin.json";

const Coin = () => {
  const options = {
    animationData: coin,
    autoplay: true,
    loop: true, 
  };
  const { View } = useLottie(options, { height: 50 });

  return <>{View}</>;
};

export default Coin;
