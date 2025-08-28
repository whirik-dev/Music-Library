"use client"
import { useEffect } from "react";
import useMusicListStore from "@/stores/useMusicListStore";
import RelatedSuggestItem from "@/components/search/RelatedSuggestItem";

import Terms from "./searchTermTest";

const RelatedSuggest = ({ onClick }) => {
    const { searchTab, query, relatedKeywords, setRelatedKeywords } = useMusicListStore();

    const test = Terms;

    useEffect(() => {
        const lastQuery = query.split(" ").at(-1);
    
        if (!lastQuery) {
            setRelatedKeywords([]);
            return;
        }
    
        const result = test.filter(item => 
            item.slice(0, lastQuery.length).toLowerCase() === lastQuery.toLowerCase()
        );
    
        setRelatedKeywords(result);
    }, [query]);
    
    return (
        <div className={`${searchTab ? "hidden lg:flex" : "hidden"} mt-2 flex-row gap-2`}>
            {relatedKeywords.slice(0, 9).map((item, idx) => (
                <RelatedSuggestItem
                    key={idx}
                    order={idx}
                    name={item}
                    onClick={onClick}
                />
            ))}
        </div>
    );
};

export default RelatedSuggest;
