/**
 * 
 * @component 
 * @returns 
 * return (
 *  <div>{children}<div>
 * )
 */
const Sidebar = ({ children, visibility }) => {
    return (
      <div className={`z-50 lg:z-0 fixed ${visibility ? 'left-0 opacity-100' : '-left-full opacity-0'} lg:fixed lg:left-0 lg:opacity-100
                      w-full lg:w-[280px] h-full overflow-scroll lg:overflow-auto p-6 lg:py-8 lg:px-5 pt-7.5
                      flex flex-col bg-zinc-800 backdrop-blur-xl lg:backdrop-blur-none
                      scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-40`}>
        {children}
      </div>
    );
  };
  
  export default Sidebar;