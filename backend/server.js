require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// uploads

const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
}

app.use("/uploads", express.static(uploadsPath));

//Multer

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsPath);
    },

    filename: (req, file, cb) => {
        const fileName =
            Date.now() +
            "-" +
            file.originalname.replace(/\s+/g, "-");

        cb(null, fileName);
    }
});


const upload = multer({
    storage,

    limits: {
        files: 3,
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPG, JPEG and PNG images are allowed."
                )
            );
        }
    }
});


//Delete Image

const deleteImageFile = (imagePath) => {
    try {
        if (!imagePath) {
            return;
        }

        if (
            typeof imagePath !== "string" ||
            !imagePath.startsWith("/uploads/")
        ) {
            return;
        }

        const fileName = path.basename(imagePath);

        const filePath = path.join(
            uploadsPath,
            fileName
        );

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

    } catch (error) {
        console.error(
            "Image delete error:",
            error.message
        );
    }
};

const deleteImageFiles = (images) => {
    if (!Array.isArray(images)) {
        return;
    }

    images.forEach((image) => {
        deleteImageFile(image);
    });
};
//Geocoding

const searchLocation = async (query) => {
    try {
        if (!query || !query.trim()) {
            return null;
        }

        const url =
            "https://nominatim.openstreetmap.org/search?" +
            new URLSearchParams({
                q: query,
                format: "json",
                limit: "1"
            });

        const response = await fetch(url, {
            headers: {
                "User-Agent": "LunaraStay/1.0"
            }
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (!data.length) {
            return null;
        }

        return {
            latitude: Number(data[0].lat),
            longitude: Number(data[0].lon)
        };

    } catch (error) {
        console.error(
            "Location search error:",
            error.message
        );

        return null;
    }
};


const getCoordinates = async (
    address,
    location,
    latitude,
    longitude
) => {

    const givenLatitude = Number(latitude);
    const givenLongitude = Number(longitude);

    if (
        Number.isFinite(givenLatitude) &&
        givenLatitude >= -90 &&
        givenLatitude <= 90 &&
        Number.isFinite(givenLongitude) &&
        givenLongitude >= -180 &&
        givenLongitude <= 180
    ) {
        return {
            latitude: givenLatitude,
            longitude: givenLongitude
        };
    }

    const queries = [
        `${address}, ${location}, Tamil Nadu, India`,
        `${location}, Tamil Nadu, India`,
        `${location}, India`
    ];

    for (const query of queries) {

        const result = await searchLocation(query);

        if (result) {
            return result;
        }
    }

    return {
        latitude: null,
        longitude: null
    };
};


//Validation

const validateHotelData = (data) => {

    const {
        title,
        description,
        location,
        address,
        price,
        total_rooms,
        hotel_type,
        amenities
    } = data;


    if (!title || title.trim().length < 3) {
        return "Hotel title must contain at least 3 characters.";
    }


    if (
        !description ||
        description.trim().length < 10
    ) {
        return "Description must contain at least 10 characters.";
    }


    if (!location || location.trim().length === 0) {
        return "Hotel location is required.";
    }


    if (
        !address ||
        address.trim().length < 5
    ) {
        return "Valid hotel address is required.";
    }


    const numericPrice = Number(price);

    if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 1000 ||
        numericPrice > 100000
    ) {
        return "Price must be between ₹1,000 and ₹1,00,000.";
    }


    const rooms = Number(total_rooms);

    if (
        !Number.isInteger(rooms) ||
        rooms < 1
    ) {
        return "Total rooms must be at least 1.";
    }


    if (
        !hotel_type ||
        hotel_type.trim().length === 0
    ) {
        return "Hotel type is required.";
    }


    let amenitiesArray = [];

    if (amenities) {
        try {
            amenitiesArray =
                typeof amenities === "string"
                    ? JSON.parse(amenities)
                    : amenities;
        } catch {
            return "Invalid amenities format.";
        }
    }


    if (
        !Array.isArray(amenitiesArray) ||
        amenitiesArray.length === 0
    ) {
        return "At least one amenity is required.";
    }


    return null;
};

app.get("/", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT NOW()"
        );

        res.json({
            message:
                "Lunara Stay backend is running",

            database:
                result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Database connection failed"
        });
    }
});

app.post(
    "/api/upload",
    upload.single("image"),
    (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    message:
                        "No image uploaded"
                });
            }


            res.json({

                message:
                    "Image uploaded successfully",

                image:
                    `/uploads/${req.file.filename}`

            });

        } catch (error) {

            console.error(
                "IMAGE UPLOAD ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Image upload failed"
            });
        }
    }
);


//Add Hotel

