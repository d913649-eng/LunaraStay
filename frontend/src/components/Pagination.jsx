function Pagination({
    currentPage,
    totalPages,
    setCurrentPage
}) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="explore-pagination">

            <button
                type="button"
                onClick={() =>
                    setCurrentPage(currentPage - 1)
                }
                disabled={currentPage === 1}
            >
                Previous
            </button>


            {Array.from(
                { length: totalPages },
                (_, index) => index + 1
            ).map((page) => (

                <button
                    type="button"
                    key={page}
                    onClick={() =>
                        setCurrentPage(page)
                    }
                    className={
                        currentPage === page
                            ? "active-page"
                            : ""
                    }
                >
                    {page}
                </button>

            ))}


            <button
                type="button"
                onClick={() =>
                    setCurrentPage(currentPage + 1)
                }
                disabled={
                    currentPage === totalPages
                }
            >
                Next
            </button>

        </div>
    );
}

export default Pagination;