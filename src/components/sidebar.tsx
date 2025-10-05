'use client'; 
import { MdDashboard } from "react-icons/md";
import { FaPerson  } from "react-icons/fa6";
import { usePathname } from 'next/navigation';
import { IoHomeSharp } from "react-icons/io5";
import { FaCalendarAlt } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa6";
import Link from "next/link";

const SidebarStatic: React.FC = () => {
 
const currentPath = usePathname(); 

const HOME_PATH = "/";
const SCHEDULES_PATH = "/schedules";
const SESSIONS_PATH = "/sessions";

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed z-20 top-0 left-0 h-screen bg-white shadow-xl w-90 pl-6 pr-0 py-8 flex flex-col gap-8
          transform transition-transform duration-300 ease-in-out
          translate-x-0 md:translate-x-0 md:flex md:w-72
        `}
      >
        <div className="flex justify-start items-center pl-4 pr-2">
          <FaPerson className="text-[#487FB2] text-3xl" />
          <div className="flex justify-start items-center px-4 font-bold"> 
          <h1 className="text-3xl text-black">Perma</h1>
          <h1 className="text-3xl text-[#487FB2]">Fit</h1>
          </div>
        </div>
        
         <div className="flex flex-col gap-3 w-full">
                    <NavButton name="Home" icon={<IoHomeSharp />} path={HOME_PATH} currentPath={currentPath} />
                    <NavButton name="Workout Schedule" icon={<FaCalendarAlt />} path={SCHEDULES_PATH} currentPath={currentPath} />
                    <NavButton name="Workout Session" icon={<FaRegClock />} path={SESSIONS_PATH} currentPath={currentPath} />
                </div>
        </div>
      

    
    </>
  );
};

interface NavButtonProps {
    name: string;
    icon: React.ReactNode;
    path: string;
    currentPath: string; 
}

const NavButton: React.FC<NavButtonProps> = ({ name, icon, path, currentPath }) => {
    const isActive = path === currentPath;
    const activeClasses = 'bg-[#EDF4F9] text-[#487FB2] border-r-4 border-[#487FB2]';
    const inactiveClasses = 'hover:bg-gray-100 text-gray-500 border-r-4 border-transparent'; 
    const commonClasses = 'flex flex-row justify-start items-center gap-4 py-4 px-6 w-full cursor-pointer transition-colors duration-150 rounded-tl-lg rounded-bl-lg';
    return (
        <Link href={path}>
        <div>
            <div
                className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
                <span className="text-2xl">{icon}</span>
                <h2 className="text-md font-bold ">{name}</h2>
            </div>
        </div>
        </Link>
    );
};

export default SidebarStatic;