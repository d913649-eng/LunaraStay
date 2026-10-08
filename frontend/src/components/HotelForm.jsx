import React, { useEffect, useState } from "react";

function HotelForm({
    mode = "add",
    initialData = {},
    onSubmit,
    onCancel,
    saving = false
}) {
    const [title, setTitle] = useState(initialData.title || "");
    const [description, setDescription] = useState(
        initialData.description || ""
    );
    const [location, setLocation] = useState(initialData.location || "");
    const [address, setAddress] = useState(initialData.address || "");
    const [latitude, setLatitude] = useState(initialData.latitude || "");
    const [longitude, setLongitude] = useState(initialData.longitude || "");
    const [price, setPrice] = useState(initialData.price || "");
    const [hotelType, setHotelType] = useState(
        initialData.hotel_type || ""
    );
    const [totalRooms, setTotalRooms] = useState(
        initialData.total_rooms || ""
    );

    const [amenities, setAmenities] = useState(
        initialData.amenities || []
    );
    const [amenityInput, setAmenityInput] = useState("");

    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const [errors, setErrors] = useState({});

    useEffect(() => {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setLocation(initialData.location || "");
        setAddress(initialData.address || "");
        setLatitude(initialData.latitude || "");
        setLongitude(initialData.longitude || "");
        setPrice(initialData.price || "");
        setHotelType(initialData.hotel_type || "");
        setTotalRooms(initialData.total_rooms || "");

        setAmenities(initialData.amenities || []);

        if (initialData.images && Array.isArray(initialData.images)) {
            setExistingImages(initialData.images);
        } else if (initialData.image) {
            setExistingImages([initialData.image]);
        } else {
            setExistingImages([]);
        }
    }, [initialData]);

    const getImageUrl = (image) => {
        if (!image) return "";

        if (typeof image === "string") {
            if (image.startsWith("http")) {
                return image;
            }

            return `http://localhost:5000/${image.replace(/^\/+/, "")}`;
        }

        return "";
    };

    const addAmenity = () => {
        const value = amenityInput.trim();

        if (!value) return;

        if (!amenities.includes(value)) {
            setAmenities([...amenities, value]);
        }

        setAmenityInput("");
    };

    const handleAmenityKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addAmenity();
        }
    };

    const removeAmenity = (amenity) => {
        setAmenities(
            amenities.filter((item) => item !== amenity)
        );
    };

    const handleImageChange = (event) => {
        const selectedFiles = Array.from(event.target.files || []);

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png"
        ];

        const validFiles = selectedFiles.filter((file) =>
            allowedTypes.includes(file.type)
        );

        const totalImageCount =
            existingImages.length + images.length + validFiles.length;

        if (totalImageCount > 3) {
            setErrors((prev) => ({
                ...prev,
                images: "You can upload a maximum of 3 images."
            }));
            return;
        }

        const newImages = validFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setImages([...images, ...newImages]);

        setErrors((prev) => ({
            ...prev,
            images: ""
        }));

        event.target.value = "";
    };

    const removeNewImage = (index) => {
        setImages(
            images.filter((_, imageIndex) => imageIndex !== index)
        );
    };

    const removeExistingImage = (index) => {
        setExistingImages(
            existingImages.filter((_, imageIndex) => imageIndex !== index)
        );
    };

    const validate = () => {
        const newErrors = {};

        if (!title.trim()) {
            newErrors.title = "Hotel name is required.";
        } else if (title.trim().length < 3) {
            newErrors.title = "Hotel name must be at least 3 characters.";
        }

        if (!description.trim()) {
            newErrors.description = "Description is required.";
        } else if (description.trim().length < 10) {
            newErrors.description =
                "Description must be at least 10 characters.";
        }

        if (!location.trim()) {
            newErrors.location = "Location is required.";
        }

        if (!address.trim()) {
            newErrors.address = "Address is required.";
        } else if (address.trim().length < 5) {
            newErrors.address =
                "Address must be at least 5 characters.";
        }

        if (latitude === "") {
            newErrors.latitude = "Latitude is required.";
        } else if (
            Number(latitude) < -90 ||
            Number(latitude) > 90
        ) {
            newErrors.latitude =
                "Latitude must be between -90 and 90.";
        }

        if (longitude === "") {
            newErrors.longitude = "Longitude is required.";
        } else if (
            Number(longitude) < -180 ||
            Number(longitude) > 180
        ) {
            newErrors.longitude =
                "Longitude must be between -180 and 180.";
        }

        if (price === "") {
            newErrors.price = "Price is required.";
        } else if (
            Number(price) < 1000 ||
            Number(price) > 100000
        ) {
            newErrors.price =
                "Price must be between ₹1,000 and ₹1,00,000.";
        }

        if (!hotelType.trim()) {
            newErrors.hotelType = "Hotel type is required.";
        }

        if (totalRooms === "") {
            newErrors.totalRooms = "Total rooms is required.";
        } else if (Number(totalRooms) < 1) {
            newErrors.totalRooms =
                "Total rooms must be at least 1.";
        }

        if (amenities.length === 0) {
            newErrors.amenities =
                "Please add at least one amenity.";
        }

        const totalImages =
            existingImages.length + images.length;

        if (totalImages === 0) {
            newErrors.images =
                "Please upload at least one hotel image.";
        }

        if (totalImages > 3) {
            newErrors.images =
                "You can upload a maximum of 3 images.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            address: address.trim(),
            latitude: Number(latitude),
            longitude: Number(longitude),
            price: Number(price),
            hotel_type: hotelType.trim(),
            total_rooms: Number(totalRooms),
            amenities: amenities.filter(
                (item) => item.trim() !== ""
            ),
            images,
            existingImages
        });
    };

    return (
        <form
            className="hotel-form"
            onSubmit={handleSubmit}
        >

            {/* HOTEL INFORMATION */}
            <section className="hotel-form-card">

                <div className="hotel-card-heading">
                    <div className="hotel-card-number">
                        01
                    </div>

                    <div>
                        <span className="hotel-card-kicker">
                            THE ESSENTIALS
                        </span>

                        <h2>Hotel Information</h2>

                        <p>
                            Tell guests what makes this stay special.
                        </p>
                    </div>
                </div>

                <div className="hotel-form-grid">

                    <div className="hotel-form-group hotel-full-width">
                        <label>
                            Hotel Name
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            placeholder="e.g. The Palm Grove Retreat"
                        />

                        {errors.title && (
                            <small className="hotel-form-error">
                                {errors.title}
                            </small>
                        )}
                    </div>

                    <div className="hotel-form-group hotel-full-width">
                        <label>
                            Description
                            <span>*</span>
                        </label>

                        <textarea
                            rows="5"
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            placeholder="Describe the atmosphere, experience and highlights of the stay..."
                        />

                        <div className="textarea-count">
                            {description.length} characters
                        </div>

                        {errors.description && (
                            <small className="hotel-form-error">
                                {errors.description}
                            </small>
                        )}
                    </div>

                    <div className="hotel-form-group">
                        <label>
                            Location
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            value={location}
                            onChange={(e) =>
                                setLocation(e.target.value)
                            }
                            placeholder="Goa, Cochin, Ooty..."
                        />

                        {errors.location && (
                            <small className="hotel-form-error">
                                {errors.location}
                            </small>
                        )}
                    </div>
<div className="hotel-form-group">
    <label htmlFor="price">
        Price per Night <span>*</span>
    </label>

    <input
        id="price"
        type="number"
        value={price}
        onChange={(event) =>
            setPrice(event.target.value)
        }
        placeholder="Enter price per night"
        min="1000"
        max="100000"
    />

    {errors.price && (
        <p className="hotel-form-error">
            {errors.price}
        </p>
    )}
</div>
<div className="hotel-form-group hotel-full-width">
                        <label>
                            Full Address
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            value={address}
                            onChange={(e) =>
                                setAddress(e.target.value)
                            }
                            placeholder="Enter the complete property address"
                        />

                        {errors.address && (
                            <small className="hotel-form-error">
                                {errors.address}
                            </small>
                        )}
                    </div>

                    <div className="hotel-form-group">
                        <label>
                            Latitude
                            <span>*</span>
                        </label>

                        <input
                            type="number"
                            step="any"
                            value={latitude}
                            onChange={(e) =>
                                setLatitude(e.target.value)
                            }
                            placeholder="10.8505"
                        />

                        {errors.latitude && (
                            <small className="hotel-form-error">
                                {errors.latitude}
                            </small>
                        )}
                    </div>

                    <div className="hotel-form-group">
                        <label>
                            Longitude
                            <span>*</span>
                        </label>

                        <input
                            type="number"
                            step="any"
                            value={longitude}
                            onChange={(e) =>
                                setLongitude(e.target.value)
                            }
                            placeholder="76.2711"
                        />

                        {errors.longitude && (
                            <small className="hotel-form-error">
                                {errors.longitude}
                            </small>
                        )}
                    </div>
                </div>
            </section>


            {/* STAY INFORMATION */}
            <section className="hotel-form-card">

                <div className="hotel-card-heading">
                    <div className="hotel-card-number">
                        02
                    </div>

                    <div>
                        <span className="hotel-card-kicker">
                            PROPERTY DETAILS
                        </span>

                        <h2>Stay Information</h2>

                        <p>
                            Add the basic details of the property.
                        </p>
                    </div>
                </div>

                <div className="hotel-form-grid">

                    <div className="hotel-form-group">
                        <label>
                            Hotel Type
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            value={hotelType}
                            onChange={(e) =>
                                setHotelType(e.target.value)
                            }
                            placeholder="Luxury Resort, Boutique Hotel..."
                        />

                        {errors.hotelType && (
                            <small className="hotel-form-error">
                                {errors.hotelType}
                            </small>
                        )}
                    </div>

                    <div className="hotel-form-group">
                        <label>
                            Total Rooms
                            <span>*</span>
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={totalRooms}
                            onChange={(e) =>
                                setTotalRooms(e.target.value)
                            }
                            placeholder="25"
                        />

                        {errors.totalRooms && (
                            <small className="hotel-form-error">
                                {errors.totalRooms}
                            </small>
                        )}
                    </div>
                </div>
            </section>


            {/* AMENITIES */}
            <section className="hotel-form-card">

                <div className="hotel-card-heading">
                    <div className="hotel-card-number">
                        03
                    </div>

                    <div>
                        <span className="hotel-card-kicker">
                            GUEST EXPERIENCE
                        </span>

                        <h2>Amenities</h2>

                        <p>
                            Highlight the comforts guests can enjoy.
                        </p>
                    </div>
                </div>

                <div className="amenity-input-row">

                    <input
                        type="text"
                        value={amenityInput}
                        onChange={(e) =>
                            setAmenityInput(e.target.value)
                        }
                        onKeyDown={handleAmenityKeyDown}
                        placeholder="Add an amenity — WiFi, Pool, Breakfast..."
                    />

                    <button
                        type="button"
                        className="add-amenity-button"
                        onClick={addAmenity}
                    >
                        <span>+</span>
                        Add
                    </button>
                </div>

                {amenities.length > 0 && (
                    <div className="amenities-list">
                        {amenities.map((amenity, index) => (
                            <div
                                className="amenity-item"
                                key={`${amenity}-${index}`}
                            >
                                <span className="amenity-dot">
                                    ✦
                                </span>

                                <span>{amenity}</span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeAmenity(amenity)
                                    }
                                    aria-label={`Remove ${amenity}`}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {errors.amenities && (
                    <small className="hotel-form-error">
                        {errors.amenities}
                    </small>
                )}
            </section>


            {/* IMAGES */}
            <section className="hotel-form-card">

                <div className="hotel-card-heading">
                    <div className="hotel-card-number">
                        04
                    </div>

                    <div>
                        <span className="hotel-card-kicker">
                            VISUAL STORY
                        </span>

                        <h2>Hotel Images</h2>

                        <p>
                            Add up to 3 beautiful images of the property.
                        </p>
                    </div>
                </div>

                <label
                    className="hotel-image-upload"
                    htmlFor="hotel-images"
                >
                    <input
                        id="hotel-images"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        multiple
                        onChange={handleImageChange}
                    />

                    <div className="upload-inner">
                        <div className="upload-symbol">
                            +
                        </div>

                        <div>
                            <strong>
                                Add property images
                            </strong>

                            <p>
                                JPG or PNG · Maximum 3 images
                            </p>
                        </div>

                        <span className="upload-browse">
                            Browse
                        </span>
                    </div>
                </label>

                {errors.images && (
                    <small className="hotel-form-error image-error">
                        {errors.images}
                    </small>
                )}

                {(existingImages.length > 0 ||
                    images.length > 0) && (
                    <div className="hotel-image-preview-list">

                        {existingImages.map(
                            (image, index) => (
                                <div
                                    className="hotel-image-preview"
                                    key={`existing-${index}`}
                                >
                                    <img
                                        src={getImageUrl(image)}
                                        alt={`Existing hotel ${index + 1}`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeExistingImage(index)
                                        }
                                    >
                                        ×
                                    </button>

                                    <span>
                                        Existing
                                    </span>
                                </div>
                            )
                        )}

                        {images.map(
                            (image, index) => (
                                <div
                                    className="hotel-image-preview"
                                    key={`new-${index}`}
                                >
                                    <img
                                        src={image.preview}
                                        alt={`New hotel ${index + 1}`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeNewImage(index)
                                        }
                                    >
                                        ×
                                    </button>

                                    <span>
                                        New
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>


            {/* ACTIONS */}
            <div className="hotel-form-actions">

                <div className="form-action-note">
                    <span>✦</span>
                    <p>
                        Review all property details before saving.
                    </p>
                </div>

                <div className="form-action-buttons">

                    <button
                        type="button"
                        className="hotel-cancel-button"
                        onClick={onCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="hotel-save-button"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : mode === "edit"
                                ? "Save Changes"
                                : "Add Hotel"}

                        <span>→</span>
                    </button>
                </div>
            </div>
        </form>
    );
}

export default HotelForm;