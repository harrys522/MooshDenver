type Value = number[];

export interface ProfileWingman {
    id: string;
    name: string;
    desc: string;

    // Stored as base64
    pfp: string;
}

export interface PropertyEntry {
    type: number; // Index into property types array!

    is: Value; // The value the user has.
    prefered: Value;
    notPrefered: Value;

    mustHave: Value;
    cantHave: Value;
}

export interface PropertyType {
    name: string;

    // weight: number;

    canSelectMultiple: boolean;

    validFields?: string[];
    validRange?: number[];
}

export interface Profile {
    firstName: string;
    lastName: string;
    contactEmail: string;

    geolocation: string;
    maxDistance: number;

    properties: PropertyEntry[];

    exclusionList: string[];
    lastModified: Date;
}

export const propertyTypes: PropertyType[] = [
    { name: "Sex", canSelectMultiple: false, validFields: ["Male", "Female"] },
    { name: "Ethnicity", canSelectMultiple: true, validFields: ["White", "Black", "Asian", "Hispanic", "Native American", "Mixed"] },
    { name: "Star sign", canSelectMultiple: false, validFields: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] },
    { name: "Languages", canSelectMultiple: true, validFields: ["English", "Spanish", "Mandarin", "Hindi", "French", "Arabic", "Bengali", "Portuguese", "Russian", "Urdu", "German", "Japanese"] },
    { name: "Personality", canSelectMultiple: false, validFields: ["Introverted", "Extroverted"] },
    { name: "Drug usage", canSelectMultiple: true, validFields: ["Tobacco", "Weed", "Mushrooms"] },
    { name: "Interests", canSelectMultiple: true, validFields: ["Travel", "Sports", "Reading", "Hiking", "Gaming", "Camping", "Crypto"] },
    { name: "Religion", canSelectMultiple: false, validFields: [" Atheist / Agnostic", " Christian", " Jewish"] },
    { name: "Birthday", canSelectMultiple: false, validRange: [-2204107955, 1172486845] },
    { name: "Height (cm)", canSelectMultiple: false, validRange: [50, 280] },
    { name: "Weight (kg)", canSelectMultiple: false, validRange: [30, 400] },
];

export function getProperty(
    profile: Profile,
    propertyName: string,
    propertyTypes: PropertyType[]
): PropertyEntry | undefined {
    // Find the index in the propertyTypes array based on the property name.
    const typeIndex = propertyTypes.findIndex((pt) => pt.name === propertyName);
    if (typeIndex === -1) {
        console.warn(`Property name "${propertyName}" not found in propertyTypes.`);
        return undefined;
    }
    // Look for the corresponding property entry in the profile.
    return profile.properties.find((prop) => prop.type === typeIndex);
}

export function setProperty(
    profile: Profile,
    typeIndex: number,
    propertyEntry: PropertyEntry
): void {
    // Check if there is already an entry for this property type.
    const index = profile.properties.findIndex((prop) => prop.type === typeIndex);
    if (index !== -1) {
        // Update the existing entry.
        profile.properties[index] = propertyEntry;
    } else {
        // Add a new entry if not found.
        profile.properties.push(propertyEntry);
    }
}

export function getSelectedValues(typeIndex: number, selectedIndexes: number[], propertyTypes: PropertyType[]): string[] {
    const validFields = propertyTypes[typeIndex]?.validFields ?? [];
    return selectedIndexes.map(index => validFields[index]).filter(value => value !== undefined);
}
