import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import HotelForm from "../components/HotelForm";

function AddHotel() {
    const navigate = useNavigate();

    const handleSubmit = async (data) => {
        const formData = new FormData();

        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("location", data.location);
        formData.append("address", data.address);
        formData.append("latitude", data.latitude);
        formData.append("longitude", data.longitude);
        formData.append("price", data.price);
        formData.append("hotel_type", data.hotel_type);
        formData.append("total_rooms", data.total_rooms);

        formData.append("amenities", JSON.stringify(data.amenities));

        data.images.forEach((image) => {
            formData.append("images", image.file);
        });

        try {
            const response = await fetch(
                "http://localhost:5000/api/hotels",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Failed to add hotel");
                return;
            }

            alert("Hotel added successfully!");
            navigate("/explore-stays");
        } catch (error) {
            console.error("Add hotel error:", error);
            alert("Unable to connect to the server");
        }
    };

    return (
        <>
            <Helmet>
                <title>Add Hotel | Lunara Stay</title>
                <meta
                    name="description"
                    content="Add a new hotel to the Lunara Stay collection."
                />
            </Helmet>

            <div className="add-hotel-page">

                {/* MAIN NAVBAR */}
                <nav className="add-hotel-navbar">
                    <div className="add-hotel-logo">
                        ✦ LUNARA STAY
                    </div>

                    <div className="add-hotel-nav-links">
                        <button onClick={() => navigate("/")}>
                            Home
                        </button>

                        <button onClick={() => navigate("/about")}>
                            About Us
                        </button>

                        <button onClick={() => navigate("/explore-stays")}>
                            Explore Stays
                        </button>

                        <button
                            className="active"
                            onClick={() => navigate("/add-hotel")}
                        >
                            Add Hotel
                        </button>
                    </div>
                </nav>

                {/* PREMIUM PAGE HEADING */}
                <section className="add-hotel-header">

                    <div className="add-hotel-heading-star">
                        ✦
                    </div>

                    <h1>Add a New Hotel</h1>

                    <div className="add-hotel-heading-line">
                        <span></span>
                        <p>LUNARA STAY COLLECTION</p>
                        <span></span>
                    </div>

                </section>

                {/* HOTEL FORM */}
                <section className="hotel-form-section">
                    <div className="hotel-form-container">
                        <HotelForm
                            mode="add"
                            initialData={{
                                title: "",
                                description: "",
                                location: "",
                                address: "",
                                latitude: "",
                                longitude: "",
                                price: "",
                                hotel_type: "",
                                total_rooms: "",
                                amenities: [],
                                images: [],
                            }}
                            onSubmit={handleSubmit}
                            onCancel={() => navigate("/explore-stays")}
                        />
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="footer">
                    <p>
                        © 2026 Lunara Stay. All rights reserved.
                    </p>
                </footer>

            </div>
        </>
    );
}

export default AddHotel;

