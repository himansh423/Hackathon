import HomePage from "@/components/HomePage";
import Spline from "@splinetool/react-spline";

const Page = () => {
  return (
    <div className="w-screen min-h-screen flex flex-col justify-between overflow-y-hidden">
      <div className="w-1/2 z-0 h-screen absolute top-0 right-0">
        <Spline scene="https://prod.spline.design/k6tJobQvpgMjHVSY/scene.splinecode" />
      </div>
      <div className="w-1/2 hide-scrollbar  h-screen bg-[#E3E3E3] overflow-y-auto">
        <HomePage />
      </div>
    </div>
  );
};

export default Page;
