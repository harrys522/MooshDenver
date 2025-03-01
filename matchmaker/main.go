package main

import (
	// "crypto/aes"
	// "crypto/cipher"
	// "crypto/rand"
	"github.com/edgelesssys/ego/enclave"

	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"crypto/sha256"
	"fmt"
	"time"
)

type Value []int

type PropertyEntry struct {
	Type int `json:"type"` // Index into property types array!

	Is          Value `json:"is"` // The value the user has.
	Prefered    Value `json:"prefered"`
	NotPrefered Value `json:"notPrefered"`

	MustHave Value `json:"mustHave"`
	CantHave Value `json:"cantHave"`
}

type PropertyType struct {
	Name string `json:"name"`

	Weight int `json:"weight"`

	CanSelectMultiple bool `json:"canSelectMultiple"`

	ValidFields []string `json:"validFields"`
	ValidRange  []int    `json:"validRange"`
}

type Profile struct {
	// Basic info:
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
	ContactEmail string `json:"contactEmail"`

	Geolocation string `json:"geolocation"`
	// Max km
	MaxDistance float32 `json:"maxDistance"`

	// Will be ordered by
	Properties []PropertyEntry `json:"properties"`

	// Exclude other people based on id hash.
	ExclusionList [][32]byte `json:"exclusionList"`
	LastModified  time.Time  `json:"lastModified"`
}

type PublicProfile struct {
	FirstName    string `json:"firstName"`
	LastInitial  string `json:"lastInitial"`
	ContactEmail string `json:"contactEmail"`

	Properties []PropertyEntry `json:"properties"`
}

type Match struct {
	// Two profiles
	Profiles []PublicProfile `json:"profiles"`
	Score    int             `json:"score"`
}

type ConfidentialProfileSet struct {
	EncryptedSymKey string `json:"encryptedSymKey"`
	Iv              string `json:"iv"`
	Ciphertext      string `json:"ciphertext"`
}

var PropertyTypes = []PropertyType{
	{"Sex", 10_000, false, []string{"Male", "Female"}, nil},
	{"Ethnicity", 10, true, []string{"White", "Black", "Asian", "Hispanic", "Native American", "Mixed"}, nil},
	{"Star sign", 10, false, []string{"Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"}, nil},
	{"Languages", 10, true, []string{"English", "Spanish", "Mandarin", "Hindi", "French", "Arabic", "Bengali", "Portuguese", "Russian", "Urdu", "German", "Japanese"}, nil},
	{"Personality", 10, true, []string{"Introverted", "Extroverted"}, nil},
	{"Drug usage", 10, true, []string{"Tobacco", "Weed", "Mushrooms"}, nil},
	{"Interests", 10, true, []string{"Travel", "Sports", "Reading", "Hiking", "Gaming", "Camping", "Crypto"}, nil},
	{"Religion", 10, true, []string{"⚛️ Atheist / Agnostic", "✝️ Christian", "✡️ Jewish"}, nil},

	// Birthday is in unix timestamp seconds.
	{"Birthday", 100, true, nil, []int{-2204107955, 1172486845}},
	// Height is in cm
	{"Height", 100, true, nil, []int{50, 280}},
	// Weight in kg
	{"Weight", 100, true, nil, []int{30, 400}},

	{"Extra", 100, true, []string{""}, nil},
}

func (p *Profile) Id() [32]byte {
	return sha256.Sum256([]byte(p.FirstName + string(p.LastName[0]) + p.ContactEmail))
}
func (p *PublicProfile) Id() [32]byte {
	return sha256.Sum256([]byte(p.FirstName + string(p.LastInitial[0]) + p.ContactEmail))
}

