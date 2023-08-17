export const fetchData = (storageKey: string) => {
	const data = localStorage.getItem(storageKey);
	if (data) {
		return JSON.parse(data);
	}
	return null;
};

export const appendData = (storageKey: string, newData: Object) => {
	let prevData = fetchData(storageKey);
	if (!prevData) {
		prevData = [];
	}
	localStorage.setItem(storageKey, JSON.stringify([...prevData, newData]));
};