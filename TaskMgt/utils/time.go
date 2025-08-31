package utils

import "time"

func GetCurrentTimeISO() string {
	return time.Now().Format(time.RFC3339)
}
