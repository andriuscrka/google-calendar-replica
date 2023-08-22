import React from 'react';
import styles from './CalendarHeader.module.css';

import { getToday, getWeekdays } from 'utils/utils';
interface Props {
	gridArea?: string;
	currentWeeklyView: Date;
	onViewChange: Function;
}

const DAYS_IN_WEEK = 7;

const CalendarHeader: React.FC<Props> = (props): JSX.Element => {
	const today = getToday();
	const weekdays = getWeekdays(props.currentWeeklyView);

	const formatDayName = (day: Date) => {
		return day
			.toLocaleString('en-US', {
				weekday: 'short',
			})
			.toUpperCase();
	};

	const handleWeekNavigation = (
		direction: 'forward' | 'backward',
		currentDate: Date
	) => {
		const updatedDate =
			direction === 'forward'
				? new Date(currentDate.setDate(currentDate.getDate() + DAYS_IN_WEEK))
				: new Date(currentDate.setDate(currentDate.getDate() - DAYS_IN_WEEK));

		props.onViewChange(updatedDate);
	};

	const checkIfSameDay = (today: Date, otherDate: Date) => {
		return (
			today.getFullYear() === otherDate.getFullYear() &&
			today.getMonth() === otherDate.getMonth() &&
			today.getDate() === otherDate.getDate()
		);
	};

	return (
		<>
			<div className={styles.headerMisc}>
				<div>
					<button
						className={styles.buttonWeek}
						onClick={() =>
							handleWeekNavigation('backward', props.currentWeeklyView)
						}
					>
						{'<'}
					</button>
					<button
						className={styles.buttonWeek}
						onClick={() =>
							handleWeekNavigation('forward', props.currentWeeklyView)
						}
					>
						{'>'}
					</button>
				</div>
				<span className={styles.headerTimezone}>GMT+03</span>
			</div>
			<>
				{weekdays.map((day: Date, index): JSX.Element => {
					const isToday = checkIfSameDay(today, day);
					return (
						<div className={styles.headerCell} key={index + 123}>
							<span
								className={`${styles.headerCellLetters} ${
									isToday && styles.currentDayLetters
								}`}
							>
								{formatDayName(day)}
							</span>
							<span
								className={`${styles.headerCellNumbers} ${
									isToday && styles.currentDayNumbers
								}`}
							>
								{day.getDate()}
							</span>
						</div>
					);
				})}
			</>
		</>
	);
};

export default CalendarHeader;
