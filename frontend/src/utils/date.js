
export function formatedSmartDate({ date, showTimeIfToday = true }) {
    const now = new Date();
    const isSameDay = date.toDateString() === now.toDateString();

    if (isSameDay) {
        return showTimeIfToday ? date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        }) : "Today";
    }
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffInDays = Math.floor((todayMidnight - dateMidnight) / (1000 * 60 * 60 * 24));
    if (diffInDays === 1) {
        return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric"
    });
}