package main

import (
	// "crypto/aes"
	// "crypto/cipher"
	// "crypto/rand"
	// "github.com/edgelesssys/ego/enclave"
	"crypto/ed25519"
	"crypto/rand"
	"encoding/json"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/linkedin/goavro/v2"
	"github.com/vmihailenco/msgpack/v5"
	"go.mongodb.org/mongo-driver/bson"

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

func getKeyPair() (ed25519.PublicKey, ed25519.PrivateKey) {

	seed, err := os.ReadFile(".secret")

	var sk = ed25519.PrivateKey{}
	if err != nil {
		// No file yet, generate pk and save seed to file.
		_, genSk, err := ed25519.GenerateKey(rand.Reader)

		if err != nil {
			panic(err)
		} else {
			sk = genSk

			os.WriteFile(".secret", sk.Seed(), 0o666)
		}
	} else {
		sk = ed25519.NewKeyFromSeed(seed)
	}

	return sk.Public().(ed25519.PublicKey), sk
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

	pk, sk := getKeyPair()

	r := gin.Default()

	msg := []byte("Hello bro")
	sig := ed25519.Sign(sk, msg)
	worked := ed25519.Verify(pk, msg, sig)

	if !worked {
		panic("Failed to sign")
	}

	r.GET("/attestation", func(c *gin.Context) {
		// TODO: Return copy of attestation
	})

	r.GET("/matchmake", func(c *gin.Context) {
		// Take arrays of profiles as input.
		// Spits out

		// 1. Decrypt the profile arrays.

		// processProfiles()

		// c.JSON(profiles)
	})

	r.GET("/matchmake-debug", func(c *gin.Context) {
		var profiles []Profile

		if c.ShouldBindJSON(&profiles) {
		}

		processProfiles()

		// c.JSON(profiles)
	})

	r.Run()

	// key, _, err := enclave.GetProductSealKey()
	//
	// if err != nil {
	// 	fmt.Println("Error getting product seal key!")
	// 	fmt.Println(err)
	// } else {
	// 	// Either decrypt local file with previous key, or create key and file now using.
	//
	// 	{
	// 	block, err := aes.NewCipher(key)
	//
	// 	if err != nil {
	// 		panic(err)
	// 	}
	//
	// 	aesGCM, err := cipher.NewGCM(block)
	//
	// 	// Decrypt the key or whatever
	// 	// if err != nil {
	// 	// 	panic(err)
	// 	// }
	// 	//
	// 	// nonce := [32]byte{}
	// 	// rand.Read(nonce[:])
	// 	//
	// 	// aesGCM.Seal(nil, nonce, nil, nil)
	// }
}
