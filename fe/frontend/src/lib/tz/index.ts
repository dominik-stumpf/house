import { derived, readable } from "svelte/store";

const updateFrequencyMs = 1000;

// source: https://stackoverflow.com/a/74377652
function getTimeZoneOffsetHour(date: Date, timeZone: string) {
	const referenceLocale = "en-US";
	const localizedTime = new Date(
		date.toLocaleString(referenceLocale, { timeZone }),
	);
	const utcTime = new Date(
		date.toLocaleString(referenceLocale, { timeZone: "UTC" }),
	);
	return Math.round((localizedTime.getTime() - utcTime.getTime()) / 60000) / 60;
}

/**
 * get all necessary data for calculating difference between two time zones
 *
 * time: datetime object
 * localTimeZone: time zone adjusted to client location
 *
 * ideal example: `5:32 (3h ahead)` where `5:32` is local (client) time and `3h` is the offset
 * calculated using local and target time zones.
 */
function getTimeZoneOffsetRequisites() {
	const time = readable(new Date(), (set) => {
		set(new Date());
		const interval = setInterval(() => {
			set(new Date());
		}, updateFrequencyMs);

		return () => clearInterval(interval);
	});
	const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	return { time, localTimeZone };
}

interface TimeZoneOffsetMeasurement {
	timeZoneOffsetHour: number;
	targetTime: string;
}

/**
 * measure time zone difference
 */
function measureTimeZoneOffset({
	time,
	targetTimeZone,
	localTimeZone,
}: {
	time: Date;
	targetTimeZone: string;
	localTimeZone: string;
}): TimeZoneOffsetMeasurement {
	const targetOffset = getTimeZoneOffsetHour(time, targetTimeZone);
	const localOffset = getTimeZoneOffsetHour(time, localTimeZone);
	const timeZoneOffsetHour = targetOffset - localOffset;
	const targetTime = time.toLocaleTimeString(undefined, {
		timeZone: targetTimeZone,
	});

	return { timeZoneOffsetHour, targetTime };
}

/**
 * manage offset calculation and return formattable result
 */
function getTimeZoneOffset(targetTimeZone: string) {
	const { time, localTimeZone } = getTimeZoneOffsetRequisites();
	const timeZoneOffsetMeasurement = derived(time, ($time) =>
		measureTimeZoneOffset({ time: $time, targetTimeZone, localTimeZone }),
	);

	return {
		offsetMeasurement: timeZoneOffsetMeasurement,
		targetTimeZone,
		localTimeZone,
		time,
	};
}

const offsetState = {
	SameTimeZone: "SameTimeZone",
	Ahead: "Ahead",
	Behind: "Behind",
} as const;

type OffsetState = keyof typeof offsetState;

function determineTimeZoneOffsetState(timeZoneOffsetHour: number): OffsetState {
	if (timeZoneOffsetHour === 0) {
		return offsetState.SameTimeZone;
	}

	return timeZoneOffsetHour < 0 ? offsetState.Ahead : offsetState.Behind;
}

// TODO: possibly move to trans
function formatPrettyDate(date: Date) {
	// extra Date wrapper is for client and server side compatibility
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export const tz = {
	getTimeZoneOffset,
	determineTimeZoneOffsetState,
	offsetState,
	formatPrettyDate,
};
