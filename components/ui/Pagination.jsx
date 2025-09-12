"use client";

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import useMusicListStore from '@/stores/useMusicListStore';

const Pagination = () => {
    const {
        page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        isLoading,
        goToPage,
        nextPage,
        prevPage,
        firstPage,
        lastPage
    } = useMusicListStore();

    // 페이지가 없거나 1페이지뿐이면 렌더링하지 않음
    if (totalPages <= 1) return null;

    // 현재 페이지 주변의 페이지 번호들을 계산
    const getPageNumbers = () => {
        const delta = 2; // 현재 페이지 앞뒤로 보여줄 페이지 수
        const range = [];
        const rangeWithDots = [];

        // 시작과 끝 계산
        const start = Math.max(0, page - delta);
        const end = Math.min(totalPages - 1, page + delta);

        // 첫 페이지
        if (start > 0) {
            rangeWithDots.push(0);
            if (start > 1) {
                rangeWithDots.push('...');
            }
        }

        // 중간 페이지들
        for (let i = start; i <= end; i++) {
            rangeWithDots.push(i);
        }

        // 마지막 페이지
        if (end < totalPages - 1) {
            if (end < totalPages - 2) {
                rangeWithDots.push('...');
            }
            rangeWithDots.push(totalPages - 1);
        }

        return rangeWithDots;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            {/* 모바일 버전 */}
            <div className="flex justify-between flex-1 sm:hidden">
                <button
                    onClick={prevPage}
                    disabled={!hasPrevPage || isLoading}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    이전
                </button>
                <span className="text-sm text-gray-700">
                    {page + 1} / {totalPages}
                </span>
                <button
                    onClick={nextPage}
                    disabled={!hasNextPage || isLoading}
                    className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    다음
                </button>
            </div>

            {/* 데스크톱 버전 */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        총 <span className="font-medium">{totalCount}</span>개 중{' '}
                        <span className="font-medium">{page * 20 + 1}</span>-
                        <span className="font-medium">
                            {Math.min((page + 1) * 20, totalCount)}
                        </span>개 표시
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        {/* 이전 버튼 */}
                        <button
                            onClick={prevPage}
                            disabled={!hasPrevPage || isLoading}
                            className="relative inline-flex items-center px-2 py-2 text-gray-400 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>

                        {/* 페이지 번호들 */}
                        {pageNumbers.map((pageNum, index) => {
                            if (pageNum === '...') {
                                return (
                                    <span
                                        key={`dots-${index}`}
                                        className="relative inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            const isCurrentPage = pageNum === page;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => goToPage(pageNum)}
                                    disabled={isLoading}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                                        isCurrentPage
                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {pageNum + 1}
                                </button>
                            );
                        })}

                        {/* 다음 버튼 */}
                        <button
                            onClick={nextPage}
                            disabled={!hasNextPage || isLoading}
                            className="relative inline-flex items-center px-2 py-2 text-gray-400 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;