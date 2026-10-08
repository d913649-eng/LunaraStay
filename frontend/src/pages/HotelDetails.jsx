import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const fallbackImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85";

const defaultAmenities = [
  "Free Wi-Fi",
  "Swimming Pool",
  "Parking",
  "Restaurant",
];

const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);

  const [availabilityMessage, setAvailabilityMessage] =
    useState("");

  const [availabilityError, setAvailabilityError] =
    useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/hotels/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setHotel(data);
        setSelectedImage(0);
      })
      .catch((error) => {
        console.error("Hotel fetch error:", error);
      });

    fetch(`http://localhost:5000/api/hotels/${id}/reviews`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch(() => {
        setReviews([]);
      });
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this hotel?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/hotels/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete hotel");
        return;
      }

      setDeleteSuccess(true);

      setTimeout(() => {
        navigate("/explore-stays");
      }, 1500);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting the hotel.");
    }
  };

  const handleAvailability = () => {
    setAvailabilityMessage("");
    setAvailabilityError("");

    if (!checkIn || !checkOut) {
      setAvailabilityError(
        "Please select your check-in and check-out dates."
      );
      return;
    }

    if (checkOut <= checkIn) {
      setAvailabilityError(
        "Check-out date must be after check-in date."
      );
      return;
    }

    if (guests < 1) {
      setAvailabilityError(
        "At least one guest is required."
      );
      return;
    }

    if (rooms < 1) {
      setAvailabilityError(
        "At least one room is required."
      );
      return;
    }

    const totalRooms = Number(
      hotel?.total_rooms || 10
    );

    if (rooms > totalRooms) {
      setAvailabilityError(
        `Only ${totalRooms} rooms are available in this hotel.`
      );
      return;
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    const difference =
      (endDate - startDate) /
      (1000 * 60 * 60 * 24);

    const nights = Math.max(1, difference);

    const totalPrice =
      Number(hotel.price || 0) *
      rooms *
      nights;

    setAvailabilityMessage(
      `${rooms} room${rooms > 1 ? "s" : ""} available • ${
        guests
      } guest${guests > 1 ? "s" : ""} • ${
        nights
      } night${nights > 1 ? "s" : ""} • Total ₹${totalPrice.toLocaleString(
        "en-IN"
      )}`
    );
  };

  if (!hotel) {
    return (
      <div className="hotel-loading-screen">
        <div className="loading-circle"></div>
        <p>Loading your stay...</p>
      </div>
    );
  }

  const hotelImages = [];

  if (Array.isArray(hotel.images)) {
    hotel.images.forEach((image) => {
      if (image) {
        hotelImages.push(image);
      }
    });
  } else if (typeof hotel.images === "string") {
    try {
      const parsedImages = JSON.parse(hotel.images);

      if (Array.isArray(parsedImages)) {
        parsedImages.forEach((image) => {
          if (image) {
            hotelImages.push(image);
          }
        });
      } else if (parsedImages) {
        hotelImages.push(parsedImages);
      }
    } catch {
      hotel.images
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean)
        .forEach((image) => hotelImages.push(image));
    }
  }

  if (
    hotel.image &&
    !hotelImages.includes(hotel.image)
  ) {
    hotelImages.push(hotel.image);
  }

  if (hotelImages.length === 0) {
    hotelImages.push(fallbackImage);
  }

  const getImageUrl = (image) => {
    if (!image) {
      return fallbackImage;
    }

    if (image.startsWith("http")) {
      return image;
    }

    if (image.startsWith("/uploads/")) {
      return `http://localhost:5000${image}`;
    }

    if (image.startsWith("uploads/")) {
      return `http://localhost:5000/${image}`;
    }

    return `http://localhost:5000/uploads/${image}`;
  };

  const imageUrl = getImageUrl(
    hotelImages[selectedImage] || hotelImages[0]
  );

  const nextImage =
    hotelImages.length > 1
      ? getImageUrl(
          hotelImages[
            (selectedImage + 1) % hotelImages.length
          ]
        )
      : null;

  const handleNextImage = () => {
    if (hotelImages.length <= 1) {
      return;
    }

    setSelectedImage(
      (previous) =>
        (previous + 1) % hotelImages.length
    );
  };

  const latitude = Number(hotel.latitude);
  const longitude = Number(hotel.longitude);

  const hasMap =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const amenities =
    Array.isArray(hotel.amenities) &&
    hotel.amenities.length > 0
      ? hotel.amenities
      : defaultAmenities;

  return (
    <>
      <Helmet>
        <title>
          {hotel
            ? `${hotel.title} | Lunara Stay`
            : "Hotel Details | Lunara Stay"}
        </title>

        <meta
          name="description"
          content={
            hotel
              ? `View details, amenities and information about ${hotel.title}.`
              : "View hotel details with Lunara Stay."
          }
        />
      </Helmet>

      <div className="hotel-view-page">

        {deleteSuccess && (
          <div className="delete-success-overlay">
            <div className="delete-success-popup">
              <div className="delete-success-icon">
                ✓
              </div>

              <h3>Hotel Deleted</h3>

              <p>
                The hotel has been successfully removed.
              </p>
            </div>
          </div>
        )}

        <div className="hotel-view-topbar">

          <Link
            to="/"
            className="back-button"
          >
            <span>←</span>
            Back to stays
          </Link>

          <div className="topbar-brand">
            <span>✦</span>
            LUNARA STAY
          </div>

        </div>

        <main className="hotel-view-container">

          <section className="hotel-photo-section">

            {nextImage && (
              <div className="hotel-photo-back">
                <img
                  src={nextImage}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.src =
                      fallbackImage;
                  }}
                />
              </div>
            )}

            <div
              className="hotel-photo-click-area"
              onClick={handleNextImage}
              role={hotelImages.length > 1 ? "button" : undefined}
              tabIndex={hotelImages.length > 1 ? 0 : undefined}
              onKeyDown={(event) => {
                if (
                  hotelImages.length > 1 &&
                  (event.key === "Enter" ||
                    event.key === " ")
                ) {
                  event.preventDefault();
                  handleNextImage();
                }
              }}
            >

              <img
                src={imageUrl}
                alt={hotel.title}
                className="hotel-main-photo"
                onError={(event) => {
                  if (
                    event.currentTarget.src !==
                    fallbackImage
                  ) {
                    event.currentTarget.src =
                      fallbackImage;
                  }
                }}
              />

              <div className="photo-overlay"></div>

              <div className="photo-caption">

                <span className="photo-tag">
                  LUNARA STAY
                </span>

                <h1>{hotel.title}</h1>

                <p>
                  {hotel.location ||
                    "A beautiful destination to stay"}
                </p>

              </div>

              {hotelImages.length > 1 && (
                <div className="photo-next-control">

                  <span>
                    Next photo
                  </span>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleNextImage();
                    }}
                    aria-label="View next hotel image"
                  >
                    →
                  </button>

                </div>
              )}

            </div>

          </section>

          <section className="hotel-intro-section">

            <div className="hotel-intro-left">

              <div className="rating-line">

                <span className="rating-badge">
                  ★ 4.5
                </span>

                <span className="rating-label">
                  Excellent stay
                </span>

              </div>

              <h2>{hotel.title}</h2>

              <div className="location-line">
                <span>⌖</span>

                <span>
                  {hotel.location ||
                    "Beautiful Destination"}
                </span>
              </div>

              <p className="hotel-description">
                {hotel.description}
              </p>

              {hotel.address && (
                <div className="address-box">

                  <span className="address-icon">
                    ◉
                  </span>

                  <div>
                    <small>ADDRESS</small>

                    <p>{hotel.address}</p>
                  </div>

                </div>
              )}

            </div>

            <div className="hotel-intro-right">

              <div className="price-box">

                <span className="price-label">
                  STARTING FROM
                </span>

                <div className="price-value">
                  ₹
                  {Number(
                    hotel.price
                  ).toLocaleString("en-IN")}

                  <span>
                    / night
                  </span>
                </div>

              </div>

              <div className="admin-actions">

                <Link
                  to={`/edit-hotel/${hotel.id}`}
                  className="edit-button"
                >
                  Edit Hotel
                </Link>

                <button
                  type="button"
                  className="delete-button"
                  onClick={handleDelete}
                >
                  Delete
                </button>

              </div>

            </div>

          </section>

          <section className="details-grid">

            <div className="details-card">

              <div className="card-heading">

                <div className="heading-icon">
                  ♢
                </div>

                <div>
                  <span>
                    ABOUT YOUR STAY
                  </span>

                  <h3>
                    Stay Information
                  </h3>
                </div>

              </div>

              <div className="information-list">

                <div className="information-row">

                  <div className="info-symbol">
                    🏨
                  </div>

                  <div>
                    <span>
                      Hotel type
                    </span>

                    <strong>
                      {hotel.hotel_type ||
                        "Premium Stay"}
                    </strong>
                  </div>

                </div>

                <div className="information-row">

                  <div className="info-symbol">
                    🛏
                  </div>

                  <div>
                    <span>
                      Total rooms
                    </span>

                    <strong>
                      {hotel.total_rooms || 10} rooms
                    </strong>
                  </div>

                </div>

                <div className="information-row">

                  <div className="info-symbol">
                    📍
                  </div>

                  <div>
                    <span>
                      Location
                    </span>

                    <strong>
                      {hotel.location ||
                        "Not specified"}
                    </strong>
                  </div>

                </div>

                <div className="information-row">

                  <div className="info-symbol">
                    ₹
                  </div>

                  <div>
                    <span>
                      Room price
                    </span>

                    <strong>
                      ₹
                      {Number(
                        hotel.price
                      ).toLocaleString("en-IN")}{" "}
                      / night
                    </strong>
                  </div>

                </div>

              </div>

            </div>

            <div className="details-card">

              <div className="card-heading">

                <div className="heading-icon">
                  ✧
                </div>

                <div>
                  <span>
                    COMFORT & CONVENIENCE
                  </span>

                  <h3>
                    Amenities
                  </h3>
                </div>

              </div>

              <div className="amenities-grid">

                {amenities.map(
                  (amenity, index) => (
                    <div
                      className="amenity-box"
                      key={index}
                    >
                      <span className="amenity-check">
                        ✓
                      </span>

                      <span>
                        {amenity}
                      </span>
                    </div>
                  )
                )}

              </div>

            </div>

          </section>

          <section className="location-section">

            <div className="section-heading">

              <div>

                <span>
                  EXPLORE THE LOCATION
                </span>

                <h2>
                  Where You'll Stay
                </h2>

              </div>

              <p>
                Find your stay and explore the
                surrounding location.
              </p>

            </div>

            {hasMap ? (
              <div className="map-container">

                <MapContainer
                  center={[
                    latitude,
                    longitude,
                  ]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{
                    height: "430px",
                    width: "100%",
                  }}
                >

                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker
                    position={[
                      latitude,
                      longitude,
                    ]}
                    icon={markerIcon}
                  >

                    <Popup>
                      <strong>
                        {hotel.title}
                      </strong>

                      <br />

                      {hotel.location ||
                        "Hotel location"}
                    </Popup>

                  </Marker>

                </MapContainer>

              </div>
            ) : (
              <div className="no-map">

                <span>⌖</span>

                <p>
                  Location map is not available
                  for this hotel.
                </p>

              </div>
            )}

          </section>

          <section className="availability-section">

            <div className="availability-wrapper">

              <div className="availability-title">

                <span>
                  PLAN YOUR STAY
                </span>

                <h2>
                  Make your stay memorable
                </h2>

                <p>
                  Choose your dates and preferences
                  to check room availability.
                </p>

              </div>

              <div className="availability-form">

                <div className="date-field">

                  <label>
                    CHECK-IN
                  </label>

                  <input
                    type="date"
                    value={checkIn}
                    onChange={(event) =>
                      setCheckIn(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="date-field">

                  <label>
                    CHECK-OUT
                  </label>

                  <input
                    type="date"
                    value={checkOut}
                    onChange={(event) =>
                      setCheckOut(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="counter-field">

                  <label>
                    GUESTS
                  </label>

                  <div className="counter-control">

                    <button
                      type="button"
                      onClick={() =>
                        setGuests(
                          (value) =>
                            Math.max(
                              1,
                              value - 1
                            )
                        )
                      }
                    >
                      −
                    </button>

                    <strong>
                      {guests}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        setGuests(
                          (value) =>
                            value + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="counter-field">

                  <label>
                    ROOMS
                  </label>

                  <div className="counter-control">

                    <button
                      type="button"
                      onClick={() =>
                        setRooms(
                          (value) =>
                            Math.max(
                              1,
                              value - 1
                            )
                        )
                      }
                    >
                      −
                    </button>

                    <strong>
                      {rooms}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        setRooms(
                          (value) =>
                            value + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

              </div>

              <button
                type="button"
                className="availability-button"
                onClick={handleAvailability}
              >
                Check Availability
                <span>→</span>
              </button>

              {availabilityError && (
                <div className="availability-error">
                  {availabilityError}
                </div>
              )}

              {availabilityMessage && (
                <div className="availability-success">
                  <span>✓</span>

                  {availabilityMessage}
                </div>
              )}

            </div>

          </section>

          <section className="reviews-section">

            <div className="reviews-heading">

              <div>

                <span>
                  GUEST EXPERIENCES
                </span>

                <h2>
                  What guests say
                </h2>

              </div>

              <div className="overall-rating">

                <strong>
                  4.5
                </strong>

                <div>

                  <div className="big-stars">
                    ★★★★★
                  </div>

                  <span>
                    Guest rating
                  </span>

                </div>

              </div>

            </div>

            <div className="review-grid">

              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    className="review-card"
                    key={review.id}
                  >

                    <div className="review-top">

                      <div className="review-avatar">
                        {review.guest_name
                          ? review.guest_name
                              .charAt(0)
                              .toUpperCase()
                          : "G"}
                      </div>

                      <div>

                        <h4>
                          {review.guest_name}
                        </h4>

                        <div className="small-stars">
                          ★★★★★
                        </div>

                      </div>

                    </div>

                    <p>
                      "{review.review}"
                    </p>

                  </div>
                ))
              ) : (
                <>
                  <div className="review-card">

                    <div className="review-top">

                      <div className="review-avatar">
                        P
                      </div>

                      <div>

                        <h4>
                          Priya
                        </h4>

                        <div className="small-stars">
                          ★★★★★
                        </div>

                      </div>

                    </div>

                    <p>
                      "Beautiful place to stay.
                      The room was clean,
                      comfortable and the location
                      was excellent."
                    </p>

                  </div>

                  <div className="review-card">

                    <div className="review-top">

                      <div className="review-avatar">
                        R
                      </div>

                      <div>

                        <h4>
                          Rahul
                        </h4>

                        <div className="small-stars">
                          ★★★★★
                        </div>

                      </div>

                    </div>

                    <p>
                      "Really enjoyed the stay.
                      The atmosphere was peaceful
                      and the overall experience
                      was very good."
                    </p>

                  </div>
                </>
              )}

            </div>

          </section>

        </main>

      </div>
    </>
  );
}

export default HotelDetails;