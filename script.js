'use strict';

const calendarHeaderCells = document.querySelectorAll('.calendar-header--cell');
const calendarTable = document.querySelector('.calendar-table');

const weekBackBtn = document.querySelector('.button-week--back');
const weekForwardBtn = document.querySelector('.button-week--forward');

const eventModal = document.querySelector('.event-creation--modal');
const eventModalCloseBtn = document.querySelector('.modal-close--button');
const eventModalSaveBtn = document.querySelector('.modal-save--button');

const eventBlobs = document.querySelectorAll('.calendar-event');

const mandatoryInputs = document.querySelectorAll('.mandatory-input');
/*
 *
 *
 *
 *
 */

class Utils {
	constructor() {}

	generateId() {
		return Date.now();
	}

	generateDateId(date = new Date()) {
		return `${this.getWeekOfYear(date)}/${new Date(date).getFullYear()}`;
	}

	getWeekOfYear(date = new Date()) {
		const copyDate = new Date(date);
		copyDate.setHours(0, 0, 0, 0);
		const firstDayOfYear = new Date(copyDate.getFullYear(), 0, 0);
		const firstSundayOffset = (7 - firstDayOfYear.getDay()) % 7;
		const firstSundayOfYear = new Date(firstDayOfYear);
		firstSundayOfYear.setDate(firstDayOfYear.getDate() + firstSundayOffset);

		if (copyDate < firstSundayOfYear) {
			return 1; // It's still part of the first week of the year
		}

		const daysSinceFirstSunday =
			(copyDate - firstDayOfYear) / (24 * 60 * 60 * 1000);

		// Adjust week number if January 1st is not a Sunday
		let weekNumber = Math.floor(daysSinceFirstSunday / 7) + 1;
		// if (firstDayOfYear.getDay() !== 0) {
		// 	weekNumber--;
		// }

		return weekNumber;
	}
}

class Modal {
	constructor(modal, closeBtn, saveBtn, callbacks) {
		this.modal = modal;
		this.closeBtn = closeBtn;
		this.saveBtn = saveBtn;

		this.modal.addEventListener('submit', (event) => this.onSubmit(event));
		this.closeBtn.addEventListener('click', (event) => this.hide(event));
		this.saveBtn.addEventListener('submit', (event) => event.preventDefault());
	}
	open(eventBlobId) {
		this.modal.classList.remove('hide');
	}
	hide() {
		this.modal.classList.add('hide');
	}
	toggle() {
		this.modal.classList.toggle('hide');
	}
	onSubmit(event) {
		event.preventDefault();
		let title = document.getElementById('event-title').value.trim();
		let description = document.getElementById('event-description').value.trim();

		let startingDate = document.getElementById('starting-date').value;
		let startingTime = document.getElementById('starting-time').value;
		let finishingTime = document.getElementById('finishing-time').value;
		let finishingDate = document.getElementById('finishing-date').value;

		const combinedStart = new Date(`${startingDate}T${startingTime}`);
		const combinedFinish = new Date(`${finishingDate}T${finishingTime}`);

		if (
			title.length > 2 &&
			startingDate &&
			startingTime &&
			finishingTime &&
			finishingDate &&
			combinedStart <= combinedFinish
		) {
			console.log('pog');
			calendar.getModalData(title, description, combinedStart, combinedFinish);
			this.modal.reset();
			this.hide();
			setTimeout(() => {
				storage.getData().then((data) => {
					calendar.renderEvents(
						data,
						utils.generateDateId(calendar.currentView)
					);
				});
			}, 100);
		} else {
			mandatoryInputs.forEach((input) => {
				if (!input.value) {
					input.style.color = 'red';
				} else {
					input.style.color = 'black';
				}
			});
		}
	}
}

/*
 */

class Storage {
	constructor() {}

	async setData(data) {
		let prevData = await this.getData();
		if (prevData === null) {
			prevData = [];
		}
		localStorage.setItem('events', JSON.stringify([...prevData, data]));
	}

