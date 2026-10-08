import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotels } from "../store/hotelSlice";
import homeImage from "../assets/home.jpeg";

function Home() {
  const dispatch = useDispatch();

  const { hotels, loading } = useSelector(
    (state) => state.hotels
  );

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hotelRatings, setHotelRatings] = useState({});

  const hotelsPerPage = 5;

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!hotels || hotels.length === 0) {
        return;
      }

      const ratings = {};

      await Promise.all(
        hotels.map(async (hotel) => {
          try {
            const response = await fetch(
              `http://localhost:5000/api/hotels/${hotel.id}/reviews`
            );

            if (!response.ok) {
              ratings[hotel.id] = Number(
                hotel.rating || 0
              );
              return;
            }

            const reviews = await response.json();

            if (
              Array.isArray(reviews) &&
              reviews.length > 0
            ) {
              const totalRating = reviews.reduce(
                (sum, review) =>
                  sum + Number(review.rating || 0),
                0
              );

              ratings[hotel.id] = (
                totalRating / reviews.length
              ).toFixed(1);
            } else {
              ratings[hotel.id] = Number(
                hotel.rating || 0
              ).toFixed(1);
            }
          } catch (error) {
            ratings[hotel.id] = Number(
              hotel.rating || 0
            ).toFixed(1);
          }
        })
      );

      setHotelRatings(ratings);
    };

    fetchRatings();
  }, [hotels]);

  const filteredHotels = hotels.filter((hotel) => {
    const searchText = search.toLowerCase().trim();

    return (
      hotel.title?.toLowerCase().includes(searchText) ||
      hotel.description?.toLowerCase().includes(searchText) ||
      hotel.location?.toLowerCase().includes(searchText)
    );
  });

  const totalPages = Math.ceil(
    filteredHotels.length / hotelsPerPage
  );

  const startIndex =
    (currentPage - 1) * hotelsPerPage;

  const currentHotels = filteredHotels.slice(
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
        <title>Lunara Stay | Discover Stays Worth Remembering</title>
        <meta
          name="description"
          content="Discover beautiful hotels and memorable stays with Lunara Stay."
        />
      </Helmet>

      <div className="home-page">

        <header className="navbar">

          <Link to="/" className="logo">
            ✦ LUNARA STAY
          </Link>

          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/explore-stays">Explore Stays</Link>
            <Link to="/add-hotel">Add Hotel</Link>
          </nav>

        </header>

        <section
          className="hero"
          style={{
            backgroundImage: `linear-gradient(
              rgba(20, 35, 29, 0.45),
              rgba(20, 35, 29, 0.45)
            ), url(${homeImage})`,
          }}
        >

          <div className="hero-content">

            <div className="hero-sparkle">
              ✦
            </div>

            <h1>
              Discover Stays Worth Remembering
            </h1>

            <p>
              Find beautiful stays and unforgettable
              experiences with Lunara Stay.
            </p>

          </div>

        </section>

        <section className="search-section">

          <div className="search-container">

            <div className="search-box">

              <span className="search-icon">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search hotels or locations..."
                value={search}
                onChange={handleSearch}
              />

              <button type="button">
                Search
              </button>

            </div>

            <Link
              to="/make-your-stay"
              className="make-stay-btn"
            >
              Make Your Stay
            </Link>

          </div>

        </section>

        <section className="featured-section">

          <div className="section-heading">

            <h2>
              {search ? "Search Results" : "Featured Stays"}
            </h2>

            <p>
              {search
                ? `Hotels matching "${search}"`
                : "Discover comfortable stays for your next journey"}
            </p>

          </div>

          {loading ? (

            <p className="loading-text">
              Loading hotels...
            </p>

          ) : currentHotels.length === 0 ? (

            <div className="no-hotels">

              <h3>
                No hotels found
              </h3>

              <p>
                Try searching with another hotel name
                or location.
              </p>

            </div>

          ) : (

            <div className="hotel-list">

              {currentHotels.map((hotel) => (

                <div
                  className="hotel-card"
                  key={hotel.id}
                >

                  <img
                    src={getImageUrl(hotel.image)}
                    alt={hotel.title}
                    className="hotel-image"
                  />

                  <div className="hotel-info">

                    <div className="hotel-top">

                      <div>

                        <h3>
                          {hotel.title}
                        </h3>

                        <p className="hotel-location">
                          📍{" "}
                          {hotel.location ||
                            "Location not available"}
                        </p>

                      </div>

                      <div className="hotel-rating">
                        ★{" "}
                        {hotelRatings[hotel.id] ??
                          Number(
                            hotel.rating || 0
                          ).toFixed(1)}
                      </div>

                    </div>

                    <p className="hotel-description">
                      {hotel.description}
                    </p>

                    <div className="hotel-details">

                      <span>
                        ★ Comfortable Stay
                      </span>

                      <span>
                        ✓ Quality Service
                      </span>

                    </div>

                    <div className="hotel-bottom">

                      <div className="price">

                        ₹
                        {Number(
                          hotel.price
                        ).toLocaleString("en-IN")}

                        <small>
                          {" "}
                          / night
                        </small>

                      </div>

                      <Link
                        to={`/hotel/${hotel.id}`}
                        className="details-btn"
                      >
                        View Details
                      </Link>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

          {totalPages > 1 && (

            <div className="pagination">

              <button
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

          )}

        </section>

        <footer className="footer">

          <p>
            © 2026 Lunara Stay. All rights reserved.
          </p>

        </footer>

      </div>
    </>
  );
}

export default Home;