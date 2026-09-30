/* =========================
   PHOTO GALLERY
========================= */
let popup;
let popupImage;
let popupMeta;
let popupSpinner;

let currentPhotos = [];
let currentPhotoIndex = 0;

let browseMode;
let inspectionMode;

let inspectionImage;
let inspectionViewer;

/* =========================
   INSPECTION MODE
========================= */

let inspectionZoom = 1;

function parseFilename(filename) {

    const clean =
        filename.replace(/\.[^/.]+$/, "");

    const parts =
        clean.split("_");

    return {

        object:
            parts[0] || "Unknown",

        photographer:
            parts[1] || "Unknown",

        date:
            parts[2] || "Unknown",

        telescope:
            parts[3] || "Unknown",

        frame:
            parts[4] || "01",
        
        location:
            parts[5] || "",

        event:
            parts[6] || ""

    };

}

function buildRow(label, value) {

    if (!value) return "";

    if (value === "Unknown") return "";

    return `
        <div class="popup-row">

            <span>${label}</span>

            <span>${value}</span>

        </div>
    `;

}

function getDriveImageUrl(id) {

    return `https://drive.google.com/thumbnail?id=${id}&sz=w2000`;

}

function getCurrentCategoryCount() {

    return currentPhotos.length;

}

function getCurrentPhotoNumber() {

    return currentPhotoIndex + 1;

}

document.addEventListener(
    "DOMContentLoaded",
    initGallery
);

const OBJECT_NAMES = {

    M031: "Andromeda Galaxy",
    M045: "Pleiades",
    M057: "Ring Nebula",
    M027: "Dumbbell Nebula",
    M016: "Eagle Nebula",
    M017: "Omega Nebula"

};

const GALLERY_PHOTOS =
    PHOTO_INDEX.map(photo => {

        const meta =
            parseFilename(photo.file);

        const info =
            OBJECT_INFO[meta.object] || {};

        return {

            ...meta,

            info,

            name:
                info.name || meta.object,

            category:
                photo.category || "uncategorized",

            thumbnail:
                getDriveImageUrl(
                    photo.driveId
                ),

            full:
                getDriveImageUrl(
                    photo.driveId
                )

        };

    });


function updateCategoryTabs() {

    const counts = {};

    GALLERY_PHOTOS.forEach(photo => {

        counts[photo.category] =
            (counts[photo.category] || 0) + 1;

    });

    const totalPhotos =
        GALLERY_PHOTOS.length;

    document
        .querySelectorAll(".photo-tab")
        .forEach(tab => {

            const category =
                tab.dataset.category;

            if (
                category === "all"
            ) {

                tab.textContent =
                    `All (${totalPhotos})`;

                return;

            }

            const count =
                counts[category] || 0;

            if (count === 0) {

                tab.style.display =
                    "none";

                return;

            }

            tab.style.display = "";

            const label =
                tab.dataset.label ||
                tab.textContent.replace(
                    /\s*\(\d+\)$/,
                    ""
                );

            tab.dataset.label =
                label;

            tab.textContent =
                `${label} (${count})`;

        });

}

function initGallery() {

    popupSpinner =
    document.getElementById(
        "popupSpinner"
    );
    
    updateCategoryTabs();

    renderPhotos("all");

    document
        .querySelectorAll(".photo-tab")
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(".photo-tab")
                        .forEach(btn =>
                            btn.classList.remove("active")
                        );

                    tab.classList.add("active");

                    renderPhotos(
                        tab.dataset.category
                    );

                }
            );

        });

        popup =
        document.getElementById(
            "photoPopup"
        );

        popupImage =
            document.getElementById(
                "popupImage"
            );

        browseMode =
            document.getElementById(
                "browseMode"
            );

        inspectionMode =
            document.getElementById(
                "inspectionMode"
            );

        inspectionImage =
            document.getElementById(
                "inspectionImage"
            );

        inspectionViewer =
            document.getElementById(
                "inspectionViewer"
            );

        popupMeta =
            document.getElementById(
                "popupMeta"
            );

        document
            .getElementById(
                "popupNext"
            )
            .addEventListener(
                "click",
                showNextPhoto
            );

        document
            .getElementById(
                "popupPrev"
            )
            .addEventListener(
                "click",
                showPreviousPhoto
                );

        document
            .getElementById(
                "popupInspect"
            )
            .addEventListener(
                "click",
                openInspection
            );

        document
            .getElementById(
                "inspectionClose"
            )
            .addEventListener(
                "click",
                closeInspection
            );

        document
            .getElementById(
                "inspectionZoomIn"
            )
            .addEventListener(
                "click",
                zoomInspectionIn
            );

        document
            .getElementById(
                "inspectionZoomOut"
            )
            .addEventListener(
                "click",
                zoomInspectionOut
            );

        document
            .getElementById(
                "inspectionReset"
            )
            .addEventListener(
                "click",
                resetInspection
            );

        document
            .getElementById(
                "photoPopupClose"
            )
            .addEventListener(
                "click",
                closePopup
            );

        document
            .querySelector(
                ".photo-popup-backdrop"
            )
            .addEventListener(
                "click",
                closePopup
            );
            
        document.addEventListener(
            "keydown",
            event => {

                if (
                    !popup.classList.contains(
                        "open"
                    )
                ) {
                    return;
                }

                if (
                    event.key === "Escape"
                ) {

                    if (
                        inspectionMode.classList.contains(
                            "active"
                        )
                    ) {

                        closeInspection();

                    } else {

                        closePopup();

                    }

                    return;

                }

                if (
                    inspectionMode.classList.contains(
                        "active"
                    )
                ) {

                    return;

                }

                if (
                    event.key === "ArrowRight"
                ) {

                    showNextPhoto();

                }

                if (
                    event.key === "ArrowLeft"
                ) {

                    showPreviousPhoto();

                }

            }
        );
}