func compare(pl, pr Profile) int {
	// Tally preferences, assume equal weighting / ranking.
	score := 0

	for _, propl := range pl.Properties {
		for _, propr := range pr.Properties {
			if propl.Type == propr.Type {
				// Compare the properties.

				t := PropertyTypes[propl.Type]
				weight := t.Weight

				if PropertyTypes[propl.Type].ValidFields != nil {
					// Compare as fields

					for i := range propl.Prefered {
						for j := range propr.Is {
							if propl.Prefered[i] == propr.Is[j] {
								// Match here is good
								score += weight
							}
						}
					}

					for i := range propl.NotPrefered {
						for j := range propr.Is {
							if propl.NotPrefered[i] == propr.Is[j] {
								// Matching here is bad!
								score -= weight - 10
							}
						}
					}

				} else {
					// Compare as range

					if len(propl.Prefered) > 0 {
						if propr.Is[0] >= propl.Prefered[0] && propr.Is[0] <= propr.Prefered[1] {
							// It's in the range so it's good!
							score += weight
						}

						if propr.Is[0] >= propl.NotPrefered[0] && propr.Is[0] <= propr.NotPrefered[1] {
							// It's in the bad range so it's bad!
							score -= weight - 10
						}
					}
				}
			}
		}
	}

	return score
}

func processProfiles(profiles []Profile) []Match {
	matches := []Match{}

	fmt.Println("Started matchmaking")
	for i, p1 := range profiles[:len(profiles)-1] {

		topScores := [5]struct {
			score   int
			profile Profile
			found   bool
		}{}

		for _, p2 := range profiles[i+1:] {
			// TODO: Apply distance filter.
			// TODO: Apply exclusion list.
			// TODO: Apply inclusion list.
			fmt.Println("Finding matches for "+p1.FirstName, ""+p2.FirstName)

			if p1.Id() != p2.Id() {
				// XXX: Flex, use webassembly to load the module lmao. Would be overkill.
				score1 := compare(p1, p2)
				score2 := compare(p2, p1)

				score := (score1 + score2) / 2

				for i := range topScores {
					if topScores[i].score < score {
						topScores[i].found = true
						topScores[i].score = score
						topScores[i].profile = p2
						break
					}
				}
			}
		}

		for _, m := range topScores {
			if m.found {
				fmt.Println("Appended one")
				p2 := m.profile
				matches = append(matches, Match{
					[]PublicProfile{
						{
							p1.FirstName,
							p1.LastName[:1],
							p1.ContactEmail,
							p1.Properties,
						},
						{
							p2.FirstName,
							p2.LastName[:1],
							p2.ContactEmail,
							p2.Properties,
						},
					},
					m.score,
				})
			}
		}
	}

	return matches
}

// Key size (Recommended: at least 2048 bits)
const keySize = 2048

// Generates or loads an RSA key pair
func getKeyPair() (*rsa.PublicKey, *rsa.PrivateKey) {
	// Check if the key file exists
	encryptedSeed, err := os.ReadFile(".secret")
	if err != nil {
		// No key file found, generate a new RSA key pair
		log.Println("No existing key found. Generating new RSA key pair...")

		privKey, err := rsa.GenerateKey(rand.Reader, keySize)
		if err != nil {
			log.Fatalf("Failed to generate RSA key: %v", err)
		}

		// Encrypt and save the private key
		saveEncryptedPrivateKey(privKey)

		return &privKey.PublicKey, privKey
	}

	// Decrypt and load the RSA private key
	privKey, err := loadEncryptedPrivateKey(encryptedSeed)
	if err != nil {

		log.Fatalf("Failed to load private key: %v", err)
	}
	return &privKey.PublicKey, privKey
}

// saveEncryptedPrivateKey encrypts the private key using AES-GCM with SGX seal key
func saveEncryptedPrivateKey(privKey *rsa.PrivateKey) {
	privKeyBytes := x509.MarshalPKCS1PrivateKey(privKey)

	// Get SGX sealing key
	sealedKey, _, err := enclave.GetProductSealKey()
	if err != nil {
		log.Fatalf("Failed to get SGX sealing key: %v", err)
	}

	// Encrypt using AES-GCM
	encryptedKey, err := aesGCMEncrypt(sealedKey, privKeyBytes)
	if err != nil {
		log.Fatalf("Failed to encrypt private key: %v", err)
	}

	// Save to file
	err = os.WriteFile(".secret", encryptedKey, 0o600)
	if err != nil {
		log.Fatalf("Failed to save encrypted private key: %v", err)
	}
	log.Println("Encrypted private key saved to .secret")
}

