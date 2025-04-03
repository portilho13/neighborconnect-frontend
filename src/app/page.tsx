import Image from "next/image";
import ImagemInicial from "../../images/ImagemInicial.svg"
import Paragraph from "../../components/footer/Paragraph";

/*3F3D56 */
export default function Home() {
  return (
    <div className="w-screen flex flex-col">
      <div className="bg-[#3F3D56] flex flex-col h-screen w-screen">
        <h1 className="ml-10 mt-14 font-bold text-3xl">
          <span className="block">Welcome To</span>
          <span className="block">NeighboorConnect !</span>
        </h1>
        <div className="w-screen flex flex-col gap-20 items-center justify-center py-10">
          <Image
              width={500}
              height={500}
              src={ImagemInicial}
              alt="Imagem Inicial"
              />
          <div className="text-center">
            <button className="bg-[#4987FF] w-52 h-14 rounded-md mb-3" type="submit">Sign Up</button>
            <p className="text-sm">Already have an account? <a>Login</a></p>
          </div>
        </div>
      </div>
      <div className="w-screen p-16 flex justify-between h-60">
        <div className="flex flex-col justify-between">
          <h1 className="font-bold">Exclusive</h1>
          <p>Subscrive</p>
          <p>Get 10% Off</p>
          <input className="bg-black border-2 rounded-md border-white" type="text"></input>
        </div>
        <Paragraph></Paragraph>
        <Paragraph></Paragraph>
        <Paragraph></Paragraph>
        <Paragraph></Paragraph>

      </div>
    </div>
  );
}
