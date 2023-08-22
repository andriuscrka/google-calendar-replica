'use strict';

//@ts-nocheck

const calendarHeaderCells: NodeListOf<HTMLDivElement> =
	document.querySelectorAll('.calendar-header--cell')!;
const calendarTable =
	document.querySelector<HTMLDivElement>('.calendar-table')!;
const weekBackBtn =
	document.querySelector<HTMLButtonElement>('.button-week--back');
const weekForwardBtn = document.querySelector<HTMLButtonElement>(
	'.button-week--forward'
);
const eventModal = document.querySelector<HTMLFormElement>(
	'.event-creation--modal'
);
const eventModalCloseBtn = document.querySelector<HTMLButtonElement>(
	'.modal-close--button'
);
const eventModalSaveBtn = document.querySelector<HTMLButtonElement>(
	'.modal-save--button'
);
const eventBlobs = document.querySelectorAll<HTMLDivElement>('.calendar-event');
const mandatoryInputs =
	document.querySelectorAll<HTMLInputElement>('.mandatory-input');

class Utils {
	constructor() {}

	generateId(): number {
		return Date.now();
	}

	generateDateId(date = new Date()): string {
		date = new Date(date);
		return `${this.getWeekOfYear(date)}/${date.getFullYear()}`;
	}

	getWeekOfYear(date: Date = new Date()): number {
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
	}
}

class Modal {
	modal: HTMLFormElement;
	closeBtn: HTMLButtonElement;
	saveBtn: HTMLButtonElement;

	constructor(
		modal: HTMLFormElement,
		closeBtn: HTMLButtonElement,
		saveBtn: HTMLButtonElement
	) {
		this.modal = modal;
		this.closeBtn = closeBtn;
		this.saveBtn = saveBtn;

		this.modal.addEventListener('submit', (event: Event): void =>
			this.onSubmit(event)
		);
		this.closeBtn.addEventListener('click', (): void => this.hide());
	}

	open(): void {
		this.modal.classList.remove('hide');
	}
	hide(): void {
		this.modal.classList.add('hide');
	}
	toggle(): void {
		this.modal.classList.toggle('hide');
	}
	onSubmit(event: Event): void {
		event.preventDefault();

		let title = (
			document.getElementById('event-title') as HTMLInputElement
		).value.trim();
		let description = (
			document.getElementById('event-description') as HTMLInputElement
		).value.trim();
		let startingDate = (
			document.getElementById('starting-date') as HTMLInputElement
		).value;
		let startingTime = (
			document.getElementById('starting-time') as HTMLInputElement
		).value;
		let finishingTime = (
			document.getElementById('finishing-time') as HTMLInputElement
		).value;
		let finishingDate = (
			document.getElementById('finishing-date') as HTMLInputElement
		).value;

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
			calendar.getModalData(title, description, combinedStart, combinedFinish);
			this.modal.reset();
			this.hide();
			setTimeout((): void => {
				storage.getData().then((data): void => {
					data?.map((event): void => {
						event.startingDate = new Date(event.startingDate);
						event.finishingDate = new Date(event.finishingDate);
					});
					calendar.renderEvents(
						data!,
						utils.generateDateId(calendar.currentView)
					);
				});
			}, 100);
		} else {
			for (const input of Array.from(mandatoryInputs)) {
				if (input instanceof HTMLInputElement) {
					if (!input.value) {
						input.style.color = 'red';
					} else {
						input.style.color = 'black';
					}
				}
			}
		}
	}
}

class CalendarStorage {
	constructor() {}

	async setData(data: Object): Promise<void> {
		let prevData = await this.getData();
		if (prevData === null) {
			prevData = [];
		}
		localStorage.setItem('events', JSON.stringify([...prevData, data]));
	}

	async getData(): Promise<null | Array<Data>> {
		const data = localStorage.getItem('events');
		const parsedData = JSON.parse(data!);
		return data ? parsedData : data;
	}
}

interface Data {
	title: string;
	id: string;
	storageId?: string;
	description?: string;
	startingDate: Date;
	finishingDate: Date;
	startingDateId?: string;
	finishingDateId?: string;
}

interface StyledData extends Data {
	blobId?: string;
	width?: string;
	gridRow?: string;
	gridColumn?: string;
	marginTop?: string;
	marginBottom?: string;
	paddingBottom?: string;
	paddingTop?: string;
	overlapping?: boolean;
}

class Calendar {
	today: Date;
	currentView: Date;
	week: Date[] = [];
	headerCells;
	table;
	weekBackButton;
	weekForwardButton;

	constructor(
		table: HTMLDivElement,
		calendarHeaderCells: NodeListOf<HTMLDivElement>
	) {
		this.today = this.getToday();
		this.currentView = this.today;
		this.headerCells = calendarHeaderCells;

		this.table = table.addEventListener('click', (): void => modal.toggle());
		this.initWeek(this.today);
		storage.getData().then((data): void => {
			data?.map((event): void => {
				event.startingDate = new Date(event.startingDate);
				event.finishingDate = new Date(event.finishingDate);
			});
			//console.log(calendar.currentView);
			this.renderEvents(data!);
		});

		this.weekBackButton = weekBackBtn?.addEventListener('click', (): void => {
			this.currentView = new Date(
				this.currentView.setDate(this.currentView.getDate() - 7)
			);
			this.initWeek(this.currentView);
			storage.getData().then((data): void => {
				data?.map((event): void => {
					event.startingDate = new Date(event.startingDate);
					event.finishingDate = new Date(event.finishingDate);
				});
				this.renderEvents(data!, utils.generateDateId(calendar.currentView));
			});
		});

		this.weekForwardButton = weekForwardBtn?.addEventListener(
			'click',
			(): void => {
				this.currentView = new Date(
					this.currentView.setDate(this.currentView.getDate() + 7)
				);
				this.initWeek(this.currentView);
				storage.getData().then((data): void => {
					data?.map((event): void => {
						event.startingDate = new Date(event.startingDate);
						event.finishingDate = new Date(event.finishingDate);
					});
					this.renderEvents(data!, utils.generateDateId(calendar.currentView));
				});
			}
		);
	}

