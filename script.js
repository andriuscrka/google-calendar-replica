'use strict';

const calendarHeaderCells = document.querySelectorAll('.calendar-header--cell');
const calendarTable = document.querySelector('.calendar-table');

const eventModal = document.querySelector('.event-creation--modal');
const eventModalCloseBtn = document.querySelector('.modal-close--button');
const eventModalSaveBtn = document.querySelector('.modal-save--button');

const eventBlobs = document.querySelectorAll('.calendar-event');

/*
 *
 *
 *
 *
 */

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
	hide(event) {
		event.preventDefault();
		this.modal.classList.add('hide');
	}
	toggle() {
		this.modal.classList.toggle('hide');
	}

	onSubmit(e) {
		e.preventDefault();
		let title = document.getElementById('event-title').value.trim();
		let description = document.getElementById('event-description').value.trim();

		let startingDate = document.getElementById('starting-date').value;
		let startingTime = document.getElementById('starting-time').value;
		let finishingTime = document.getElementById('finishing-time').value;
		let finishingDate = document.getElementById('finishing-date').value;

		const combinedStart = new Date(`${startingDate}T${startingTime}`);
		const combinedFinish = new Date(`${finishingDate}T${finishingTime}`);

		const minimalTimeDiff = combinedFinish.getMinutes();

		if (
			title.length > 2 &&
			startingDate &&
			startingTime &&
			finishingTime &&
			finishingDate &&
			combinedStart <= combinedFinish.setMinutes(minimalTimeDiff - 15)
		) {
			console.log('pog');
			event.getModalData(title, description, combinedStart, combinedFinish);
			this.modal.reset();
			this.hide();
		} else {
			console.log('unpog');
		}

		console.log(
			title,
			description,
			startingDate,
			startingTime,
			finishingTime,
			finishingDate
		);
	}
}

/*
 */

class Calendar {
	constructor(table, calendarHeaderCells, callbacks) {
		this.today = this.getToday();
		this.headerCells = calendarHeaderCells;

		this.table = table.addEventListener('click', callbacks.onClick);
		this.initWeek(this.today);
	}

	getToday() {
		return new Date();
	}

	getWeekdays(date = this.today) {
		return Array(7)
			.fill()
			.map((_, index) =>
				new Date(date.setDate(date.getDate() - date.getDay() + index)).getDate()
			);
	}

	initWeek(date = this.today) {
		this.today = new Date();
		this.getWeekOfYear(this.today);
		this.week = this.getWeekdays(date);
		for (let [index, day] of this.headerCells.entries()) {
			day.children[1].textContent = this.week[index];
			if (this.week[index] === this.today.getDate()) {
				day.children[0].classList.add('current-day--letters');
				day.children[1].classList.add('current-day--number');
			}
		}
	}

	getWeekOfYear(date = this.today) {
		const copyDate = new Date(date);
		copyDate.setHours(0, 0, 0, 0);
		const firstDayOfYear = new Date(copyDate.getFullYear(), 0, 1);
		const daysSinceFirstSunday =
			(copyDate - firstDayOfYear) / (24 * 60 * 60 * 1000);

		// Adjust week number if January 1st is not a Sunday
		let weekNumber = Math.floor(daysSinceFirstSunday / 7) + 1;
		if (firstDayOfYear.getDay() !== 0) {
			weekNumber--;
		}

		return weekNumber;
	}

	formatDateToDDMMYY(date) {
		const year = date.getFullYear().slice(2);
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${day}/${month}/${year}`;
	}
}

/*
 */

class Event {
	constructor(eventBlobs, callbacks) {
		this.eventBlobs = eventBlobs;
	}
	generateId() {
		return Date.now();
	}

	getModalData(title, description, startingDate, finishingTime) {
		console.log(startingDate);
	}
}

class Storage {
	constructor() {
		console.log(this.idByDate());
	}

	idByDate(date = calendar.getToday()) {
		return `${calendar.getWeekOfYear(date)}/${date.getFullYear()}`;
	}
}

/*
 *
 *
 *
 *
 */

const modal = new Modal(eventModal, eventModalCloseBtn, eventModalSaveBtn);

const calendar = new Calendar(calendarTable, calendarHeaderCells, {
	onClick() {
		modal.toggle();
	},
});

const event = new Event(eventBlobs, {});

const storage = new Storage();