app.post(
    "/api/hotels",
    upload.array("images", 3),

    async (req, res) => {

        try {

            const {
                title,
                description,
                location,
                address,
                latitude,
                longitude,
                price,
                total_rooms,
                hotel_type,
                amenities
            } = req.body;

            const validationError =
                validateHotelData(req.body);

            if (validationError) {

                deleteImageFiles(
                    req.files?.map(
                        (file) =>
                            `/uploads/${file.filename}`
                    ) || []
                );

                return res.status(400).json({
                    message:
                        validationError
                });
            }

            if (
                !req.files ||
                req.files.length === 0
            ) {

                return res.status(400).json({
                    message:
                        "At least one hotel image is required"
                });
            }


            if (req.files.length > 3) {

                deleteImageFiles(
                    req.files.map(
                        (file) =>
                            `/uploads/${file.filename}`
                    )
                );

                return res.status(400).json({
                    message:
                        "Maximum 3 hotel images are allowed"
                });
            }

            const imagePaths =
                req.files.map(
                    (file) =>
                        `/uploads/${file.filename}`
                );

            const mainImage =
                imagePaths[0];


            let amenitiesArray = [];

            try {

                amenitiesArray =
                    typeof amenities === "string"
                        ? JSON.parse(amenities)
                        : amenities || [];

            } catch {

                deleteImageFiles(
                    imagePaths
                );

                return res.status(400).json({
                    message:
                        "Invalid amenities format"
                });
            }

            const coordinates =
                await getCoordinates(
                    address,
                    location,
                    latitude,
                    longitude
                );


            const result =
                await pool.query(
                    `
                    INSERT INTO hotels
                    (
                        image,
                        images,
                        title,
                        description,
                        location,
                        address,
                        price,
                        total_rooms,
                        hotel_type,
                        amenities,
                        latitude,
                        longitude
                    )
                    VALUES
                    (
                        $1,$2,$3,$4,$5,$6,
                        $7,$8,$9,$10,$11,$12
                    )
                    RETURNING *
                    `,
                    [
                        mainImage,
                        imagePaths,
                        title.trim(),
                        description.trim(),
                        location.trim(),
                        address.trim(),
                        Number(price),
                        Number(total_rooms),
                        hotel_type.trim(),
                        amenitiesArray,
                        coordinates.latitude,
                        coordinates.longitude
                    ]
                );


            res.status(201).json(
                result.rows[0]
            );

        } catch (error) {

            console.error(
                "ADD HOTEL ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to add hotel",

                error:
                    error.message
            });
        }
    }
);
//Get All Hotels

app.get(
    "/api/hotels",
    async (req, res) => {

        try {

            const {
                search,
                minPrice,
                maxPrice,
                limit,
                offset
            } = req.query;

            let query =
                "SELECT * FROM hotels WHERE 1=1";

            let values = [];
            let number = 1;


            if (search) {

                query += `
                    AND (
                        LOWER(title) LIKE LOWER($${number})
                        OR LOWER(location) LIKE LOWER($${number})
                    )
                `;

                values.push(`%${search}%`);
                number++;
            }


            if (minPrice) {

                query +=
                    ` AND price >= $${number}`;

                values.push(Number(minPrice));
                number++;
            }


            if (maxPrice) {

                query +=
                    ` AND price <= $${number}`;

                values.push(Number(maxPrice));
                number++;
            }


            query +=
                " ORDER BY id DESC";


            if (limit) {

                query +=
                    ` LIMIT $${number}`;

                values.push(Number(limit));
                number++;
            }


            if (offset) {

                query +=
                    ` OFFSET $${number}`;

                values.push(Number(offset));
            }


            const result =
                await pool.query(
                    query,
                    values
                );


            res.json(
                result.rows
            );

        } catch (error) {

            console.error(
                "GET HOTELS ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch hotels"
            });
        }
    }
);
//Get Single Hotel

app.get(
    "/api/hotels/:id",
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const result =
                await pool.query(
                    `
                    SELECT *
                    FROM hotels
                    WHERE id = $1
                    `,
                    [id]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({
                    message:
                        "Hotel not found"
                });
            }


            res.json(
                result.rows[0]
            );

        } catch (error) {

            console.error(
                "GET HOTEL ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch hotel"
            });
        }
    }
);
//Add Images

