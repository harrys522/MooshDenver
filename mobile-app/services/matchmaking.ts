import { Match, Profile } from "@/types";
import forge from "node-forge";

const backendUrl = process.env.EXPO_PUBLIC_MATCH_URL || 'https://denver.moosh.gg'

var rsa = forge.pki.rsa;
// Pregenerated testing keypair
const n = new forge.jsbn.BigInteger("26607019847643504227038942340374771522397299026124957765764803722465757351536916069344855179140842023510151842132292362738932639301533454149563922989028287984048079519136452651594081054906665929511692801877929596879886601395913844712674173729430806542157894859391008724147219814740580843128210513570121952054779000293616783353125244473489675143079715456767111358271646378472101339170577242626840216687950355683172851512026544078282200656916693096539947294887007693398035758834211762782385428623849987030064903267091721255586873112295217030099014490196154828130976219193236853889003453838908125019748343037562678790689")
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
    const data = await res.json() as Match[]
    return data
}

function encryptMessage(message: string) {
    var symKey = forge.random.getBytesSync(16);
    var iv = forge.random.getBytesSync(16);

    var cipher = forge.cipher.createCipher('AES-CBC', symKey);
    cipher.start({ iv: iv });
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
