const ProgressBar = ({ now, max, plan}) => {
    let progressWidth;

    if(plan && plan != "free"){
        now = 10; max = 10;
        progressWidth=0;
    }
    else
    {
        progressWidth=(1-(now/max))*100;
    }
    
    return (
        <div className={`relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden
                        ${plan === 'master' ? "shadow-md shadow-orange-400/20" :
                          plan === 'pro' ? "shadow-md shadow-purple-500/20" : 
                          plan === 'basic' ? "shadow-md shadow-green-400/20" : 
                          "bg-background"  
                        }`}
        >
            <div className={`absolute top-0 left-0 h-full w-full transition-size duration-300
                            ${plan === 'master' ? "bg-orange-400" :
                              plan === 'pro' ? "bg-purple-500" : 
                              plan === 'basic' ? "bg-green-400" : 
                              "bg-foreground"  
                            }`}
                style={{ left: `-${progressWidth}%` }}
            >
            </div>
        </div>
    );
}
export default ProgressBar