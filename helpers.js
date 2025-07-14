// helpers.js
const vendors = require('./vendors');

function searchVendors(food, location) {
    return vendors.filter(vendor =>
        vendor.location.toLowerCase().includes(location.toLowerCase()) &&
        vendor.menu.some(item => item.toLowerCase().includes(food.toLowerCase()))
    );
}

function formatVendorResults(results) {
    if (results.length === 0) return "❌ No vendors found for that request.";

    let message = "✅ Found these vendors:\n\n";
    results.forEach((vendor, index) => {
        message += `${index + 1}. ${vendor.name} - ${vendor.phone}\n`;
    });
    message += `\nReply with 1, 2, etc. to contact a vendor.`;
    return message;
}

module.exports = { searchVendors, formatVendorResults };
