
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import HotelForm from "../components/HotelForm";

function EditHotel() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const response = await fetch(
                    `https://lunara-stay-backend.onrender.com/api/hotels/${id}`
                );

                if (!response.ok) {
                    throw new Error("Hotel not found");
                }

                const data = await response.json();
                setHotel(data);
            } catch (error) {
                console.error("Error fetching hotel:", error);
                setHotel(null);
            } finally {
                setLoading(false);
            }
        };

        fetchHotel();
    }, [id]);

    const handleSubmit = async (data) => {
        try {
            setSaving(true);

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

            formData.append(
                "amenities",
                JSON.stringify(data.amenities)
            );

            formData.append(
                "existing_images",
                JSON.stringify(data.existingImages)
            );

            data.images.forEach((image) => {
                formData.append("images", image.file);
            });

            const response = await fetch(
                `https://lunara-stay-backend.onrender.com/api/hotels/${id}`,
                {
                    method: "PUT",
                    body: formData
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to update hotel"
                );
            }

            alert("Hotel updated successfully!");

            navigate(`/hotel/${id}`);
        } catch (error) {
            console.error("Error updating hotel:", error);

            alert(
                error.message ||
                "Failed to update hotel"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/hotel/${id}`);
    };

    if (loading) {
        return (
            <div className="edit-hotel-loading">
                <p>Loading hotel details...</p>
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="edit-hotel-loading">
                <h2>Hotel not found</h2>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/explore-stays")
                    }
                >
                    Back to Explore Stays
                </button>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>
                    Edit {hotel.title} | Lunara Stay
                </title>

                <meta
                    name="description"
                    content={`Edit hotel details for ${hotel.title} on Lunara Stay.`}
                />
            </Helmet>

            <div className="edit-hotel-page">

                {/* EDIT HOTEL TOP BAR */}

                <nav className="edit-hotel-navbar">

                    <button
                        type="button"
                        className="edit-back-button"
                        onClick={() =>
                            navigate(`/hotel/${id}`)
                        }
                    >
                        ← Back to Stay
                    </button>

                    <div className="edit-hotel-logo">
                        ✦ LUNARA STAY
                    </div>

                </nav>

                {/* EDIT HOTEL HEADING */}

                <section className="edit-hotel-header">

                    <div className="edit-hotel-heading-star">
                        ✦
                    </div>

                    <h1>
                        Edit Hotel
                    </h1>

                    <div className="edit-hotel-heading-line">
                        <span></span>

                        <p>
                            LUNARA STAY COLLECTION
                        </p>

                        <span></span>
                    </div>

                </section>

                {/* EXISTING HOTEL FORM */}

                <section className="edit-hotel-form-section">

                    <div className="edit-hotel-form-container">

                        <HotelForm
                            mode="edit"
                            initialData={hotel}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            saving={saving}
                        />

                    </div>

                </section>

                <footer className="edit-hotel-footer">
                    <p>
                        © 2026 Lunara Stay. All rights reserved.
                    </p>
                </footer>

            </div>
        </>
    );
}

export default EditHotel;

