import { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useMusicListStore from "@/stores/useMusicListStore";
import { IconSearch, IconCornerDownLeft, IconX } from "@tabler/icons-react";

import ShortcutHint from "@/components/search/ShortcutHint";
import SearchKeyPressEvent from "@/components/command/searchKeyPressEvent";
import RelatedSuggest from "@/components/search/RelatedSuggest";

const Search = () => {
    const t = useTranslations('search');

    const [familyClicked, setFamilyClicked] = useState(false);
    const { query, setQuery, searchTab, toggleSearchTab, queryMusicList, fetchMusicList, resetList, listMode, error, relatedKeywords, relSelected, setRelSelected } = useMusicListStore();
    const inputRef = useRef(null);
    const router = useRouter();

    const toggleSearchTabHelper = () => {
        // const searchTabElem = document.querySelector('')
        if (searchTab) {
            if (familyClicked) {
                return;
            }
            toggleSearchTab(false)
        }
        else {
            toggleSearchTab(true)
        }
    }

    const handleRelatedClick = (v) => {
        if (v === '') {
            handleInit();
            return;
        }
        const trimmed = query.trim();
        const splitQuery = trimmed === "" ? [] : trimmed.split(" ");

        if (splitQuery.length > 0) {
            splitQuery.pop();
        }

        const newQuery = [...splitQuery, v.toLowerCase()].join(" ");
        setQuery(newQuery);

        inputRef.current?.focus();
    };

    const handleQuery = () => {
        const trimmed = query.trim();
        if (trimmed === '') {
            console.info('Query is empty');
            return;
        }

        // Encode the query to handle special characters correctly in the URL
        const encodedQuery = encodeURIComponent(trimmed);

        // Navigate to the search page with the query parameter
        router.push(`/search?q=${encodedQuery}`);

        inputRef.current?.blur();
    };

    const handleInit = () => {
        setQuery('');
        setRelSelected(null);
        router.push(`/search`);
    }

    const relatedKeyPressEvent = (e) => {
        if (e.key === 'Enter') {
            if (relSelected != null) {
                handleRelatedClick(relatedKeywords[relSelected]);
            }
            else {
                handleQuery();
            }
            setRelSelected(null);
        }

        if (e.key === 'ArrowDown') {
            if (relSelected === null && relatedKeywords.length > 0) {
                e.preventDefault();
                setRelSelected(0);
            }
            else if (relSelected != null) {
                e.preventDefault();
                setRelSelected(relatedKeywords.slice(0, 9).length - 1);
            }
        }

        if (e.key === 'ArrowUp') {
            if (relSelected != null) {
                e.preventDefault();
                setRelSelected(null);
            }

        }

        if (e.key === 'ArrowLeft') {
            if (relSelected != null) {
                e.preventDefault();
                if (relSelected > 0) {
                    setRelSelected(relSelected - 1);
                }
            }
        }

        if (e.key === 'ArrowRight') {
            if (relSelected != null) {
                e.preventDefault();
                if (relSelected < relatedKeywords.slice(0, 9).length - 1) {
                    setRelSelected(relSelected + 1);
                }
            }
        }
    }


    return (
        <div className="lg:relative ml-auto lg:ml-0" onMouseDown={() => setFamilyClicked(true)} onMouseUp={() => setFamilyClicked(false)}>
            {/* 모바일 검색 아이콘 */}
            {/** TODO : 모바일용 검색 UI는 따로 만들어야함 (구조상의 한계)*/}
            <div className={`lg:hidden`} onClick={() => toggleSearchTabHelper()}>
                <IconSearch size="24" />
            </div>

            {/* 검색 입력창 */}
            <div className="flex flex-row items-center gap-3 text-foreground/50">
                <div
                    className={`hidden lg:block z-21 border-1 rounded-4xl px-4 py-2 border-foreground/30 
                    ${searchTab ? "fixed top-0 left-0 w-full mt-5 lg:mt-0 lg:relative lg:w-2xl border-foreground/50" : "hidden lg:block w-sm"} 
                    transition-all duration-300`}
                >
                    <div className="flex flex-row items-center gap-5 text-foreground">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={t('placeholder')}
                            className="focus:outline-0 w-full"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value), e.target.value.length === 0 && setRelSelected(null) }}
                            onFocus={() => toggleSearchTab(true)}
                            onBlur={() => setTimeout(() => toggleSearchTabHelper(), 100)}
                            onKeyDown={(e) => relatedKeyPressEvent(e)}
                        />
                        <div className="cursor-pointer flex flex-row items-center gap-1 color-foreground/10">
                            {searchTab ? (
                                <div className="border-1 border-zinc-500 rounded-sm p-0.5 size-6 flex items-center items justify-center hover:opacity-70" >
                                    <IconCornerDownLeft color="#777" size="16" onClick={() => handleQuery()} />
                                </div>
                            ) : (
                                <>
                                    {query ? (
                                        <div className="p-0.5 size-6 flex items-center items justify-center" >
                                            <IconX color="#777" onClick={() => handleInit()} />
                                        </div>
                                    ) : (
                                        <ShortcutHint />
                                    )}
                                </>
                            )}
                            {/* <IconSearch size="24" /> */}
                        </div>
                    </div>
                </div>
                <div className="">
                    {listMode === 'empty' && error}
                </div>
            </div>

            {/* 연관 검색어 리스트 */}
            <RelatedSuggest onClick={handleRelatedClick} />

            <SearchKeyPressEvent ref={inputRef} />
        </div>
    );
};

export default Search;
