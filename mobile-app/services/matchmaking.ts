import { Profile } from "@/types";
import forge from "node-forge";

const backendUrl =  process.env.EXPO_PUBLIC_MATCH_URL || 'https://denver.moosh.gg'

var rsa = forge.pki.rsa;
// Pregenerated testing keypair
const n = new forge.jsbn.BigInteger("23279870195056103910301780594235990532180830393447504809213711769375892073556364957986734788883200340509468659757229938170247881687642110925615296330208156584934956621918894434440231864257976953857544809972618710566595947530792201198091579895943463947294142724083948559972678369327663184307748369627261523560203665339243119718989869365036201251318855250204181927693120931881145711400599912223692881008976927993376066402684967395567956948513741529381599425511191922416839709853826704831503454517434400059929645759724390643400970980863944212385982881527657006219101756337849157495092080818745786730913877709224058491203")
const e = new forge.jsbn.BigInteger("65537")
export const samplePublicKey = rsa.setPublicKey(n, e)

export async function getPublicKey() {
    try {
        const response = await fetch(`${backendUrl}/`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch public key');
        }

        const res = await response.json() as { publicKey: string };

        // Decode Base64-encoded PEM
        const pemString = forge.util.decode64(res.publicKey);

        // Convert PEM to a Forge public key
        const publicKey = forge.pki.publicKeyFromPem(pemString);

        return publicKey;
    } catch (error) {
        console.error('Error fetching public key:', error);
        throw error;
    }
}

interface ConfidentialProfileSet {
    encryptedSymKey: string
    iv: string
    ciphertext: string
}


export function encryptProfiles(publicKey: forge.pki.rsa.PublicKey, profiles: Profile[]) {
    // Key parameter needs to be a PEM or something! Do later
    const message = JSON.stringify(profiles)
    const encodedB64 = forge.util.encode64(message)
    const { ciphertext, symKey, iv } = encryptMessage(encodedB64)
    const encryptedSymKey = publicKey.encrypt(symKey) // RSAES-PKCS1-V1_5 encrypt the symmetric key

    const confidentialProfileSet: ConfidentialProfileSet = {
        encryptedSymKey: forge.util.encode64(encryptedSymKey),
        iv: forge.util.encode64(iv),
        ciphertext: forge.util.encode64(ciphertext)
    }
    // console.log(testDecryptMessage(message, ciphertext, symKey, iv))
    const stringified = JSON.stringify(confidentialProfileSet)
    console.log(stringified)
    return confidentialProfileSet
}

export async function sendMatchmakingProfiles(encryptedProfileSets: ConfidentialProfileSet[]) {
    // encryptedProfileSets each item in array decrypts to Profile[], meaning this data is Profile[][] after decryption
    console.log(backendUrl)
    const res = await fetch(`${backendUrl}/matchmaking`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(encryptedProfileSets)
    })
    if (!res.ok) {
        throw new Error('Matchmaking response was not ok')
    }
    const data = await res.json()
    return data
}

function encryptMessage(message: string) {
    var symKey = forge.random.getBytesSync(16);
    var iv = forge.random.getBytesSync(16);

    var cipher = forge.cipher.createCipher('AES-CBC', symKey);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(message));
    cipher.finish();

    var ciphertext = cipher.output.data;
    return { ciphertext, symKey, iv }
}

function testDecryptMessage(cleartext: string, ciphertext: forge.util.ByteStringBuffer, symKey: string, iv: string) {
    var decipher = forge.cipher.createDecipher('AES-CBC', symKey);
    decipher.start({ iv: iv });
    decipher.update(ciphertext);
    var result = decipher.finish();

    if (!result) {
        console.log("Decryption failed.");
        return false;
    }
    const deciphered = forge.util.decode64(decipher.output.data)
    console.log(deciphered === cleartext);
}