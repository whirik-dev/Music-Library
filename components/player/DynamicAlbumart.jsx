const DynamicAlbumart = ({ id, color, size="40", type="linear"}) => {
    
    const RadialCover = ({ prop, id }) => {
        return (
            <svg className="w-full h-full rounded-sm">
                <defs>
                    <radialGradient id={`bl-g-${id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={prop[0]} />
                        <stop offset="50%" stopColor={prop[1]} />
                        <stop offset="100%" stopColor={prop[2]} />
                    </radialGradient>
                </defs>
                <rect fill={`url(#bl-g-${id})`} x="0" y="0" width="100%" height="100%" />
            </svg>
        );
    }

    const LinearCover = ({ prop, id }) => {
        return (
            <svg className="w-full h-full rounded-sm">
                <defs>
                    <linearGradient id={`bl-g-${id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={prop[0]} />
                        <stop offset="100%" stopColor={prop[prop.length-1]} />
                    </linearGradient>
                </defs>
                <rect fill={`url(#bl-g-${id})`} x="0" y="0" width="100%" height="100%" />
            </svg>
        );
    }

    
    return (
        <div className="relative block">
            <div className={`aspect-square w-[${size}px]`}>
                {type === "radial" && <RadialCover prop={color} id={id} />}
                {type === "linear" && <LinearCover prop={color} id={id} />}
            </div>
        </div>
    );
}

export default DynamicAlbumart;