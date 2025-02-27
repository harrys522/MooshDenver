type Value = number[];

interface PropertyEntry {
    type: number; // Index into property types array!

    is: Value; // The value the user has.
    prefered: Value;
    notPrefered: Value;

    mustHave: Value;
    cantHave: Value;
}

interface PropertyType {
    name: string;

    weight: number;

    canSelectMultiple: boolean;

    validFields: string[];
    validRange: number[];
}