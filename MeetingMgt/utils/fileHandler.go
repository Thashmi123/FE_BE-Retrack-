package utils

import (
    "bytes"
	"fmt"
	"io"
	"encoding/json"
	"mime/multipart"
	"net/http"
)

func UploadFile(url string, file *multipart.FileHeader) (string, error) {
    fileBuffer := &bytes.Buffer{}
    writer := multipart.NewWriter(fileBuffer)

    part, err := writer.CreateFormFile("file", file.Filename)
    if err != nil {
        return "", err
    }

    uploadedFile, err := file.Open()
    if err != nil {
        return "", err
    }
    defer uploadedFile.Close()

    _, err = io.Copy(part, uploadedFile)
    if err != nil {
        return "", err
    }

    writer.Close()

    req, err := http.NewRequest("POST", url, fileBuffer)
    if err != nil {
        return "", err
    }
    req.Header.Set("Content-Type", writer.FormDataContentType())

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return "", fmt.Errorf("API returned non-OK status: %d", resp.StatusCode)
    }

    var responseData map[string]string
    if err := json.NewDecoder(resp.Body).Decode(&responseData); err != nil {
        return "", err
    }

    urlPath, ok := responseData["url"]
    if !ok {
        return "", fmt.Errorf("Response does not contain 'url' field")
    }

    return urlPath, nil
}