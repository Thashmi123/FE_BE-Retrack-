package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("ASDFGHJKL0987654321")

func GenerateJWT(userId, email, role string) (string, error) {
	claims := jwt.MapClaims{
		"userId": userId,
		"email":  email,
		"role":   role,
		"exp":    time.Now().Add(time.Hour * 2).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}
