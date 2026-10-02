// sky-events-2026.js
// ========================================
// SPACE TIME WITH ROBERT
// Astronomy Event Database System
// ========================================
// ========================================
// SKY EVENT DATABASE
// Upcoming events only
// Date format:
// YYMMDD
// Example:
// 261021 = October 21, 2026
// ========================================

window.SKY_EVENTS_2026 = {

    // ========================================
    // OCTOBER
    // ========================================

    "261004": [

        {
            icon: "🪐",
            title: "Saturn at Opposition",
            type: "planet-opposition",
            importance: 5,
            visibility: "Visible all night",
            moonImpact: "Low",
            outreachFriendly: true
        }

    ],


    "261006": [

        {
            icon: "🌕",
            title: "Moon–Jupiter Occultation",
            type: "lunar-occultation",
            importance: 4,
            visibility: "Occultation visible from parts of North America",
            moonImpact: "N/A",
            outreachFriendly: true
        }

    ],


    "261021": [

        {
            icon: "☄️",
            title: "Orionids Meteor Shower Peak",
            type: "meteor-shower",
            importance: 3,
            visibility: "Best before dawn",
            moonImpact: "High",
            outreachFriendly: true
        }

    ],


    // ========================================
    // NOVEMBER
    // ========================================

    "261116": [

        {
            icon: "☄️",
            title: "Leonids Meteor Shower Peak",
            type: "meteor-shower",
            importance: 2,
            visibility: "Best after midnight",
            moonImpact: "Moderate",
            outreachFriendly: true
        }

    ],


    "261125": [

        {
            icon: "🪐",
            title: "Uranus at Opposition",
            type: "planet-opposition",
            importance: 3,
            visibility: "Visible all night with binoculars or a telescope",
            moonImpact: "Low",
            outreachFriendly: true
        }

    ],


    // ========================================
    // DECEMBER
    // ========================================

    "261213": [

        {
            icon: "☄️",
            title: "Geminids Meteor Shower Peak",
            type: "meteor-shower",
            importance: 5,
            visibility: "Visible all night",
            moonImpact: "Low",
            outreachFriendly: true
        }

    ],


    "261221": [

        {
            icon: "🌞",
            title: "December Solstice",
            type: "solstice",
            importance: 3,
            visibility: "All day",
            moonImpact: "N/A",
            outreachFriendly: false
        }

    ],


    "261222": [

        {
            icon: "☄️",
            title: "Ursids Meteor Shower Peak",
            type: "meteor-shower",
            importance: 2,
            visibility: "Best before dawn",
            moonImpact: "High",
            outreachFriendly: true
        }

    ]

};


// ========================================
// SKY EVENT HELPERS
// ========================================

function getSkyEvents(dateKey) {

    return SKY_EVENTS[dateKey] || [];

}


function hasSkyEvents(dateKey) {

    return getSkyEvents(dateKey).length > 0;

}


function getPrimarySkyEventForDate(dateKey) {

    return getPrimarySkyEvent(getSkyEvents(dateKey));

}