	async getData() {
		const data = await Promise.resolve(localStorage.getItem('events'));
		return JSON.parse(data);
	}
}

/*
 */

class Calendar {
	constructor(table, calendarHeaderCells, callbacks) {
		this.today = this.getToday();
		this.currentView = this.today;
		this.headerCells = calendarHeaderCells;

		this.table = table.addEventListener('click', callbacks.onClick);
		this.initWeek(this.today);
		storage.getData().then((data) => {
			this.renderEvents(data);
		});

		this.weekBackButton = weekBackBtn.addEventListener('click', () => {
			this.currentView = new Date(
				this.currentView.setDate(this.currentView.getDate() - 7)
			);
			this.initWeek(this.currentView);
			storage.getData().then((data) => {
				this.renderEvents(data, utils.generateDateId(this.currentView));
			});
		});

		this.weekForwardButton = weekForwardBtn.addEventListener('click', () => {
			this.currentView = new Date(
				this.currentView.setDate(this.currentView.getDate() + 7)
			);
			this.initWeek(this.currentView);
			storage.getData().then((data) => {
				this.renderEvents(data, utils.generateDateId(this.currentView));
			});
		});
	}

	getToday() {
		return new Date();
	}

	getWeekdays(date = this.today) {
		return Array(7)
			.fill()
			.map(
				(_, index) =>
					new Date(date.setDate(date.getDate() - date.getDay() + index))
			);
	}

	initWeek(date = this.today) {
		this.today = new Date();
		utils.getWeekOfYear(this.today);
		this.week = this.getWeekdays(date);
		for (let [index, day] of this.headerCells.entries()) {
			day.children[1].textContent = this.week[index].getDate();
			if (
				this.week[index].getFullYear() === this.today.getFullYear() &&
				this.week[index].getMonth() === this.today.getMonth() &&
				this.week[index].getDate() === this.today.getDate()
			) {
				day.children[0].classList.add('current-day--letters');
				day.children[1].classList.add('current-day--number');
			} else {
				day.children[0].classList.remove('current-day--letters');
				day.children[1].classList.remove('current-day--number');
			}
		}
	}

	formatDateToDDMMYY(date) {
		const year = new Date(date).getFullYear();
		const month = String(new Date(date).getMonth() + 1).padStart(2, '0');
		const day = String(new Date(date).getDate()).padStart(2, '0');

		return `${day}/${month}/${year}`;
	}

	/*
	 */

	getModalData(title, description, startingDate, finishingDate) {
		setTimeout(100);
		const id = utils.generateId();

		storage.setData({
			id,
			title,
			description,
			startingDateId: utils.generateDateId(startingDate),
			finishingDateId: utils.generateDateId(finishingDate),
			startingDate: startingDate,
			finishingDate: finishingDate,
		});
	}

