import vocabulary from "../../content/vocabulary.json";

export { vocabulary };

export const site = {
	url: "https://insidethetriangles.com",
	name: "Inside The Triangles",
	description: "Thoughts, stories and poems about Ma Adya Mahakali and Bhairava",
	author: "KaliPutra_AshishKapoor",
};

export type DeityKey = keyof typeof vocabulary.deities;
export type FormKey = keyof typeof vocabulary.forms;

export const deityKeys = Object.keys(vocabulary.deities) as DeityKey[];
export const formKeys = Object.keys(vocabulary.forms) as FormKey[];

export const deityName = (key: string) => vocabulary.deities[key as DeityKey]?.name ?? key;
export const deityDev = (key: string) => vocabulary.deities[key as DeityKey]?.dev ?? "";
export const formName = (key: string) => vocabulary.forms[key as FormKey]?.name ?? key;
