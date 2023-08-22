interface Data {
	title: string;
	id: number;
	startingDate: Date;
	finishingDate: Date;
	startingDateId: string;
	finishingDateId: string;
	storageId?: string;
	description?: string;
}

export const fetchData = (storageKey: string) => {
	const data = localStorage.getItem(storageKey);
	if (data) {
		return JSON.parse(data);
	}
	return null;
};

export const appendData = (storageKey: string, newData: Data) => {
	let prevData = fetchData(storageKey);
	if (!prevData) {
		prevData = [];
	}
	localStorage.setItem(storageKey, JSON.stringify([...prevData, newData]));
};
