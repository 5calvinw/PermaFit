import { FaRecycle, FaCamera, FaHammer } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { FaPerson } from "react-icons/fa6";

const SidebarStatic: React.FC = () => {
  const path = "/"; // just a placeholder, no real routing

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed z-20 md:static top-0 left-0 h-screen bg-white shadow-xl w-90 px-6 py-8 flex flex-col gap-8
          transform transition-transform duration-300 ease-in-out
          translate-x-0 md:translate-x-0 md:flex md:w-72
        `}
      >
        <div className="flex justify-start items-center pl-4 pr-2">
          <FaPerson className="text-blue-600 text-3xl" />
          <div className="flex justify-start items-center px-4 font-bold"> 
          <h1 className="text-3xl text-black">Perma</h1>
          <h1 className="text-3xl text-blue-600">Fit</h1>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">

        <div
        className={`flex flex-row justify-start items-center gap-4 py-4 px-6 rounded-lg w-full cursor-default
          hover:bg-gray-100 text-gray-400 font-semibold`}>
        <span className="text-2xl"><FaCamera /></span>
        <h2 className="text-md">Home</h2>
      </div>
       <div
        className={`flex flex-row justify-start items-center gap-4 py-4 px-6 rounded-lg w-full cursor-default
          hover:bg-gray-100 text-gray-400 font-semibold`}>
        <span className="text-2xl"><FaCamera /></span>
        <h2 className="text-md">Workout Schedule</h2>
      </div>

       <div
        className={`flex flex-row justify-start items-center gap-4 py-4 px-6 rounded-lg w-full cursor-default
          hover:bg-gray-100 text-gray-400 font-semibold`}>
        <span className="text-2xl"><FaCamera /></span>
        <h2 className="text-md">Workout Session</h2>
      </div>
        
        </div>
      </div>

    
    </>
  );
};

interface NavButtonProps {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const NavButton: React.FC<NavButtonProps> = ({ name, icon }) => {

  return (
    <div>
      <div
        className={`flex flex-row justify-start items-center gap-4 py-4 px-6 rounded-lg w-full cursor-default
          hover:bg-gray-100 text-gray-400 font-semibold`}
      >
        <span className="text-2xl">{icon}</span>
        <h2 className="text-md">{name}</h2>
      </div>
    </div>
  );
};

export default SidebarStatic;
