import Logo from "@/components/Logo";

const ServerDown = () => {
    return(
        <div className="w-screen h-screen flex flex-col items-center justify-center">
            <Logo subBrand="" isActive={false} className="hover:!opacity-100 !cursor-default"/>
            <br/>
            <div className="text-center w-2xl text-sm">
                <h3 className="text-3xl mb-5">Server maintenance in progress. </h3>
                <p>We are currently performing scheduled maintenance to improve the stability, performance, and overall experience of our service. During this time, the server will be temporarily unavailable.</p>
                <p>We apologize for any inconvenience this may cause and appreciate your patience and understanding. Our team is working hard to complete the maintenance as quickly and smoothly as possible.</p>
                <p>We’ll notify you once the service is back online.</p>
                <p className="font-bold mt-5">Thank you for your continued support!</p>
            </div>
            
        </div>
    )
}
export default ServerDown;