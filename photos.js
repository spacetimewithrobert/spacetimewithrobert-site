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

    document
        .querySelectorAll(".photo-tab")
        .forEach(tab => {

            const category =
                tab.dataset.category;

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

    renderPhotos("outreach");

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

        /* =========================
           INSPECTION DRAGGING
        ========================= */

        inspectionViewer.addEventListener(
            "pointerdown",
            event => {

                if (inspectionZoom <= 1) {
                    return;
                }

                event.preventDefault();

                inspectionDragging = true;

                inspectionDragStartX =
                    event.clientX;

                inspectionDragStartY =
                    event.clientY;

                inspectionStartX =
                    inspectionX;

                inspectionStartY =
                    inspectionY;

                inspectionViewer.setPointerCapture(
                    event.pointerId
                );

                inspectionImage.classList.add(
                    "dragging"
                );

            }
        );


        inspectionViewer.addEventListener(
            "pointermove",
            event => {

                if (!inspectionDragging) {
                    return;
                }

                event.preventDefault();

                inspectionX =
                    inspectionStartX +
                    (
                        event.clientX -
                        inspectionDragStartX
                    );

                inspectionY =
                    inspectionStartY +
                    (
                        event.clientY -
                        inspectionDragStartY
                    );

                updateInspectionTransform();

            }
        );


        inspectionViewer.addEventListener(
            "pointerup",
            event => {

                if (!inspectionDragging) {
                    return;
                }

                inspectionDragging = false;

                inspectionImage.classList.remove(
                    "dragging"
                );

                try {

                    inspectionViewer.releasePointerCapture(
                        event.pointerId
                    );

                } catch (error) {}

            }
        );


        inspectionViewer.addEventListener(
            "pointercancel",
            event => {

                inspectionDragging = false;

                inspectionImage.classList.remove(
                    "dragging"
                );

                try {

                    inspectionViewer.releasePointerCapture(
                        event.pointerId
                    );

                } catch (error) {}

            }
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
    GALLERY_PHOTOS.filter(
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

let inspectionZoom = 1;
let inspectionX = 0;
let inspectionY = 0;

let inspectionBaseWidth = 0;
let inspectionBaseHeight = 0;

let inspectionDragging = false;
let inspectionDragStartX = 0;
let inspectionDragStartY = 0;
let inspectionStartX = 0;
let inspectionStartY = 0;


/* =========================
   OPEN INSPECTION
========================= */

function openInspection() {

    inspectionZoom = 1;
    inspectionX = 0;
    inspectionY = 0;

    inspectionImage.src = popupImage.src;
    inspectionImage.alt = popupImage.alt;
    inspectionImage.classList.add("loaded");

    browseMode.classList.remove("active");
    inspectionMode.classList.add("active");

    popup.classList.add("inspection-open");

    /*
       Wait until the inspection viewer is visible
       before calculating the image's fitted size.
    */
    requestAnimationFrame(() => {
        fitInspectionImage();
    });

}


/* =========================
   CLOSE INSPECTION
========================= */

function closeInspection() {

    inspectionMode.classList.remove("active");
    browseMode.classList.add("active");

    popup.classList.remove("inspection-open");

    resetInspection();

}


/* =========================
   FIT IMAGE TO VIEWER
========================= */

function fitInspectionImage() {

    if (!inspectionImage.naturalWidth ||
        !inspectionImage.naturalHeight) {
        return;
    }

    const viewerWidth =
        inspectionViewer.clientWidth;

    const viewerHeight =
        inspectionViewer.clientHeight;

    if (!viewerWidth || !viewerHeight) {
        return;
    }

    const imageRatio =
        inspectionImage.naturalWidth /
        inspectionImage.naturalHeight;

    const viewerRatio =
        viewerWidth /
        viewerHeight;

    if (imageRatio > viewerRatio) {

        inspectionBaseWidth =
            viewerWidth;

        inspectionBaseHeight =
            viewerWidth / imageRatio;

    } else {

        inspectionBaseHeight =
            viewerHeight;

        inspectionBaseWidth =
            viewerHeight * imageRatio;

    }

    /*
       The image is positioned from its center.
       This keeps the initial view perfectly centered.
    */
    inspectionImage.style.width =
        `${inspectionBaseWidth}px`;

    inspectionImage.style.height =
        `${inspectionBaseHeight}px`;

    inspectionX = 0;
    inspectionY = 0;

    updateInspectionTransform();

}


/* =========================
   UPDATE IMAGE POSITION
========================= */

function updateInspectionTransform() {

    if (!inspectionBaseWidth ||
        !inspectionBaseHeight) {
        return;
    }

    const viewerWidth =
        inspectionViewer.clientWidth;

    const viewerHeight =
        inspectionViewer.clientHeight;

    const scaledWidth =
        inspectionBaseWidth *
        inspectionZoom;

    const scaledHeight =
        inspectionBaseHeight *
        inspectionZoom;

    /*
       Maximum distance the image can move from center.
       When the image is larger than the viewport,
       this allows the user to reach every part of it.
    */
    const maxX =
        Math.max(
            0,
            (scaledWidth - viewerWidth) / 2
        );

    const maxY =
        Math.max(
            0,
            (scaledHeight - viewerHeight) / 2
        );

    inspectionX =
        Math.max(
            -maxX,
            Math.min(maxX, inspectionX)
        );

    inspectionY =
        Math.max(
            -maxY,
            Math.min(maxY, inspectionY)
        );

    inspectionImage.style.transform =
        `translate(-50%, -50%)
         translate(${inspectionX}px, ${inspectionY}px)
         scale(${inspectionZoom})`;

}


/* =========================
   ZOOM IN
========================= */

function zoomInspectionIn() {

    inspectionZoom =
        Math.min(
            inspectionZoom + 0.5,
            5
        );

    updateInspectionTransform();

}


/* =========================
   ZOOM OUT
========================= */

function zoomInspectionOut() {

    inspectionZoom =
        Math.max(
            inspectionZoom - 0.5,
            1
        );

    updateInspectionTransform();

}


/* =========================
   RESET
========================= */

function resetInspection() {

    inspectionZoom = 1;
    inspectionX = 0;
    inspectionY = 0;

    updateInspectionTransform();

}

/* =========================
   WINDOW RESIZE
========================= */

window.addEventListener(
    "resize",
    () => {

        if (
            inspectionMode &&
            inspectionMode.classList.contains("active")
        ) {
            fitInspectionImage();
        }

    }
);

function closePopup() {

    popup.classList.remove(
        "open"
    );

    document.body.classList.remove(
        "popup-open"
    );

}