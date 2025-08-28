const PlaylistItem = ({ playlist_id }) => {
    const playlistMeta = {
        "name" : "playlist",
        "count" : 12
    }
    return (
        <div className="aspect-square flex flex-col justify-end w-full bg-gradient-to-br from-red-400 to-yellow-100 rounded-lg ">
            <div className="flex flex-row items-center">
                <div className="p-2 flex flex-col">
                    <div className="text-2xl font-bold">
                        {playlistMeta.name}
                    </div>
                    <div className="text-sm font-bold uppercase">
                        {playlistMeta.count} tracks
                    </div> 
                </div>
                <div className="">
                    
                </div>
            </div>
        </div>
    )
}
export default PlaylistItem;