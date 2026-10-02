// ========================================
// SKY EVENT UTILITIES
// ========================================

function getPrimarySkyEvent(events = []) {

    if (!events.length) return null;

    return events.reduce((best, current) => {

        const bestScore = best.importance ?? 0;
        const currentScore = current.importance ?? 0;

        return currentScore > bestScore
            ? current
            : best;

    }, events[0]);
}

// ========================================
// MASTER SKY EVENT DATABASE
// ========================================

const SKY_EVENTS = {

    ...(window.SKY_EVENTS_2026 || {}),
    ...(window.SKY_EVENTS_2027 || {}),
    ...(window.SKY_EVENTS_2028 || {}),
    ...(window.SKY_EVENTS_2029 || {}),
    ...(window.SKY_EVENTS_2030 || {}),
    ...(window.SKY_EVENTS_2031 || {})

};