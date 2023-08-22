import React from 'react';
import styles from './EventModal.module.css';
import { useFormik } from 'formik';
import { generateDateId, generateId } from 'utils/utils';
import { appendData } from 'utils/apiHelper';
import { useState } from 'react';
interface Props {
	closeModal: Function;
}

const EventModal: React.FC<Props> = (props): JSX.Element => {
	const formik = useFormik({
		initialValues: {
			title: '',
			description: '',
			startingDate: '',
			startingTime: '',
			finishingTime: '',
			finishingDate: '',
		},

		onSubmit: (values) => {
			const {
				title,
				description,
				startingDate,
				startingTime,
				finishingTime,
				finishingDate,
			} = values;

			const combinedStartDate = new Date(`${startingDate}T${startingTime}`);
			const combinedFinishDate = new Date(`${finishingDate}T${finishingTime}`);

			if (
				title.trim().length > 2 &&
				startingDate &&
				startingTime &&
				finishingTime &&
				finishingDate &&
				combinedStartDate <= combinedFinishDate
			) {
				const id = generateId();
				const startingDateId = generateDateId(combinedStartDate);
				const finishingDateId = generateDateId(combinedFinishDate);

				const eventData = {
					id,
					title,
					description,
					startingDate: combinedStartDate,
					finishingDate: combinedFinishDate,
					startingDateId,
					finishingDateId,
				};

				appendData('events', eventData);
				props.closeModal();
			} else {
				!formik.values.title.trim()
					? setTitleError(true)
					: setTitleError(false);
				!formik.values.startingDate
					? setStartingDateError(true)
					: setStartingDateError(false);
				!formik.values.startingTime
					? setStartingTimeError(true)
					: setStartingTimeError(false);
				!formik.values.finishingDate
					? setFinishingDateError(true)
					: setFinishingDateError(false);
				!formik.values.finishingTime
					? setFinishingTimeError(true)
					: setFinishingTimeError(false);
			}
		},
	});

	const [titleError, setTitleError] = useState(false);
	const [startingDateError, setStartingDateError] = useState(false);
	const [startingTimeError, setStartingTimeError] = useState(false);
	const [finishingDateError, setFinishingDateError] = useState(false);
	const [finishingTimeError, setFinishingTimeError] = useState(false);

	const inputMapping = {
		'event-title': 'title',
		'starting-date': 'startingDate',
		'starting-time': 'startingTime',
		'finishing-date': 'finishingDate',
		'finishing-time': 'finishingTime',
	};

	const handleClick = (event) => {
		formik.setFieldTouched(inputMapping[event.target.id]);
	};

	const handleBlur = (event) => {
		formik.handleBlur(event);

		formik.values.title.trim().length < 3
			? setTitleError(true)
			: setTitleError(false);
		!formik.values.startingDate && formik.touched.startingDate
			? setStartingDateError(true)
			: setStartingDateError(false);
		!formik.values.startingTime && formik.touched.startingTime
			? setStartingTimeError(true)
			: setStartingTimeError(false);
		!formik.values.finishingDate && formik.touched.finishingDate
			? setFinishingDateError(true)
			: setFinishingDateError(false);
		!formik.values.finishingTime && formik.touched.finishingTime
			? setFinishingTimeError(true)
			: setFinishingTimeError(false);
	};

	return (
		<form className={styles.modal} onSubmit={formik.handleSubmit}>
			<div className={styles.modalHeader}>
				<button
					className={styles.closeButton}
					aria-label="Close modal button"
					type="button"
					onClick={() => props.closeModal()}
				>
					X
				</button>
			</div>
			<div className={styles.eventCreationWrap}>
				<div className={styles.eventCreationInput}>
					<input
						type="text"
						name="title"
						aria-label="Add event title"
						placeholder="Add title"
						id="event-title"
						className={`${styles.mandatoryInput}
							${titleError && styles.error}
						`}
						value={formik.values.title}
						onClick={handleClick}
						onChange={formik.handleChange}
						onBlur={handleBlur}
					/>
				</div>
				<div className={styles.eventCreationTime}>
					<label htmlFor="starting-date" className="hide-visibility">
						Starting date
					</label>
					<input
						type="date"
						name="startingDate"
						id="starting-date"
						className={`${styles.mandatoryInput}
							${startingDateError && styles.error}
						`}
						value={formik.values.startingDate}
						onClick={handleClick}
						onChange={formik.handleChange}
						onBlur={handleBlur}
					/>
					<label htmlFor="starting-time" className="hide-visibility">
						Starting time
					</label>
					<input
						type="time"
						name="startingTime"
						id="starting-time"
						className={`${styles.mandatoryInput}
							${startingTimeError && styles.error}
						`}
						value={formik.values.startingTime}
						onClick={handleClick}
						onChange={formik.handleChange}
						onBlur={handleBlur}
					/>
					<div aria-label="until">-</div>
					<label htmlFor="finishing-time" className="hide-visibility">
						Finishing time
					</label>
					<input
						type="time"
						name="finishingTime"
						id="finishing-time"
						className={`${styles.mandatoryInput}
							${finishingTimeError && styles.error}
						`}
						value={formik.values.finishingTime}
						onClick={handleClick}
						onChange={formik.handleChange}
						onBlur={handleBlur}
					/>
					<label htmlFor="finishing-date" className="hide-visibility">
						Finishing date
					</label>
					<input
						type="date"
						name="finishingDate"
						id="finishing-date"
						className={`${styles.mandatoryInput}
							${finishingDateError && styles.error}
						`}
						value={formik.values.finishingDate}
						onClick={handleClick}
						onChange={formik.handleChange}
						onBlur={handleBlur}
					/>
				</div>
				<textarea
					name="description"
					id="event-description"
					className={styles.eventCreationDescription}
					placeholder="Description of the meeting"
					value={formik.values.description}
					onClick={handleClick}
					onChange={formik.handleChange}
					onBlur={handleBlur}
				></textarea>
				<div className={styles.eventCreationButtons}>
					<button type="submit" className={styles.saveButton}>
						Save
					</button>
				</div>
			</div>
		</form>
	);
};

export default EventModal;
