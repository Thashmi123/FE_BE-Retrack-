package api

import (
	"github.com/gofiber/fiber/v2"

	"UserMGT/dao"

	"bytes"
	"encoding/csv"
	"fmt"
	"io"
	"reflect"
	"time"
)

// @Summary      DownloadUser
// @Description   This API performs the DOWNLOAD operation on User. It allows you to  User records.
// @Tags          User
// @Accept       json
// @Produce      json
// @Param        objectId query []string false "string collection"  collectionFormat(multi)
// @Success      200  {array}   dto. "Status OK"
// @Success      202  {array}   dto. "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /DownloadUser [DOWNLOAD]

func DownloadUserApi(c *fiber.Ctx) error {

	_, objects, err := dao.DB_FindallUser("1", "10", "", true, "")
	if err != nil {
		return err
	}

	buffer := new(bytes.Buffer)
	writer := csv.NewWriter(buffer)

	if len(*objects) == 0 {

		return fmt.Errorf("no data found")
	}

	e := reflect.ValueOf(&(*objects)[0]).Elem()
	var header []string
	for i := 0; i < e.NumField(); i++ {
		header = append(header, e.Type().Field(i).Name)
	}
	if err := writer.Write(header); err != nil {
		return err
	}

	// Write CSV data
	for i := 0; i < len(*objects); i++ {
		var row []string
		e = reflect.ValueOf(&(*objects)[i]).Elem()
		for j := 0; j < e.NumField(); j++ {
			row = append(row, fmt.Sprintf("%v", e.Field(j).Interface()))
		}
		if err := writer.Write(row); err != nil {
			return err
		}
	}

	// Flush the writer
	writer.Flush()

	// Set the filename and content type for the response
	fileName := "Users" + time.Now().Format("2006-01-02") + ".csv"
	c.Set("Content-Disposition", "attachment; filename="+fileName)
	c.Set("Content-Type", "text/csv")

	// Send the CSV file as the response
	_, err = io.Copy(c, buffer)
	if err != nil {
		return err
	}

	return nil

}
