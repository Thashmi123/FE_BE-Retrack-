package dbConfig

import (
	"fmt"
	"os"
)

func RemoveGeneratedOuts() {
	err := os.RemoveAll("outs/")
	if err != nil {
		fmt.Println("Deleting Pre Generated Apps: Failed")
		fmt.Println(err)

	} else {
		err := os.Mkdir("outs", os.ModePerm)
		if err != nil {
			fmt.Println("Generating /Outs: Failed")
		}
	}

}
