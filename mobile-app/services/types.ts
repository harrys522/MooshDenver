

// Want a 
//

export type Fixer = {
    name: string;
    desc: string;
    id: string; // Public id on the chain
    picture: string; // Base64 picture of fixer
}

export type LocalData = {

}



export type Value = number[];

export type PropertyEntry = {
    type: number; // Index into property types array!

    is: Value; // The value the user has.
    prefered: Value;
    notPrefered: Value;

    mustHave: Value;
    cantHave: Value;
};

export type PropertyType = {
    name: string;
    weight: number;
    canSelectMultiple: boolean;
    validFields: string[];
    validRange: number[];
};

export type Profile = {
    // Basic info:
    firstName: string;
    lastName: string;
    contactEmail: string;

    geolocation: string;
    // Max km
    maxDistance: number;

    // Will be ordered by
    properties: PropertyEntry[];

    exclusionList: string[];
    lastModified: Date;
};

export type PublicProfile = {
    firstName: string;
    lastInitial: string;
    contactEmail: string;
    properties: PropertyEntry[];
};

export type Match = {
    // Two profiles
    profiles: PublicProfile[];
    score: number;
};
