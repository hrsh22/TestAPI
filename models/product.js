const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    block: {
        type: Number,
        required: true,
    },
    contractAddress: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Product", productSchema);