app.put(
    "/api/hotels/:id",

    upload.fields([
        {
            name: "images",
            maxCount: 3
        },
        {
            name: "image",
            maxCount: 1
        }
    ]),

    async (req, res) => {

        try {

            const { id } =
                req.params;


            const {
                title,
                description,
                location,
                address,
                latitude,
                longitude,
                price,
                total_rooms,
                hotel_type,
                amenities
            } = req.body;


            const existingHotel =
                await pool.query(
                    `
                    SELECT *
                    FROM hotels
                    WHERE id = $1
                    `,
                    [id]
                );


            if (
                existingHotel.rows.length === 0
            ) {

                return res.status(404).json({
                    message:
                        "Hotel not found"
                });
            }

            const validationError =
                validateHotelData(req.body);

            if (validationError) {

                const uploadedFiles =
                    Object.values(
                        req.files || {}
                    ).flat();

                deleteImageFiles(
                    uploadedFiles.map(
                        (file) =>
                            `/uploads/${file.filename}`
                    )
                );

                return res.status(400).json({
                    message:
                        validationError
                });
            }

            let amenitiesArray = [];

            try {

                amenitiesArray =
                    typeof amenities === "string"
                        ? JSON.parse(amenities)
                        : amenities || [];

            } catch {

                return res.status(400).json({
                    message:
                        "Invalid amenities format"
                });
            }

            const oldHotel =
                existingHotel.rows[0];

            let image =
                oldHotel.image;

            let images =
                Array.isArray(oldHotel.images)
                    ? oldHotel.images
                    : oldHotel.image
                        ? [oldHotel.image]
                        : [];


            const uploadedFiles =
                Object.values(
                    req.files || {}
                ).flat();


            if (
                uploadedFiles.length > 3
            ) {

                deleteImageFiles(
                    uploadedFiles.map(
                        (file) =>
                            `/uploads/${file.filename}`
                    )
                );

                return res.status(400).json({
                    message:
                        "Maximum 3 hotel images are allowed"
                });
            }


            if (
                uploadedFiles.length > 0
            ) {

                const newImagePaths =
                    uploadedFiles.map(
                        (file) =>
                            `/uploads/${file.filename}`
                    );
//Delete Images

                deleteImageFiles(
                    images
                );


                images =
                    newImagePaths;

                image =
                    newImagePaths[0];
            }

            const coordinates =
                await getCoordinates(
                    address,
                    location,
                    latitude,
                    longitude
                );

            const result =
                await pool.query(
                    `
                    UPDATE hotels
                    SET
                        image = $1,
                        images = $2,
                        title = $3,
                        description = $4,
                        location = $5,
                        address = $6,
                        price = $7,
                        total_rooms = $8,
                        hotel_type = $9,
                        amenities = $10,
                        latitude = $11,
                        longitude = $12
                    WHERE id = $13
                    RETURNING *
                    `,
                    [
                        image,
                        images,
                        title.trim(),
                        description.trim(),
                        location.trim(),
                        address.trim(),
                        Number(price),
                        Number(total_rooms),
                        hotel_type.trim(),
                        amenitiesArray,
                        coordinates.latitude,
                        coordinates.longitude,
                        id
                    ]
                );


            res.json(
                result.rows[0]
            );

        } catch (error) {

            console.error(
                "UPDATE HOTEL ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to update hotel",

                error:
                    error.message
            });
        }
    }
);

//Delete Hotel

app.delete(
    "/api/hotels/:id",
    async (req, res) => {

        try {

            const { id } =
                req.params;


            const hotelResult =
                await pool.query(
                    `
                    SELECT *
                    FROM hotels
                    WHERE id = $1
                    `,
                    [id]
                );


            if (
                hotelResult.rows.length === 0
            ) {

                return res.status(404).json({
                    message:
                        "Hotel not found"
                });
            }


            const hotel =
                hotelResult.rows[0];

            let images = [];

            if (
                Array.isArray(hotel.images)
            ) {
                images =
                    hotel.images;
            } else if (
                hotel.image
            ) {
                images =
                    [hotel.image];
            }

            await pool.query(
                `
                DELETE FROM hotels
                WHERE id = $1
                `,
                [id]
            );


            deleteImageFiles(
                images
            );


            res.json({
                message:
                    "Hotel deleted successfully"
            });

        } catch (error) {

            console.error(
                "DELETE HOTEL ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to delete hotel"
            });
        }
    }
);


app.get(
    "/api/hotels/:id/reviews",
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const result =
                await pool.query(
                    `
                    SELECT *
                    FROM reviews
                    WHERE hotel_id = $1
                    ORDER BY created_at DESC
                    `,
                    [id]
                );

            res.json(
                result.rows
            );

        } catch (error) {

            console.error(
                "GET REVIEWS ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch reviews"
            });
        }
    }
);

app.post(
    "/api/hotels/:id/reviews",
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const {
                guest_name,
                review
            } = req.body;


            if (
                !guest_name ||
                guest_name.trim().length < 2
            ) {

                return res.status(400).json({
                    message:
                        "Guest name is required"
                });
            }


            if (
                !review ||
                review.trim().length < 3
            ) {

                return res.status(400).json({
                    message:
                        "Review is required"
                });
            }


            const result =
                await pool.query(
                    `
                    INSERT INTO reviews
                    (
                        hotel_id,
                        guest_name,
                        review
                    )
                    VALUES
                    ($1,$2,$3)
                    RETURNING *
                    `,
                    [
                        id,
                        guest_name.trim(),
                        review.trim()
                    ]
                );


            res.status(201).json(
                result.rows[0]
            );

        } catch (error) {

            console.error(
                "ADD REVIEW ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to add review"
            });
        }
    }
);

//Multer Error Handler

app.use(
    (error, req, res, next) => {

        if (
            error instanceof multer.MulterError
        ) {

            if (
                error.code === "LIMIT_FILE_COUNT"
            ) {

                return res.status(400).json({
                    message:
                        "Maximum 3 images are allowed"
                });
            }


            if (
                error.code === "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({
                    message:
                        "Each image must be 5MB or smaller"
                });
            }


            return res.status(400).json({
                message:
                    error.message
            });
        }


        if (error) {

            return res.status(400).json({
                message:
                    error.message
            });
        }


        next();
    }
);


const PORT = 5000;

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );
    }
);