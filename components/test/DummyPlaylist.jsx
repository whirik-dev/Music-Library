import PlaylistItem from "@/components/player/PlaylistItem";

const DummyPlaylist = ({}) => {
    return (
        <>
            <PlaylistItem option={{
            pid : "text1",
            name : "Dream Waves",
            count : 75,
            albumartMeta : {
                color : ["#7302e7", "#aaef29", "#fd8a0c"],
                type : "linear"
            }
            }} />

            <PlaylistItem option={{
            pid : "text2",
            name : "Retro Hits",
            count : 49,
            albumartMeta : {
                color : ["#c92d65", "#178288", "#a6541a"],
                type : "linear"
            }
            }} />

            <PlaylistItem option={{
            pid : "text3",
            name : "Morning Coffee",
            count : 101,
            albumartMeta : {
                color : ["#88f680", "#3c38a7", "#d2240d"],
                type : "linear"
            }
            }} />

            {/* <PlaylistItem option={{
            pid : "text4",
            name : "Energy Boost",
            count : 168,
            albumartMeta : {
                color : ["#0d5408", "#e074c2", "#ae8fe1"],
                type : "linear"
            }
            }} /> */}

            <PlaylistItem option={{
            pid : "text5",
            name : "Summer Nights",
            count : 177,
            albumartMeta : {
                color : ["#f4a0d3", "#27b6d8", "#a83380"],
                type : "radial"
            }
            }} />

            <PlaylistItem option={{
            pid : "text6",
            name : "Retro Hits",
            count : 179,
            albumartMeta : {
                color : ["#f9f4a9", "#64895a", "#e1c811"],
                type : "linear"
            }
            }} />
{/* 
            <PlaylistItem option={{
            pid : "text7",
            name : "Dream Waves",
            count : 195,
            albumartMeta : {
                color : ["#4570a1", "#a6ef43", "#75b32c"],
                type : "radial"
            }
            }} />

            <PlaylistItem option={{
            pid : "text8",
            name : "Retro Hits",
            count : 78,
            albumartMeta : {
                color : ["#e90f9a", "#06eff2", "#fc4a69"],
                type : "radial"
            }
            }} />

            <PlaylistItem option={{
            pid : "text9",
            name : "Sunset Vibes",
            count : 69,
            albumartMeta : {
                color : ["#8f4669", "#a90877", "#6e2c42"],
                type : "linear"
            }
            }} />

            <PlaylistItem option={{
            pid : "text10",
            name : "Peaceful Moments",
            count : 160,
            albumartMeta : {
                color : ["#c85af5", "#67823d", "#272d6b"],
                type : "linear"
            }
            }} /> */}
        </>
    )
}

export default DummyPlaylist;