function renderPhotos(category) {

    const grid =
        document.getElementById(
            "photoGrid"
        );

    if (!grid) return;

    grid.innerHTML = "";

    currentPhotos =
    category === "all"
        ? GALLERY_PHOTOS
        : GALLERY_PHOTOS.filter(
            photo =>
                photo.category === category
        );

    currentPhotos.forEach(photo => {

        const card =
            document.createElement("div");

        card.className =
            "photo-card";

        card.innerHTML = `

            <img
                loading="lazy"
                src="${photo.thumbnail}"
                alt="${photo.name}"
            >

            <div class="photo-object-badge">
                ${photo.object}
            </div>

            <div class="photo-date-badge">
                ${photo.date}
            </div>

            <div class="photo-overlay">
                ${photo.photographer}
            </div>

`;

        card.addEventListener(
            "click",
            () => {

                currentPhotoIndex =
                    currentPhotos.indexOf(photo);

                openPopup(photo);

            }
        );

        grid.appendChild(card);

    });

}

function openPopup(photo) {

    closeInspection();

    const positionText =
    `${photo.category}
     •
     ${getCurrentPhotoNumber()}
     of
     ${getCurrentCategoryCount()}`;

    popupImage.classList.remove(
        "loaded"
    );

    popupImage.onload = () => {

    popupSpinner.classList.remove(
            "visible"
        );

        popupImage.classList.add(
            "loaded"
        );

    };

    popupSpinner.classList.add(
        "visible"
    );

    popupImage.src = photo.full;


    popupImage.alt =
        photo.name;

    popupMeta.innerHTML = `

        <div class="popup-title">
            ${photo.object}
        </div>

        <div class="popup-subtitle">
            ${photo.name}
        </div>

        <div class="popup-position">
            ${positionText}
        </div>

        <div class="popup-details">

        ${buildRow(
            "Object Type",
            photo.info.type
        )}

        ${buildRow(
            "Constellation",
            photo.info.constellation
        )}

        ${buildRow(
            "Distance",
            photo.info.distance
        )}

        ${buildRow(
            "Magnitude",
            photo.info.magnitude
        )}

        ${buildRow(
            "Photographer",
            photo.photographer
        )}

        ${buildRow(
            "Telescope",
            photo.telescope
        )}

        ${buildRow(
            "Date",
            photo.date
        )}

        ${buildRow(
            "Location",
            photo.location
        )}

        ${buildRow(
            "Session",
            photo.event
        )}

        </div>

    `;

    popup.classList.add(
        "open"
    );

    document.body.classList.add(
        "popup-open"
    );

}

function showNextPhoto() {

    currentPhotoIndex++;

    if (
        currentPhotoIndex >=
        currentPhotos.length
    ) {

        currentPhotoIndex = 0;

    }

    openPopup(
        currentPhotos[
            currentPhotoIndex
        ]
    );

}

function showPreviousPhoto() {

    currentPhotoIndex--;

    if (
        currentPhotoIndex < 0
    ) {

        currentPhotoIndex =
            currentPhotos.length - 1;

    }

    openPopup(
        currentPhotos[
            currentPhotoIndex
        ]
    );

}

/* =========================
   INSPECTION MODE
========================= */

function openInspection() {

    inspectionZoom = 1;

    inspectionImage.src =
        popupImage.src;

    inspectionImage.alt =
        popupImage.alt;

    inspectionImage.classList.add("loaded");

    updateInspectionTransform();

    browseMode.classList.remove("active");
    inspectionMode.classList.add("active");

    popup.classList.add("inspection-open");

}


function closeInspection() {

    inspectionMode.classList.remove("active");
    browseMode.classList.add("active");

    popup.classList.remove("inspection-open");

    resetInspection();

}


function updateInspectionTransform() {

    inspectionImage.style.transform =
        `scale(${inspectionZoom})`;

}


function zoomInspectionIn() {

    inspectionZoom =
        Math.min(
            inspectionZoom + 0.5,
            5
        );

    updateInspectionTransform();

}


function zoomInspectionOut() {

    inspectionZoom =
        Math.max(
            inspectionZoom - 0.5,
            1
        );

    updateInspectionTransform();

}


function resetInspection() {

    inspectionZoom = 1;

    updateInspectionTransform();

}

function closePopup() {

    popup.classList.remove(
        "open"
    );

    document.body.classList.remove(
        "popup-open"
    );

}