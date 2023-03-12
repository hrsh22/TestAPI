const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
    },
    price: {
        type: Number,
        required: [true, "Please enter product price"],
    },
    featured: {
        type: Boolean,
        default: false,
    },
    rating: {
        type: Number,
        default: 4.9,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    company: {
        type: String,
        enum: {
            values: ["google", "apple", "oneplus", "samsung", "nokia"],
            message: "Please select correct company name",
        },
    },

});

module.exports = mongoose.model("Product", productSchema);
