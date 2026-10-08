
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function MakeYourStay() {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://lunara-stay-backend.onrender.com/api/hotels")
      .then((response) => response.json())
      .then((data) => {
        setHotels(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

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

  const handleSearch = () => {
    setSearched(true);
  };

  const filteredHotels = hotels.filter((hotel) => {
    const searchLocation = location.toLowerCase().trim();

    const matchesLocation =
      !searchLocation ||
      hotel.title?.toLowerCase().includes(searchLocation) ||
      hotel.location?.toLowerCase().includes(searchLocation) ||
      hotel.description?.toLowerCase().includes(searchLocation);

    const price = Number(hotel.price);

    const matchesMinPrice =
      !minPrice || price >= Number(minPrice);

    const matchesMaxPrice =
      !maxPrice || price <= Number(maxPrice);

    return (
      matchesLocation &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  return (
    <div className="make-stay-page">

      <nav className="make-stay-navbar">

        <button
          type="button"
          className="make-stay-back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Stay
        </button>

        <div className="make-stay-logo">
          ✦ LUNARA STAY
        </div>

      </nav>

      <main>
        <section className="make-stay-header">
          <div className="make-stay-sparkle">✦</div>

          <h1>Make Your Stay</h1>

          <p>
            Find a stay that matches your plans,
            preferences and budget.
          </p>
        </section>

        <section className="stay-search-section">
          <div className="location-search">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Where do you want to stay?"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
            />
          </div>

          <div className="stay-content">
            <aside className="stay-sidebar">
              <h2>Make Your Stay</h2>

              <div className="stay-field">
                <label>Minimum Price</label>

                <input
                  type="number"
                  placeholder="₹ Minimum"
                  value={minPrice}
                  onChange={(event) =>
                    setMinPrice(event.target.value)
                  }
                />
              </div>

              <div className="stay-field">
                <label>Maximum Price</label>

                <input
                  type="number"
                  placeholder="₹ Maximum"
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(event.target.value)
                  }
                />
              </div>

              <div className="stay-field">
                <label>Check-in</label>

                <input
                  type="date"
                  value={checkIn}
                  onChange={(event) =>
                    setCheckIn(event.target.value)
                  }
                />
              </div>

              <div className="stay-field">
                <label>Check-out</label>

                <input
                  type="date"
                  min={checkIn}
                  value={checkOut}
                  onChange={(event) =>
                    setCheckOut(event.target.value)
                  }
                />
              </div>

              <div className="stay-field">
                <label>Guests</label>

                <div className="counter">
                  <button
                    type="button"
                    onClick={() =>
                      setGuests(
                        Math.max(1, guests - 1)
                      )
                    }
                  >
                    −
                  </button>

                  <span>{guests}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setGuests(guests + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="stay-field">
                <label>Rooms</label>

                <div className="counter">
                  <button
                    type="button"
                    onClick={() =>
                      setRooms(
                        Math.max(1, rooms - 1)
                      )
                    }
                  >
                    −
                  </button>

                  <span>{rooms}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setRooms(rooms + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="find-stay-btn"
                onClick={handleSearch}
              >
                Find Your Stay
              </button>
            </aside>

            <div className="stay-results">
              {!searched ? (
                <div className="stay-empty">
                  <div>✦</div>

                  <h2>Find Your Perfect Stay</h2>

                  <p>
                    Choose your location and preferences,
                    then click Find Your Stay.
                  </p>
                </div>
              ) : loading ? (
                <p className="loading-text">
                  Loading hotels...
                </p>
              ) : filteredHotels.length === 0 ? (
                <div className="stay-no-results">
                  <h2>No hotels found</h2>

                  <p>
                    Try changing your location or price
                    range.
                  </p>
                </div>
              ) : (
                <>
                  <div className="stay-results-heading">
                    <div>
                      <span>AVAILABLE STAYS</span>

                      <h2>
                        {filteredHotels.length} stays found
                      </h2>
                    </div>
                  </div>

                  <div className="stay-hotel-list">
                    {filteredHotels.map((hotel) => (
                      <div
                        className="stay-hotel-card"
                        key={hotel.id}
                      >
                        <img
                          src={getImageUrl(hotel.image)}
                          alt={hotel.title}
                        />

                        <div className="stay-hotel-info">
                          <div>
                            <h3>{hotel.title}</h3>

                            <p className="hotel-location">
                              📍{" "}
                              {hotel.location ||
                                "Location not available"}
                            </p>
                          </div>

                          <p className="stay-description">
                            {hotel.description}
                          </p>

                          <div className="stay-hotel-bottom">
                            <div className="stay-price">
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
                              className="stay-view-btn"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          © 2026 Lunara Stay. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default MakeYourStay;
