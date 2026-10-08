import { Link } from "react-router-dom";

function HotelCard({ hotel, getImageUrl }) {
    return (
        <div className="explore-hotel-card">

            <div className="explore-hotel-image">
                <img
                    src={getImageUrl(hotel.image)}
                    alt={hotel.title}
                    onError={(event) => {
                        event.currentTarget.src =
                            "https://images.unsplash.com/photo-1566073771259-6a8506099945";
                    }}
                />
            </div>

            <div className="explore-hotel-content">

                <div>
                    <p className="explore-hotel-location">
                        {hotel.location}
                    </p>

                    <h3>
                        {hotel.title}
                    </h3>

                    <p className="explore-hotel-description">
                        {hotel.description}
                    </p>
                </div>

                <div className="explore-hotel-bottom">

                    <div className="explore-price">
                        <strong>
                            ₹
                            {Number(
                                hotel.price
                            ).toLocaleString("en-IN")}
                        </strong>

                        <span>
                            / night
                        </span>
                    </div>

                    <Link
                        to={`/hotel/${hotel.id}`}
                        className="explore-details-btn"
                    >
                        View Details
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default HotelCard;