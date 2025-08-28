"use client"

import Icon from "@/components/Icon"
import { useEffect, useRef, useState } from 'react';

const FilterOptions = ({}) => {
    const ref = useRef(null);
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => setIsSticky(!entry.isIntersecting),
        { threshold: [1] }
      );

      if (ref.current) observer.observe(ref.current);

      return () => {
        if (ref.current) observer.unobserve(ref.current);
      };
    }, []);

    return (
        <div ref={ref} className={`z-20 sticky top-17 lg:top-20 px-4 lg:px-10 py-2 lg:py-3 bg-zinc-900/90 backdrop-blur-sm ${isSticky ? 'shadow-xl' : ''}`}>
            <div className="flex flex-row">
                <div className="flex flex-row items-center gap-1">
                    <Icon name="AdjustmentsVerticalIcon" size="4"/>
                    Tool Tab
                </div>
                <div className="flex flex-row gap-5 ml-auto">
                    <div className="flex flex-row items-center gap-1">
                        Filter
                        <Icon name="FunnelIcon" size="4"/>
                    </div>
                    <div className="flex flex-row items-center gap-1">
                        Sort
                        <Icon name="ArrowsUpDownIcon" size="4" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FilterOptions;