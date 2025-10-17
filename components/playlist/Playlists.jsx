const PlaylistItem = ({ playlist_name, playlist_id, playlist_tailwind_face}) => {
    return (
        <div className={`w-[230px] p-4 text-right aspect-square flex text-2xl font-bold items-end justify-end 
                        rounded-md cursor-pointer hover:opacity-90 hover:rounded-2xl transition-all duration-300
                        ${playlist_tailwind_face}
                        `}>
            <div className="">
                {playlist_name}
            </div>
        </div>
    )
}

const Playlists = () => {
    return (
        <div className="p-3 flex flex-col gap-2">
            <div className="text-2xl ">
                Editor's Pick
            </div>
            <div className="flex flex-row gap-3 overflow-x-scroll">
                <PlaylistItem playlist_name="Wedding Collection" playlist_tailwind_face='bg-pink-400' />
                <PlaylistItem playlist_name="Marching" playlist_tailwind_face='bg-orange-400' />
            </div>
        </div>
    )
}

export default Playlists;