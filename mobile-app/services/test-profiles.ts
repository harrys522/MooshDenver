import { Profile, PropertyEntry, propertyTypes } from "@/types";

// Helper function to get the property index
const getPropertyIndex = (propertyName: string, value: string | number | boolean): number[] => {
    const typeIndex = propertyTypes.findIndex((pt) => pt.name === propertyName);
    if (typeIndex === -1) return [];

    const propertyType = propertyTypes[typeIndex];

    if (propertyType.validFields) {
        return Array.isArray(value)
            ? value.map((v) => propertyType.validFields!.indexOf(v)).filter((i) => i !== -1)
            : [propertyType.validFields!.indexOf(value as string)].filter((i) => i !== -1);
    }

    if (propertyType.validRange) {
        return [value as number];
    }

    return [];
};

// Convert raw profiles to match Profile schema
export const profiles: Profile[] = [
    {
        firstName: "Tomas",
        lastName: "Dowd",
        contactEmail: "tdowd@example.com",
        geolocation: "Unknown",
        maxDistance: 50,
        lastModified: new Date(),
        exclusionList: [[32]], // Placeholder, assuming it's used for specific exclusions
        properties: [
            { type: propertyTypes.findIndex((p) => p.name === "Sex"), is: getPropertyIndex("Sex", "male"), prefered: [], notPrefered: [], mustHave: [], cantHave: [] },
            { type: propertyTypes.findIndex((p) => p.name === "Weight (kg)"), is: getPropertyIndex("Weight (kg)", 75), prefered: [], notPrefered: [], mustHave: [], cantHave: [] },
            { type: propertyTypes.findIndex((p) => p.name === "Height (cm)"), is: getPropertyIndex("Height (cm)", 175), prefered: [], notPrefered: [], mustHave: [], cantHave: [] },
            { type: propertyTypes.findIndex((p) => p.name === "Drug usage"), is: getPropertyIndex("Drug usage", "false"), prefered: [], notPrefered: [], mustHave: [], cantHave: [] },
        ],
    },
    {
        firstName: "John",
        lastName: "Doe",
        contactEmail: "jdoe@example.com",
        geolocation: "Unknown",
        maxDistance: 50,
        lastModified: new Date(),
        exclusionList: [[32]],
        properties: [
            { type: propertyTypes.findIndex((p) => p.name === "Sex"), is: getPropertyIndex("Sex", "male"), prefered: [], notPrefered: [], mustHave: [], cantHave: [] },
            { type: propertyTypes.findIndex((p) => p.name === "Weight (kg)"), is: getPropertyIndex("Weight (kg)", 80), prefered: [], notPrefered: [], mustHave: [], cantHave: [] },
            { type: propertyTypes.findIndex((p) => p.name === "Height (cm)"), is: getPropertyIndex("Height (cm)", 180), prefered: [], notPrefered: [], mustHave: [], cantHave: [] },
            { type: propertyTypes.findIndex((p) => p.name === "Drug usage"), is: getPropertyIndex("Drug usage", "true"), prefered: [], notPrefered: [], mustHave: [], cantHave: [] },
        ],
    },
    {
        firstName: "Jane",
        lastName: "Doe",
        contactEmail: "jane@example.com",
        geolocation: "Unknown",
        maxDistance: 50,
        lastModified: new Date(),
        exclusionList: [[32]],
        properties: [
            { type: propertyTypes.findIndex((p) => p.name === "Sex"), is: getPropertyIndex("Sex", "female"), prefered: [], notPrefered: [], mustHave: [], cantHave: [] },
            { type: propertyTypes.findIndex((p) => p.name === "Weight (kg)"), is: getPropertyIndex("Weight (kg)", 65), prefered: [], notPrefered: [], mustHave: [], cantHave: [] },
            { type: propertyTypes.findIndex((p) => p.name === "Height (cm)"), is: getPropertyIndex("Height (cm)", 160), prefered: [], notPrefered: [], mustHave: [], cantHave: [] },
            { type: propertyTypes.findIndex((p) => p.name === "Drug usage"), is: getPropertyIndex("Drug usage", "false"), prefered: [], notPrefered: [], mustHave: [], cantHave: [] },
        ],
    },
];

export default profiles;
