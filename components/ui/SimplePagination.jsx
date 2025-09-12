"use client";

import useMusicListStore from '@/stores/useMusicListStore';

const SimplePagination = () => {
    const {
        page,
        totalPages,
        hasNextPage,
        hasPrevPage,
        isLoading,
        nextPage,
        prevPage
    } = useMusicListStore();

    // 페이지가 없거나 1페이지뿐이면 렌더링하지 않음
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-4 py-4">
            <button
                onClick={prevPage}
                disabled={!hasPrevPage || isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                이전
            </button>
            
            <span className="text-sm text-gray-700">
                {page + 1} / {totalPages}
            </span>
            
            <button
                onClick={nextPage}
                disabled={!hasNextPage || isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                다음
            </button>
        </div>
    );
};

export default SimplePagination;