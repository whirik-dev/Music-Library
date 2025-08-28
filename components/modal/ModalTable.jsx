
/**
 * 
 * @param {Array} param0 
 * @returns 
 */
const ModalTable = ({ head, data }) => {
    return (
        <div className="flex flex-col gap-2 mx-3 my-3 px-4 py-4 bg-zinc-800 rounded-lg ">
            {head && (
                <div className="text-md mb-1 font-bold">
                    {head}
                </div>
            )}
            {data.map((row)=>(
                <div className="flex flex-row text-md" key={row}>
                    {row.map((col)=>(
                        <div className="first:flex-1/3 first:capitalize last:flex-2/3 last:text-foreground/50" key={col}>
                            {col}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
export default ModalTable;