import { StyledEventInfo } from './interfaces';

const MS_IN_SECOND = 1000;
const SECONDS_IN_HOUR = 3600;
const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;

export const getToday = () => {
	return new Date();
};

export const getWeekdays = (date: Date) => {
	const startDate = new Date(date);
	return Array(DAYS_IN_WEEK)
		.fill('')
		.map((_, index) => {
			const newDate = new Date(startDate);
			newDate.setDate(startDate.getDate() - (startDate.getDay() - index));
			return newDate;
		});
};

export const formatDateToDDMMYY = (date: Date) => {
	date = new Date(date);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${day}/${month}/${year}`;
};

export const generateId = () => {
	return Date.now();
};

export const generateDateId = (date: Date) => {
	return `${getWeekOfYear(date)}/${date.getFullYear()}`;
};

export const getWeekOfYear = (date: string | Date) => {
	date = new Date(date);
	date.setHours(0, 0, 0, 0);
	const firstDayOfYear = new Date(date.getFullYear(), 0, 0);
	const firstSundayOffset =
		(DAYS_IN_WEEK - firstDayOfYear.getDay()) % DAYS_IN_WEEK;
	const firstSundayOfYear = new Date(Number(firstDayOfYear));
	firstSundayOfYear.setDate(firstDayOfYear.getDate() + firstSundayOffset);

	if (date < firstSundayOfYear) {
		return 1;
	}

	const daysSinceFirstSunday =
		(date.getTime() - firstDayOfYear.getTime()) /
		(HOURS_IN_DAY * SECONDS_IN_HOUR * MS_IN_SECOND);

	let weekNumber = Math.floor(daysSinceFirstSunday / DAYS_IN_WEEK) + 1;

	return weekNumber;
};

export const calculatePreffix = (i: number): 'AM' | 'PM' => {
	if (i < 11) {
		return 'AM';
	}

	return 'PM';
};

export const calculateStyles = (event: Data) => {
	const overlapping =
		formatDateToDDMMYY(event.startingDate) !==
		formatDateToDDMMYY(event.finishingDate);

	event.startingDate = new Date(event.startingDate);
	event.finishingDate = new Date(event.finishingDate);

	const { id, title, description, startingDate, finishingDate } = event;

	const metaData = {
		id,
		title,
		description,
		startingDate,
		finishingDate,
		overlapping,
	};

	if (overlapping) {
		const styledData: StyledEventInfo[] = [];
		const loopLength = Math.floor(
			(new Date(event.finishingDate).getTime() -
				new Date(event.startingDate).getTime()) /
				(SECONDS_IN_HOUR * HOURS_IN_DAY * MS_IN_SECOND)
		);

		let iterableDate = new Date(event.startingDate);

		styledData.push({
			...metaData,
			id,
			key: `${id}-0`,
			storageId: generateDateId(event.startingDate),
			width: '100%',
			gridRow: `${startingDate.getHours() + 1}/${HOURS_IN_DAY + 1}`,
			gridColumn: `${startingDate.getDay() + 1}`,
			marginTop: `${startingDate.getMinutes()}px`,
			marginBottom: '-10px',
			paddingBottom: '15px',
		});

		if (loopLength > 1) {
			for (let i = 1; i < loopLength; i++) {
				styledData.push({
					...metaData,
					id,
					key: `${id}-${i}`,
					storageId: generateDateId(
						new Date(iterableDate.setDate(iterableDate.getDate() + 1))
					),
					width: '100%',
					gridRow: `${1}/${HOURS_IN_DAY + 1}`,
					gridColumn: `${
						new Date(iterableDate.setDate(iterableDate.getDate())).getDay() + 1
					}`,

					marginTop: '-10px',
					marginBottom: '-10px',
					paddingBottom: '15px',
					paddingTop: '15px',
				});
			}
		}

		styledData.push({
			...metaData,
			id,
			key: `${id}-${loopLength}`,
			storageId: generateDateId(finishingDate),
			width: '100%',
			gridRow: `${1}/${finishingDate.getHours() + 1}`,
			gridColumn: `${finishingDate.getDay() + 1}`,
			marginBottom: `${-finishingDate.getMinutes()}px`,
			marginTop: '-10px',
			paddingTop: '15px',
		});
		return [...styledData];
	} else {
		return [
			{
				...metaData,
				id,
				key: `${id}`,
				storageId: generateDateId(startingDate),
				width: '100%',
				gridRow: `${startingDate.getHours() + 1}/${
					finishingDate.getHours() + 1
				}`,
				gridColumn: `${startingDate.getDay() + 1}`,
				marginTop: `${startingDate.getMinutes()}px`,
				marginBottom: `${-finishingDate.getMinutes()}px`,
			},
		];
	}
};