// loadEncryptedPrivateKey decrypts the private key using AES-GCM with SGX seal key
func loadEncryptedPrivateKey(encryptedData []byte) (*rsa.PrivateKey, error) {
	sealedKey, _, err := enclave.GetProductSealKey()
	if err != nil {
		return nil, errors.New("failed to get SGX sealing key")
	}

	decryptedData, err := aesGCMDecrypt(sealedKey, encryptedData)
	if err != nil {
		return nil, errors.New("failed to decrypt private key")
	}

	privKey, err := x509.ParsePKCS1PrivateKey(decryptedData)
	if err != nil {
		return nil, errors.New("failed to parse RSA private key")
	}

	return privKey, nil
}

// AES-GCM Encryption
func aesGCMEncrypt(key, plaintext []byte) ([]byte, error) {
	block, err := aes.NewCipher(key[:16]) // Use first 16 bytes of SGX key
	if err != nil {
		return nil, err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	// Generate a random 12-byte nonce
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return nil, err
	}

	// Encrypt the data
	ciphertext := aesGCM.Seal(nil, nonce, plaintext, nil)

	// Return nonce + ciphertext
	return append(nonce, ciphertext...), nil
}

// AES-GCM Decryption
func aesGCMDecrypt(key, encryptedData []byte) ([]byte, error) {
	block, err := aes.NewCipher(key[:16]) // Use first 16 bytes of SGX key
	if err != nil {
		return nil, err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := aesGCM.NonceSize()
	if len(encryptedData) < nonceSize {
		return nil, errors.New("ciphertext too short")
	}

	// Extract nonce and actual ciphertext
	nonce, ciphertext := encryptedData[:nonceSize], encryptedData[nonceSize:]

	// Decrypt
	return aesGCM.Open(nil, nonce, ciphertext, nil)
}

func main() {
	fmt.Println("Starting server.")

	// Run a simple webserver that handles everything.

	profiles := []Profile{
		{
			FirstName:    "Charlie",
			LastName:     "Brown",
			ContactEmail: "charlie.brown@example.com",
			Geolocation:  "Chicago, USA",
			MaxDistance:  75.0,
			Properties: []PropertyEntry{
				{Type: 0, Is: []int{0}, Prefered: []int{1}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},             // Male, prefers female
				{Type: 1, Is: []int{1}, Prefered: []int{1, 2}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},          // Black
				{Type: 2, Is: []int{3}, Prefered: []int{}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},              // Cancer
				{Type: 3, Is: []int{0, 5}, Prefered: []int{0, 1, 5}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},    // English, Arabic
				{Type: 4, Is: []int{1}, Prefered: []int{}, NotPrefered: []int{0}, MustHave: []int{}, CantHave: []int{}},             // Extroverted
				{Type: 6, Is: []int{2, 4, 6}, Prefered: []int{2, 4, 6}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}}, // Reading, Gaming, Crypto
				{Type: 9, Is: []int{180}, Prefered: []int{}, NotPrefered: []int{}, MustHave: []int{175}, CantHave: []int{190}},      // Height: 180 cm
			},
			ExclusionList: [][32]byte{},
			LastModified:  time.Now(),
		},
		{
			FirstName:    "Diana",
			LastName:     "Torres",
			ContactEmail: "diana.torres@example.com",
			Geolocation:  "Miami, USA",
			MaxDistance:  60.0,
			Properties: []PropertyEntry{
				{Type: 0, Is: []int{1}, Prefered: []int{0}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},                // Female
				{Type: 1, Is: []int{3}, Prefered: []int{3, 4}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},             // Hispanic
				{Type: 3, Is: []int{0, 1, 2}, Prefered: []int{0, 1, 2, 3}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}}, // English, Spanish, Mandarin
				{Type: 6, Is: []int{0, 1, 3}, Prefered: []int{0, 1, 3}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},    // Travel, Sports, Hiking
				{Type: 9, Is: []int{170}, Prefered: []int{}, NotPrefered: []int{}, MustHave: []int{160}, CantHave: []int{180}},         // Height: 170 cm
			},
			ExclusionList: [][32]byte{},
			LastModified:  time.Now(),
		},
		{
			FirstName:    "Ethan",
			LastName:     "Garcia",
			ContactEmail: "ethan.garcia@example.com",
			Geolocation:  "Austin, USA",
			MaxDistance:  100.0,
			Properties: []PropertyEntry{
				{Type: 0, Is: []int{0}, Prefered: []int{1}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},       // Male
				{Type: 1, Is: []int{2}, Prefered: []int{2, 5}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},    // Asian
				{Type: 6, Is: []int{4, 5}, Prefered: []int{4, 5}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}}, // Gaming, Camping
				{Type: 9, Is: []int{175}, Prefered: []int{}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{190}},   // Height: 175 cm
			},
			ExclusionList: [][32]byte{},
			LastModified:  time.Now(),
		},
	}

	// Generating 7 more profiles dynamically for variety
	for i := 4; i <= 10; i++ {
		profiles = append(profiles, Profile{
			FirstName:    fmt.Sprintf("User%d", i),
			LastName:     "Doe",
			ContactEmail: fmt.Sprintf("user%d@example.com", i),
			Geolocation:  "Unknown",
			MaxDistance:  float32(50 + i*10),
			Properties: []PropertyEntry{
				{Type: 0, Is: []int{i % 2}, Prefered: []int{(i + 1) % 2}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}}, // Alternating Male/Female
				{Type: 1, Is: []int{i % 6}, Prefered: []int{}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},            // Ethnicity rotating
				{Type: 2, Is: []int{i % 12}, Prefered: []int{}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},           // Star sign rotating
				{Type: 6, Is: []int{i % 7}, Prefered: []int{}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},            // Interest rotating
				{Type: 9, Is: []int{160 + (i % 10)}, Prefered: []int{}, NotPrefered: []int{}, MustHave: []int{}, CantHave: []int{}},   // Height varies between 160-170
			},
			ExclusionList: [][32]byte{},
			LastModified:  time.Now(),
		})
	}

	matches := processProfiles(profiles)

	for _, m := range matches {
		fmt.Println(m)
	}

	bytes, _ := json.Marshal(profiles)
	fmt.Println("Naive encoding bytes:", len(bytes))

	// bytes, _ = msgpack.Marshal(profiles)
	// fmt.Println("Message pack encoding bytes:", len(bytes))
	//
	// bytes, _ = bson.Marshal(profiles)
	//
	// return

	publicKey, secretKey := getKeyPair()
	log.Println("Public key:", publicKey)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"}, // Replace with frontend URL if needed
		AllowMethods: []string{"GET", "POST", "OPTIONS"},
		AllowHeaders: []string{"Content-Type", "Authorization"},
	}))

	// TODO: Complete the implementation of a sealed secret on-disk
	// {
	// 	key, _, err := enclave.GetProductSealKey()

	// 	if err != nil {
	// 		fmt.Println("Error getting product seal key!")
	// 		fmt.Println(err)
	// 	} else {
	// 		// Either decrypt local file with previous key, or create key and file now using.
	// 		block, err := aes.NewCipher(key)

	// 		if err != nil {
	// 			panic(err)
	// 		}

	// 		aesGCM, err := cipher.NewGCM(block)
	// 		if err != nil {
	// 			panic(err)
	// 		}
	// 		//Decrypt the key if it exists
	// 		if _, err := os.Stat(".secret"); errors.Is(err, os.ErrNotExist) {
	// 			nonce := []byte{}
	// 			rand.Read(nonce[:])
	// 			aesGCM.Seal(nil, nonce, nil, nil)
	// 		} else {

	// 		}
	// 	}
	// }

	// ROUTES
	r.GET("/", func(c *gin.Context) {
		pubKeyBytes, err := x509.MarshalPKIXPublicKey(publicKey) // Encode as X.509
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode public key"})
			return
		}

		pubPem := pem.EncodeToMemory(&pem.Block{
			Type:  "PUBLIC KEY",
			Bytes: pubKeyBytes,
		})

		c.JSON(http.StatusOK, gin.H{"publicKey": base64.StdEncoding.EncodeToString(pubPem)})
	})

	r.GET("/attestation", func(c *gin.Context) {
		client := &http.Client{
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
			},
		}
		// Hardcoded local route to PCCS server for identity request
		res, err := client.Get("https://127.0.0.1:8081/sgx/certification/v4/qe/identity")

		if err != nil {
			panic(err)
		}

		body, _ := io.ReadAll(res.Body)

		c.JSON(200, string(body))
	})

	r.GET("/properties", func(c *gin.Context) {
		c.JSON(200, PropertyTypes)
	})

	r.POST("/matchmaking", func(c *gin.Context) {
		var profiles []Profile
		var encrypted []ConfidentialProfileSet

		// Parse encrypted input
		if err := c.ShouldBindJSON(&encrypted); err != nil {
			log.Println("Invalid JSON (pre-decryption):", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON (pre-decryption)"})
			return
		}

		for i := range encrypted {
			// Decode Base64-encoded encrypted symmetric key
			decodedEncryptedSymmetricKey, err := base64.StdEncoding.DecodeString(encrypted[i].EncryptedSymKey)
			if err != nil {
				log.Println("Invalid base64 of encrypted symmetric key:", err)
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid base64 of encrypted symmetric key"})
				return
			}

			// Decode Base64-encoded IV
			decodedInitializationVector, err := base64.StdEncoding.DecodeString(encrypted[i].Iv)
			if err != nil {
				log.Println("Invalid base64 of initialization vector:", err)
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid base64 of initialization vector"})
				return
			}

			// Validate IV size (AES-CBC requires a 16-byte IV)
			if len(decodedInitializationVector) != aes.BlockSize {
				log.Println("Invalid IV size:", len(decodedInitializationVector))
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid initialization vector size"})
				return
			}

			// Decrypt symmetric key using RSA
			symmetricKey, err := secretKey.Decrypt(nil, decodedEncryptedSymmetricKey, nil)
			if err != nil {
				log.Println("Failed to decrypt symmetric key:", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decrypt symmetric key"})
				return
			}

			// Decode Base64-encoded ciphertext
			decodedCiphertext, err := base64.StdEncoding.DecodeString(encrypted[i].Ciphertext)
			if err != nil {
				log.Println("Invalid base64 of ciphertext:", err)
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid base64 of ciphertext"})
				return
			}

			// Create AES cipher block
			block, err := aes.NewCipher(symmetricKey)
			if err != nil {
				log.Println("Error creating AES cipher:", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cipher block"})
				return
			}

			// CBC decryption requires an IV
			mode := cipher.NewCBCDecrypter(block, decodedInitializationVector)

			// Decrypt ciphertext
			decrypted := make([]byte, len(decodedCiphertext))
			mode.CryptBlocks(decrypted, decodedCiphertext)

			// Remove PKCS#7 padding
			unpadded, err := pkcs7Unpad(decrypted, aes.BlockSize)
			if err != nil {
				log.Println("Padding removal failed:", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Padding error"})
				return
			}

			decodedUnpadded, err := base64.StdEncoding.DecodeString(string(unpadded))
			if err != nil {
				log.Println("Invalid base64 of unpadded:", err)
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid base64 of unpadded"})
				return
			}
			// Parse decrypted JSON data
			err = json.Unmarshal(decodedUnpadded, &profiles)
			if err != nil {
				log.Println("Invalid JSON (post-decryption):", err)
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON (post-decryption)"})
				return
			} else {
				log.Println("Decrypted JSON:", profiles)
			}
		}

		// Process profiles
		matches := processProfiles(profiles)
		fmt.Println(matches)

		c.JSON(http.StatusOK, matches)
	})

	// r.GET("/matchmake-debug", func(c *gin.Context) {
	// 	var profiles []Profile
	//
	// 	// if c.ShouldBindJSON(&profiles) {
	// 	// }
	//
	// 	processProfiles()
	//
	// 	// c.JSON(profiles)
	// })

	r.Run(":3000")
}

func pkcs7Unpad(data []byte, blockSize int) ([]byte, error) {
	if len(data) == 0 || len(data)%blockSize != 0 {
		return nil, errors.New("invalid padding size")
	}
	padLen := int(data[len(data)-1])
	if padLen > blockSize || padLen == 0 {
		return nil, errors.New("invalid padding value")
	}
	for _, v := range data[len(data)-padLen:] {
		if int(v) != padLen {
			return nil, errors.New("invalid padding pattern")
		}
	}
	return data[:len(data)-padLen], nil
}
