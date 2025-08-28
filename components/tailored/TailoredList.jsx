
import TailoredListItem from "@/components/tailored/TailoredListItem";
import worksList from "./worksList";

const TailoredList = () => {

    return (
        <div className="flex flex-col gap-2 mb-2">
            {/* 원래 여기 자식으로 놓으면 피곤한데, 일단 넣어본다 */}
            {worksList.map((item)=>(
                <div key={item.works_id ? item.works_id : item.desc}>
                {item.name === 'group' ? (
                    <div className="text-xl pl-1 ">
                        {item.desc}
                    </div>
                ) : (
                    <TailoredListItem 
                        id={item.works_id} 
                        icon={item.icon}
                        head={item.name} 
                        desc={item.desc}
                    />                
                )}
                </div>
            ))}
            {/* <TailoredListItem head="item" desc="description" onClick={()=>{}}/> */}
        </div>
    )
}
export default TailoredList;