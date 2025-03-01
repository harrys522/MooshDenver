import { Profile } from "@/types";
import forge from "node-forge";
import { icp_profiles } from "./icp-profiles"


var rsa = forge.pki.rsa;
// Pregenerated testing keypair
const n = new forge.jsbn.BigInteger("18036861277620816391897525796053798322654959645852558212187634609687151664374502975936177700603729212751728046566935251857430075890303147890803432834569854432904235128165310149007919395372610577704429938768074221655990424833579901205407828895702305705065286315734737178147842358165229686813150561038320883750989590514294609897445275059675790810486146098459183376283976363803877341257325924274972841950762501669933314127902954711815020230411006388193458124985410395294897051077389059616148677180086598747094542266878697001834285798162791677206671273904388208702765620854218394815604441992434230723383443611634108801467")
const e = new forge.jsbn.BigInteger("65537")
export const samplePublicKey = rsa.setPublicKey(n, e)


export function encryptProfiles(publicKey: forge.pki.rsa.PublicKey, profiles: Profile[]) {
    // Key parameter needs to be a PEM or something! Do later
    const message = JSON.stringify(profiles)
    const encodedB64 = forge.util.encode64(message)
    const { ciphertext, symKey, iv } = encryptMessage(encodedB64)
    const encryptedSymKey = publicKey.encrypt(symKey) // RSAES-PKCS1-V1_5 encrypt the symmetric key

    const confidentialProfileSet = JSON.stringify({
        encryptedSymKey,
        iv,
        ciphertext
    })
    // console.log(testDecryptMessage(message, ciphertext, symKey, iv))
    return confidentialProfileSet
}

export function sendMatchmakingProfiles(encryptedProfileSets: string[]) {
    // encryptedProfileSets each item in array decrypts to Profile[], meaning this data is Profile[][] after decryption
}

function encryptMessage(message: string) {
    var symKey = forge.random.getBytesSync(16);
    var iv = forge.random.getBytesSync(16);

    var cipher = forge.cipher.createCipher('AES-CBC', symKey);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(message));
    cipher.finish();

    var ciphertext = cipher.output;
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