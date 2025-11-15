import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";

import { getBlockedTimeslotsCollectionPath } from "@/types/blockedTimeslot";
import { createConverter } from "@/firebase/converterFactory";
import type { BlockedTimeslot, BlockedTimeslotWriteData } from "@/types/blockedTimeslot";

interface TimeslotInput {
	date: string; // DD-MM-YYYY format
	time: string; // HH:MM format
	duration: string; // e.g., "90 mins"
	description: string;
}

/**
 * Converts date from DD-MM-YYYY to YYYY-MM-DD format
 */
function convertDate(dateStr: string): string {
	const [day, month, year] = dateStr.split("-");
	if (!day || !month || !year) {
		throw new Error(`Invalid date format: ${dateStr}. Expected DD-MM-YYYY`);
	}
	return `${year}-${month}-${day}`;
}

/**
 * Extracts duration in minutes from a string like "90 mins" or "30 mins"
 */
function extractDurationMinutes(durationStr: string): number {
	const match = durationStr.match(/(\d+)\s*mins?/i);
	if (!match) {
		throw new Error(`Invalid duration format: ${durationStr}. Expected format like "90 mins"`);
	}
	return parseInt(match[1], 10);
}

/**
 * Inserts blocked timeslots into Firestore
 */
async function insertBlockedTimeslots() {
	const timeslots: TimeslotInput[] = [
		{
			date: "17-11-2025",
			time: "11:30",
			duration: "90 mins",
			description: "Arm/handfunctie",
		},
		{
			date: "17-11-2025",
			time: "16:00",
			duration: "30 mins",
			description: "Fysiotherapie",
		},
		{
			date: "18-11-2025",
			time: "10:30",
			duration: "30 mins",
			description: "Ergotherapie",
		},
		{
			date: "18-11-2025",
			time: "14:30",
			duration: "60 mins",
			description: "Beweeggrorep",
		},
        {
            date: "20-11-2025",
            time: "11:30",
            duration: "30 mins",
            description: "Arm/handfunctie",
        },
        {
            date: "21-11-2025",
            time: "09:15",
            duration: "30 mins",
            description: "Fysiotherapie",
        },
        {
            date: "21-11-2025",
            time: "14:30",
            duration: "60 mins",
            description: "Beweeggroep",
        }
	];

	// Initialize Firebase with environment variables (Node.js script uses process.env)
	const firebaseConfig = {
		apiKey: process.env.VITE_FIREBASE_API_KEY,
		authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
		projectId: process.env.VITE_FIREBASE_PROJECT_ID,
		appId: process.env.VITE_FIREBASE_APP_ID,
	};

	const missingKeys = Object.entries(firebaseConfig)
		.filter(([, value]) => typeof value === "undefined" || value === "")
		.map(([key]) => key);

	if (missingKeys.length > 0) {
		throw new Error(
			`Firebase configuration is missing values for: ${missingKeys.join(", ")}. ` +
				"Please check your .env file.",
		);
	}

	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);

	// Authenticate anonymously
	console.log("Authenticating with Firebase...");
	await signInAnonymously(auth);
	console.log("✓ Authenticated\n");

	// Get Firestore collection
	const firestore = getFirestore(app);
	const converter = createConverter<BlockedTimeslot, BlockedTimeslotWriteData>();
	const blockedTimeslotsCollection = collection(firestore, getBlockedTimeslotsCollectionPath()).withConverter(converter);

	console.log(`Inserting ${timeslots.length} blocked timeslots...\n`);

	for (const timeslot of timeslots) {
		try {
			const writeData: BlockedTimeslotWriteData = {
				date: convertDate(timeslot.date),
				time: timeslot.time,
				durationMinutes: extractDurationMinutes(timeslot.duration),
				message: timeslot.description,
			};

			const docRef = await addDoc(blockedTimeslotsCollection, writeData);
			console.log(
				`✓ Inserted: ${timeslot.date} ${timeslot.time} (${timeslot.duration}) - ${timeslot.description} [ID: ${docRef.id}]`,
			);
		} catch (error) {
			console.error(
				`✗ Failed to insert ${timeslot.date} ${timeslot.time}:`,
				error instanceof Error ? error.message : error,
			);
		}
	}

	console.log("\nDone!");
}

// Run the script
insertBlockedTimeslots().catch((error) => {
	console.error("Script failed:", error);
	process.exit(1);
});

