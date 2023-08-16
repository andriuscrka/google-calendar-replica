const generateId = () => {
	return Date.now();
};

const generateDateId = (date: string) => {
	const newDate = new Date(date);
	return `${getWeekOfYear(newDate)}/${newDate.getFullYear()}`;
};

const getWeekOfYear = (date: string | Date) => {
	date = new Date(date);
	date.setHours(0, 0, 0, 0);
	const firstDayOfYear = new Date(date.getFullYear(), 0, 0);
	const firstSundayOffset = (7 - firstDayOfYear.getDay()) % 7;
	const firstSundayOfYear = new Date(Number(firstDayOfYear));
	firstSundayOfYear.setDate(firstDayOfYear.getDate() + firstSundayOffset);

	if (date < firstSundayOfYear) {
		return 1;
	}

	const daysSinceFirstSunday =
		(date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000);

	let weekNumber = Math.floor(daysSinceFirstSunday / 7) + 1;

	return weekNumber;
};

module.exports = {
	generateId,
	generateDateId,
	getWeekOfYear,
};