	calculateStyles(data) {
		console.log(data);
		const overlapping =
			this.formatDateToDDMMYY(data.startingDate) !==
			this.formatDateToDDMMYY(data.finishingDate);
		const metaData = {
			title: data.title,
			description: data.description,
			startingDate: data.startingDate,
			finishingDate: data.finishingDate,
			overlapping,
		};

		if (overlapping) {
			const blobArray = [];
			const loopLength = Math.floor(
				(new Date(data.finishingDate) - new Date(data.startingDate)) /
					(3600 * 24 * 1000)
			);

			let iterableDate = new Date(data.startingDate);

			console.log(data);

			blobArray.push({
				...metaData,
				id: data.id,
				blobId: `${data.id}-0`,
				storageId: utils.generateDateId(data.startingDate),
				width: '100%',
				gridRow: `${new Date(data.startingDate).getHours() + 1}/${25}`,
				gridColumn: `${new Date(data.startingDate).getDay() + 1}`,
				marginTop: `${new Date(data.startingDate).getMinutes()}px`,
				marginBottom: '-10px',
				paddingBottom: '15px',
			});

			if (loopLength > 2) {
				for (let i = 1; i < loopLength; i++) {
					blobArray.push({
						...metaData,
						id: data.id,
						blobId: `${data.id}-${i}`,
						storageId: utils.generateDateId(
							iterableDate.setDate(iterableDate.getDate() + 1)
						),
						width: '100%',
						gridRow: `${1}/${25}`,
						gridColumn: new Date(
							iterableDate.setDate(iterableDate.getDate())
						).getDay(),

						marginTop: '-10px',
						marginBottom: '-10px',
						paddingBottom: '15px',
						paddingTop: '15px',
					});
				}
			}
			blobArray.push({
				...metaData,
				id: data.id,
				blobId: `${data.id}-${loopLength}`,
				storageId: utils.generateDateId(data.finishingDate),
				width: '100%',
				gridRow: `${1}/${new Date(data.finishingDate).getHours() + 1}`,
				gridColumn: `${new Date(data.finishingDate).getDay() + 1}`,
				marginBottom: `${-new Date(data.finishingDate).getMinutes()}px`,
				marginTop: '-10px',
				paddingTop: '15px',
			});

			//console.log(blobArray);
			return [...blobArray];
		} else {
			return [
				{
					...metaData,
					id: data.id,
					blobId: `${data.id}`,
					storageId: utils.generateDateId(data.startingDate),
					width: '100%',
					gridRow: `${new Date(data.startingDate).getHours() + 1}/${
						new Date(data.finishingDate).getHours() + 1
					}`,
					gridColumn: `${new Date(data.startingDate).getDay() + 1}`,
					marginTop: `${new Date(data.startingDate).getMinutes()}px`,
					marginBottom: `${-new Date(data.finishingDate).getMinutes()}px`,
				},
			];
		}
	}

	renderEvents(data, dateId = utils.generateDateId(this.getToday())) {
		calendarTable.innerHTML = '';

		if (data) {
			console.log(data);
			data = data.filter(
				(event) =>
					event.startingDateId === dateId || event.finishingDateId === dateId
			);
			data = data.map((event) => this.calculateStyles(event));
			data = data.flat();
			data = data.filter((blob) => {
				return blob.storageId.localeCompare(dateId) === 0;
			});

			data.map((blob) => {
				console.log(blob);
				calendarTable.insertAdjacentHTML(
					'beforeend',
					`<div class="calendar-event ${blob.blobId}">
							<span class="calendar-event--title">${blob.title},</span>
							<span class="calendar-event--time">${
								blob.overlapping
									? `${new Date(blob.startingDate).toLocaleString('en-US', {
											month: 'short',
									  })} ${new Date(blob.startingDate).getDate()}, `
									: ''
							}${String(new Date(blob.startingDate).getHours()).padStart(
						2,
						'0'
					)}:${String(new Date(blob.startingDate).getMinutes()).padStart(
						2,
						'0'
					)} - ${String(new Date(blob.finishingDate).getHours()).padStart(
						2,
						'0'
					)}:${String(new Date(blob.finishingDate).getMinutes()).padStart(
						2,
						'0'
					)}${
						blob.overlapping
							? `, ${new Date(blob.finishingDate).toLocaleString('en-US', {
									month: 'short',
							  })} ${new Date(blob.finishingDate).getDate()}`
							: ''
					} </span>
							<p class="calendar-event--description">
								${blob.description}
							</p>
					</div>`
				);

				let temp = calendarTable.lastElementChild;

				temp.style.gridColumn = blob.gridColumn;
				temp.style.gridRow = blob.gridRow;
				temp.style.marginTop = blob.marginTop;
				temp.style.marginBottom = blob.marginBottom;
				temp.style.paddingTop = blob.paddingTop;
				temp.style.paddingBottom = blob.paddingBottom;
			});
		}
	}
}

/*
 *
 *
 *
 *
 */

const utils = new Utils();

const modal = new Modal(eventModal, eventModalCloseBtn, eventModalSaveBtn);

const storage = new Storage();

const calendar = new Calendar(calendarTable, calendarHeaderCells, {
	onClick() {
		modal.toggle();
	},
});
