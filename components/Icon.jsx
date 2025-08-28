import { CubeIcon, Bars3Icon, XMarkIcon, HomeIcon, MusicalNoteIcon, DocumentIcon, UserCircleIcon,
         AdjustmentsHorizontalIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { ArrowDownTrayIcon, HeartIcon, AdjustmentsVerticalIcon, EllipsisVerticalIcon,
         PlayIcon, PlayPauseIcon, PauseIcon, FunnelIcon, ArrowsUpDownIcon, StopIcon
} from '@heroicons/react/24/solid';

const iconMap = {
    CubeIcon,
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    MusicalNoteIcon,
    DocumentIcon,
    UserCircleIcon,
    MagnifyingGlassIcon,
    
    // Solid
    ArrowDownTrayIcon,
    AdjustmentsHorizontalIcon,
    HeartIcon,
    AdjustmentsVerticalIcon,
    EllipsisVerticalIcon,
    PlayIcon,
    PlayPauseIcon,
    PauseIcon,
    StopIcon,
    FunnelIcon,
    ArrowsUpDownIcon
};

const Icon = ({ name, size }) => {

    // 예외 아이콘 처리 
    
    //
    const IconComponent = iconMap[name] || CubeIcon;

    const sizeClasses = {
        '4': 'w-4 h-4',
        '5': 'w-5 h-5',
        '6': 'w-6 h-6',
        '7': 'w-7 h-7',
        '8': 'w-8 h-8',
        '9': 'w-9 h-9',
        '10': 'w-10 h-10',
        '11': 'w-11 h-11',
        '12': 'w-12 h-12',
    };
    const IconSize = sizeClasses[size] || 'w-5 h-5';
    return (
        <div className={IconSize}>
            <IconComponent className={IconSize} />
        </div>
    )
}

export default Icon