	getToday(): Date {
		return new Date();
	}

	getWeekdays(date = this.today): Date[] {
		return Array(7)
			.fill('')
			.map(
				(_, index): Date =>
					new Date(date.setDate(date.getDate() - date.getDay() + index))
			);
	}

	initWeek(date = this.today): void {
		this.today = new Date();
		utils.getWeekOfYear(this.today);
		this.week = this.getWeekdays(date);
		for (let [index, day] of this.headerCells.entries()) {
			day.children[1].textContent = this.week[index].getDate().toString();
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

	formatDateToDDMMYY(date: Date): string {
		date = new Date(date);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${day}/${month}/${year}`;
	}

	getModalData(
		title: string,
		description: string,
		startingDate: Date,
		finishingDate: Date
	): void {
		setTimeout((): void => {
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
		}, 100);
	}

	calculateStyles(data: Data): StyledData | StyledData[] {
		//console.log(data);
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
				(new Date(data.finishingDate).getTime() -
					new Date(data.startingDate).getTime()) /
					(3600 * 24 * 1000)
			);

			let iterableDate = data.startingDate;

			//console.log(data);

			blobArray.push({
				...metaData,
				id: data.id,
				blobId: `${data.id}-0`,
				storageId: utils.generateDateId(data.startingDate),
				width: '100%',
				gridRow: `${data.startingDate.getHours() + 1}/${25}`,
				gridColumn: `${data.startingDate.getDay() + 1}`,
				marginTop: `${data.startingDate.getMinutes()}px`,
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
							new Date(iterableDate.setDate(iterableDate.getDate() + 1))
						),
						width: '100%',
						gridRow: `${1}/${25}`,
						gridColumn: `${new Date(
							iterableDate.setDate(iterableDate.getDate())
						).getDay()}`,

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
				gridRow: `${1}/${data.finishingDate.getHours() + 1}`,
				gridColumn: `${data.finishingDate.getDay() + 1}`,
				marginBottom: `${-data.finishingDate.getMinutes()}px`,
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
					gridRow: `${data.startingDate.getHours() + 1}/${
						data.finishingDate.getHours() + 1
					}`,
					gridColumn: `${data.startingDate.getDay() + 1}`,
					marginTop: `${data.startingDate.getMinutes()}px`,
					marginBottom: `${-data.finishingDate.getMinutes()}px`,
				},
			];
		}
	}

	renderEvents(
		data: Data[],
		dateId = utils.generateDateId(this.getToday())
	): void {
		calendarTable.innerHTML = '';
		if (data) {
			//console.log(data);
			data = data.filter(
				(event): boolean =>
					event.startingDateId === dateId || event.finishingDateId === dateId
			);
			data = data
				.map((event): StyledData | StyledData[] => this.calculateStyles(event))
				.flat();
			data = data.filter((blob): boolean => {
				return blob.storageId!.localeCompare(dateId) === 0;
			});

			data.map((blob: StyledData): void => {
				//console.log(blob);
				calendarTable!.insertAdjacentHTML(
					'beforeend',
					`<div class="calendar-event ${blob.blobId}">
							<span class="calendar-event--title">${blob.title},</span>
							<span class="calendar-event--time">${
								blob.overlapping
									? `${blob.startingDate.toLocaleString('en-US', {
											month: 'short',
									  })} ${blob.startingDate.getDate()}, `
									: ''
							}${String(blob.startingDate.getHours()).padStart(
						2,
						'0'
					)}:${String(blob.startingDate.getMinutes()).padStart(
						2,
						'0'
					)} - ${String(blob.finishingDate.getHours()).padStart(
						2,
						'0'
					)}:${String(blob.finishingDate.getMinutes()).padStart(2, '0')}${
						blob.overlapping
							? `, ${blob.finishingDate.toLocaleString('en-US', {
									month: 'short',
							  })} ${blob.finishingDate.getDate()}`
							: ''
					} </span>
							<p class="calendar-event--description">
								${blob.description}
							</p>
					</div>`
				);

				let temp = calendarTable.lastElementChild as HTMLDivElement;

				if (temp) {
					if (blob.gridColumn) {
						temp.style.gridColumn = blob.gridColumn;
					}
					if (blob.gridRow) {
						temp.style.gridRow = blob.gridRow;
					}
					if (blob.marginTop) {
						temp.style.marginTop = blob.marginTop;
					}
					if (blob.marginBottom) {
						temp.style.marginBottom = blob.marginBottom;
					}
					if (blob.paddingTop) {
						temp.style.paddingTop = blob.paddingTop;
					}
					if (blob.paddingBottom) {
						temp.style.paddingBottom = blob.paddingBottom;
					}
				}
			});
		}
	}
}

const utils = new Utils();

const modal = new Modal(eventModal!, eventModalCloseBtn!, eventModalSaveBtn!);

const storage = new CalendarStorage();

const calendar = new Calendar(calendarTable, calendarHeaderCells);
