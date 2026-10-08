
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import HotelCard from "../components/HotelCard";
import Pagination from "../components/Pagination";

function ExploreStays() {
    const [hotels, setHotels] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const hotelsPerPage = 5;

    useEffect(() => {
        fetch("https://lunara-stay-backend.onrender.com/api/hotels")
            .then((response) => response.json())
            .then((data) => {
                setHotels(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(
                    "Error fetching hotels:",
                    error
                );
                setLoading(false);
            });
    }, []);

    const filteredHotels = hotels.filter((hotel) => {
        const searchText =
            search.toLowerCase().trim();

        return (
            hotel.title
                ?.toLowerCase()
                .includes(searchText) ||
            hotel.location
                ?.toLowerCase()
                .includes(searchText)
        );
    });

    const totalPages = Math.ceil(
        filteredHotels.length / hotelsPerPage
    );

    const startIndex =
        (currentPage - 1) * hotelsPerPage;

    const currentHotels =
        filteredHotels.slice(
            startIndex,
            startIndex + hotelsPerPage
        );

    const handleSearch = (event) => {
        setSearch(event.target.value);
        setCurrentPage(1);
    };

    const getImageUrl = (image) => {
        if (!image) {
            return "https://images.unsplash.com/photo-1566073771259-6a8506099945";
        }

        if (image.startsWith("http")) {
            return image;
        }

        if (image.startsWith("/uploads/")) {
            return `http://localhost:5000${image}`;
        }

        return `http://localhost:5000/uploads/${image}`;
    };

    return (
        <>
            <Helmet>
                <title>Explore Stays | Lunara Stay</title>
                <meta
                    name="description"
                    content="Explore beautiful stays with Lunara Stay."
                />
            </Helmet>

            <div className="explore-page">

                <header className="navbar">

                    <Link
                        to="/"
                        className="logo"
                    >
                        ✦ LUNARA STAY
                    </Link>

                    <nav>

                        <Link to="/">
                            Home
                        </Link>

                        <Link to="/about">
                            About Us
                        </Link>

                        <Link
                            to="/explore-stays"
                            className="active-nav"
                        >
                            Explore Stays
                        </Link>

                        <Link to="/add-hotel">
                            Add Hotel
                        </Link>

                    </nav>

                </header>


                <main className="explore-container">

                    <section className="add-hotel-header explore-page-header">

                        <span>
                            ✦
                        </span>

                        <h1>
                            Explore Stays
                        </h1>

                        <p>
                            Find a stay that feels right for your journey.
                        </p>

                    </section>


                    <div className="explore-search-box">

                        <input
                            type="text"
                            placeholder="Search by hotel name or location..."
                            value={search}
                            onChange={handleSearch}
                        />

                        <button type="button">
                            Search
                        </button>

                    </div>


                    <section className="explore-results">

                        <div className="explore-results-heading">

                            <div>

                                <p>
                                    AVAILABLE STAYS
                                </p>

                                <h2>
                                    {search
                                        ? `Results for "${search}"`
                                        : "All Stays"}
                                </h2>

                            </div>

                            <span>
                                {filteredHotels.length} stays
                            </span>

                        </div>


                        {loading ? (

                            <div className="explore-message">
                                Loading stays...
                            </div>

                        ) : filteredHotels.length === 0 ? (

                            <div className="explore-message">
                                No stays found.
                            </div>

                        ) : (

                            <>

                                <div className="explore-hotel-list">

                                    {currentHotels.map(
                                        (hotel) => (
                                            <HotelCard
                                                key={hotel.id}
                                                hotel={hotel}
                                                getImageUrl={
                                                    getImageUrl
                                                }
                                            />
                                        )
                                    )}

                                </div>


                                <Pagination
                                    currentPage={
                                        currentPage
                                    }
                                    totalPages={
                                        totalPages
                                    }
                                    setCurrentPage={
                                        setCurrentPage
                                    }
                                />

                            </>

                        )}

                    </section>

                </main>

            </div>
        </>
    );
}

export default ExploreStays;

